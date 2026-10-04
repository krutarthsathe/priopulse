import { timingSafeEqual, createHash } from 'node:crypto';
const reply = (status, body) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function createVoiceSession(request, { env, patientIds, fetcher = fetch }) {
  if (!env.ELEVENLABS_API_KEY || !env.ELEVENLABS_AGENT_ID || !env.VOICE_DEMO_PASSCODE) return reply(503, { error: 'Voice demo is not configured. Follow docs/elevenlabs-setup.md to add the three server environment variables.' });
  let body;
  try { body = await request.json(); } catch { return reply(400, { error: 'Invalid request.' }); }
  if (typeof body?.passcode !== 'string' || body.passcode.length > 256) return reply(401, { error: 'Incorrect demo passcode.' });
  const digest = value => createHash('sha256').update(value).digest();
  if (!timingSafeEqual(digest(body.passcode), digest(env.VOICE_DEMO_PASSCODE))) return reply(401, { error: 'Incorrect demo passcode.' });
  if (!patientIds.has(body.patientId)) return reply(400, { error: 'Select a valid patient from the call queue.' });
  try {
    const response = await fetcher(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(env.ELEVENLABS_AGENT_ID)}`, { headers: { 'xi-api-key': env.ELEVENLABS_API_KEY }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) return reply(502, { error: 'Voice service is unavailable. Check the agent configuration and account, then try again.' });
    const data = await response.json();
    if (typeof data.signed_url !== 'string' || !data.signed_url.startsWith('wss://')) throw new Error('Invalid session');
    return reply(200, { signedUrl: data.signed_url });
  } catch { return reply(502, { error: 'Unable to start voice. Please try again later.' }); }
}
