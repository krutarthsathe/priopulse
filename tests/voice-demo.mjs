import assert from 'node:assert/strict';
import { createVoiceSession } from '../lib/voice-session-server.js';
import { transcriptMessage, transcriptDraft } from '../lib/voice-transcript.js';
const env = { ELEVENLABS_API_KEY: 'secret-key', ELEVENLABS_AGENT_ID: 'agent-test', VOICE_DEMO_PASSCODE: 'demo-pass' };
const request = (body) => new Request('http://localhost/api/voice/session', { method: 'POST', body: JSON.stringify(body) });
let calls = 0;
const dependencies = { env, patientIds: new Set(['HF-001']), fetcher: async (url, options) => { calls++; assert.equal(options.headers['xi-api-key'], 'secret-key'); return Response.json({ signed_url: 'wss://api.elevenlabs.io/test' }); } };
assert.equal((await createVoiceSession(request({}), { ...dependencies, env: {} })).status, 503);
assert.equal((await createVoiceSession(request({ passcode: 'wrong', patientId: 'HF-001' }), dependencies)).status, 401);
assert.equal((await createVoiceSession(request({ passcode: 'demo-pass', patientId: 'missing' }), dependencies)).status, 400);
assert.equal(calls, 0);
const success = await createVoiceSession(request({ passcode: 'demo-pass', patientId: 'HF-001' }), dependencies);
assert.equal(success.status, 200); assert.equal(success.headers.get('cache-control'), 'no-store');
assert.deepEqual(await success.json(), { signedUrl: 'wss://api.elevenlabs.io/test' });
for (const fetcher of [async () => new Response('secret upstream error', { status: 401 }), async () => { throw Error('secret upstream error'); }, async () => Response.json({ signed_url: 'invalid' })]) {
 const failure = await createVoiceSession(request({ passcode: 'demo-pass', patientId: 'HF-001' }), { ...dependencies, fetcher });
 assert.equal(failure.status, 502); assert.ok(!(await failure.text()).includes('secret'));
}
assert.equal(transcriptMessage({ source:'debug', message:'private' }), null);
assert.equal(transcriptMessage({ source:'user', message:'hello', type:'tentative' }), null);
const message = transcriptMessage({ source:'user', message:'I need a callback.' });
assert.deepEqual(message, { speaker:'Participant', text:'I need a callback.' });
const draft = transcriptDraft('HF-001','session-test',[message]);
assert.ok(draft.includes('session-test')); assert.ok(draft.includes('Participant: I need a callback.')); assert.ok(!draft.includes('diagnosis'));
console.log('Voice endpoint validation, failure handling, transcript filtering, and draft checks passed.');
