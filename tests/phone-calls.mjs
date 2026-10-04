import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID, createHmac } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { callAccess, callHistory, startCall, reviewCall, receiveCallWebhook } from '../lib/call-service.js';
import { accessCookie, verifyWebhook } from '../lib/call-auth.js';
import { callConfig } from '../lib/call-config.js';
import { createCallStore } from '../lib/call-store.js';
import { callNoteDraft } from '../lib/call-transcript.js';

const env = { SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_private', ELEVENLABS_API_KEY: 'private-eleven-key', ELEVENLABS_AGENT_ID: 'agent_demo', ELEVENLABS_PHONE_NUMBER_ID: 'phnum_demo', ELEVENLABS_WEBHOOK_SECRET: 'webhook-secret', VOICE_DEMO_PASSCODE: 'demo-password', CALL_DEMO_DESTINATIONS: JSON.stringify([{ id: 'tester', label: 'Demo participant', number: '+15555550100' }]) };
const origin = 'https://priopulse.test';
const cookie = accessCookie(env.ELEVENLABS_API_KEY, true).split(';')[0];
function request(path, body, options = {}) {
  return new Request(`${origin}${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { origin, cookie, 'Content-Type': 'application/json', ...options.headers }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}), ...options });
}
const db = new PGlite();
await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
const schema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
await db.exec(schema);
await db.exec(schema); // Setup file can be rerun without losing records.
const rpc = async (name, args) => (await db.query(`select public.${name}(${Object.keys(args).map((key, index) => `${key} => $${index + 1}`).join(',')}) as value`, Object.values(args))).rows[0].value;
const store = {
  reserve: args => rpc('priopulse_reserve_call', args),
  update: (id, changes) => rpc('priopulse_update_call', { p_id: id, p_changes: changes }),
  ingest: event => rpc('priopulse_ingest_call_event', { p_event: event }),
  review: (id, note, actor) => rpc('priopulse_review_call', { p_id: id, p_note: note, p_actor: actor }),
  list: async patient => (await db.query('select * from follow_up_calls where ($1::text is null or patient_id=$1) order by created_at desc limit 100', [patient || null])).rows,
  active: async () => (await db.query('select * from follow_up_calls where active_slot=1 limit 1')).rows[0] || null,
};
let dialCount = 0;
let providerMode = 'success';
let agentLimit = 300;
let dialBody;
let recoveredId;
let deps;
const completed = (id, conversationId = 'conv_demo') => ({ agent_id: env.ELEVENLABS_AGENT_ID, conversation_id: conversationId, user_id: id, status: 'done', transcript: [{ role: 'agent', message: 'Would you like a nurse callback?' }, { role: 'user', message: 'Yes, please.' }], metadata: { call_duration_secs: 22, phone_call: { call_sid: `CA_${conversationId}` } }, analysis: { transcript_summary: 'Do not copy this inferred summary' } });
function webhook(data, type = 'post_call_transcription', signature = true) {
  const raw = JSON.stringify({ type, event_timestamp: Math.floor(Date.now() / 1000), data });
  const t = Math.floor(Date.now() / 1000);
  const sig = `t=${t},v0=${createHmac('sha256', env.ELEVENLABS_WEBHOOK_SECRET).update(`${t}.${raw}`).digest('hex')}`;
  return new Request(`${origin}/api/elevenlabs/webhook`, { method: 'POST', body: raw, headers: signature ? { 'elevenlabs-signature': sig } : {} });
}
const fetcher = async (url, options) => {
  if (url.includes('/agents/')) return Response.json({ main_branch_id: 'branch_main', conversation_config: { agent: { language: 'en', first_message: 'Hello. I am a demonstration assistant. Please use fictional answers.' }, conversation: { max_duration_seconds: agentLimit } } });
  if (url.endsWith('/twilio/outbound-call')) {
    dialCount++; dialBody = JSON.parse(options.body);
    if (providerMode === 'timeout') throw new Error('PRIVATE PROVIDER ERROR');
    if (providerMode === 'reject') return new Response('PRIVATE PROVIDER ERROR', { status: 400 });
    const id = dialBody.conversation_initiation_client_data.user_id;
    const conv = `conv_${id}`;
    if (providerMode === 'early-webhook') {
      const data = completed(null, conv); // No local correlation; must wait for dial response binding.
      assert.equal((await receiveCallWebhook(webhook(data), deps)).status, 200);
    }
    return Response.json({ success: true, conversation_id: conv, callSid: `CA_${conv}` });
  }
  if (url.includes('/conversations?')) return Response.json({ conversations: recoveredId ? [{ conversation_id: `conv_${recoveredId}` }] : [] });
  if (url.includes('/conversations/')) return Response.json(completed(recoveredId, `conv_${recoveredId}`));
  throw new Error('Unexpected provider path');
};
deps = { env, patientIds: new Set(['HF-001', 'HF-002']), fetcher, getStore: () => store };
const input = (patientId = 'HF-001') => ({ callId: randomUUID(), patientId, destinationId: 'tester', actorId: 'nurse-ana', confirmed: true });
const clear = async () => { await db.exec('truncate follow_up_call_events, follow_up_calls;'); providerMode = 'success'; recoveredId = null; dialCount = 0; };

// Access protection, server configuration, and no-dial validation.
assert.equal((await callAccess(request('/api/calls/access', {}), deps)).status, 200);
assert.doesNotThrow(() => callConfig({ ...env, VOICE_DEMO_PASSCODE: undefined }));
const access = await callAccess(request('/api/calls/access', { passcode: env.VOICE_DEMO_PASSCODE }), deps);
assert.equal(access.status, 200); assert.match(access.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
assert.equal((await callHistory(request('/api/calls', undefined, { headers: {} }), deps)).status, 401);
assert.equal((await startCall(request('/api/calls', input(), { headers: { origin: 'https://other.test', cookie } }), deps)).status, 403);
assert.equal((await startCall(request('/api/calls', input('UNKNOWN')), deps)).status, 400);
assert.equal((await startCall(request('/api/calls', { ...input(), destinationId: 'not-allowed', to_number: '+15555550999' }), deps)).status, 400);
assert.equal((await startCall(request('/api/calls', { ...input(), actorId: 'toString' }), deps)).status, 400);
assert.equal((await startCall(request('/api/calls', { ...input(), confirmed: false }), deps)).status, 400);
assert.equal((await startCall(request('/api/calls', input()), { ...deps, env: { ...env, ELEVENLABS_API_KEY: '' } })).status, 503);
assert.equal(dialCount, 0);
assert.throws(() => callConfig({ ...env, CALL_DEMO_DESTINATIONS: '[{"id":"x","label":"x","number":"123"}]' }));

// Exact replay cannot dial again; independent attempts cannot overlap.
const first = input();
let response = await startCall(request('/api/calls', first), deps);
assert.equal(response.status, 202);
assert.equal((await startCall(request('/api/calls', first), deps)).status, 200);
const publicHistory = await callHistory(request('/api/calls?view=public', undefined, { headers: {} }), deps);
assert.equal(publicHistory.status, 200);
const publicBody = await publicHistory.json();
assert.equal(publicBody.calls.length, 1);
assert.equal(publicBody.calls[0].destination_number, undefined);
assert.equal(publicBody.calls[0].conversation_id, undefined);
assert.deepEqual(publicBody.calls[0].transcript, []);
assert.deepEqual(publicBody.destinations, []);
assert.equal(publicBody.active, null);
assert.equal((await startCall(request('/api/calls', input(), { headers: { origin } }), deps)).status, 401);

assert.equal((await startCall(request('/api/calls', input('HF-002')), deps)).status, 409);
assert.equal(dialCount, 1);
assert.equal(dialBody.to_number, '+15555550100');
assert.equal(dialBody.conversation_initiation_client_data.branch_id, 'branch_main');
assert.equal(dialBody.conversation_initiation_client_data.user_id, first.callId);
assert.ok(!JSON.stringify(dialBody).includes('HF-001'));
assert.ok(!JSON.stringify(dialBody).includes('DEATH_EVENT'));
assert.equal(dialBody.call_recording_enabled, false);
assert.equal((await reviewCall(request('/api/calls/review', { note: 'premature', reviewed: true, actorId: 'nurse-ana' }), first.callId, deps)).status, 409);

// Verified events are deduplicated, attached correctly, and never save a reviewed note.
const data = completed(first.callId, `conv_${first.callId}`);
assert.equal((await receiveCallWebhook(webhook(data, 'post_call_transcription', false), deps)).status, 401);
assert.equal((await receiveCallWebhook(webhook(data), deps)).status, 200);
assert.equal((await receiveCallWebhook(webhook(data), deps)).status, 200);
assert.equal((await db.query('select count(*)::int as count from follow_up_call_events')).rows[0].count, 1);
let call = (await store.list('HF-001'))[0];
assert.equal(call.status, 'completed'); assert.equal(call.reviewed_at, null); assert.equal(call.transcript[1].speaker, 'Participant');
assert.ok(!JSON.stringify(call).includes('inferred summary')); assert.equal(await store.active(), null);
assert.match(callNoteDraft(call), /Participant: Yes, please/);
assert.equal((await store.list('HF-002')).length, 0);
assert.equal((await reviewCall(request('/api/calls/review', { note: 'Edited nurse note', reviewed: false, actorId: 'nurse-ana' }), first.callId, deps)).status, 400);
assert.equal((await reviewCall(request('/api/calls/review', { note: 'Edited nurse note', reviewed: true, actorId: 'nurse-ana' }), first.callId, deps)).status, 200);
assert.equal((await reviewCall(request('/api/calls/review', { note: 'duplicate overwrite', reviewed: true, actorId: 'nurse-ana' }), first.callId, deps)).status, 409);
await receiveCallWebhook(webhook(data), deps);
assert.equal((await store.list())[0].reviewed_note, 'Edited nurse note');
// A delayed failure must not revert a completed conversation or remove its note.
await receiveCallWebhook(webhook({ agent_id: env.ELEVENLABS_AGENT_ID, conversation_id: data.conversation_id, failure_reason: 'no-answer' }, 'call_initiation_failure'), deps);
assert.equal((await store.list())[0].status, 'completed');
assert.equal((await store.list())[0].failure_message, null);

// A failed conversation's received transcript is still useful for explicit review.
const partial = input('HF-002');
await startCall(request('/api/calls', partial), deps);
await receiveCallWebhook(webhook({ ...completed(partial.callId, `conv_${partial.callId}`), status: 'failed' }), deps);
const partialCall = (await store.list('HF-002'))[0];
assert.equal(partialCall.status, 'failed'); assert.equal(partialCall.transcript.length, 2);
assert.equal((await reviewCall(request('/api/calls/review', { note: 'Reviewed partial fictional conversation', reviewed: true, actorId: 'nurse-ana' }), partial.callId, deps)).status, 200);

// Webhook may precede dial response; durable inbox is applied after identifiers bind.
await clear(); providerMode = 'early-webhook';
response = await startCall(request('/api/calls', input()), deps);
assert.equal((await response.json()).call.status, 'completed');
assert.equal((await store.list())[0].transcript.length, 2);

// True provider rejection is sanitized and releases the reservation.
await clear(); providerMode = 'reject';
response = await startCall(request('/api/calls', input()), deps);
assert.equal(response.status, 502); assert.ok(!(await response.text()).includes('PRIVATE'));
assert.equal(await store.active(), null);
// Agent duration is checked before dialing, never enforced by a browser timer.
await clear(); agentLimit = 600;
assert.equal((await startCall(request('/api/calls', input()), deps)).status, 503); assert.equal(dialCount, 0); agentLimit = 300;

// Interrupted dialing remains reserved; reconciliation reads provider state without retrying.
await clear(); providerMode = 'timeout'; const interrupted = input();
response = await startCall(request('/api/calls', interrupted), deps);
assert.equal((await response.json()).call.status, 'uncertain');
assert.equal((await startCall(request('/api/calls', input()), deps)).status, 409);
await db.query("update follow_up_calls set created_at=now()-interval '2 minutes' where id=$1", [interrupted.callId]);
await callHistory(request('/api/calls'), deps); // No provider match: stay blocked.
assert.equal((await store.active()).status, 'uncertain');
recoveredId = interrupted.callId;
await db.exec('update follow_up_calls set last_checked_at=null');
response = await callHistory(request('/api/calls?patientId=HF-001'), deps);
assert.equal((await response.json()).calls[0].status, 'completed'); assert.equal(dialCount, 1);

// SQL reservation and unique constraint prevent races across requests/instances.
await clear();
const concurrent = await Promise.all([startCall(request('/api/calls', input()), deps), startCall(request('/api/calls', input('HF-002')), deps)]);
assert.deepEqual(concurrent.map(res => res.status).sort(), [202, 409]); assert.equal(dialCount, 1);

// No public browser-key access to calls, transcripts, or RPCs.
for (const role of ['anon', 'authenticated']) {
  await db.exec(`set role ${role}`);
  await assert.rejects(db.query('select * from public.follow_up_calls'));
  await assert.rejects(db.query('select public.priopulse_review_call($1,$2,$3)', [randomUUID(), 'note', 'actor']));
  await db.exec('reset role');
}
await db.exec('set role service_role');
assert.equal((await db.query('select count(*)::int as count from follow_up_calls')).rows[0].count, 1);
await db.exec('reset role');

// Supabase secret-key header handling and database error sanitization.
let databaseHeaders;
const rest = createCallStore(env, async (_, options) => { databaseHeaders = options.headers; return Response.json([]); });
await rest.list(); assert.equal(databaseHeaders.apikey, env.SUPABASE_SECRET_KEY); assert.equal(databaseHeaders.Authorization, undefined);
await assert.rejects(createCallStore(env, async () => new Response('SECRET DATABASE ERROR', { status: 500 })).list(), /Call storage is unavailable/);
const old = Math.floor(Date.now() / 1000) - 1801; const raw = '{}';
assert.equal(verifyWebhook(raw, `t=${old},v0=${createHmac('sha256', env.ELEVENLABS_WEBHOOK_SECRET).update(`${old}.${raw}`).digest('hex')}`, env.ELEVENLABS_WEBHOOK_SECRET), false);
assert.equal(verifyWebhook(raw, 't=invalid,v0=bad', env.ELEVENLABS_WEBHOOK_SECRET), false);
await db.close();
console.log('Phone-call tests passed: real SQL reservations, access, provider errors, reconciliation, webhook races, transcripts, and nurse review.');
