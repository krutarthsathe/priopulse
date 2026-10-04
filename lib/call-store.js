import { CallError } from './call-config.js';

// Native Supabase REST/RPC client. The privileged key never reaches client components.
export function createCallStore(env, fetcher = fetch) {
  const base = `${new URL(env.SUPABASE_URL).origin}/rest/v1`;
  async function database(path, body) {
    const key = env.SUPABASE_SECRET_KEY;
    const headers = { apikey: key, 'Content-Type': 'application/json' };
    // New sb_secret keys use apikey; legacy service_role JWTs additionally use Bearer.
    if (!key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${key}`;
    try {
      const response = await fetcher(`${base}/${path}`, { method: body === undefined ? 'GET' : 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Database unavailable');
      return await response.json();
    } catch { throw new CallError(503, 'Call storage is unavailable. Check the Supabase setup; do not repeat an uncertain call.'); }
  }
  return {
    reserve: input => database('rpc/priopulse_reserve_call', input),
    update: (id, changes) => database('rpc/priopulse_update_call', { p_id: id, p_changes: changes }),
    ingest: event => database('rpc/priopulse_ingest_call_event', { p_event: event }),
    review: (id, note, actor) => database('rpc/priopulse_review_call', { p_id: id, p_note: note, p_actor: actor }),
    list: patientId => database(`follow_up_calls?select=*&order=created_at.desc&limit=100${patientId ? `&patient_id=eq.${encodeURIComponent(patientId)}` : ''}`),
    active: () => database('follow_up_calls?select=*&active_slot=eq.1&limit=1').then(rows => rows[0] || null),
  };
}
