'use client';
import Drawer from './Drawer';
import KpiStrip from './KpiStrip';
import AgentFeed, { CheckLegend } from './AgentFeed';
import RuleCard, { AgentFindings } from './RuleCard';
import SafetyChecks from './SafetyChecks';
import { versionName } from './helpers';

export const AGENT_TABS = [
  ['scoring', 'ph-list-numbers', 'How patients are scored'],
  ['tests', 'ph-robot', 'Tests the agent ran'],
  ['checks', 'ph-shield-check', 'Safety checks'],
  ['terms', 'ph-book-open', 'What the terms mean'],
];

/** Scoring, and everything about how it was chosen, kept off the nurse's main page. */
export default function AgentPanel({ tab, setTab, onClose, onCompare, agent, override, scoring, tests, safety, graded, droppedRows }) {
  function replay() { setTab('tests'); agent.replay(); }
  const loaded = agent.allEvents.find(e => e.type === 'loaded');
  return <Drawer wide title="Scoring & agent tests" subtitle={override ? 'Your custom scoring is ordering the call list' : `${versionName(agent.current.version)} is ordering today’s call list`} onClose={onClose} labelledBy="pd-agent-title"
    actions={<><button className="pd-btn" onClick={onCompare}><i className="ph ph-git-diff" />Compare with oldest first</button><button className="pd-btn pd-btn-primary" onClick={replay} disabled={agent.replaying}><i className="ph ph-play" />Replay agent tests</button></>}>
    <div className="pd-tabs pd-panel-tabs" role="tablist" aria-label="Scoring and agent details">{AGENT_TABS.map(([key, icon, label]) => <button key={key} type="button" role="tab" aria-selected={tab === key} aria-pressed={tab === key} onClick={() => setTab(key)}><i className={`ph ${icon}`} />{label}</button>)}</div>
    <div role="tabpanel" className="pd-panel-body">
      {tab === 'scoring' && <RuleCard {...scoring} graded={graded} />}
      {tab === 'tests' && <>
        <KpiStrip {...tests.kpi} />
        <div className="pd-two-col">
          <AgentFindings {...tests.findings} />
          <CheckLegend groups={{ all: loaded?.graded ?? 0, learn: loaded?.learn ?? 0, heldOut: loaded?.heldOut ?? 0 }} />
        </div>
        <AgentFeed agent={agent} droppedRows={droppedRows} />
      </>}
      {tab === 'checks' && <SafetyChecks {...safety} />}
      {tab === 'terms' && <section className="hf-card hf-rules">
        <h2>What the terms mean</h2>
        <p><strong>Heart pumping (ejection fraction):</strong> the percentage of blood the heart pumps out with each beat. Low means a weak heart.</p>
        <p><strong>Kidney function (serum creatinine):</strong> a blood test for kidney health. High means the kidneys are struggling.</p>
        <p><strong>Anaemia:</strong> too few healthy red blood cells.</p>
        <p><strong>Blood sodium:</strong> the salt level in the blood. Low sodium can be a sign of worsening heart failure.</p>
        <p><strong>At-risk patient:</strong> in these past records, a patient who died during follow-up. Used only to check how well a call list would have worked, never to score anyone.</p>
        <p><strong>All patients:</strong> all 299 past records, checking how many at-risk patients make the top 25 calls.</p>
        <p><strong>Learning group:</strong> 199 of those patients that the agent studies to come up with ideas for better scoring.</p>
        <p><strong>Test group:</strong> the other 100 patients, kept aside and never studied, so the agent is checked on patients it has not seen, like an exam with new questions.</p>
        <p><strong>Random test groups (reshuffles):</strong> the agent splits patients into learning and test groups 4 different ways. A change must do better every time before it is adopted, so a lucky result cannot slip through.</p>
        <p>This is not a validated clinical tool. The phone button starts a confirmed demo call to a verified participant; calls and reviewed notes are shared through Supabase. The other call buttons log manual outcomes, which stay in this browser.</p>
        <p className="hf-caption">Dataset: Chicco &amp; Jurman, Heart Failure Clinical Records (2020), <a href="https://doi.org/10.24432/C5Z89R">UCI Machine Learning Repository</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p>
      </section>}
    </div>
  </Drawer>;
}
