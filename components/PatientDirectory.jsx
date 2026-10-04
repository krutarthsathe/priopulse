'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardShell from './DashboardShell';
import PatientPhoto from './PatientPhoto';
import dataset from '../data/heart-failure-patients.json';
import { rankPatients } from '../lib/heart-failure-ranking';
import './heart-failure.css';
import './patients-polish.css';
import './patient-directory.css';

const patients = rankPatients(dataset.patients);
const PAGE_SIZE = 12;
export default function PatientDirectory() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('id');
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => patients.filter(patient => {
    const text = `${patient.id} ${patient.age} ${patient.reasons.map(reason => reason.label).join(' ')}`.toLowerCase();
    return text.includes(search.trim().toLowerCase()) && (filter !== 'priority' || patient.rank <= 25);
  }).sort((a, b) => sort === 'priority' ? a.rank - b.rank : sort === 'age' ? b.age - a.age || a.id.localeCompare(b.id) : a.id.localeCompare(b.id)), [search, filter, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  function searchPatients(value) { setSearch(value); setPage(0); }
  return <DashboardShell search={search} setSearch={searchPatients} setPage={setPage} searchLabel="Search all patients" searchPlaceholder="Search patient ID, age, or scoring reason…"><main className="pt-16 pb-6 min-h-dvh ml-0 lg:ml-64" id="main-content"><div className="hf-dashboard patient-directory">
    <header className="hf-patients-hero"><div><span className="hf-hero-kicker"><i className="ph ph-users" /> Patient directory</span><h1>All patients, one clear view.</h1><p>Explore all {patients.length} anonymous records. Select a patient to see measurements, priority reasons, and follow-up.</p><div className="hf-hero-tags"><span>{patients.length} patient records</span><span>25 in the default priority list</span><span>Illustrative photos · Anonymous data</span></div></div><Link href="/patients" className="hf-hero-link">Priority Call List <i className="ph ph-arrow-up-right" /></Link></header>
    <section className="hf-card directory-panel" aria-labelledby="directory-heading"><div className="directory-toolbar"><div><h2 id="directory-heading">Patient directory</h2><p>{filtered.length} matching records · Default scoring rules</p></div><div className="directory-controls"><label className="directory-search">Search patients<input value={search} onChange={event => searchPatients(event.target.value)} placeholder="Patient ID, age, or reason" /></label><label>Show<select aria-label="Show patients" value={filter} onChange={event => { setFilter(event.target.value); setPage(0); }}><option value="all">All 299 patients</option><option value="priority">Top 25 priority patients</option></select></label><label>Sort by<select aria-label="Sort patients" value={sort} onChange={event => { setSort(event.target.value); setPage(0); }}><option value="id">Patient ID</option><option value="priority">Call priority</option><option value="age">Oldest first</option></select></label></div></div>
    <div className="directory-grid">{visible.map(patient => <Link className="directory-card" key={patient.id} href={`/patient-details?id=${patient.id}`} aria-label={`View patient ${patient.id}`}><div className="directory-card-head"><PatientPhoto patient={patient} className="directory-avatar" /><div><h3>{patient.id}</h3><p>{patient.age} years · {patient.sex === 1 ? 'Male' : 'Female'}</p><span className="directory-subtitle">Anonymous patient record</span></div></div><div className="directory-priority"><span>Default call priority <strong>#{patient.rank}</strong></span><span className={patient.rank <= 25 ? 'directory-badge' : 'directory-badge directory-badge-muted'}>{patient.rank <= 25 ? 'Top 25' : `${patient.score} points`}</span></div><dl className="directory-measurements"><div><dt>Heart pumping</dt><dd>{patient.ejection_fraction}<small>%</small></dd></div><div><dt>Kidney measurement</dt><dd>{patient.serum_creatinine}<small>mg/dL</small></dd></div></dl><div className="directory-card-footer"><span>View patient details</span><i className="ph ph-arrow-right" /></div></Link>)}</div>
    {!visible.length && <div className="directory-empty"><i className="ph ph-magnifying-glass" /><h3>No matching patients</h3><p>Try another patient ID, age, or scoring reason.</p><button className="hf-action" onClick={() => { setSearch(''); setFilter('all'); setPage(0); }}>Reset filters</button></div>}
    <footer className="directory-pagination"><span>{filtered.length ? currentPage * PAGE_SIZE + 1 : 0}–{Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} patients</span><div><button className="hf-action" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage + 1} of {pages}</span><button className="hf-action" disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}>Next</button></div></footer></section>
    <p className="hf-caption">Clinical values come from the supplied historical dataset. Portraits are illustrative and are not photographs of the dataset patients. Priority points are challenge rules, not a diagnosis.</p>
  </div></main></DashboardShell>;
}
