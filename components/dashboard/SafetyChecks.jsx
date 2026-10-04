'use client';
import { useMemo } from 'react';
import { rankPatients } from '../../lib/heart-failure-ranking';

const ids = (list, k) => list.slice(0, k).map(p => p.id).join();

function Check({ ok, icon, title, children }) {
  return <div className={`pd-check ${ok ? 'ok' : 'fail'}`}>
    <div className="pd-check-head"><i className={`ph-fill ${ok ? icon : 'ph-x-circle'}`} />{title}</div>
    {children}
  </div>;
}

/** Each trap from the case is re-checked live against the rule in use, not described from memory. */
export default function SafetyChecks({ patients, rule, listSize, events, droppedRows }) {
  const checks = useMemo(() => {
    const ranked = rankPatients(patients, rule);
    const cutoff = ranked[Math.min(listSize, ranked.length) - 1]?.score;
    const tied = ranked.filter(p => p.score === cutoff).length, tiedInside = ranked.slice(0, listSize).filter(p => p.score === cutoff).length;
    const hash = id => [...id].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
    const shuffled = [...patients].sort((a, b) => hash(a.id) - hash(b.id));
    const shuffleStable = ids(rankPatients(shuffled, rule), listSize) === ids(ranked, listSize);
    const flipped = patients.map(p => ({ ...p, DEATH_EVENT: p.DEATH_EVENT === 1 ? 0 : 1, time: 9999 }));
    const leakFree = ids(rankPatients(flipped, rule), patients.length) === ids(ranked, patients.length);
    return { cutoff, tied, tiedInside, shuffleStable, leakFree };
  }, [patients, rule, listSize]);

  const decisions = events.filter(e => e.type === 'promoted' || e.type === 'rejected');
  const protocol = decisions.find(e => e.round === 1);
  const loaded = events.find(e => e.type === 'loaded');
  const partial = decisions.filter(e => e.type === 'rejected' && e.check.wins > 0).length;
  const promoted = decisions.filter(e => e.type === 'promoted');

  return <section className="hf-card" aria-labelledby="safety-heading">
    <div className="hf-section-heading"><h2 id="safety-heading">Data safety checks</h2><span>Re-checked live on the scoring in use · top {listSize} calls</span></div>
    <div className="pd-checks">
      <Check ok={!!protocol} icon="ph-shield-check" title="Suggested change tested, not assumed">
        {protocol ? <p>{protocol.idea.detail}. This reaches <em>{protocol.challenger.full} of 25</em> at-risk patients instead of <em>{protocol.champion.full}</em> ({protocol.challenger.heldOut} instead of {protocol.champion.heldOut} in the test group), so it was <em>{protocol.type === 'rejected' ? 'rejected' : 'adopted'}</em>. It would push patients off the list who are {protocol.movedSummary.left || 'a mix of ages and conditions'}.</p> : <p>Waiting for round 1.</p>}
      </Check>
      <Check ok={checks.shuffleStable} icon="ph-check-circle" title="Ties settled by a fixed rule">
        <p><em>{checks.tied}</em> patients have the last qualifying score of {checks.cutoff} points, but only {checks.tiedInside} fit on the list. The older patient goes first, then the lower patient ID, so the order of the file never decides. Shuffling the records gives {checks.shuffleStable ? <em>the same list ✓</em> : <em>a different list ✗</em>}.</p>
      </Check>
      <Check ok={checks.leakFree} icon="ph-lock-simple" title="Does not peek at the answer">
        <p>Scoring only uses what is known when the patient leaves hospital. Changing every patient’s outcome and follow-up time gives {checks.leakFree ? <em>the same ranking ✓</em> : <em>a different ranking ✗</em>}. Outcomes are only used afterwards, to check results.</p>
      </Check>
      <Check ok={!!loaded} icon="ph-flask" title="Tested on patients it never learned from">
        <p>The agent learns from <em>{loaded?.learn ?? '…'}</em> patients and is checked on <em>{loaded?.heldOut ?? '…'}</em> it has never seen. A change is adopted only if it does better in all 4 random test groups: {promoted.length} adopted, {decisions.length - promoted.length} rejected{partial ? ` (${partial} did better in only some groups)` : ''}.</p>
      </Check>
      <Check ok icon="ph-database" title="Complete data only">
        <p>{droppedRows ? `${droppedRows} records were removed for missing data.` : 'No records had missing data.'} Patients added by hand are checked for missing or impossible values before they are scored.</p>
      </Check>
      <Check ok icon="ph-first-aid" title="Decides who to call, does not diagnose">
        <p>It ranks who to call first from recorded risk factors. It does not predict or diagnose anything and is not a validated clinical tool.</p>
      </Check>
    </div>
  </section>;
}
