'use client';
import { useEffect, useRef, useState } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { recordAuditEvent } from '../../lib/audit-log';
import { transcriptDraft, transcriptMessage } from '../../lib/voice-transcript';

export default function VoiceFollowUp({ patientId, actor }) {
  const [messages, setMessages] = useState([]);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  return <ConversationProvider onConnect={event => setSessionId(event.conversationId)} onMessage={event => { const message = transcriptMessage(event); if (message) setMessages(current => [...current, message]); }} onDisconnect={() => setFinished(true)} onError={() => { setError('Voice connection failed. Your received transcript is preserved. End the session and review it.'); setFinished(true); }}>
    <VoiceWorkspace key={patientId} patientId={patientId} actor={actor} messages={messages} setMessages={setMessages} finished={finished} setFinished={setFinished} error={error} setError={setError} sessionId={sessionId} setSessionId={setSessionId} />
  </ConversationProvider>;
}
function VoiceWorkspace({ patientId, actor, messages, setMessages, finished, setFinished, error, setError, sessionId, setSessionId }) {
  const conversation = useConversation();
  const [passcode, setPasscode] = useState('');
  const [starting, setStarting] = useState(false);
  const [draft, setDraft] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(false);
  const [notice, setNotice] = useState('');
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const endRef = useRef(conversation.endSession);
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const alive = useRef(true);
  const startedRef = useRef(false);
  const saveLock = useRef(false);
  endRef.current = conversation.endSession;
  const active = conversation.status !== 'disconnected' || starting;
  const pending = messages.length > 0 && !saved;
  useEffect(() => { alive.current = true; return () => { alive.current = false; abortRef.current?.abort(); clearTimeout(timerRef.current); void Promise.resolve(endRef.current()).catch(() => {}); }; }, []);
  useEffect(() => {
    if (finished) { clearTimeout(timerRef.current); setStarting(false); if (!saved) setDraft(current => current || transcriptDraft(patientId, sessionId, messages)); }
  }, [finished, messages, patientId, sessionId, saved]);
  useEffect(() => {
    const warn = event => { if (pending || active) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [pending, active]);
  async function end() { abortRef.current?.abort(); clearTimeout(timerRef.current); try { await endRef.current(); } catch { setError('Session stopped with a connection error. Review the available transcript.'); } if (alive.current) { setStarting(false); setFinished(true); } }
  async function start() {
    if (startedRef.current || active || pending) return;
    startedRef.current = true; setStarting(true); setFinished(false); setError(''); setNotice(''); setSaved(false); setReviewed(false); setDraft(''); setMessages([]); setSessionId(''); saveLock.current = false; setMuted(false);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      // Check microphone access before issuing a paid-session link; release the probe immediately.
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('microphone');
      const probe = await navigator.mediaDevices.getUserMedia({ audio: true }); probe.getTracks().forEach(track => track.stop());
      if (controller.signal.aborted || !alive.current) return;
      const response = await fetch('/api/voice/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode, patientId }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Unable to start voice.'); return; }
      if (controller.signal.aborted || !alive.current) return;
      conversation.startSession({ signedUrl: data.signedUrl, connectionType: 'websocket' });
      setPasscode('');
    } catch (failure) {
      if (failure.name !== 'AbortError' && alive.current) { setError(['NotAllowedError', 'NotFoundError'].includes(failure.name) || failure.message === 'microphone' ? 'Microphone unavailable. Allow microphone access and use HTTPS or localhost.' : 'Unable to connect to voice. Check your network and try again.'); await Promise.resolve(endRef.current()).catch(() => {}); }
    } finally { startedRef.current = false; if (alive.current) setStarting(false); }
  }
  useEffect(() => {
    if (conversation.status !== 'connected') return;
    setStarting(false);
    timerRef.current = setTimeout(() => { setNotice('Five-minute demo limit reached. Review the transcript below.'); void end(); }, 5 * 60 * 1000);
    return () => clearTimeout(timerRef.current);
  }, [conversation.status]);
  function save() {
    if (saveLock.current || saved || !reviewed || !draft.trim() || active) return;
    saveLock.current = true;
    try {
      const entry = recordAuditEvent({ actor, action: 'note', patient: patientId, detail: `Nurse-reviewed fictional voice demo\nPatient: ${patientId}\nSession: ${sessionId || 'Unavailable'}\n\n${draft.trim()}` });
      const stored = JSON.parse(localStorage.getItem('priopulse-audit-log-v2') || '[]');
      if (!stored.some(record => record.id === entry.id)) throw new Error('Storage unavailable');
      setSaved(true); setNotice('Reviewed note saved to this patient’s Follow-up Activity in this browser.');
    } catch { saveLock.current = false; setError('The reviewed note could not be saved. Your draft is preserved.'); }
  }
  function discard() { setMessages([]); setDraft(''); setFinished(false); setSessionId(''); setReviewed(false); setSaved(false); setDiscardConfirm(false); setNotice('Unsaved transcript and draft discarded.'); }
  return <section className="hf-card voice-panel" aria-labelledby="voice-heading"><div className="hp-card-title"><i className="ph ph-microphone" /><h2 id="voice-heading">Voice follow-up demo</h2><span className="hf-badge">Fictional role-play</span></div><p>Play the patient using fictional answers. Audio and transcript are sent to ElevenLabs and may be retained under your account settings. No patient measurements or outcomes are sent.</p><div className="voice-controls"><label>Demo passcode<input type="password" autoComplete="off" maxLength={256} value={passcode} onChange={e => setPasscode(e.target.value)} disabled={active} /></label><button className="hf-action" disabled={active || pending || !passcode} onClick={start}>{starting ? 'Connecting…' : 'Start demo conversation'}</button><button className="hf-action" disabled={!active} onClick={end}>End conversation</button><button className="hf-action" disabled={conversation.status !== 'connected'} onClick={() => { conversation.setMuted(!muted); setMuted(!muted); }}>{muted ? 'Unmute microphone' : 'Mute microphone'}</button></div><p role="status">{starting ? 'Connecting' : conversation.status} · {muted ? 'Microphone muted' : 'Microphone enabled during session'} · Five-minute maximum</p>{error && <p role="alert" className="voice-error">{error}</p>}{notice && <p role="status">{notice}</p>}<details><summary>Setup help</summary><p>Create an authenticated ElevenLabs agent, then configure ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, and VOICE_DEMO_PASSCODE on the server. See docs/elevenlabs-setup.md. Manual follow-up controls remain available.</p></details><div className="voice-transcript" aria-label="Conversation transcript">{messages.length ? messages.map((message, index) => <div key={index}><strong>{message.speaker}</strong><p>{message.text}</p></div>) : <p>Your transcript will appear here. Nothing is saved automatically.</p>}</div>{finished && messages.length > 0 && <div className="voice-review"><label htmlFor={`voice-note-${patientId}`}>Review and edit the transcript-based note</label><textarea id={`voice-note-${patientId}`} value={draft} disabled={saved} onChange={e => { setDraft(e.target.value); setReviewed(false); }} /><label className="voice-check"><input type="checkbox" checked={reviewed} disabled={saved} onChange={e => setReviewed(e.target.checked)} /> I reviewed this fictional note and its transcript.</label><button className="hf-action" disabled={active || saved || !reviewed || !draft.trim()} onClick={save}>{saved ? 'Reviewed note saved' : 'Save reviewed note'}</button></div>}{pending && !active && <div><button className="hf-action" onClick={() => setDiscardConfirm(true)}>Discard unsaved draft</button>{discardConfirm && <div role="alert"><p>Discard this transcript and draft? This cannot be undone.</p><button className="hf-action" onClick={discard}>Confirm discard</button><button className="hf-action" onClick={() => setDiscardConfirm(false)}>Keep draft</button></div>}</div>}<p className="hf-caption">Ending a conversation does not mark the patient as called. Save a reviewed note or discard the draft before starting another session.</p></section>;
}
