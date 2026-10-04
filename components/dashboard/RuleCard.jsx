'use client';
import { useMemo } from 'react';
import { DEFAULT_SETTINGS, rankPatients, compareLists, evaluateList } from '../../lib/heart-failure-ranking';
import { versionName } from './helpers';

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const pts = n => `${n} ${n === 1 ? 'point' : 'points'}`;

/**
 * Every scoring row a nurse can see. `points` (and `cut`, where the row has a cut-off) name the setting each control changes.
 */
const ROWS = [
  { key: 'heart', data: 'Heart pumping (ejection fraction)', help: 'Low pumping means a weak heart.', before: 'below', cut: 'heartThreshold', cuts: [25, 30, 35, 40, 45, 50], unit: '%', points: 'heartWeight', pointRange: range(0, 5) },
  { key: 'kidney', data: 'Kidney function (serum creatinine)', help: 'High creatinine means the kidneys are struggling.', before: 'above', cut: 'kidneyThreshold', cuts: [1, 1.2, 1.3, 1.5, 1.8, 2, 2.5], unit: ' mg/dL', points: 'kidneyWeight', pointRange: range(0, 5) },
  { key: 'anaemia', data: 'Anaemia', help: 'Too few healthy red blood cells.', when: 'recorded in their record', points: 'anaemiaPoints', pointRange: range(0, 5) },
  { key: 'diabetes', data: 'Diabetes', when: 'recorded in their record', points: 'diabetesPoints', pointRange: range(0, 5) },
  { key: 'bp', data: 'High blood pressure', when: 'recorded in their record', points: 'bloodPressurePoints', pointRange: range(0, 5) },
  { key: 'age70', data: 'Age', when: '70 or older', points: 'agePoints', pointRange: range(0, 5) },
  { key: 'age80', data: 'Age', help: 'An extra point on top of the one for 70 or older.', when: '80 or older', points: 'seniorPoints', pointRange: range(0, 5) },
  { key: 'sodium', data: 'Blood sodium', help: 'Low sodium can be a sign of worsening heart failure.', before: 'below', cut: 'sodiumThreshold', cuts: [125, 130, 135, 140], unit: ' mEq/L', points: 'sodiumPoints', pointRange: range(0, 5) },
];
const LABELS = { heartThreshold: 'Weak heart cut-off', heartWeight: 'Points for a weak heart', kidneyThreshold: 'Weak kidney cut-off', kidneyWeight: 'Points for weak kidneys', anaemiaPoints: 'Points for anaemia', diabetesPoints: 'Points for diabetes', bloodPressurePoints: 'Points for high blood pressure', agePoints: 'Points for age 70 or older', seniorPoints: 'Extra points for age 80 or older', sodiumPoints: 'Points for low blood sodium', sodiumThreshold: 'Low sodium cut-off' };

/** The scoring in use as an editable table, with the effect of any change in plain language. */
export default function RuleCard({ rule, agentRule, agentVersion, override, onChange, onReset, graded }) {
  const effect = useMemo(() => {
    if (!override) return null;
    const theirs = rankPatients(graded, agentRule).slice(0, 25), yours = rankPatients(graded, rule).slice(0, 25);
    const { overlap, entered, left } = compareLists(theirs, yours);
    return { overlap, entered, left, theirs: evaluateList(theirs).deaths, yours: evaluateList(yours).deaths };
  }, [override, graded, agentRule, rule]);

  function set(key, value) {
    if (rule[key] === value) return;
    onChange({ ...rule, [key]: value }, { label: LABELS[key], from: rule[key], to: value });
  }
  const select = (key, values, unit = '') => <select aria-label={LABELS[key]} value={rule[key]} onChange={e => set(key, Number(e.target.value))}>{values.map(v => <option key={v} value={v}>{v}{unit}</option>)}</select>;
  const changed = row => (row.cut && rule[row.cut] !== DEFAULT_SETTINGS[row.cut]) || (row.points && rule[row.points] !== DEFAULT_SETTINGS[row.points]);

  return <section className="hf-card" aria-labelledby="rule-heading">
    <div className="hf-section-heading"><h2 id="rule-heading">How patients are scored</h2><span className="hf-badge">In use: {override ? 'your custom scoring' : versionName(agentVersion)}</span></div>
    <p>Each patient gets points for the data below from their hospital record. The points are added up and the highest totals are called first. <strong>You can change every point value and cut-off</strong>; the call list updates straight away and your scoring is used until you go back to the agent’s.</p>

    <div className="hf-table-wrap"><table className="pd-table pd-scoring">
      <thead><tr><th>Patient data</th><th>Counts when the patient’s value is…</th><th>Points</th></tr></thead>
      <tbody>{ROWS.map(row => <tr key={row.key} className={changed(row) ? 'is-changed' : ''}>
        <td><strong>{row.data}</strong>{row.help && <span className="hf-caption"><br />{row.help}</span>}</td>
        <td>{row.cut ? <span className="pd-inline-edit">{row.before} {select(row.cut, row.cuts, row.unit)}</span> : row.when}
          {row.cut && rule[row.cut] !== DEFAULT_SETTINGS[row.cut] && <span className="hf-caption"> (standard: {row.before} {DEFAULT_SETTINGS[row.cut]}{row.unit})</span>}</td>
        <td>{select(row.points, row.pointRange)}
          {row.points && rule[row.points] !== DEFAULT_SETTINGS[row.points] && <span className="pd-tag new">standard: {DEFAULT_SETTINGS[row.points]}</span>}
          {row.points && rule[row.points] === 0 && <span className="hf-caption"> not counted</span>}</td>
      </tr>)}</tbody>
    </table></div>

    <div className="pd-scoring-actions">
      <button className="pd-btn" onClick={onReset} disabled={!override}><i className="ph ph-robot" />Go back to the agent’s scoring</button>
      <button className="pd-btn" onClick={() => onChange({ ...DEFAULT_SETTINGS }, { label: 'All settings', from: 'current', to: 'standard scoring' })}><i className="ph ph-arrow-counter-clockwise" />Start from standard scoring</button>
    </div>

    {effect && <div className="pd-effect" aria-live="polite">
      <h3 className="pd-kpi-label">What your changes do to the top 25 calls</h3>
      <p><strong>{effect.overlap} of 25</strong> patients stay on the list, <strong>{effect.entered.length}</strong> join and <strong>{effect.left.length}</strong> leave, compared with the agent’s scoring.</p>
      <p>Looking back at past records, your list would have reached <strong>{effect.yours} of 25</strong> at-risk patients, compared with <strong>{effect.theirs} of 25</strong> for the agent’s scoring. Giving one factor more points does not always reach more at-risk patients.</p>
      {effect.entered.length > 0 && <p><strong>Join the list:</strong> {effect.entered.map(p => <span className="hf-change-link" key={p.id}>{p.id} · #{p.rank} · {pts(p.score)}</span>)}</p>}
      {effect.left.length > 0 && <p><strong>Leave the list:</strong> {effect.left.map(p => <span className="hf-change-link" key={p.id}>{p.id} · {pts(p.score)}</span>)}</p>}
    </div>}

    <details className="pd-know" open>
      <summary>Good to know</summary>
      <ul>
        <li>A <strong>weak heart</strong> means heart pumping below the cut-off. <strong>Weak kidneys</strong> means creatinine above the cut-off.</li>
        <li>Every factor’s points can be set from 0 to 5. Setting points to 0 turns that factor off.</li>
        <li>In standard scoring, anaemia, diabetes, high blood pressure and age 70 or older are worth 1 point each.</li>
        <li>If two patients have the same total, the older patient is called first, then the lower patient ID.</li>
        <li>Never used for scoring: sex, smoking, platelets, the CPK enzyme, how long the patient was followed up, or whether they died.</li>
        <li>Changes are logged in the audit log under your name.</li>
      </ul>
    </details>
  </section>;
}

/** What the agent concluded, in a few sentences, plus the versions it went through. */
export function AgentFindings({ final, current, reached, protocol }) {
  const history = final.history;
  const start = history[0];
  return <section className="hf-card pd-findings" aria-labelledby="findings-heading">
    <h2 id="findings-heading">What the agent found</h2>
    <div className="pd-sentence">
      Calling the oldest patients first reaches <strong>{reached.oldest} of 25</strong> at-risk patients. Standard scoring reaches <strong>{start.score.full} of 25</strong>.
      {protocol && <> The agent tested a common suggestion, <em>{protocol.idea.label.toLowerCase()}</em>, which reached {protocol.challenger.full} of 25, so it was {protocol.type === 'rejected' ? 'rejected' : 'adopted'}.</>}
      {history.length > 1
        ? <> It then adopted <em>{history.slice(1).map(h => h.change.toLowerCase()).join(', ')}</em>, which reached more at-risk patients in the test group ({start.score.heldOut} → {final.score.heldOut} of 25), in all 4 reshuffles.</>
        : <> No other change reached more at-risk patients in the test group, so it kept standard scoring.</>}
    </div>
    <h3 className="pd-kpi-label" style={{ marginTop: 14 }}>Scoring versions</h3>
    <ol className="pd-history">{history.map(h => <li key={h.version} className={h.version === current.version ? 'is-current' : ''}><strong>{h.version}</strong><span>{versionName(h.version)}{h.round ? `: ${h.change.toLowerCase()} (test ${h.round})` : ' (starting point)'}<br /><span className="hf-caption">Test group: {h.score.heldOut} of 25 at-risk reached · all patients: {h.score.full} of 25</span></span></li>)}</ol>
  </section>;
}
