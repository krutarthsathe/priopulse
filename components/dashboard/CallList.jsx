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

export default function CallList({ onStartCall, callBusy, rows, allRanked, baseRanks, baseTop, statuses, onOutcome, onUndo, onOpen, search, setSearch, listSize, versionLabel, totalPatients }) {
  const query = search.trim().toLowerCase();
  const matches = patient => !query || `${patient.id} ${patient.reasons.map(r => r.label).join(' ')}`.toLowerCase().includes(query);
  const [view, setView] = useState('open');
  const groupOf = patient => statuses.get(patient.id)?.group;
  // Call back and Completed look across every patient, so nobody drops out of view if the list size changes.
  const lists = {
    open: rows.filter(p => !groupOf(p)),
    callback: allRanked.filter(p => groupOf(p) === 'callback'),
    done: allRanked.filter(p => groupOf(p) === 'done'),
    all: allRanked,
  };
  const shown = lists[view].filter(matches);
  const slideRef = useRowSlide(view + '|' + shown.map(p => p.id).join());
  const VIEWS = [['open', 'To call'], ['callback', 'Manual call back'], ['done', 'Manually reached'], ['all', 'All patients']];
  const subtitle = {
    open: `Top ${listSize} of ${totalPatients} patients, ranked by ${versionLabel}. Arrows compare with standard scoring.`,
    callback: 'Patients manually marked No answer or Unreachable today. Actual phone-call statuses are in Calls & Review.',
    done: 'Patients manually marked as reached today. Actual phone-call statuses are in Calls & Review.',
    all: `Every patient, ranked by ${versionLabel}. Patients below #${listSize} are not on today’s call list.`,
  }[view];
  const empty = {
    open: 'Everyone on today’s list has an outcome. Check Call back for anyone still to reach.',
    callback: 'Nobody needs a call back. Patients marked No answer or Unreachable appear here.',
    done: 'No patients reached yet today.',
    all: 'No patients to show.',
  }[view];

  const row = patient => {
    const status = statuses.get(patient.id);
    const offList = patient.rank > listSize;
    return <tr key={patient.id} ref={slideRef(patient.id)} className={offList ? 'is-off-list' : ''}>
      <td><span className="pd-rank">#{patient.rank}</span><Movement patient={patient} baseRank={baseRanks.get(patient.id)} entered={!isImported(patient) && !baseTop.has(patient.id)} /></td>
      <td><button type="button" className="pd-patient" onClick={() => onOpen(patient)} aria-label={`Open quick view for ${patient.id}`}>
        <PatientPhoto patient={patient} thumbnail className="hf-patient-photo" />
        <span><strong>{patient.id}{isImported(patient) && <span className="pd-tag new">NEW</span>}{offList && <span className="pd-tag off">not on today’s list</span>}</strong><span>{patient.age} yrs · {patient.sex === 1 ? 'M' : 'F'}</span></span>
      </button></td>
      <td><div className="pd-chips">{reasonChips(patient).map(chip => <span key={chip.key} className={`pd-chip ${chip.tone}`}>{chip.text} <strong>+{chip.points}</strong></span>)}{!reasonChips(patient).length && <span className="pd-chip">No scoring conditions</span>}</div></td>
      <td className="pd-hide-sm"><span className="pd-score">{patient.score}</span></td>
      <td><div className="pd-outcomes"><button type="button" className="pd-outcome pd-call-start" disabled={callBusy || isImported(patient)} aria-label={`Start follow-up call for ${patient.id}`} title={isImported(patient) ? 'Imported records are local scoring examples; phone calls require a saved dataset patient.' : callBusy ? 'Another call is in progress' : 'Start follow-up call'} onClick={() => onStartCall(patient)}><i className="ph ph-phone-outgoing" /></button><span className="pd-outcome-divider" aria-hidden="true" />{OUTCOMES.map(outcome => <button key={outcome.action} type="button" className={`pd-outcome ${outcome.tone}`} aria-pressed={status?.action === outcome.action} aria-label={`${outcome.label}: ${patient.id}`} title={`Log manual outcome: ${outcome.label}`} onClick={() => onOutcome(patient, outcome.action)}><i className={`ph ${outcome.icon}`} /></button>)}</div>
        {status && <span className={`pd-status ${status.group === 'callback' ? 'is-callback' : ''}`}>Manual: {status.label} · {status.status} · {formatTime(status.at)} · <button type="button" className="pd-link" onClick={() => onUndo(patient)} aria-label={`Undo ${status.label} for ${patient.id}`}>Undo</button></span>}</td>
    </tr>;
  };

  return <section className="hf-card pd-calls" aria-labelledby="calls-heading">
    <div className="pd-panel-head">
      <div><h2 id="calls-heading">{view === 'all' ? 'All patients' : 'Today’s call list'}</h2><p>{subtitle}</p></div>
      <div className="pd-tabs" role="tablist" aria-label="Call list view">
        {VIEWS.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={view === key} aria-pressed={view === key} className={key === 'callback' && lists.callback.length ? 'has-callbacks' : ''} onClick={() => setView(key)}>{key === 'callback' && <i className="ph ph-phone-incoming" />}{label} <strong>{lists[key].length}</strong></button>)}
      </div>
      <input aria-label="Filter call list" placeholder="Search ID or reason…" value={search} onChange={e => setSearch(e.target.value)} />
    </div>
    <div className="hf-table-wrap"><table className="pd-table">
      <thead><tr><th title="Arrows show the change compared with standard scoring">Rank</th><th>Patient</th><th>Why this patient (points)</th><th className="pd-hide-sm">Total</th><th style={{ textAlign: 'right' }} title="Phone button starts a call; the others log a manual outcome">Call · outcome</th></tr></thead>
      <tbody>
        {shown.map(row)}
      </tbody>
    </table>{!shown.length && <p className="pd-empty">{query ? `No patients match "${search}" here.` : empty}</p>}</div>
  </section>;
}
