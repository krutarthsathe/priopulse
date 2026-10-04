'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const CallContext = createContext(null);
export function useCalls() { return useContext(CallContext); }
const PENDING_KEY = 'priopulse-pending-phone-call';
export default function CallProvider({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [calls, setCalls] = useState([]);
  const [active, setActive] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(null);
  const refreshing = useRef(null);
  const accessEpoch = useRef(0);
  const startLock = useRef(false);
  const pendingRef = useRef(null);
  const alive = useRef(true);
  function rememberPending(value) {
    pendingRef.current = value; setPending(value);
    try { value ? sessionStorage.setItem(PENDING_KEY, JSON.stringify(value)) : sessionStorage.removeItem(PENDING_KEY); } catch {}
  }
  const refresh = useCallback(async (force = false) => {
    if (refreshing.current && !force) return;
    const token = {};
    const epoch = accessEpoch.current;
    refreshing.current = token;
    try {
      let response = await fetch('/api/calls', { cache: 'no-store' });
      if (response.status === 401) {
        const access = await fetch('/api/calls/access', { method: 'POST' });
        if (!access.ok) { const failure = await access.json(); throw new Error(failure.error); }
        response = await fetch('/api/calls', { cache: 'no-store' });
      }
      const data = await response.json();
      if (!alive.current || epoch !== accessEpoch.current) return;
      if (response.status === 401) { setUnlocked(false); setCalls([]); setDestinations([]); setActive(null); return; }
      if (!response.ok) throw new Error(data.error);
      setUnlocked(true); setCalls(data.calls); setActive(data.active); setDestinations(data.destinations); setError('');
      if (pendingRef.current && data.calls.some(call => call.id === pendingRef.current.callId)) rememberPending(null);
    } catch (failure) { if (alive.current && epoch === accessEpoch.current) setError(failure.message || 'Call history could not be loaded.'); }
    finally { if (refreshing.current === token) refreshing.current = null; if (alive.current && epoch === accessEpoch.current) setLoading(false); }
  }, []);
  useEffect(() => {
    alive.current = true;
    try { const stored = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null'); if (stored?.callId) rememberPending(stored); } catch {}
    void refresh();
    return () => { alive.current = false; };
  }, [refresh]);
  useEffect(() => { if (!unlocked) return; const timer = setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 10000); return () => clearInterval(timer); }, [unlocked, refresh]);
  async function start(patientId, destinationId, actorId) {
    if (startLock.current || active || pendingRef.current) return null;
    startLock.current = true;
    const epoch = accessEpoch.current;
    const request = { patientId, destinationId, actorId, callId: crypto.randomUUID(), confirmed: true };
    rememberPending(request);
    try {
      const response = await fetch('/api/calls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) });
      const data = await response.json();
      if (epoch !== accessEpoch.current) return null;
      if (response.status === 401) setUnlocked(false);
      if (data.call) {
        setCalls(current => [data.call, ...current.filter(call => call.id !== data.call.id)]);
        setActive(['initiating', 'uncertain', 'submitted', 'in_progress', 'processing'].includes(data.call.status) ? data.call : null);
        rememberPending(null);
      } else if (!response.ok) rememberPending(null);
      if (data.error) setError(data.error);
      else setError('');
      await refresh();
      return data.call || null;
    } catch {
      setError('The request was interrupted. A call may still be placed. Use Refresh status before doing anything else; no automatic retry will occur.');
      return null;
    } finally { startLock.current = false; }
  }
  // A manually confirmed recovery reuses the exact request ID; it cannot create a duplicate.
  async function recover() {
    if (!pendingRef.current || startLock.current) return;
    startLock.current = true;
    const epoch = accessEpoch.current;
    try {
      const response = await fetch('/api/calls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pendingRef.current) });
      const data = await response.json();
      if (epoch !== accessEpoch.current) return;
      if (data.call || !response.ok) rememberPending(null);
      if (data.error) setError(data.error);
      await refresh();
    } catch { setError('Recovery was interrupted. Keep this request pending and refresh its status.'); }
    finally { startLock.current = false; }
  }
  return <CallContext.Provider value={{ unlocked, calls, active, destinations, error, loading, pending, refresh, start, recover }}>{children}</CallContext.Provider>;
}
