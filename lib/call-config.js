export class CallError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function callConfig(env) {
  const required = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'ELEVENLABS_API_KEY', 'ELEVENLABS_AGENT_ID', 'ELEVENLABS_PHONE_NUMBER_ID', 'ELEVENLABS_WEBHOOK_SECRET', 'VOICE_DEMO_PASSCODE', 'CALL_DEMO_DESTINATIONS'];
  if (required.some(key => !env[key])) throw new CallError(503, 'Phone follow-ups need server configuration. Open Setup help for the Supabase and Vercel instructions.');
  let destinations;
  try { destinations = JSON.parse(env.CALL_DEMO_DESTINATIONS); } catch { throw new CallError(503, 'The demo destination list is not configured correctly.'); }
  if (!Array.isArray(destinations) || !destinations.length || destinations.length > 10 || destinations.some(item =>
    typeof item?.id !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(item.id) || typeof item.label !== 'string' || !item.label.trim() || item.label.length > 80 || !/^\+[1-9]\d{7,14}$/.test(item.number)
  ) || new Set(destinations.map(item => item.id)).size !== destinations.length) throw new CallError(503, 'The demo destination list is not configured correctly.');
  let databaseUrl;
  try { databaseUrl = new URL(env.SUPABASE_URL); } catch { throw new CallError(503, 'The Supabase URL is not configured correctly.'); }
  if (databaseUrl.protocol !== 'https:') throw new CallError(503, 'Use the HTTPS Supabase project URL.');
  return { destinations, databaseUrl: databaseUrl.origin, agentId: env.ELEVENLABS_AGENT_ID, phoneId: env.ELEVENLABS_PHONE_NUMBER_ID, branchId: env.ELEVENLABS_BRANCH_ID || null };
}

// Identity labels only. Authorization always comes from the shared demo passcode.
export const CALL_ACTORS = {
  'nurse-ana': 'Jenus Ana', 'dr-fox': 'Dr Robert Fox', 'admin-alexander': 'Leslie Alexander',
};
