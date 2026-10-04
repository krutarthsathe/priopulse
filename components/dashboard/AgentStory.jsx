'use client';
import { useMemo } from 'react';
import { rankPatients, DEFAULT_SETTINGS } from '../../lib/heart-failure-ranking';
import { hitsAtK } from '../../lib/agent/evaluate';
import { reasonChips, versionName } from './helpers';

const LONG_LIST = 100;

/** The facts every story piece needs, read from the agent's full run (not from the replay's progress). */
export function summarise(allEvents) {
  const baseline = allEvents.find(e => e.type === 'baseline');
  const done = allEvents.find(e => e.type === 'done');
  const decisions = allEvents.filter(e => e.type === 'promoted' || e.type === 'rejected');
  return { baseline, done, decisions, protocol: decisions.find(e => e.round === 1), adopted: decisions.filter(e => e.type === 'promoted') };
}

/** Main page: the whole agent in one sentence, "decided X from data Y, improved to Z". */
export function DecisionLine({ allEvents, patientCount, onOpen }) {
  const { baseline, done, decisions, adopted } = summarise(allEvents);
  if (!baseline || !done) return null;
  return <div className="pd-decision" role="note">
    <i className="ph-fill ph-robot" aria-hidden="true" />
    <p>
      <strong>The agent decided today’s call order</strong> from {patientCount} patient records (heart pumping, kidney function, age and conditions).
      {' '}It tested {decisions.length} changes to its own scoring and {adopted.length
        ? <>improved it to <strong>{versionName(done.version).toLowerCase()}</strong> ({adopted.map(e => e.idea.label.toLowerCase()).join(', ')}), which reaches <strong>{done.score.heldOut} at-risk patients</strong> among patients it never studied, up from {baseline.standard.heldOut} (calling the oldest first: {baseline.score.heldOut}).</>
        : <>kept standard scoring, which reaches {done.score.heldOut} at-risk patients among patients it never studied (calling the oldest first: {baseline.score.heldOut}).</>}
      {' '}<button type="button" className="pd-link" onClick={onOpen}>See how it decided</button>
    </p>
  </div>;
}

/** Side-by-side results: the lazy answer, the starting rule, the suggested change, and the agent's result. */
export function Scoreboard({ allEvents, graded }) {
  const { baseline, done, protocol } = summarise(allEvents);
  const longList = useMemo(() => {
    const at = (rule, oldest = false) => hitsAtK(rankPatients(graded, rule, oldest), LONG_LIST);
    return { oldest: at(DEFAULT_SETTINGS, true), standard: at(DEFAULT_SETTINGS), protocol: protocol ? at({ ...DEFAULT_SETTINGS, ...protocol.idea.change }) : null, agent: done ? at(done.rule) : null };
  }, [graded, protocol, done]);
  if (!baseline || !done) return null;
  const cards = [
    { key: 'oldest', title: 'Call the oldest first', note: 'The lazy answer to beat', test: baseline.score.heldOut, all: baseline.score.full, long: longList.oldest, tone: 'muted' },
    { key: 'standard', title: 'Standard scoring', note: 'The agent’s first result', test: baseline.standard.heldOut, all: baseline.standard.full, long: longList.standard, tone: '' },
    protocol && { key: 'protocol', title: protocol.idea.label, note: `Suggested change · ${protocol.type === 'rejected' ? 'rejected' : 'adopted'}`, test: protocol.challenger.heldOut, all: protocol.challenger.full, long: longList.protocol, tone: protocol.type === 'rejected' ? 'rejected' : '' },
    { key: 'agent', title: versionName(done.version), note: done.version === 'v1' ? 'No change adopted' : 'The agent’s improved result', test: done.score.heldOut, all: done.score.full, long: longList.agent, tone: 'win' },
  ].filter(Boolean);
  return <section className="hf-card" aria-labelledby="scoreboard-heading">
    <div className="hf-section-heading"><h2 id="scoreboard-heading">First result vs improved result</h2><span>At-risk patients reached. Higher is better.</span></div>
    <div className="pd-scoreboard">{cards.map((card, i) => <div key={card.key} className={`pd-scorecard ${card.tone}`}>
      {i > 0 && <span className="pd-scorecard-arrow" aria-hidden="true">→</span>}
      <span className="pd-scorecard-note">{card.note}</span>
      <strong>{card.title}</strong>
      <span className="pd-scorecard-main">{card.test}<small> / 25</small></span>
      <span className="hf-caption">in the test group of 100 unseen patients</span>
      <dl><div><dt>All 299, top 25</dt><dd>{card.all}</dd></div><div><dt>All 299, top {LONG_LIST}</dt><dd>{card.long}</dd></div></dl>
    </div>)}</div>
    <p className="hf-caption">The test group is the fair score: the agent never studied those patients. With {LONG_LIST} calls, the agent’s scoring reaches {longList.agent} at-risk patients compared with {longList.oldest} for calling the oldest first.</p>
  </section>;
}

/** The agent's loop as a simple diagram, with the real numbers from this run on each step. */
export function LoopDiagram({ allEvents, patientCount }) {
  const { baseline, done, decisions, adopted } = summarise(allEvents);
  const loaded = allEvents.find(e => e.type === 'loaded');
  if (!baseline || !done) return null;
  const steps = [
    ['ph-database', 'Patient data in', `${patientCount} records: heart pumping, kidney function, age, conditions`],
    ['ph-list-numbers', 'Score & rank', 'Add up points for each patient and sort into a call list'],
    ['ph-scales', 'Compare with oldest first', `${baseline.standard.full} vs ${baseline.score.full} of 25 at-risk patients reached`],
    ['ph-magnifying-glass', 'Find who was missed', `At-risk patients just below the cut-off, studied in the learning group of ${loaded?.learn}`],
    ['ph-lightbulb', 'Propose one change', adopted[0] ? `e.g. ${adopted[0].idea.label.toLowerCase()}` : 'e.g. give one factor more points'],
    ['ph-exam', 'Test on unseen patients', `Test group of ${loaded?.heldOut}, reshuffled 4 ways`],
    ['ph-check-circle', 'Adopt or reject', `${adopted.length} adopted, ${decisions.length - adopted.length} rejected → ${versionName(done.version).toLowerCase()}`],
  ];
  return <section className="hf-card" aria-labelledby="loop-heading">
    <div className="hf-section-heading"><h2 id="loop-heading">How the agent improves itself</h2><span>One loop per change tested</span></div>
    <ol className="pd-loop">{steps.map(([icon, title, text], i) => <li key={title} className={i === steps.length - 1 ? 'is-decision' : ''}>
      <span className="pd-loop-num">{i + 1}</span><i className={`ph ${icon}`} aria-hidden="true" /><strong>{title}</strong><span>{text}</span>
    </li>)}</ol>
    <p className="pd-loop-back"><i className="ph ph-arrow-u-up-left" aria-hidden="true" /> After every decision the agent goes back to step 2 with the scoring it kept (re-ranking the call list if a change was adopted) and looks for its next idea. It stops after 3 changes in a row fail.</p>
  </section>;
}

/** One real patient from the records: oldest-first would leave them off the list, the agent calls them early. */
export function PatientStory({ allEvents, graded, onOpen }) {
  const { done } = summarise(allEvents);
  const story = useMemo(() => {
    if (!done) return null;
    const agent = rankPatients(graded, done.rule), oldest = rankPatients(graded, DEFAULT_SETTINGS, true);
    const oldestRank = new Map(oldest.map(p => [p.id, p.rank]));
    // An illustration from history: an at-risk patient on the agent's list whom oldest-first ranks furthest down.
    return agent.slice(0, 25).filter(p => p.DEATH_EVENT === 1 && oldestRank.get(p.id) > 25)
      .map(p => ({ ...p, oldestRank: oldestRank.get(p.id) })).sort((a, b) => b.oldestRank - a.oldestRank || a.rank - b.rank)[0] ?? null;
  }, [graded, done]);
  if (!story) return null;
  return <section className="hf-card pd-story" aria-labelledby="story-heading">
    <h2 id="story-heading">One patient, two approaches</h2>
    <p><strong>{story.id}</strong> is {story.age} years old. Calling the oldest first would put them at <strong>#{story.oldestRank}</strong>, far outside the 25 calls. The agent’s scoring calls them at <strong>#{story.rank}</strong> because of:</p>
    <div className="pd-chips" style={{ marginTop: 8 }}>{reasonChips(story).map(chip => <span key={chip.key} className={`pd-chip ${chip.tone}`}>{chip.text} <strong>+{chip.points}</strong></span>)}</div>
    <p>In the past records, this patient died during follow-up. Sorting by age alone would have missed them; the scoring looks at their medical data instead.</p>
    <button type="button" className="pd-btn pd-btn-sm" onClick={() => onOpen(story)} style={{ marginTop: 10 }}>Open {story.id}</button>
  </section>;
}
