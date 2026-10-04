'use client';
import { useEffect, useRef } from 'react';
import { versionName } from './helpers';

const quarter = n => Math.max(1, Math.round(n / 4));

/** Plain explanation of the three numbers on every test card, and of the reshuffles. */
export function CheckLegend({ groups }) {
  const items = [
    ['ph-users-three', 'All patients', `Out of all ${groups.all} patients, how many at-risk patients make the top 25 of the call list.`],
    ['ph-book-open-text', 'Learning group', `${groups.learn} patients the agent studies to come up with ideas. Counted in their top ${quarter(groups.learn)} (a quarter).`],
    ['ph-exam', 'Test group', `${groups.heldOut} patients kept aside that the agent never studies, like exam questions it has not seen. Counted in their top ${quarter(groups.heldOut)} (a quarter). This is the fair check.`],
    ['ph-shuffle', 'Random test groups', 'The agent reshuffles which patients go into the learning and test groups 4 different ways. A change is only adopted if it does better every time, so a lucky result cannot slip through.'],
  ];
  return <section className="hf-card pd-legend" aria-labelledby="legend-heading">
    <h2 id="legend-heading">How each test is checked</h2>
    <p>Every test compares two ways of ranking patients by how many <strong>at-risk patients</strong> (patients who died during follow-up in these past records) they would have put near the top of the call list. Higher is better.</p>
    <div className="pd-legend-grid">{items.map(([icon, title, text]) => <div key={title}><i className={`ph ${icon}`} /><div><strong>{title}</strong><p>{text}</p></div></div>)}</div>
  </section>;
}

/** Side-by-side numbers for one test, each row labelled with what it counts. */
function ScoreTable({ before, after, beforeLabel, afterLabel, groups, check, checkText }) {
  const rows = [
    ['All patients', `top 25 of all ${groups.all}`, 'full'],
    ['Learning group', `top ${quarter(groups.learn)} of the ${groups.learn} it studies`, 'learn'],
    ['Test group', `top ${quarter(groups.heldOut)} of the ${groups.heldOut} it never studies`, 'heldOut'],
  ];
  return <div className="pd-score-table">
    <table className="pd-table">
      <thead><tr><th>At-risk patients reached in…</th><th>{beforeLabel}</th><th>{afterLabel}</th></tr></thead>
      <tbody>{rows.map(([name, hint, key]) => {
        const diff = after[key] - before[key];
        return <tr key={key}><td><strong>{name}</strong><span className="hf-caption"> · {hint}</span></td><td>{before[key]}</td><td><strong>{after[key]}</strong> <span className={diff > 0 ? 'pd-up' : diff < 0 ? 'pd-down' : 'pd-move same'}>{diff > 0 ? `▲${diff}` : diff < 0 ? `▼${-diff}` : 'same'}</span></td></tr>;
      })}</tbody>
    </table>
    {check && <p className="pd-reshuffle"><i className="ph ph-shuffle" /> <strong>Random test groups:</strong> {checkText(check)}</p>}
  </div>;
}

function BaselineCard({ event, groups }) {
  const better = event.standard.full > event.score.full;
  return <article className="pd-round rejected">
    <div className="pd-round-head"><span>Test 0 <small>· The simple approach to beat</small></span><span className="pd-verdict rejected">{better ? '✗ NOT USED' : '= NO BETTER'}</span></div>
    <h3>Call the oldest patients first</h3>
    <p><strong>What it does:</strong> ignores all medical data and simply calls the 25 oldest patients.</p>
    <p><strong>Why test it:</strong> it is the easiest plan a clinic could use, so any scoring has to beat it to be worth using.</p>
    <ScoreTable before={event.score} after={event.standard} beforeLabel="Oldest first" afterLabel="Standard scoring" groups={groups} check={event.check}
      checkText={c => `standard scoring reached more at-risk patients in the test group in ${c.wins} of ${c.total} reshuffles.`} />
    <p style={{ marginTop: 6 }}><strong>Result:</strong> {better ? `Standard scoring reaches ${event.standard.full} of 25 at-risk patients instead of ${event.score.full}, so it becomes the starting point and oldest-first is not used.` : 'Standard scoring does not reach more at-risk patients than oldest-first.'}</p>
  </article>;
}

function groupEvents(events) {
  const items = [];
  const rounds = new Map();
  for (const event of events) {
    if (event.round && ['round_start', 'tested', 'promoted', 'rejected'].includes(event.type)) {
      if (!rounds.has(event.round)) { const round = { kind: 'round', round: event.round }; rounds.set(event.round, round); items.push(round); }
      Object.assign(rounds.get(event.round), event.type === 'round_start' ? { start: event } : event.type === 'tested' ? { tested: event } : { result: event });
    } else items.push({ kind: 'step', event });
  }
  return items;
}

function Step({ event, droppedRows, groups }) {
  if (event.type === 'baseline') return <BaselineCard event={event} groups={groups} />;
  const text = {
    loaded: () => `Loaded ${event.count} patient records (${droppedRows ? `${droppedRows} removed for missing data` : 'none had missing data'})${event.ungraded ? `, including ${event.ungraded} new patient${event.ungraded === 1 ? '' : 's'} with no outcome yet, who are ranked but not used to check results` : ''}. Set aside ${event.heldOut} as a test group the agent never learns from; it learns from the other ${event.learn}.`,
    champion: () => 'Standard scoring is the starting point. Next, the agent tests changes to it one at a time.',
    exhausted: () => 'No other change is supported by the patients the scoring is missing. Stopping.',
    done: () => `Review finished: ${event.rounds} changes tested, ${event.promotions} adopted. Now using ${versionName(event.version)}, which reaches ${event.score.full} of 25 (${event.score.heldOut} of 25 in the test group).`,
  }[event.type];
  return text ? <div className="pd-step"><i className={`ph ${event.type === 'done' ? 'ph-flag-checkered' : 'ph-check-circle'}`} /><span>{text()}</span></div> : null;
}

function MovedList({ title, patients }) {
  if (!patients.length) return null;
  const conditions = p => [p.anaemia && "anaemia", p.diabetes && "diabetes", p.high_blood_pressure && "high BP"].filter(Boolean).join(", ") || "no conditions";
  return <><strong>{title}</strong><ul>{patients.map(p => <li key={p.id}>{p.id} · age {p.age} · pump {p.ejection_fraction}% · {conditions(p)} · #{p.from} → #{p.to}</li>)}</ul></>;
}

function RoundCard({ item, groups }) {
  const { start, tested, result } = item;
  const state = result ? result.type : 'testing';
  const t = tested ?? result;
  return <article className={`pd-round ${state}`}>
    <div className="pd-round-head"><span>Test {item.round} <small>· {start?.source}</small></span><span className={`pd-verdict ${state}`}>{state === 'testing' ? '⟳ TESTING' : state === 'promoted' ? '✓ ADOPTED' : '✗ REJECTED'}</span></div>
    <h3>{start?.idea.label}</h3>
    <p><strong>What changes:</strong> {start?.idea.detail}</p>
    <p><strong>Why try it:</strong> {start?.reason}</p>
    {t && <>
      <ScoreTable before={t.champion} after={t.challenger} beforeLabel="Current scoring" afterLabel="With this change" groups={groups} check={t.check}
        checkText={c => `with this change, the test group did better in ${c.wins} of ${c.total} reshuffles${c.wins === c.total ? ', so the result is reliable.' : '. It needs all ' + c.total + ' to be adopted.'}`} />
      {result && <p style={{ marginTop: 6 }}><strong>Result:</strong> {result.why}</p>}
      {(t.moved.entered.length > 0 || t.moved.left.length > 0) && <details className="pd-moved"><summary>Show who would move ({t.moved.entered.length} join · {t.moved.left.length} leave the call list)</summary>
        <p>Joining: {t.movedSummary.entered || 'nobody'}. Leaving: {t.movedSummary.left || 'nobody'}.</p>
        <MovedList title="Would join the list" patients={t.moved.entered} />
        <MovedList title="Would leave the list" patients={t.moved.left} />
      </details>}
    </>}
  </article>;
}

export default function AgentFeed({ agent, droppedRows }) {
  const body = useRef(null);
  const items = groupEvents(agent.events);
  const loaded = agent.allEvents.find(e => e.type === 'loaded');
  const groups = { all: loaded?.graded ?? 0, learn: loaded?.learn ?? 0, heldOut: loaded?.heldOut ?? 0 };
  useEffect(() => { if (agent.replaying && body.current) body.current.scrollTop = body.current.scrollHeight; }, [agent.events.length, agent.replaying]);
  return <section className="hf-card pd-feed" aria-labelledby="feed-heading">
    <div className="pd-panel-head">
      <div><h2 id="feed-heading">Tests the agent ran</h2><p>{agent.replaying ? `Replaying · ${agent.events.length} of ${agent.allEvents.length} steps` : agent.reviewedAt ? `Reviewed today at ${agent.reviewedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'Reviewed today'}</p></div>
      <div className="pd-feed-controls">
        {!agent.replaying && <button className="pd-btn pd-btn-sm pd-btn-primary" onClick={agent.replay}><i className="ph ph-play" />Replay</button>}
        {agent.replaying && (agent.playing ? <button className="pd-btn pd-btn-sm" onClick={agent.pause}><i className="ph ph-pause" />Pause</button> : <button className="pd-btn pd-btn-sm" onClick={agent.resume}><i className="ph ph-play" />Resume</button>)}
        {agent.replaying && <button className="pd-btn pd-btn-sm" onClick={agent.step}>Step <i className="ph ph-caret-right" /></button>}
        {agent.replaying && <button className="pd-btn pd-btn-sm" onClick={agent.skip}>Skip</button>}
        <select aria-label="Replay speed" value={agent.speed} onChange={e => agent.setSpeed(e.target.value)}><option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option></select>
      </div>
    </div>
    <div className="pd-feed-body" ref={body} aria-live="polite">
      {items.length === 0 && <p className="pd-empty">Starting review…</p>}
      {items.map((item, i) => item.kind === 'round' ? <RoundCard key={`r${item.round}`} item={item} groups={groups} /> : <Step key={`s${i}`} event={item.event} droppedRows={droppedRows} groups={groups} />)}
    </div>
  </section>;
}
