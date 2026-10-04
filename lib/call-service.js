import { createHash } from 'node:crypto';
import { CallError, CALL_ACTORS, callConfig } from './call-config.js';
import { accessCookie, clearAccessCookie, requireAccess, requireSameOrigin, verifyWebhook } from './call-auth.js';
import { ACTIVE_CALL_STATUSES, normalizeTranscript } from './call-transcript.js';

const PROVIDER = 'https://api.elevenlabs.io/v1/convai';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const reply = (status, body, headers = {}) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
const errorReply = failure => reply(failure instanceof CallError ? failure.status : 503, { error: failure instanceof CallError ? failure.message : 'Phone follow-ups are temporarily unavailable. Your existing call records are preserved.' });
const publicCall = call => {
  if (!call) return null;
  const { active_slot, agent_id, ...record } = call;
  return record;
};
async function jsonBody(request, max = 110000) {
  const raw = await request.text();
  if (raw.length > max) throw new CallError(413, 'This request is too large.');
  try { return JSON.parse(raw); } catch { throw new CallError(400, 'Invalid request.'); }
}

export async function callAccess(request, { env }) {
  try {
    requireSameOrigin(request);
    if (request.method === 'DELETE') return reply(200, { locked: true }, { 'Set-Cookie': clearAccessCookie(env.NODE_ENV === 'production') });
    callConfig(env);
    return reply(200, { unlocked: true }, { 'Set-Cookie': accessCookie(env.ELEVENLABS_API_KEY, env.NODE_ENV === 'production') });
  } catch (failure) { return errorReply(failure); }
}

async function providerGet(path, deps) {
  const response = await (deps.fetcher || fetch)(`${PROVIDER}/${path}`, { headers: { 'xi-api-key': deps.env.ELEVENLABS_API_KEY }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new CallError(502, 'Unable to check ElevenLabs. Check the agent configuration and API-key permissions.');
  return response.json();
}
async function prepareAgent(config, deps) {
  const agent = await providerGet(`agents/${encodeURIComponent(config.agentId)}${config.branchId ? `?branch_id=${encodeURIComponent(config.branchId)}` : ''}`, deps);
  const limit = agent.conversation_config?.conversation?.max_duration_seconds;
  if (!Number.isInteger(limit) || limit < 1 || limit > 300) throw new CallError(503, 'Set the ElevenLabs agent’s maximum conversation duration to 300 seconds or less before calling.');
  if (agent.conversation_config?.agent?.language !== 'en') throw new CallError(503, 'Set this demonstration agent’s language to English before calling.');
  const greeting = agent.conversation_config?.agent?.first_message || '';
  if (!/demo|demonstration/i.test(greeting) || !/fictional/i.test(greeting) || !/assistant|automated/i.test(greeting)) throw new CallError(503, 'Use the fictional demonstration assistant greeting from docs/phone-follow-ups.md before calling.');
  const branchId = config.branchId || agent.main_branch_id;
  if (!branchId) throw new CallError(503, 'Set ELEVENLABS_BRANCH_ID to the agent’s Main branch ID.');
  return branchId;
}

export function normalizedCallEvent(type, data, rawKey) {
  const failure = type === 'call_initiation_failure';
  const reason = data.failure_reason;
  const status = failure ? (reason === 'no-answer' ? 'no_answer' : reason === 'busy' ? 'busy' : 'failed')
    : data.status === 'done' ? 'completed' : data.status === 'failed' ? 'failed' : data.status === 'processing' ? 'processing' : data.status === 'in-progress' ? 'in_progress' : 'submitted';
  const callId = data.user_id || data.conversation_initiation_client_data?.user_id || data.conversation_initiation_client_data?.dynamic_variables?.priopulse_call_id;
  const duration = data.metadata?.call_duration_secs;
  const event = {
    agent_id: typeof data.agent_id === 'string' ? data.agent_id : null,
    conversation_id: typeof data.conversation_id === 'string' ? data.conversation_id : null,
    call_sid: data.metadata?.phone_call?.call_sid || data.metadata?.body?.CallSid || null,
    call_id: UUID.test(callId || '') ? callId : null,
    status, transcript: normalizeTranscript(data.transcript),
    duration_seconds: Number.isFinite(duration) && duration >= 0 ? Math.floor(duration) : null,
    failure_message: status === 'no_answer' ? 'The recipient did not answer.' : status === 'busy' ? 'The recipient’s line was busy.' : status === 'failed' ? 'The phone conversation failed. Check the ElevenLabs and Twilio call logs.' : null,
  };
  event.event_key = createHash('sha256').update(rawKey || JSON.stringify(event)).digest('hex');
  return event;
}

// Reconciliation reads provider state only. It never initiates or retries calls.
export async function reconcileCall(call, config, store, deps) {
  if (!call || !ACTIVE_CALL_STATUSES.includes(call.status)) return;
  if (Date.now() - Date.parse(call.created_at) < 15000 || (call.last_checked_at && Date.now() - Date.parse(call.last_checked_at) < 15000)) return;
  await store.update(call.id, { last_checked_at: new Date().toISOString(), ...(!call.conversation_id && call.status === 'initiating' ? { status: 'uncertain' } : {}) });
  try {
    let conversationId = call.conversation_id;
    if (!conversationId) {
      const page = await providerGet(`conversations?${new URLSearchParams({ agent_id: config.agentId, user_id: call.id, page_size: '10' })}`, deps);
      // user_id is a unique attempt ID, never a clinical patient identifier.
      if (page.conversations?.length !== 1) return;
      conversationId = page.conversations[0].conversation_id;
    }
    if (!conversationId) return;
    const data = await providerGet(`conversations/${encodeURIComponent(conversationId)}`, deps);
    if (data.agent_id !== call.agent_id || (data.conversation_id && data.conversation_id !== conversationId)) return;
    const correlation = data.user_id || data.conversation_initiation_client_data?.user_id || data.conversation_initiation_client_data?.dynamic_variables?.priopulse_call_id;
    if (!call.conversation_id && correlation !== call.id) return;
    await store.update(call.id, { conversation_id: conversationId, call_sid: data.metadata?.phone_call?.call_sid || null });
    await store.ingest(normalizedCallEvent('reconcile', { ...data, conversation_id: conversationId, user_id: call.id }));
  } catch (failure) {
    // Provider outages keep the global reservation; do not guess that a call ended.
    if (failure instanceof CallError && failure.status === 503) throw failure;
  }
}

export async function callHistory(request, deps) {
  try {
    const publicView = new URL(request.url).searchParams.get('view') === 'public';
    if (!publicView) requireAccess(request, deps.env);
    const config = callConfig(deps.env);
    const patientId = new URL(request.url).searchParams.get('patientId');
    if (patientId && !deps.patientIds.has(patientId)) throw new CallError(400, 'Select a valid patient.');
    const store = deps.getStore();
    if (!publicView) await reconcileCall(await store.active(), config, store, deps);
    const [calls, active] = await Promise.all([store.list(patientId), store.active()]);
    if (publicView) {
      const visible = calls.map(call => ({ id: call.id, patient_id: call.patient_id, destination_label: call.destination_label, actor_name: call.actor_name, status: call.status, created_at: call.created_at, duration_seconds: call.duration_seconds, reviewed_at: call.reviewed_at, reviewed_by: call.reviewed_by, awaiting_review: ['completed', 'failed'].includes(call.status) && !!call.transcript?.length && !call.reviewed_at, transcript: [], reviewed_note: null }));
      return reply(200, { calls: visible, active: null, destinations: [], historyLimit: 100 });
    }
    return reply(200, { calls: calls.map(publicCall), active: publicCall(active), destinations: config.destinations, historyLimit: 100 });
  } catch (failure) { return errorReply(failure); }
}

export async function startCall(request, deps) {
  let reserved;
  let store;
  try {
    requireSameOrigin(request);
    requireAccess(request, deps.env);
    const config = callConfig(deps.env);
    const body = await jsonBody(request, 4096);
    if (!deps.patientIds.has(body?.patientId)) throw new CallError(400, 'Select a valid patient from the call queue.');
    const destination = config.destinations.find(item => item.id === body.destinationId);
    if (!destination) throw new CallError(400, 'Choose a configured demo destination.');
    if (!UUID.test(body.callId || '') || !Object.hasOwn(CALL_ACTORS, body.actorId) || body.confirmed !== true) throw new CallError(400, 'Confirm the demo destination and patient before calling.');
    store = deps.getStore();
    await reconcileCall(await store.active(), config, store, deps);
    const result = await store.reserve({ p_id: body.callId, p_patient_id: body.patientId, p_destination_id: destination.id, p_destination_label: destination.label, p_destination_number: destination.number, p_actor_id: body.actorId, p_actor_name: CALL_ACTORS[body.actorId], p_agent_id: config.agentId });
    if (result.conflict) throw new CallError(409, 'This call request belongs to a different patient or destination.');
    if (result.busy) return reply(409, { error: 'Another demo call is active or uncertain. Review it in Calls before starting another.', call: publicCall(result.call) });
    if (!result.created) return reply(200, { call: publicCall(result.call), duplicate: true });
    reserved = result.call;
    let branchId;
    try { branchId = await prepareAgent(config, deps); }
    catch (failure) {
      await store.update(reserved.id, { status: 'failed', failure_message: 'Call was not dialed. Check the agent’s configuration and API permissions.' });
      throw failure;
    }
    try {
      const response = await (deps.fetcher || fetch)(`${PROVIDER}/twilio/outbound-call`, {
        method: 'POST', headers: { 'xi-api-key': deps.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ agent_id: config.agentId, agent_phone_number_id: config.phoneId, to_number: destination.number,
          conversation_initiation_client_data: { branch_id: branchId, user_id: reserved.id, dynamic_variables: { priopulse_call_id: reserved.id } },
          telephony_call_config: { ringing_timeout_secs: 30, twilio_call_recording_enabled: false }, call_recording_enabled: false }),
      });
      if (!response.ok) {
        const rejected = [400, 401, 403, 404, 422, 429].includes(response.status);
        const call = await store.update(reserved.id, { status: rejected ? 'failed' : 'uncertain', failure_message: rejected ? 'Call rejected. Verify the destination in Twilio and check ElevenLabs configuration and account limits.' : 'Provider response was uncertain. Do not redial; refresh Calls to reconcile.' });
        return reply(rejected ? 502 : 202, { call: publicCall(call), error: call.failure_message });
      }
      const data = await response.json();
      if (data.success === false) {
        const call = await store.update(reserved.id, { status: 'failed', failure_message: 'Call was not initiated. Check the provider call logs and configuration.' });
        return reply(502, { call: publicCall(call), error: call.failure_message });
      }
      if (data.success !== true || (!data.conversation_id && !data.callSid)) throw new Error('Unknown dial response');
      const call = await store.update(reserved.id, { status: data.conversation_id ? 'submitted' : 'uncertain', conversation_id: data.conversation_id || null, call_sid: data.callSid || null });
      return reply(202, { call: publicCall(call) });
    } catch {
      const call = await store.update(reserved.id, { status: 'uncertain', failure_message: 'The dialing response was interrupted. The phone may still ring. Do not redial; refresh Calls to reconcile.' });
      return reply(202, { call: publicCall(call), error: call.failure_message });
    }
  } catch (failure) { return errorReply(failure); }
}

export async function reviewCall(request, id, deps) {
  try {
    requireSameOrigin(request);
    requireAccess(request, deps.env);
    callConfig(deps.env);
    if (!UUID.test(id)) throw new CallError(400, 'Invalid call.');
    const body = await jsonBody(request);
    if (body?.reviewed !== true || typeof body.note !== 'string' || !body.note.trim() || body.note.length > 100000 || !Object.hasOwn(CALL_ACTORS, body.actorId)) throw new CallError(400, 'Review the transcript and enter a note before saving.');
    const result = await deps.getStore().review(id, body.note.trim(), CALL_ACTORS[body.actorId]);
    if (!result.call?.id) throw new CallError(404, 'Call not found.');
    if (!result.saved) return reply(409, { error: result.call.reviewed_at ? 'A reviewed note is already saved for this call. Your edits have not overwritten it.' : 'Wait for a finished conversation with a transcript before saving.', call: publicCall(result.call) });
    return reply(200, { call: publicCall(result.call) });
  } catch (failure) { return errorReply(failure); }
}

export async function receiveCallWebhook(request, deps) {
  try {
    if (!deps.env.ELEVENLABS_WEBHOOK_SECRET || !deps.env.SUPABASE_URL || !deps.env.SUPABASE_SECRET_KEY || !deps.env.ELEVENLABS_AGENT_ID) throw new CallError(503, 'Webhook storage is not configured.');
    if (Number(request.headers.get('content-length') || 0) > 2000000) throw new CallError(413, 'Event too large.');
    const raw = await request.text();
    if (raw.length > 2000000) throw new CallError(413, 'Event too large.');
    if (!verifyWebhook(raw, request.headers.get('elevenlabs-signature'), deps.env.ELEVENLABS_WEBHOOK_SECRET)) throw new CallError(401, 'Invalid webhook signature.');
    let event;
    try { event = JSON.parse(raw); } catch { throw new CallError(400, 'Invalid event.'); }
    if (!['post_call_transcription', 'call_initiation_failure'].includes(event.type) || event.data?.agent_id !== deps.env.ELEVENLABS_AGENT_ID) return reply(200, { received: true, ignored: true });
    if (event.type === 'post_call_transcription' && !['done', 'failed'].includes(event.data.status)) throw new CallError(400, 'Invalid conversation status.');
    const normalized = normalizedCallEvent(event.type, event.data, raw);
    if (!normalized.call_id && !normalized.conversation_id && !normalized.call_sid) throw new CallError(400, 'Missing call identifier.');
    await deps.getStore().ingest(normalized);
    return reply(200, { received: true });
  } catch (failure) { return errorReply(failure); }
}
