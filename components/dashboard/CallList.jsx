'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import PatientPhoto from '../PatientPhoto';
import { OUTCOMES, reasonChips, isImported, formatTime } from './helpers';

/** Slides rows from their old position to the new one whenever the order changes. */
function useRowSlide(order) {
  const rows = useRef(new Map());
  const tops = useRef(new Map());
  useLayoutEffect(() => {
    const next = new Map();
    rows.current.forEach((row, id) => {
      if (!row) return;
      const top = row.getBoundingClientRect().top;
      next.set(id, top);
      const before = tops.current.get(id);
      if (before === undefined || before === top || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      row.style.transition = 'none';
      row.style.transform = `translateY(${before - top}px)`;
      row.getBoundingClientRect();
      row.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
      row.style.transform = '';
    });
    tops.current = next;
  }, [order]);
  return id => element => { if (element) rows.current.set(id, element); else rows.current.delete(id); };
}

function Movement({ patient, baseRank, entered }) {
  if (isImported(patient)) return <span className="pd-move same">new record</span>;
  if (entered) return <span className="pd-move up">▲ entered</span>;
  const delta = baseRank - patient.rank;
  if (!delta) return <span className="pd-move same">–</span>;
  return <span className={`pd-move ${delta > 0 ? 'up' : 'down'}`}>{delta > 0 ? `▲ ${delta}` : `▼ ${-delta}`}</span>;
}

export default function CallList({ onStartCall, callBusy, rows, baseRanks, baseTop, statuses, onOutcome, onUndo, onOpen, search, setSearch, listSize, versionLabel, totalPatients }) {
  const query = search.trim().toLowerCase();
  const matches = patient => !query || `${patient.id} ${patient.reasons.map(r => r.label).join(' ')}`.toLowerCase().includes(query);
  const visible = rows.filter(matches);
  const [view, setView] = useState('open');
  const open = visible.filter(p => !statuses.get(p.id)?.done), done = visible.filter(p => statuses.get(p.id)?.done);
  const doneTotal = rows.filter(p => statuses.get(p.id)?.done).length, openTotal = rows.length - doneTotal;
  const shown = view === 'open' ? open : done;
  const slideRef = useRowSlide(view + '|' + shown.map(p => p.id).join());

  const row = patient => {
    const status = statuses.get(patient.id);
    return <tr key={patient.id} ref={slideRef(patient.id)}>
      <td><span className="pd-rank">#{patient.rank}</span><Movement patient={patient} baseRank={baseRanks.get(patient.id)} entered={!isImported(patient) && !baseTop.has(patient.id)} /></td>
      <td><button type="button" className="pd-patient" onClick={() => onOpen(patient)} aria-label={`Open quick view for ${patient.id}`}>
        <PatientPhoto patient={patient} thumbnail className="hf-patient-photo" />
        <span><strong>{patient.id}{isImported(patient) && <span className="pd-tag new">NEW</span>}</strong><span>{patient.age} yrs · {patient.sex === 1 ? 'M' : 'F'}</span></span>
      </button></td>
      <td><div className="pd-chips">{reasonChips(patient).map(chip => <span key={chip.key} className={`pd-chip ${chip.tone}`}>{chip.text} <strong>+{chip.points}</strong></span>)}{!patient.reasons.length && <span className="pd-chip">No scoring conditions</span>}</div></td>
      <td className="pd-hide-sm"><span className="pd-score">{patient.score}</span></td>
      <td><div className="pd-outcomes"><button type="button" className="pd-outcome pd-call-start" disabled={callBusy} aria-label={`Start follow-up call for ${patient.id}`} title={callBusy ? 'Another call is in progress' : 'Start follow-up call'} onClick={() => onStartCall(patient)}><i className="ph ph-phone-outgoing" /></button><span className="pd-outcome-divider" aria-hidden="true" />{OUTCOMES.map(outcome => <button key={outcome.action} type="button" className={`pd-outcome ${outcome.tone}`} aria-pressed={status?.action === outcome.action} aria-label={`${outcome.label}: ${patient.id}`} title={`Log manual outcome: ${outcome.label}`} onClick={() => onOutcome(patient, outcome.action)}><i className={`ph ${outcome.icon}`} /></button>)}</div>
        {status && <span className="pd-status">{status.status} · {formatTime(status.at)} · <button type="button" className="pd-link" onClick={() => onUndo(patient)} aria-label={`Undo ${status.label} for ${patient.id}`}>Undo</button></span>}</td>
    </tr>;
  };

  return <section className="hf-card pd-calls" aria-labelledby="calls-heading">
    <div className="pd-panel-head">
      <div><h2 id="calls-heading">Today's call list</h2><p>Top {listSize} of {totalPatients} patients, ranked by {versionLabel}. Arrows compare with standard scoring.</p></div>
      <div className="pd-tabs" role="tablist" aria-label="Call list view">
        <button type="button" role="tab" aria-selected={view === 'open'} aria-pressed={view === 'open'} onClick={() => setView('open')}>To call <strong>{openTotal}</strong></button>
        <button type="button" role="tab" aria-selected={view === 'done'} aria-pressed={view === 'done'} onClick={() => setView('done')}>Completed <strong>{doneTotal}</strong></button>
      </div>
      <input aria-label="Filter call list" placeholder="Search ID or reason…" value={search} onChange={e => setSearch(e.target.value)} />
    </div>
    <div className="hf-table-wrap"><table className="pd-table">
      <thead><tr><th title="Arrows show the change compared with standard scoring">Rank</th><th>Patient</th><th>Why this patient (points)</th><th className="pd-hide-sm">Total</th><th style={{ textAlign: 'right' }} title="Phone button starts a call; the others log a manual outcome">Call · outcome</th></tr></thead>
      <tbody>
        {shown.map(row)}
      </tbody>
    </table>{!shown.length && <p className="pd-empty">{query ? `No patients match "${search}" here.` : view === 'open' ? 'Everyone on today’s list has been reached or escalated.' : 'No completed calls yet today. Patients you reach, or mark unreachable, move here.'}</p>}</div>
  </section>;
}
