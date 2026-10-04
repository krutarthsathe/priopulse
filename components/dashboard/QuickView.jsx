'use client';
import { AUDIT_ACTIONS } from '../../lib/audit-log';
import PatientPhoto from '../PatientPhoto';
import Drawer from './Drawer';
import { OUTCOMES, isImported, profileLink, formatTime } from './helpers';

const yesNo = value => value === 1 ? 'Yes' : value === 0 ? 'No' : '—';

export default function QuickView({ patient, rule, versionLabel, history, status, onOutcome, onUndo, onClose }) {
  const facts = [
    ['Heart pumping', `${patient.ejection_fraction}%`], ['Kidney (creatinine)', `${patient.serum_creatinine} mg/dL`],
    ['Blood sodium', patient.serum_sodium != null ? `${patient.serum_sodium} mEq/L` : '—'], ['Age · sex', `${patient.age} · ${patient.sex === 1 ? 'Male' : 'Female'}`],
    ['Anaemia', yesNo(patient.anaemia)], ['Diabetes', yesNo(patient.diabetes)], ['High blood pressure', yesNo(patient.high_blood_pressure)], ['Priority', `#${patient.rank} · ${patient.score} points`],
  ];
  return <Drawer title={`Patient ${patient.id}`} subtitle={isImported(patient) ? 'Imported today · no outcome yet' : 'Anonymous dataset record'} onClose={onClose} labelledBy="pd-quickview-title">
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <PatientPhoto patient={patient} className="hf-patient-photo" alt={`Patient ${patient.id}`} />
      <div><strong>Rank #{patient.rank}</strong> with {versionLabel}<p className="hf-caption">{status ? `${status.status} · ${status.label} at ${formatTime(status.at)} by ${status.by}` : 'Not called yet today'}</p></div>
    </div>
    <dl className="pd-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <div><h3 className="pd-kpi-label">Why this patient</h3>
      <ul className="pd-list" style={{ marginTop: 8 }}>{patient.reasons.map(r => <li key={r.label}><span>{r.label}</span><strong>+{r.points}</strong></li>)}{!patient.reasons.length && <li>No scoring conditions</li>}</ul>
    </div>
    <div><h3 className="pd-kpi-label">Log today’s call</h3>
      <div className="pd-outcomes" style={{ justifyContent: 'flex-start', marginTop: 8 }}>{OUTCOMES.map(o => <button key={o.action} type="button" className="pd-btn pd-btn-sm" aria-pressed={status?.action === o.action} onClick={() => onOutcome(patient, o.action)}><i className={`ph ${o.icon}`} />{o.label}</button>)}{status && <button type="button" className="pd-btn pd-btn-sm" onClick={() => onUndo(patient)}><i className="ph ph-arrow-counter-clockwise" />Undo “{status.label}”</button>}</div>
    </div>
    <div><h3 className="pd-kpi-label">Follow-up activity</h3>
      {history.length ? <ul className="pd-list" style={{ marginTop: 8 }}>{history.map(e => <li key={e.id}><span>{AUDIT_ACTIONS[e.action]?.label ?? e.action} · {e.actor.name}</span><span className="hf-caption">{new Date(e.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span></li>)}</ul> : <p>No activity logged yet.</p>}
    </div>
    {isImported(patient)
      ? <p className="hf-caption">Imported records live on this page only and have no full profile yet.</p>
      : <a className="pd-btn pd-btn-primary" href={profileLink(patient, rule)} style={{ justifyContent: 'center' }}>Open full profile <i className="ph ph-arrow-up-right" /></a>}
  </Drawer>;
}
