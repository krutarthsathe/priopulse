'use client';
import { useEffect, useRef, useState } from 'react';
import { useCalls } from './CallProvider';
import { ACTIVE_CALL_STATUSES, CALL_STATUS_LABELS, callNoteDraft, isReviewableCall } from '../../lib/call-transcript';
import { DEMO_USERS, useCurrentUser } from '../../lib/current-user';
import './calls.css';

export function CallSetupHelp() {
  return <details className="call-setup"><summary>Setup help</summary><ol><li>Run <code>supabase/schema.sql</code> in your Supabase SQL Editor.</li><li>Add the server variables from <code>docs/phone-follow-ups.md</code> to Vercel: Supabase URL and secret key, ElevenLabs key, agent ID, phone-number ID, webhook secret, demo passcode, and demo destinations.</li><li>In ElevenLabs, set the agent’s language to English and its maximum duration to 300 seconds. Use the fictional follow-up script.</li><li>Enable signed transcription and call-initiation-failure webhooks to <code>https://YOUR-SITE/api/elevenlabs/webhook</code>.</li><li>Verify receiving demo numbers in Twilio if you have a trial account. Redeploy Vercel after adding variables.</li></ol></details>;
}
export function CallAccess() {
  const { unlocked, unlock, lock, loading } = useCalls();
  const [passcode, setPasscode] = useState('');
  const [busy, setBusy] = useState(false);
  if (loading) return <p role="status">Checking phone follow-up access…</p>;
  if (unlocked) return <div className="call-access"><span><i className="ph ph-lock-open" /> Demo access unlocked · 8-hour session</span><button className="hf-action" onClick={lock}>Lock access</button></div>;
  return <form className="call-access" onSubmit={async event => { event.preventDefault(); if (busy) return; setBusy(true); if (await unlock(passcode)) setPasscode(''); setBusy(false); }}><label>Demo passcode<input type="password" autoComplete="off" maxLength={256} value={passcode} onChange={event => setPasscode(event.target.value)} required /></label><button className="hf-action call-primary" disabled={busy || !passcode}>{busy ? 'Unlocking…' : 'Unlock phone follow-ups'}</button><span>Shared demo access. User names are fictional identities.</span></form>;
}
export function CallStatus({ call }) {
  return <span className={`call-status call-status-${call.status}`}><span aria-hidden="true" />{CALL_STATUS_LABELS[call.status] || call.status}</span>;
}
export function CallAlerts() {
  const { error, active, pending, refresh, recover } = useCalls();
  const [recovering, setRecovering] = useState(false);
  const [confirmRecovery, setConfirmRecovery] = useState(false);
  return <>{error && <p className="call-error" role="alert">{error}</p>}{(active || pending) && <div className="call-active" role="status"><i className="ph ph-phone-call" /><div><strong>{active ? <>{active.patient_id} · <CallStatus call={active} /></> : 'Call request awaiting confirmation'}</strong><p>{active?.status === 'uncertain' || pending ? 'A call may still be active. The app will not automatically redial.' : 'One demo call at a time. Leaving this page does not end a phone call.'}</p><a href="/calls">Open Calls</a></div><button className="hf-action" onClick={refresh}>Refresh status</button></div>}{pending && <div className="call-recovery"><p>This interrupted request is associated with {pending.patientId}. Recovery checks the same request ID; if it was never received, it can place the originally confirmed call.</p>{!confirmRecovery ? <button className="hf-action" onClick={() => setConfirmRecovery(true)}>Recover original request…</button> : <><button className="hf-action" disabled={recovering} onClick={async () => { setRecovering(true); await recover(); setRecovering(false); setConfirmRecovery(false); }}>Confirm recovery; call may be placed</button><button className="hf-action" onClick={() => setConfirmRecovery(false)}>Cancel</button></>}</div>}</>;
}
export function CallLauncher({ patientId, onStarted }) {
  const { unlocked, destinations, active, pending, start } = useCalls();
  const actor = useCurrentUser() || DEMO_USERS[0];
  const [destinationId, setDestinationId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const startLock = useRef(false);
  const destination = destinations.find(item => item.id === destinationId);
  useEffect(() => { setDestinationId(''); setConfirmed(false); }, [patientId]);
  if (!unlocked) return <p>Unlock demo access to choose a verified receiving number.</p>;
  return <div className="call-launcher"><div className="call-controls"><label>Receiving demo phone<select value={destinationId} disabled={busy} onChange={event => { setDestinationId(event.target.value); setConfirmed(false); }}><option value="">Choose a demo destination…</option>{destinations.map(item => <option key={item.id} value={item.id}>{item.label} · {item.number}</option>)}</select></label><span>Initiated by {actor.name} · demo identity</span></div><div className="call-confirm"><i className="ph ph-info" aria-hidden="true" /><div><strong>Fictional patient {patientId}</strong><p>{destination ? `The assistant will call ${destination.label} at ${destination.number}.` : 'The selected number belongs to a demo participant, not this dataset patient.'} The call continues if you leave this page. Five-minute conversation maximum; answer on your phone.</p><label><input type="checkbox" checked={confirmed} disabled={!destination || busy} onChange={event => setConfirmed(event.target.checked)} /> I confirm this participant agreed to receive this fictional demo call.</label></div></div><button className="hf-action call-primary" disabled={!confirmed || !destination || busy || !!active || !!pending} onClick={async () => { if (startLock.current) return; startLock.current = true; setBusy(true); try { const call = await start(patientId, destinationId, actor.id); if (call) { setConfirmed(false); onStarted?.(call); } } finally { setBusy(false); startLock.current = false; } }}><i className="ph ph-phone-call" aria-hidden="true" />{busy ? 'Requesting call…' : 'Start follow-up call'}</button><p className="hf-caption">No microphone permission needed. No clinical measurements or historical outcomes are sent. Transcripts are processed by ElevenLabs and stored in Supabase.</p></div>;
}

export function CallRecord({ call, readOnly = false }) {
  const { refresh } = useCalls();
  const actor = useCurrentUser() || DEMO_USERS[0];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedCall, setSavedCall] = useState(null);
  const [conflictingDraft, setConflictingDraft] = useState('');
  const saveLock = useRef(false);
  const effective = call.reviewed_at ? call : savedCall || call;
  const draftKey = `priopulse-phone-draft-${call.id}`;
  useEffect(() => {
    if (call.reviewed_at || savedCall?.reviewed_at) {
      try {
        const stored = sessionStorage.getItem(draftKey);
        const sharedNote = (savedCall || call).reviewed_note;
        if (!savedCall && stored && stored.trim() !== sharedNote?.trim()) setConflictingDraft(stored);
        else { sessionStorage.removeItem(draftKey); setConflictingDraft(''); }
      } catch {}
      return;
    }
    try { setDraft(sessionStorage.getItem(draftKey) ?? callNoteDraft(call)); } catch { setDraft(callNoteDraft(call)); }
  }, [call.id, call.reviewed_at, JSON.stringify(call.transcript), savedCall?.reviewed_at, draftKey]);
  function edit(value) {
    setDraft(value); setReviewed(false);
    try { sessionStorage.setItem(draftKey, value); } catch { setError('Draft edits cannot persist across page reloads in this browser. Keep this page open until saved.'); }
  }
  async function save() {
    if (saveLock.current || !reviewed || !draft.trim() || effective.reviewed_at) return;
    saveLock.current = true; setSaving(true); setError('');
    try {
      const response = await fetch(`/api/calls/${call.id}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: draft, reviewed, actorId: actor.id }) });
      const data = await response.json();
      if (!response.ok) { if (data.call?.reviewed_at) setConflictingDraft(draft); throw new Error(data.error); }
      setSavedCall(data.call); try { sessionStorage.removeItem(draftKey); } catch {}
      await refresh();
    } catch (failure) { setError(failure.message || 'The note could not be saved. Your draft is preserved.'); saveLock.current = false; }
    finally { setSaving(false); }
  }
  return <article className="call-record"><div className="call-record-head"><div><a href={`/patient-details?id=${call.patient_id}`}>Patient {call.patient_id}</a><p>{call.destination_label}{call.destination_number ? ` · ${call.destination_number}` : ''}</p></div><CallStatus call={call} />{!readOnly && <button className="hf-action" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Close details' : effective.reviewed_at ? 'View reviewed note' : call.transcript?.length ? 'Review transcript' : 'View attempt'}</button>}</div><div className="call-meta"><span>{new Date(call.created_at).toLocaleString()}</span><span>Requested by {call.actor_name}</span>{call.duration_seconds != null && <span>{call.duration_seconds}s conversation</span>}{effective.reviewed_at ? <span className="call-reviewed">Reviewed by {effective.reviewed_by}</span> : isReviewableCall(call) && <span className="call-needs-review">Awaiting nurse review</span>}</div>{call.failure_message && <p className="call-failure">{call.failure_message}</p>}{open && <div className="call-record-body"><p className="hf-caption">Conversation: {call.conversation_id || 'Not yet confirmed'} · Twilio call: {call.call_sid || 'Not yet confirmed'}</p><div className="call-transcript" aria-label={`Transcript for ${call.patient_id}`}>{call.transcript?.length ? call.transcript.map((turn, index) => <div key={index} className={turn.speaker === 'Agent' ? 'call-turn-agent' : 'call-turn-participant'}><strong>{turn.speaker}</strong><p>{turn.text}</p></div>) : <p>{ACTIVE_CALL_STATUSES.includes(call.status) ? 'Transcript will appear after the conversation finishes. Status refreshes automatically while this page is open.' : 'No transcript is available for this attempt.'}</p>}</div>{effective.reviewed_at ? <div className="call-saved-note"><h3>Nurse-reviewed note</h3><p>{effective.reviewed_note}</p></div> : isReviewableCall(call) && <div className="call-review"><label htmlFor={`call-note-${call.id}`}>Review and edit the transcript-based note</label><textarea id={`call-note-${call.id}`} maxLength={100000} value={draft} disabled={saving} onChange={event => edit(event.target.value)} /><label className="call-checkbox"><input type="checkbox" checked={reviewed} disabled={saving} onChange={event => setReviewed(event.target.checked)} /> I reviewed the transcript and this fictional follow-up note.</label><div><button className="hf-action call-primary" disabled={!reviewed || !draft.trim() || saving} onClick={save}>{saving ? 'Saving…' : 'Save reviewed note'}</button><button className="hf-action" disabled={saving} onClick={() => { if (window.confirm('Discard your draft edits? The shared transcript will remain available.')) { try { sessionStorage.removeItem(draftKey); } catch {} setDraft(callNoteDraft(call)); setReviewed(false); } }}>Discard draft edits</button></div><p className="hf-caption">Nothing is saved as a reviewed note automatically. Unsaved edits stay in this browser tab; reviewed notes are shared through Supabase.</p></div>}{conflictingDraft && effective.reviewed_at && <div className="call-review"><label htmlFor={`preserved-draft-${call.id}`}>Your unsaved edits are preserved; a reviewed note already exists</label><textarea id={`preserved-draft-${call.id}`} value={conflictingDraft} readOnly /><button className="hf-action" onClick={() => { if (window.confirm('Discard these unsaved edits? The shared reviewed note will remain.')) { try { sessionStorage.removeItem(draftKey); } catch {} setConflictingDraft(''); } }}>Discard preserved edits</button></div>}{error && <p className="call-error" role="alert">{error}</p>}</div>}</article>;
}

export default function PatientPhoneFollowUp({ patientId }) {
  const { unlocked, calls } = useCalls();
  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState('');
  useEffect(() => {
    if (!unlocked) { setHistory(null); return; }
    const abort = new AbortController();
    void fetch(`/api/calls?patientId=${encodeURIComponent(patientId)}`, { cache: 'no-store', signal: abort.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (!abort.signal.aborted) { setHistory(data.calls); setHistoryError(''); }
    }).catch(failure => { if (failure.name !== 'AbortError') setHistoryError(failure.message || 'Patient call history could not be loaded.'); });
    return () => abort.abort();
  }, [unlocked, patientId, calls]);
  const patientCalls = history || calls.filter(call => call.patient_id === patientId);
  return <section className="hf-card call-panel" aria-labelledby="phone-follow-up-heading"><div className="hf-section-heading"><div><span className="hf-eyebrow">NURSE-CONTROLLED FOLLOW-UP</span><h2 id="phone-follow-up-heading">Phone follow-up</h2></div><a className="hf-action" href="/calls">All calls <i className="ph ph-arrow-up-right" /></a></div><p>Choose a verified demo number. The automated assistant asks about appointments, attendance difficulties, and a nurse callback. Review its transcript before saving a note.</p><CallAccess /><CallAlerts /><CallLauncher patientId={patientId} /><CallSetupHelp />{unlocked && <div className="call-history"><h3>This patient’s phone follow-ups</h3>{historyError && <p className="call-error" role="alert">{historyError}</p>}{patientCalls.length ? patientCalls.map(call => <CallRecord key={call.id} call={call} />) : <p>{history === null ? 'Loading patient call history…' : 'No shared call attempts yet.'}</p>}</div>}</section>;
}
