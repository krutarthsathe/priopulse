'use client';
import { useMemo, useState } from 'react';
import DashboardShell from './DashboardShell';
import dataset from '../data/heart-failure-patients.json';
import { rankPatients, evaluateList, compareLists } from '../lib/heart-failure-ranking';
import { recordAuditEvent, AUDIT_ACTIONS } from '../lib/audit-log';
import { DEMO_USERS, useCurrentUser } from '../lib/current-user';
import './heart-failure.css';

const METHODS = { original: 'Original score', revised: 'Adjusted score', oldest: 'Oldest first' };
const OUTCOMES = ['call_called', 'call_no_answer', 'call_unreachable'];

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [weight, setWeight] = useState(2);
  const [method, setMethod] = useState('original');
  const [notice, setNotice] = useState('');
  const [outcomes, setOutcomes] = useState({});
  const user = useCurrentUser() ?? DEMO_USERS[0];
  const rankings = useMemo(() => ({
    oldest: rankPatients(dataset.patients, 2, true),
    original: rankPatients(dataset.patients, 2),
    revised: rankPatients(dataset.patients, weight),
  }), [weight]);
  const lists = Object.fromEntries(Object.entries(rankings).map(([key, patients]) => [key, patients.slice(0, 25)]));
  const changes = compareLists(lists.original, lists.revised);
  const originalRanks = new Map(rankings.original.map(patient => [patient.id, patient.rank]));
  const visible = lists[method].filter(patient => `${patient.id} ${patient.reasons.map(r => r.label).join(' ')}`.toLowerCase().includes(search.trim().toLowerCase()));
  const baselineDeaths = evaluateList(lists.oldest).deaths;

  function changeWeight(value) {
    const next = Number(value);
    if (next === weight) return;
    setWeight(next); setMethod('revised');
    try {
      recordAuditEvent({ actor: user, action: 'weight_change', from: String(weight), to: String(next), detail: 'Weak-heart points changed; kidney points remain 2', reason: 'Challenge sensitivity demonstration' });
      setNotice(`Heart points changed to ${next}. All 299 records rescored; kidney points remain 2.`);
    } catch { setNotice('Ranking updated. The browser audit log could not be saved.'); }
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
            return <button key={key} className={`hf-card hf-method ${method === key ? 'is-selected' : ''}`} aria-pressed={method === key} onClick={() => setMethod(key)}><span>{label}</span><strong>{deaths}<small> / 25</small></strong><p>{key === 'oldest' ? 'Sorted by age, highest first' : `Heart ${key === 'original' ? 2 : weight} points · kidneys 2 points`}</p><span className="hf-caption">{key === 'oldest' ? 'Comparison baseline' : `${difference > 0 ? '+' : ''}${difference} versus oldest first`}</span></button>;
          })}</div>
          <p className="hf-caption">These are known historical outcomes, not predicted deaths or evidence that calls prevent deaths. Outcomes and follow-up duration are excluded from scoring.</p>
        </section>

        <section className="hf-card hf-controls" aria-labelledby="weight-heading"><div><h2 id="weight-heading">Give weak hearts more importance</h2><p>Keep patient measurements fixed. Change only the points for heart pumping below 35%.</p><label className="hf-weight">Weak-heart points <select value={weight} onChange={e => changeWeight(e.target.value)}><option value={2}>2 points · Original</option><option value={3}>3 points · Revised</option></select></label><p className="hf-caption">Kidney threshold stays above 1.5 mg/dL and its weight stays at 2 points.</p></div><div className="hf-overlap" aria-live="polite"><strong>{changes.overlap} / 25</strong><span>patients remain in both lists</span><p>{changes.entered.length} entered · {changes.left.length} left</p></div></section>
        {weight === 3 && <section className="hf-card hf-changes"><h2>What changed?</h2><p>Patients with heart pumping below 35% gain one point. Other scores remain unchanged; positions can shift when patients overtake one another.</p><p><strong>Entered:</strong> {changes.entered.map(p => `${p.id} (${p.ejection_fraction}% heart pumping)`).join(', ') || 'None'}</p><p><strong>Left:</strong> {changes.left.map(p => `${p.id} (${p.ejection_fraction}% heart pumping)`).join(', ') || 'None'}</p><p className="hf-caption">Equal scores are ordered by age descending, then patient ID ascending.</p></section>}

        <section className="hf-card hf-queue" aria-labelledby="queue-heading"><div className="hf-queue-heading"><div><h2 id="queue-heading">{METHODS[method]} · Top 25 call list</h2><p>{visible.length} of 25 shown. Search filters this selected queue.</p></div><input aria-label="Filter call list" placeholder="Patient ID or reason" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="hf-table-wrap"><table className="hf-table"><thead><tr><th>Rank</th><th>Patient</th><th>Age</th><th>Heart pumping</th><th>Kidney measurement</th><th>Points</th><th>Why this patient?</th><th>Demo call outcome</th></tr></thead><tbody>{visible.map(patient => {
            const movement = originalRanks.get(patient.id) - patient.rank;
            return <tr key={patient.id}><td><strong>#{patient.rank}</strong>{method === 'revised' && weight === 3 && <span className="hf-movement">{movement > 0 ? `↑ ${movement}` : movement < 0 ? `↓ ${-movement}` : 'Unchanged'}</span>}</td><td><a href={`/patient-details?id=${patient.id}&weight=${method === 'revised' ? weight : 2}`}>{patient.id}</a>{method === 'revised' && changes.entered.some(p => p.id === patient.id) && <span className="hf-badge">Entered</span>}</td><td>{patient.age}</td><td>{patient.ejection_fraction}%</td><td>{patient.serum_creatinine} mg/dL</td><td><span className="hf-score">{patient.score}</span></td><td><ul>{patient.reasons.map(reason => <li key={reason.label}>{reason.label} <strong>+{reason.points}</strong></li>)}</ul>{patient.reasons.length === 0 && 'No scoring conditions'}</td><td><select aria-label={`Log call outcome for ${patient.id}`} value={outcomes[patient.id] || ''} onChange={e => logOutcome(patient, e.target.value)}><option value="">Log outcome…</option>{OUTCOMES.map(action => <option key={action} value={action}>{AUDIT_ACTIONS[action].label}</option>)}</select></td></tr>;
          })}</tbody></table>{visible.length === 0 && <p className="hf-empty">No matching patients in this top-25 list. Try another ID or reason.</p>}</div>
        </section>
        <details className="hf-card hf-rules"><summary>How the score works</summary><p>2 points for heart pumping below 35% (3 when revised); 2 for kidney measurement above 1.5 mg/dL; 1 each for anaemia, diabetes, high blood pressure, and age 70 or older. Higher totals rank first.</p><p>Ejection fraction is the percentage of blood pumped out with each heartbeat. Serum creatinine is a blood measurement used to assess kidney function. Anaemia means too few healthy red blood cells.</p><p>These challenge rules are not a validated clinical decision tool. The app logs demo outcomes; it does not place phone calls. Logs are stored in this browser, not shared across users.</p></details>
        <footer className="hf-caption">Dataset: Chicco &amp; Jurman, Heart Failure Clinical Records (2020), <a href="https://doi.org/10.24432/C5Z89R">UCI Machine Learning Repository</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</footer>
        {notice && <div className="hf-notice" role="status">{notice}<button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
      </div>
    </main>
  </DashboardShell>;
}
