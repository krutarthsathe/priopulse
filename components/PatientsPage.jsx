'use client';
import { useMemo, useState } from 'react';
import DashboardShell from './DashboardShell';
import dataset from '../data/heart-failure-patients.json';
import { rankPatients, evaluateList, compareLists, DEFAULT_SETTINGS } from '../lib/heart-failure-ranking';
import { recordAuditEvent, AUDIT_ACTIONS } from '../lib/audit-log';
import { DEMO_USERS, useCurrentUser } from '../lib/current-user';
import PatientPhoto from './PatientPhoto';
import './heart-failure.css';
import './patient-photo.css';

const METHODS = { original: 'Original score', revised: 'Adjusted score', oldest: 'Oldest first' };
const OUTCOMES = ['call_called', 'call_no_answer', 'call_unreachable'];

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [mode, setMode] = useState('challenge');
  const [capacity, setCapacity] = useState(25);
  const weight = settings.heartWeight;
  const [method, setMethod] = useState('original');
  const [notice, setNotice] = useState('');
  const [outcomes, setOutcomes] = useState({});
  const user = useCurrentUser() ?? DEMO_USERS[0];
  const rankings = useMemo(() => ({
    oldest: rankPatients(dataset.patients, 2, true),
    original: rankPatients(dataset.patients, 2),
    revised: rankPatients(dataset.patients, settings),
  }), [settings]);
  const lists = Object.fromEntries(Object.entries(rankings).map(([key, patients]) => [key, patients.slice(0, 25)]));
  const changes = compareLists(lists.original, lists.revised);
  const queueSize = mode === 'explore' ? capacity : 25;
  const queue = rankings[method].slice(0, queueSize);
  const originalScores = new Map(rankings.original.map(patient => [patient.id, patient.score]));
  const originalRanks = new Map(rankings.original.map(patient => [patient.id, patient.rank]));
  const visible = queue.filter(patient => `${patient.id} ${patient.reasons.map(r => r.label).join(' ')}`.toLowerCase().includes(search.trim().toLowerCase()));
  const baselineDeaths = evaluateList(lists.oldest).deaths;

  function changeWeight(value) {
    const next = Number(value);
    if (next === weight) return;
    setSettings(current => ({ ...current, heartWeight: next })); setMethod('revised');
    try {
      recordAuditEvent({ actor: user, action: 'weight_change', from: String(weight), to: String(next), detail: 'Weak-heart points changed; kidney points remain 2', reason: 'Challenge sensitivity demonstration' });
      setNotice(`Heart points changed to ${next}. All 299 records rescored; kidney points remain 2.`);
    } catch { setNotice('Ranking updated. The browser audit log could not be saved.'); }
  }
  function patientLink(patient, selectedMethod) {
    const active = selectedMethod === 'revised' ? settings : DEFAULT_SETTINGS;
    return `/patient-details?id=${patient.id}&${new URLSearchParams(Object.entries(active).map(([key, value]) => [key, String(value)])).toString()}`;
  }
  function logOutcome(patient, action) {
    if (!action) return;
    try {
      recordAuditEvent({ actor: user, action, patient: patient.id, detail: 'Demo call outcome logged from heart-failure queue' });
      setOutcomes(current => ({ ...current, [patient.id]: action }));
      setNotice(`${patient.id}: ${AUDIT_ACTIONS[action].label} recorded in the browser audit log.`);
    } catch { setNotice('The call outcome could not be saved.'); }
  }
  return <DashboardShell search={search} setSearch={setSearch} setPage={() => {}} searchLabel="Search the top 25" searchPlaceholder="Search patient ID or scoring reason…">
    <main id="main-content" className="pt-16 pb-6 min-h-dvh ml-0 lg:ml-64 transition-all duration-300">
      <div className="hf-dashboard">
        <div className="hf-heading"><div><span className="hf-eyebrow">PrioPulse · Follow-up prioritization</span><h1>Who should the nurse call first?</h1><p>An explainable top-25 queue from 299 historical heart-failure records.</p></div><span className="hf-badge">Research dataset · Demo</span></div>
        <div className="hf-info"><strong>{dataset.patients.length} patients loaded</strong> · {dataset.droppedRows} rows removed for missing values · {dataset.patients.reduce((sum, p) => sum + p.DEATH_EVENT, 0)} recorded deaths during follow-up. Patient IDs identify anonymous dataset rows.</div>

        <section aria-labelledby="comparison-heading"><div className="hf-section-heading"><h2 id="comparison-heading">Historical evaluation</h2><span>Recorded deaths captured among each list’s 25 patients</span></div>
          <div className="hf-metrics">{Object.entries(METHODS).map(([key, label]) => {
            const deaths = evaluateList(lists[key]).deaths;
            const difference = deaths - baselineDeaths;
            return <button key={key} className={`hf-card hf-method ${method === key ? 'is-selected' : ''}`} aria-pressed={method === key} onClick={() => setMethod(key)}><span>{label}</span><strong>{deaths}<small> / 25</small></strong><p>{key === 'oldest' ? 'Sorted by age, highest first' : `Heart ${key === 'original' ? 2 : weight} · kidneys ${key === 'original' ? 2 : settings.kidneyWeight} points`}</p><span className="hf-caption">{key === 'oldest' ? 'Comparison baseline' : `${difference > 0 ? '+' : ''}${difference} versus oldest first`}</span></button>;
          })}</div>
          <p className="hf-caption">These are known historical outcomes, not predicted deaths or evidence that calls prevent deaths. Outcomes and follow-up duration are excluded from scoring.</p>
        </section>

        <section className="hf-card" aria-labelledby="weight-heading"><div className="hf-section-heading"><h2 id="weight-heading">Ranking settings</h2><button className="hf-action" onClick={() => { setSettings({ ...DEFAULT_SETTINGS }); setCapacity(25); setMethod('original'); setSearch(''); }}>Reset to challenge defaults</button></div>
          <div className="hf-mode-switch">{[['challenge', 'Challenge Demo'], ['explore', 'Explore Settings']].map(([key, label]) => <button key={key} aria-pressed={mode === key} onClick={() => { setMode(key); setSettings({ ...DEFAULT_SETTINGS }); setCapacity(25); setMethod('original'); }}>{label}</button>)}</div>
          <p>{mode === 'challenge' ? 'Keep all measurements fixed. Change only weak-heart points from 2 to 3.' : 'Experimental settings. The historical evaluation above always compares top 25; call capacity changes only the queue below.'}</p>
          {mode === 'challenge' ? <div className="hf-weight"><span>Heart points: <strong>{weight}</strong> · Kidney points: 2</span><button className="hf-action" disabled={weight === 3} onClick={() => changeWeight(3)}>Increase heart points to 3</button></div> : <div className="hf-setting-grid">{[
            ['heartWeight', 'Weak-heart points', [0,1,2,3,4,5]], ['kidneyWeight', 'Kidney points', [0,1,2,3,4,5]], ['heartThreshold', 'Heart pumping threshold (%)', [25,30,35,40,45,50]], ['kidneyThreshold', 'Kidney threshold (mg/dL)', [1,1.2,1.5,1.8,2,2.5]],
          ].map(([key,label,values]) => <label key={key}>{label}<select value={settings[key]} onChange={e => { setSettings(current => ({ ...current, [key]: Number(e.target.value) })); setMethod('revised'); }}>{values.map(value => <option key={value} value={value}>{value}</option>)}</select></label>)}<label>Call capacity<select value={capacity} onChange={e => setCapacity(Number(e.target.value))}>{[10,15,25,50].map(value => <option key={value} value={value}>{value} calls</option>)}</select></label></div>}
          <p className="hf-caption">Heart measurement must be below its threshold; kidney measurement must be above its threshold. Age and condition points stay fixed.</p>
        </section>
        <section className="hf-card hf-changes" aria-live="polite"><div className="hf-section-heading"><h2>Before → After · Top 25</h2><span className="hf-badge">{changes.overlap}/25 remain · {changes.entered.length} enter · {changes.left.length} leave</span></div><p>Original: {evaluateList(lists.original).deaths}/25 recorded deaths → Adjusted: {evaluateList(lists.revised).deaths}/25. A higher weight does not necessarily improve this measure.</p>
          <p><strong>Entered:</strong> {changes.entered.length ? changes.entered.map(p => <a className="hf-change-link" key={p.id} href={patientLink(p, 'revised')}>{p.id}: #{originalRanks.get(p.id)} → #{p.rank} · {originalScores.get(p.id)} → {p.score} points </a>) : 'None'}</p>
          <p><strong>Left:</strong> {changes.left.length ? changes.left.map(p => { const after = rankings.revised.find(record => record.id === p.id); return <span className="hf-change-link" key={p.id}>{p.id}: #{p.rank} → #{after.rank} · {p.score} → {after.score} points </span>; }) : 'None'}</p>
          {mode === 'challenge' && weight === 3 && <p>Patients with heart pumping below 35% gained one point. Other measurements and weights stayed fixed.</p>}
          <p className="hf-caption">Equal scores use age descending, then patient ID ascending.</p>
        </section>

        <section className="hf-card hf-queue" aria-labelledby="queue-heading"><div className="hf-queue-heading"><div><h2 id="queue-heading">{METHODS[method]} · Top {queueSize} call list</h2><p>{visible.length} of {queueSize} shown. Search filters this selected queue.</p></div><input aria-label="Filter call list" placeholder="Patient ID or reason" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="hf-table-wrap"><table className="hf-table"><thead><tr><th>Rank</th><th>Patient</th><th>Age</th><th>Heart pumping</th><th>Kidney measurement</th><th>Points</th><th>Why this patient?</th><th>Demo call outcome</th></tr></thead><tbody>{visible.map(patient => {
            const movement = originalRanks.get(patient.id) - patient.rank;
            return <tr key={patient.id}><td><strong>#{patient.rank}</strong>{method === 'revised' && <span className="hf-movement">{movement > 0 ? `↑ ${movement}` : movement < 0 ? `↓ ${-movement}` : 'Unchanged'}</span>}</td><td><div className="hf-patient-cell"><PatientPhoto patient={patient} thumbnail className="hf-patient-photo" /><a href={patientLink(patient, method)}>{patient.id}</a>{method === 'revised' && changes.entered.some(p => p.id === patient.id) && <span className="hf-badge">Entered</span>}</div></td><td>{patient.age}</td><td>{patient.ejection_fraction}%</td><td>{patient.serum_creatinine} mg/dL</td><td><span className="hf-score">{patient.score}</span>{method === 'revised' && <span className="hf-movement">{originalScores.get(patient.id)} → {patient.score} points</span>}</td><td><ul>{patient.reasons.map(reason => <li key={reason.label}>{reason.label} <strong>+{reason.points}</strong></li>)}</ul>{patient.reasons.length === 0 && 'No scoring conditions'}</td><td><select aria-label={`Log call outcome for ${patient.id}`} value={outcomes[patient.id] || ''} onChange={e => logOutcome(patient, e.target.value)}><option value="">Log outcome…</option>{OUTCOMES.map(action => <option key={action} value={action}>{AUDIT_ACTIONS[action].label}</option>)}</select></td></tr>;
          })}</tbody></table>{visible.length === 0 && <p className="hf-empty">No matching patients in this top-25 list. Try another ID or reason.</p>}</div>
        </section>
        <details className="hf-card hf-rules"><summary>How the score works</summary><p>2 points for heart pumping below 35% (3 when revised); 2 for kidney measurement above 1.5 mg/dL; 1 each for anaemia, diabetes, high blood pressure, and age 70 or older. Higher totals rank first.</p><p>Ejection fraction is the percentage of blood pumped out with each heartbeat. Serum creatinine is a blood measurement used to assess kidney function. Anaemia means too few healthy red blood cells.</p><p>These challenge rules are not a validated clinical decision tool. The app logs demo outcomes; it does not place phone calls. Logs are stored in this browser, not shared across users.</p></details>
        <footer className="hf-caption">Dataset: Chicco &amp; Jurman, Heart Failure Clinical Records (2020), <a href="https://doi.org/10.24432/C5Z89R">UCI Machine Learning Repository</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</footer>
        {notice && <div className="hf-notice" role="status">{notice}<button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
      </div>
    </main>
  </DashboardShell>;
}
