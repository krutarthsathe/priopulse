'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import DashboardShell from './DashboardShell';
import dataset from '../data/heart-failure-patients.json';
import { rankPatients, DEFAULT_SETTINGS } from '../lib/heart-failure-ranking';
import { hitsAtK } from '../lib/agent/evaluate';
import { recordAuditEvent, AUDIT_ACTIONS, useAuditLog } from '../lib/audit-log';
import { DEMO_USERS, useCurrentUser } from '../lib/current-user';
import { useAgentRun } from './dashboard/useAgentRun';
import { todaysCallStatus, versionName, formatTime } from './dashboard/helpers';
import { TodayStrip } from './dashboard/KpiStrip';
import CallList from './dashboard/CallList';
import AgentPanel from './dashboard/AgentPanel';
import { DecisionLine } from './dashboard/AgentStory';
import QuickView from './dashboard/QuickView';
import CompareDrawer from './dashboard/CompareDrawer';
import ImportDrawer from './dashboard/ImportDrawer';
import { CallAccess, CallAlerts, CallLauncher, CallSetupHelp } from './calls/CallWorkspace';
import { useCalls } from './calls/CallProvider';
import './heart-failure.css';
import './patient-photo.css';
import './dashboard/dashboard.css';

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [listSize, setListSize] = useState(25);
  const [imported, setImported] = useState([]);
  const [override, setOverride] = useState(null);
  const [panel, setPanel] = useState(null);
  const [agentTab, setAgentTab] = useState('scoring');
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState('');
  const [today, setToday] = useState('');
  // Nurse-triggered phone follow-ups: one call at a time, started from a row and confirmed in the call window.
  const [callPatient, setCallPatient] = useState(null);
  const callDialog = useRef(null);
  const { active: activeCall, pending: pendingCall } = useCalls();
  useEffect(() => { if (callPatient && !callDialog.current?.open) callDialog.current?.showModal(); }, [callPatient]);
  const user = useCurrentUser() ?? DEMO_USERS[0];
  useEffect(() => setToday(new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })), []);

  const patients = useMemo(() => [...dataset.patients, ...imported], [imported]);
  const agent = useAgentRun(patients);
  const rule = override ?? agent.current.rule;
  const versionLabel = override ? 'your custom scoring' : versionName(agent.current.version).toLowerCase();

  const ranked = useMemo(() => rankPatients(patients, rule), [patients, rule]);
  const rows = ranked.slice(0, listSize);
  const base = useMemo(() => rankPatients(patients, DEFAULT_SETTINGS), [patients]);
  const baseRanks = useMemo(() => new Map(base.map(p => [p.id, p.rank])), [base]);
  const baseTop = useMemo(() => new Set(base.slice(0, listSize).map(p => p.id)), [base, listSize]);

  const audit = useAuditLog();
  const statuses = useMemo(() => todaysCallStatus(audit), [audit]);
  const rowStatuses = rows.map(p => statuses.get(p.id)).filter(Boolean);
  const calls = { total: rows.length, attempted: rowStatuses.length, reached: rowStatuses.filter(s => s.action === 'call_called').length, retry: rowStatuses.filter(s => s.action === 'call_no_answer').length, escalate: rowStatuses.filter(s => s.action === 'call_unreachable').length };

  // Grading uses only the 299 records with recorded outcomes; imported patients are never graded.
  const reached = useMemo(() => ({ oldest: hitsAtK(rankPatients(dataset.patients, DEFAULT_SETTINGS, true), listSize), agent: hitsAtK(rankPatients(dataset.patients, rule), listSize) }), [rule, listSize]);
  const history = agent.final.history;
  const baseline = agent.allEvents.find(e => e.type === 'baseline');
  const currentEntry = history.find(h => h.version === agent.current.version) ?? history[0];
  const heldOut = { oldest: baseline.score.heldOut, start: history[0].score.heldOut, agent: override ? null : currentEntry.score.heldOut };
  const decisions = new Map(agent.events.filter(e => e.type === 'promoted' || e.type === 'rejected').map(e => [e.round, e]));
  const rounds = [...decisions.values()].map(e => ({ round: e.round, champion: e.champion.heldOut, challenger: e.challenger.heldOut, verdict: e.type }));
  const protocol = agent.allEvents.find(e => (e.type === 'promoted' || e.type === 'rejected') && e.round === 1);
  const change = override ? 'Edited by hand in How patients are scored' : currentEntry.round ? `Changed in round ${currentEntry.round}: ${currentEntry.change.toLowerCase()}` : 'No changes adopted yet';

  const selected = selectedId ? ranked.find(p => p.id === selectedId) : null;
  const selectedHistory = selected ? audit.filter(e => e.patient === selected.id).toReversed() : [];
  const status = agent.replaying ? { tone: 'is-running', text: agent.playing ? 'Agent running…' : 'Agent paused' } : override ? { tone: 'is-override', text: 'Custom scoring in use' } : { tone: '', text: `${versionName(agent.current.version)} · reviewed today` };

  function logOutcome(patient, action) {
    try {
      recordAuditEvent({ actor: user, action, patient: patient.id, detail: 'Call outcome logged from the follow-up call list' });
      setNotice({ text: `${patient.id}: ${AUDIT_ACTIONS[action].label} recorded.`, undo: patient });
    } catch { setNotice('The call outcome could not be saved.'); }
  }
  function undoOutcome(patient) {
    const current = statuses.get(patient.id);
    if (!current) return;
    try {
      recordAuditEvent({ actor: user, action: 'call_undo', patient: patient.id, detail: `Undid "${current.label}" logged at ${formatTime(current.at)}`, from: current.label, to: current.previous?.label ?? 'Not called yet', reason: 'Logged by mistake' });
      setNotice(`${patient.id}: "${current.label}" undone. ${current.previous ? `Back to "${current.previous.label}".` : 'Back to not called yet.'}`);
    } catch { setNotice('The undo could not be saved.'); }
  }
  function editScoring(next, change) {
    setOverride(next);
    try {
      recordAuditEvent({ actor: user, action: 'weight_change', from: String(change.from), to: String(change.to), detail: `Scoring changed by hand: ${change.label}`, reason: 'Edited in How patients are scored' });
      setNotice(`${change.label}: ${change.from} → ${change.to}. The call list has been re-ranked.`);
    } catch { setNotice('Scoring updated. The browser audit log could not be saved.'); }
  }
  function importPatients(records) {
    setImported(current => [...current, ...records.map((record, i) => ({ ...record, id: `NEW-${String(current.length + i + 1).padStart(3, '0')}`, imported: true }))]);
    agent.replayAfterChange();
    setNotice(`${records.length === 1 ? 'New patient' : `${records.length} new patients`} scored and added to the list. The agent is re-checking its scoring.`);
  }
  function openPatient(patient) { setPanel(null); setSelectedId(patient.id); }
  function openAgent(tab = 'scoring') { setAgentTab(tab); setPanel('agent'); }

  return <DashboardShell search={search} setSearch={setSearch} setPage={() => {}} searchLabel="Search today's call list" searchPlaceholder="Search patient ID or scoring reason…">
    <main id="main-content" className="pt-16 pb-6 min-h-dvh ml-0 lg:ml-64 transition-all duration-300">
      <div className="hf-dashboard pd-dashboard">
        <div className="pd-shift">
          <div>
            <span className="hf-eyebrow">PrioPulse · Heart-failure follow-up</span>
            <h1>Today’s follow-up calls</h1>
            <div className="pd-shift-meta">
              {today && <span><i className="ph ph-calendar-blank" />{today}</span>}
              <span><i className="ph ph-user" />{user.name}, {user.title}</span>
              <span><i className="ph ph-users" />{patients.length} patients{imported.length ? ` · ${imported.length} new today` : ''}</span>
            </div>
          </div>
          <div className="pd-shift-actions">
            <button type="button" className={`pd-pill ${status.tone}`} onClick={() => openAgent(agent.replaying ? 'tests' : 'scoring')} title="Open scoring & agent tests"><span className="pd-dot" />{status.text}</button>
            <button className="pd-btn" onClick={() => setPanel('import')}><i className="ph ph-user-plus" />Add patient</button>
            <button className="pd-btn pd-btn-primary" onClick={() => openAgent()}><i className="ph ph-sliders-horizontal" />Scoring &amp; agent tests</button>
          </div>
        </div>

        {override && <div className="pd-banner" role="status"><span><strong>Custom scoring in use.</strong> The call list uses your settings instead of the agent’s {versionName(agent.current.version).toLowerCase()}.</span><span className="pd-shift-actions"><button className="pd-btn pd-btn-sm" onClick={() => openAgent('scoring')}>Edit scoring</button><button className="pd-btn pd-btn-sm" onClick={() => setOverride(null)}>Go back to the agent’s scoring</button></span></div>}

        <DecisionLine allEvents={agent.allEvents} patientCount={dataset.patients.length} onOpen={() => openAgent('tests')} />

        <TodayStrip listSize={listSize} setListSize={setListSize} calls={calls} version={override ? 'manual' : agent.current.version} change={change} onDetails={() => openAgent()} />

        <section className="hf-card call-queue-panel" aria-labelledby="phone-heading">
          <div className="hf-section-heading"><h2 id="phone-heading">Nurse-controlled phone follow-ups</h2><a className="pd-btn pd-btn-sm" href="/calls"><i className="ph ph-phone-list" />Calls &amp; Review <i className="ph ph-arrow-up-right" /></a></div>
          <p>Start a call from any patient with the <i className="ph ph-phone-outgoing" aria-label="Start follow-up call" /> button. Each call goes to a verified demo participant; no calls start automatically.</p>
          <CallAccess /><CallAlerts /><CallSetupHelp />
        </section>

        <CallList onStartCall={patient => setCallPatient(patient.id)} callBusy={!!activeCall || !!pendingCall} rows={rows} allRanked={ranked} baseRanks={baseRanks} baseTop={baseTop} statuses={statuses} onOutcome={logOutcome} onUndo={undoOutcome} onOpen={openPatient} search={search} setSearch={setSearch} listSize={listSize} versionLabel={versionLabel} totalPatients={patients.length} />

        <footer className="hf-caption">Ranks who to call first; it does not diagnose. Not a validated clinical tool. Confirmed phone calls and reviewed notes are shared through Supabase; manual outcome buttons and scoring changes stay in this browser. Dataset: Chicco &amp; Jurman, Heart Failure Clinical Records (2020), <a href="https://doi.org/10.24432/C5Z89R">UCI Machine Learning Repository</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</footer>
        {notice && <div className="hf-notice" role="status">{notice.text ?? notice}{notice.undo && statuses.has(notice.undo.id) && <button className="pd-link" onClick={() => undoOutcome(notice.undo)}>Undo</button>}<button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
      </div>
        <dialog ref={callDialog} className="call-modal pd-call-modal" onClose={() => setCallPatient(null)}>
          <div className="pd-drawer-head"><h2>Follow-up call · {callPatient}</h2><button className="pd-close" aria-label="Close call window" onClick={() => callDialog.current.close()}><i className="ph ph-x" /></button></div>
          <div className="pd-drawer-body"><CallAccess /><CallAlerts />{callPatient && <CallLauncher patientId={callPatient} />}<p><a className="pd-link" href="/calls">View shared call history and review transcripts</a></p></div>
        </dialog>
    </main>
    {selected && <QuickView patient={selected} rule={rule} versionLabel={versionLabel} history={selectedHistory} status={statuses.get(selected.id)} onOutcome={logOutcome} onUndo={undoOutcome} onClose={() => setSelectedId(null)} />}
    {panel === 'agent' && <AgentPanel tab={agentTab} setTab={setAgentTab} onClose={() => setPanel(null)} onCompare={() => setPanel('compare')} onOpenPatient={openPatient} agent={agent} override={override} graded={dataset.patients} droppedRows={dataset.droppedRows}
      scoring={{ rule, agentRule: agent.current.rule, agentVersion: agent.current.version, override, onChange: editScoring, onReset: () => { setOverride(null); setNotice('Back to the agent’s scoring.'); } }}
      tests={{ kpi: { listSize, reached, heldOut, rounds, version: override ? 'manual' : agent.current.version }, findings: { final: agent.final, current: agent.current, reached: { oldest: baseline.score.full }, protocol } }}
      safety={{ patients, rule, listSize, events: agent.events, droppedRows: dataset.droppedRows }} />}
    {panel === 'compare' && <CompareDrawer patients={patients} rule={rule} versionLabel={versionLabel} listSize={listSize} onOpen={openPatient} onClose={() => openAgent('tests')} />}
    {panel === 'import' && <ImportDrawer onImport={importPatients} onClose={() => setPanel(null)} />}
  </DashboardShell>;
}
