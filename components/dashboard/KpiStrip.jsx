'use client';
import ApexChart from './ApexChart';
import { versionName } from './helpers';

export const LIST_SIZES = [10, 25, 50, 100];
const scoringName = version => version === 'manual' ? 'Your custom scoring' : versionName(version);

function Sparkline({ rounds }) {
  return <ApexChart className="pd-spark" label="At-risk patients reached in the test group for each change the agent tested" deps={[JSON.stringify(rounds)]} build={c => ({
    chart: { type: 'line', height: 74, width: '100%', sparkline: { enabled: true } },
    series: [{ name: 'Current scoring', data: rounds.map(r => r.champion) }, { name: 'With the change', data: rounds.map(r => r.challenger) }],
    stroke: { width: [2.5, 0], curve: 'stepline' },
    markers: { size: [0, 5], strokeWidth: 0, discrete: rounds.map((r, i) => ({ seriesIndex: 1, dataPointIndex: i, fillColor: r.verdict === 'promoted' ? c.success : c.danger, size: 5 })) },
    colors: [c.primary, c.faint],
    xaxis: { categories: rounds.map(r => `Round ${r.round}`) },
    tooltip: { x: { show: true }, y: { formatter: v => `${v} of 25 in test group` } },
  })} />;
}

/** Main page: the nurse's progress today, how many calls, and which scoring orders the list. */
export function TodayStrip({ listSize, setListSize, calls, version, change, onDetails }) {
  return <section className="pd-today" aria-label="Today's progress">
    <div className="hf-card pd-kpi pd-today-progress">
      <span className="pd-kpi-label">Today's calls <span className="hf-caption">{calls.attempted} attempted · {calls.retry + calls.escalate} to call back ({calls.retry} no answer, {calls.escalate} unreachable)</span></span>
      <strong className="pd-kpi-value">{calls.reached}<small> of {calls.total} reached</small></strong>
      <div className="pd-progress" role="progressbar" aria-label="Patients reached today" aria-valuemin={0} aria-valuemax={calls.total} aria-valuenow={calls.reached}><span style={{ width: `${calls.total ? calls.reached / calls.total * 100 : 0}%` }} /></div>
    </div>
    <div className="hf-card pd-kpi">
      <span className="pd-kpi-label">Number of calls
        <select aria-label="Number of calls today" value={listSize} onChange={e => setListSize(Number(e.target.value))}>{LIST_SIZES.map(size => <option key={size} value={size}>{size} calls</option>)}</select>
      </span>
      <strong className="pd-kpi-value" style={{ fontSize: 18 }}>{scoringName(version)}</strong>
      <span className="hf-caption">{change} · <button type="button" className="pd-link" onClick={onDetails}>See or change the scoring</button></span>
    </div>
  </section>;
}

/** Agent panel: how the scoring compares with calling the oldest first, and every change it tested. */
export default function KpiStrip({ listSize, reached, heldOut, rounds, version }) {
  const gain = reached.agent - reached.oldest;
  return <section className="pd-kpis pd-kpis-2" aria-label="Key figures">
    <div className="hf-card pd-kpi">
      <span className="pd-kpi-label">At-risk patients reached in the top {listSize} calls</span>
      <div className="pd-kpi-compare">
        <div><span>Oldest first</span><strong className="pd-kpi-value">{reached.oldest}</strong></div>
        <div><span>{scoringName(version)}</span><strong className="pd-kpi-value">{reached.agent}<small> / {listSize}</small></strong></div>
        <span className={gain > 0 ? 'pd-up' : gain < 0 ? 'pd-down' : 'pd-move same'}>{gain > 0 ? `▲ ${gain} vs oldest` : gain < 0 ? `▼ ${-gain} vs oldest` : '= oldest'}</span>
      </div>
      <span className="hf-caption">Checked against 299 historical records. In the test group of unseen patients: oldest first {heldOut.oldest} · standard {heldOut.start}{heldOut.agent != null ? ` · ${versionName(version).toLowerCase()} ${heldOut.agent}` : ''} of 25.</span>
    </div>
    <div className="hf-card pd-kpi">
      <span className="pd-kpi-label">Changes tested by the agent <span className="hf-badge">{rounds.length} tested</span></span>
      {rounds.length ? <Sparkline rounds={rounds} /> : <p className="hf-caption">Waiting for the first round…</p>}
      <span className="hf-caption">Line: current scoring. Dots: each change tested on the test group (green adopted, red rejected).</span>
    </div>
  </section>;
}
