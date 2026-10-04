'use client';
import { useState } from 'react';
import DashboardShell from '../DashboardShell';
import { rankPatients, scorePatient } from '../../lib/heart-failure-ranking';
import dataset from '../../data/heart-failure-patients.json';
import { AUDIT_ACTIONS, recordAuditEvent, useAuditLog } from '../../lib/audit-log';
import { DEMO_USERS, useCurrentUser } from '../../lib/current-user';
import PatientPhoto from '../PatientPhoto';
import '../heart-failure.css';
import './heart-failure-profile.css';

const TABS = [['overview', 'ph-user-circle', 'Overview'], ['measurements', 'ph-flask', 'Measurements'], ['activity', 'ph-clock-counter-clockwise', 'Follow-up activity']];
const CONDITIONS = [['Anaemia', 'anaemia', 'ph-drop'], ['Diabetes', 'diabetes', 'ph-drop-half'], ['High blood pressure', 'high_blood_pressure', 'ph-heartbeat'], ['Smoking', 'smoking', 'ph-cigarette']];

export default function HeartFailureDetails({ patient, weight }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('overview');
  const [note, setNote] = useState('');
  const [notice, setNotice] = useState('');
  const actor = useCurrentUser() ?? DEMO_USERS[0];
  const events = useAuditLog().filter(event => patient && event.patient === patient.id);
  const scored = patient ? scorePatient(patient, weight) : null;
  const rank = patient ? rankPatients(dataset.patients, weight).find(record => record.id === patient.id)?.rank : null;
  const originalRank = patient ? rankPatients(dataset.patients, 2).find(record => record.id === patient.id)?.rank : null;
  const filteredEvents = events.filter(event => `${event.detail} ${event.actor.name} ${AUDIT_ACTIONS[event.action].label}`.toLowerCase().includes(search.toLowerCase())).toReversed();
  function saveEvent(action, detail) {
    try {
      recordAuditEvent({ actor, action, patient: patient.id, detail });
      setNotice(`${AUDIT_ACTIONS[action].label} saved in this browser.`);
      if (action === 'note') setNote('');
    } catch { setNotice('This entry could not be saved. Please try again.'); }
  }
  return <DashboardShell search={search} setSearch={setSearch} setPage={() => {}} searchLabel="Search patient activity" searchPlaceholder="Search follow-up activity…">
    <main id="main-content" className="pt-16 pb-6 min-h-dvh ml-0 lg:ml-64"><div className="hf-dashboard hp-dashboard">
      <div className="hp-breadcrumb"><a href="/patients"><i className="ph ph-arrow-left" /> Call queue</a><span>/</span><span>Patient profile</span></div>
      {scored ? <>
        <section className="hp-hero" aria-label="Patient profile"><div className="hp-hero-art" aria-hidden="true"><i className="ph ph-heartbeat" /></div><div className="hp-identity"><div className="hp-avatar"><PatientPhoto key={patient.id} patient={patient} alt={`Patient ${patient.id}`} /><span><i className="ph ph-user" /></span></div><div><span className="hp-kicker">HEART-FAILURE FOLLOW-UP</span><h1>Patient {patient.id}</h1><div className="hp-meta"><span><i className="ph ph-calendar-blank" /> {patient.age} years</span><span><i className="ph ph-identification-card" /> Anonymous record</span><span><i className="ph ph-database" /> UCI dataset</span></div><p>Personal identity and contact details not supplied</p></div></div><div className="hp-hero-rank"><span>CALL PRIORITY</span><strong>#{rank}<small> / 299</small></strong><span className="hp-queue-chip">{rank <= 25 ? 'In the top-25 call list' : 'Outside the top-25 call list'}</span></div></section>
        <div className="hp-layout"><aside className="hp-sidebar">
          <section className="hf-card hp-profile-card"><div className="hp-card-title"><i className="ph ph-identification-card" /><h2>Patient information</h2></div><dl><div><dt>Patient ID</dt><dd>{patient.id}</dd></div><div><dt>Age</dt><dd>{patient.age} years</dd></div><div><dt>Sex recorded in dataset</dt><dd>{patient.sex === 1 ? 'Male' : 'Female'}</dd></div><div><dt>Care context</dt><dd>Heart failure dataset</dd></div><div><dt>Phone / email</dt><dd className="hp-muted">Not provided</dd></div><div><dt>Address / date of birth</dt><dd className="hp-muted">Not provided</dd></div></dl><div className="hp-source-note"><i className="ph ph-info" /><p>Clinical values come from the selected record.</p></div></section>
          <section className="hf-card"><div className="hp-card-title"><i className="ph ph-phone-call" /><h2>Follow-up workspace</h2></div><p>Record a demo call outcome for this patient.</p><div className="hp-call-actions">{['call_called', 'call_no_answer', 'call_unreachable'].map(action => <button key={action} onClick={() => saveEvent(action, 'Demo outcome recorded from patient profile')}><i className={`ph ${AUDIT_ACTIONS[action].icon}`} />{AUDIT_ACTIONS[action].label}<i className="ph ph-arrow-up-right" /></button>)}</div><p className="hf-caption">Logs stay in this browser. These actions do not place a call.</p></section>
          <section className="hp-context"><i className="ph ph-shield-check" /><div><strong>Transparent by design</strong><p>Every priority point has a reason. Historical outcomes are never used to choose who ranks first.</p></div></section>
        </aside><div className="hp-main">
          <div className="hp-tabs" role="tablist" aria-label="Patient profile sections">{TABS.map(([key, icon, label]) => <button key={key} id={`profile-tab-${key}`} role="tab" aria-selected={tab === key} aria-controls="profile-panel" onClick={() => setTab(key)}><i className={`ph ${icon}`} />{label}</button>)}</div>
          <div id="profile-panel" role="tabpanel" aria-labelledby={`profile-tab-${tab}`}>
          {tab === 'overview' && <div className="hp-stack">
            <div className="hp-vitals"><Metric icon="ph-heartbeat" label="Heart pumping" value={patient.ejection_fraction} unit="%" detail="Ejection fraction" flag={patient.ejection_fraction < 35 ? `Below scoring threshold · +${weight}` : 'No heart points'} /><Metric icon="ph-drop" label="Kidney measurement" value={patient.serum_creatinine} unit="mg/dL" detail="Serum creatinine" flag={patient.serum_creatinine > 1.5 ? 'Above scoring threshold · +2' : 'No kidney points'} /><Metric icon="ph-chart-bar" label="Priority score" value={scored.score} unit="points" detail={`Heart weight ${weight} · Kidney weight 2`} flag="Explainable rule-based score" /></div>
            <section className="hf-card hp-score-panel"><div className="hp-card-title"><i className="ph ph-sparkle" /><h2>Why this patient ranks #{rank}</h2><span className="hf-badge">{scored.score} points</span></div><p>Each contribution below comes directly from a recorded measurement or condition.</p><div className="hp-contributions">{scored.reasons.map(reason => <div className="hp-contribution" key={reason.label}><span>{reason.label}</span><div className="hp-point-track"><span style={{width: `${reason.points / 3 * 100}%`}} /></div><strong>+{reason.points}</strong></div>)}</div>{!scored.reasons.length && <p>No scoring conditions apply to this record.</p>}<div className="hp-score-footer"><span>Original rank <strong>#{originalRank}</strong></span><span>Current rank <strong>#{rank}</strong></span><span>Heart points <strong>{weight}</strong></span></div><p className="hf-caption">Equal scores use age descending, then patient ID ascending. Points are not a probability of death.</p></section>
            <section className="hf-card"><div className="hp-card-title"><i className="ph ph-first-aid-kit" /><h2>Recorded conditions</h2></div><div className="hp-conditions">{CONDITIONS.map(([label, field, icon]) => <div key={field}><i className={`ph ${icon}`} /><span>{label}</span><strong className={patient[field] ? 'hp-present' : 'hp-absent'}>{patient[field] ? 'Recorded' : 'Not recorded'}</strong></div>)}</div><p className="hf-caption">Smoking is shown for context and contributes no points in these challenge rules.</p></section>
            <section className="hf-card"><div className="hp-card-title"><i className="ph ph-note-pencil" /><h2>Follow-up note</h2></div><form onSubmit={e => {e.preventDefault(); if (note.trim()) saveEvent('note', note.trim());}}><label className="hp-note-label" htmlFor="patient-note">Add a demo note to this patient’s activity</label><textarea id="patient-note" value={note} onChange={e => setNote(e.target.value)} placeholder="What should the next team member know?" maxLength={1000} /><div className="hp-note-bottom"><span>{note.length}/1000 · Stored in this browser</span><button className="hp-primary" disabled={!note.trim()} type="submit">Save note <i className="ph ph-arrow-right" /></button></div></form></section>
          </div>}
          {tab === 'measurements' && <section className="hf-card"><div className="hp-card-title"><i className="ph ph-flask" /><h2>Measurements from this record</h2></div><p>A single historical record, with no measurement dates or trends supplied.</p><div className="hf-table-wrap"><table className="hf-table"><thead><tr><th>Measurement</th><th>Recorded value</th><th>Use in ranking</th></tr></thead><tbody>{[
            ['Heart pumping (ejection fraction)', `${patient.ejection_fraction}%`, `Below 35% adds ${weight} points`],
            ['Kidney measurement (serum creatinine)', `${patient.serum_creatinine} mg/dL`, 'Above 1.5 adds 2 points'],
            ['Blood sodium', `${patient.serum_sodium} mEq/L`, 'Context only'],
            ['Platelets', `${patient.platelets.toLocaleString('en-US')} / µL`, 'Context only'],
            ['Creatinine phosphokinase (enzyme)', `${patient.creatinine_phosphokinase} mcg/L`, 'Context only'],
          ].filter(row => row.join(' ').toLowerCase().includes(search.toLowerCase())).map(([label, value, use]) => <tr key={label}><td>{label}</td><td><strong>{value}</strong></td><td>{use}</td></tr>)}</tbody></table></div><div className="hp-source-note"><i className="ph ph-info" /><p>Ejection fraction is the percentage of blood pumped out per heartbeat. Serum creatinine helps assess kidney function. Thresholds here are challenge scoring rules.</p></div></section>}
          {tab === 'activity' && <section className="hf-card"><div className="hp-card-title"><i className="ph ph-clock-counter-clockwise" /><h2>Follow-up activity</h2><span className="hf-badge">{filteredEvents.length} entries</span></div><p>Actual demo actions logged for {patient.id}, newest first.</p>{filteredEvents.length ? <div className="hp-timeline">{filteredEvents.map(event => <article key={event.id}><div className="hp-event-icon"><i className={`ph ${AUDIT_ACTIONS[event.action].icon}`} /></div><div><strong>{AUDIT_ACTIONS[event.action].label}</strong><p>{event.detail}</p><span>{event.actor.name} · <time dateTime={event.at}>{new Intl.DateTimeFormat('en-CA',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Edmonton'}).format(new Date(event.at))}</time></span></div></article>)}</div> : <div className="hp-empty"><i className="ph ph-chat-circle-dots" /><h3>{events.length ? 'No matching activity' : 'A fresh start for this patient'}</h3><p>{events.length ? 'Try a different search.' : 'Log a call outcome or save a note to begin the follow-up history.'}</p></div>}</section>}
          </div>
        </div></div>
        <footer className="hf-caption">Historical demonstration · Not a validated clinical tool. Appointments, prescriptions, and billing are not supplied for these records. Dataset: <a href="https://doi.org/10.24432/C5Z89R">Chicco &amp; Jurman, UCI (2020)</a> · CC BY 4.0.</footer>
      </> : <section className="hf-card"><h1>Patient not found</h1><p>Select a patient from the call queue.</p></section>}
      {notice && <div className="hf-notice" role="status">{notice}<button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
    </div></main>
  </DashboardShell>;
}
function Metric({icon, label, value, unit, detail, flag}) { return <section className="hf-card hp-metric"><div><span>{label}</span><i className={`ph ${icon}`} /></div><strong>{value}<small>{unit}</small></strong><p>{detail}</p><span className="hp-metric-flag">{flag}</span></section>; }
