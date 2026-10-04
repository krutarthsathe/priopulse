'use client';
import { useMemo } from 'react';
import { rankPatients, compareLists, DEFAULT_SETTINGS } from '../../lib/heart-failure-ranking';
import { hitsAtK, isGraded } from '../../lib/agent/evaluate';
import Drawer from './Drawer';

export default function CompareDrawer({ patients, rule, versionLabel, listSize, onOpen, onClose }) {
  const view = useMemo(() => {
    const agent = rankPatients(patients, rule), oldest = rankPatients(patients, DEFAULT_SETTINGS, true);
    const agentTop = agent.slice(0, listSize), oldestTop = oldest.slice(0, listSize);
    const { overlap, entered, left } = compareLists(oldestTop, agentTop);
    // Graded the same way as the dashboard figures: only records with a recorded outcome.
    const graded = patients.filter(isGraded);
    return { overlap, onlyAgent: entered, onlyOldest: left, agentHits: hitsAtK(rankPatients(graded, rule), listSize), oldestHits: hitsAtK(rankPatients(graded, DEFAULT_SETTINGS, true), listSize), agentById: new Map(agent.map(p => [p.id, p])) };
  }, [patients, rule, listSize]);
  return <Drawer title="Compare with calling the oldest first" subtitle={`Top ${listSize} calls · ${versionLabel} vs oldest first`} onClose={onClose} labelledBy="pd-compare-title">
    <dl className="pd-facts">
      <div><dt>Shared patients</dt><dd>{view.overlap} of {listSize}</dd></div>
      <div><dt>At-risk patients reached</dt><dd>{view.agentHits} vs {view.oldestHits}</dd></div>
    </dl>
    <p>At-risk reached is graded on the 299 records with a recorded outcome, after the fact; neither list was built from outcomes. New imports appear in the lists but are never graded.</p>
    <div><h3 className="pd-kpi-label">Only on our list · {view.onlyAgent.length}</h3>
      <ul className="pd-list" style={{ marginTop: 8 }}>{view.onlyAgent.map(p => <li key={p.id}><button type="button" className="pd-patient" onClick={() => onOpen(view.agentById.get(p.id))}><strong>{p.id}</strong></button><span>age {p.age} · pump {p.ejection_fraction}% · kidney {p.serum_creatinine} · {p.score} pts</span></li>)}</ul>
    </div>
    <div><h3 className="pd-kpi-label">Only on the oldest-first list · {view.onlyOldest.length}</h3>
      <ul className="pd-list" style={{ marginTop: 8 }}>{view.onlyOldest.map(p => <li key={p.id}><button type="button" className="pd-patient" onClick={() => onOpen(view.agentById.get(p.id))}><strong>{p.id}</strong></button><span>age {p.age} · {view.agentById.get(p.id)?.score} pts · our rank #{view.agentById.get(p.id)?.rank}</span></li>)}</ul>
    </div>
  </Drawer>;
}
