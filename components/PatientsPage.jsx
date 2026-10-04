'use client';
import { useEffect, useState } from 'react';
import Navigation from './Navigation';
import Header from './Header';
import PatientRow from './PatientRow';
import initialRows from './patients-data.json';
import { AUDIT_ACTIONS, recordAuditEvent } from '../lib/audit-log';
import { DEMO_USERS, useCurrentUser } from '../lib/current-user';

const CALL_OUTCOMES = ['call_called', 'call_no_answer', 'call_unreachable'];

export default function PatientsPage() {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState('');
  const [dense, setDense] = useState(true);
  const [pageSize, setPageSize] = useState(6);
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState('');
  const [callMenu, setCallMenu] = useState(null);
  const user = useCurrentUser() ?? DEMO_USERS[0];
  const filteredRows = rows.filter(row => row.search.toLowerCase().replace(/\s+/g, ' ').includes(search.toLowerCase().trim()));
  const visibleRows = filteredRows.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', localStorage.getItem('priopulse-theme') === 'dark');
    root.classList.toggle('sidebar-collapsed', localStorage.getItem('priopulse-sidebar') !== 'expanded');
    const close = e => { if (e.key === 'Escape') { closeModal(); closeMenus(); closeMobile(); setCallMenu(null); }
      const modal = document.getElementById('add-patient-modal');
      if (e.key === 'Tab' && modal && !modal.classList.contains('hidden')) {
        const focusable = [...modal.querySelectorAll('button, input, select, textarea')].filter(el => !el.disabled);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      } };
    document.addEventListener('keydown', close);
    let cleanup;
    let disposed = false;
    import('./charts').then(async ({ mountCharts }) => {
      const destroy = await mountCharts();
      if (disposed) destroy(); else cleanup = destroy;
    }).catch(() => setNotice('Charts could not be loaded. Please reload the page.'));
    return () => { disposed = true; cleanup?.(); document.removeEventListener('keydown', close); document.body.style.overflow = ''; };
  }, []);

  function closeModal() {
    const modal = document.getElementById('add-patient-modal');
    modal?.classList.add('hidden'); modal?.classList.remove('flex'); modal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.getElementById('add-patient-btn')?.focus();
  }
  function closeMobile() {
    document.getElementById('mobile-sidebar')?.classList.add('-translate-x-full');
    document.getElementById('mobile-sidebar-overlay')?.classList.add('hidden');
  }
  function closeMenus() {
    document.querySelectorAll('[data-period-menu], #profile-dropdown, #notifications-dropdown').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[data-period-btn], #profile-btn, #notifications-btn').forEach(el => el.setAttribute('aria-expanded', 'false'));
    document.querySelector('[data-row-menu]')?.remove();
  }
  function addPatient(e) {
    e.preventDefault();
    const fields = [...e.currentTarget.querySelectorAll('input,select,textarea')];
    const [name, email, phone, dob, blood, gender, treatment, payment, ...address] = fields.map(field => field.value);
    const row = { id: crypto.randomUUID(), name, email, phone, dob, blood, gender, treatment, payment, address: address.filter(Boolean).join(', '), search: fields.map(field => field.value).join(' ') };
    setRows(current => [row, ...current]); setSearch(''); setPage(0); closeModal(); e.currentTarget.reset();
    setNotice(`${name} added to this session.`);
  }
  function handleClick(e) {
    const target = e.target;
    const button = target.closest('button');
    if (button?.dataset.callOutcome) {
      const action = button.dataset.callOutcome;
      try {
        recordAuditEvent({ actor: user, action, patient: callMenu.patient, detail: 'Call outcome logged from patient list' });
        setNotice(`“${AUDIT_ACTIONS[action].label}” for ${callMenu.patient} recorded in the audit log.`);
      } catch { setNotice('The call outcome could not be recorded.'); }
      return setCallMenu(null);
    }
    if (!target.closest('[data-call-menu]')) setCallMenu(null);
    if (target.closest('[data-modal-close]')) return closeModal();
    if (target.closest('#mobile-sidebar-overlay, #mobile-sidebar-close')) return closeMobile();
    if (!button) {
      if (!target.closest('[data-period-menu], [data-row-menu], #profile-dropdown, #notifications-dropdown')) closeMenus();
      if (target.closest('a[href="#"]')) { e.preventDefault(); setNotice('This conversion includes the Patients page. Other sections are not connected.'); }
      return;
    }
    if (button.id === 'add-patient-btn') {
      const modal = document.getElementById('add-patient-modal');
      modal.classList.remove('hidden'); modal.classList.add('flex'); modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; modal.querySelector('input')?.focus();
    } else if (button.id === 'theme-toggle') {
      const dark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('priopulse-theme', dark ? 'dark' : 'light');
    } else if (button.id === 'sidebar-toggle') {
      if (window.innerWidth < 1024) {
        document.getElementById('mobile-sidebar').classList.remove('-translate-x-full');
        const overlay = document.getElementById('mobile-sidebar-overlay'); overlay.classList.remove('hidden', 'opacity-0');
      } else {
        const collapsed = document.documentElement.classList.toggle('sidebar-collapsed');
        localStorage.setItem('priopulse-sidebar', collapsed ? 'collapsed' : 'expanded');
      }
    } else if (button.hasAttribute('data-nav-trigger')) {
      const menu = button.parentElement.querySelector('[data-nav-menu]');
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(expanded)); menu?.classList.toggle('hidden', !expanded);
    } else if (button.hasAttribute('data-period-btn') || ['profile-btn', 'notifications-btn'].includes(button.id)) {
      const menu = document.getElementById(button.dataset.target || button.id.replace('-btn', '-dropdown'));
      const opening = menu?.classList.contains('hidden'); closeMenus();
      if (opening) { menu.classList.remove('hidden'); button.setAttribute('aria-expanded', 'true'); }
    } else if (button.hasAttribute('data-period-item')) {
      const menu = button.closest('[data-period-menu]');
      const trigger = document.querySelector(`[data-target="${menu.id}"]`);
      const label = trigger?.querySelector('[data-period-label]'); if (label) label.textContent = button.textContent.trim();
      closeMenus();
    } else if (button.hasAttribute('data-filter-pill')) {
      document.querySelectorAll('[data-filter-pill]').forEach(pill => {
        const active = pill === button;
        pill.classList.toggle('active', active); pill.classList.toggle('text-on-primary', active); pill.classList.toggle('text-muted', !active);
      });
      setNotice(`${button.textContent.trim()} selected. The source provides six sample patients and no date-based dataset.`);
    } else if (button.hasAttribute('data-row-more')) {
      closeMenus();
      const menu = document.createElement('div'); menu.dataset.rowMenu = ''; menu.setAttribute('role', 'menu');
      menu.className = 'fixed z-50 p-3 bg-w1 border border-border rounded-xl shadow-lg text-sm';
      menu.textContent = button.closest('tr').innerText.trim().replace(/\s+/g, ' ');
      const rect = button.getBoundingClientRect(); menu.style.maxWidth = '300px'; menu.style.left = Math.max(8, Math.min(rect.right - 300, window.innerWidth - 308)) + 'px'; menu.style.top = Math.min(rect.bottom + 6, window.innerHeight - 100) + 'px';
      document.body.appendChild(menu);
    } else if (button.getAttribute('aria-label') === 'Call') {
      closeMenus();
      const patient = button.closest('tr')?.querySelector('p')?.textContent.trim().replace(/\s+/g, ' ');
      const rect = button.getBoundingClientRect();
      if (patient) setCallMenu({ patient, left: Math.max(8, Math.min(rect.right - 240, window.innerWidth - 248)), top: Math.min(rect.bottom + 6, window.innerHeight - 190) });
    } else if (['Upload', 'Remove'].includes(button.textContent.trim())) {
      setNotice('Photo upload is not connected in this demo.');
    }
  }
  return <div onClick={handleClick}>
    {notice && <div role="status" className="fixed bottom-4 right-4 z-50 bg-w1 border border-border rounded-xl shadow-lg p-4 text-sm max-w-sm"><button aria-label="Dismiss message" onClick={() => setNotice('')} className="float-right ml-3">×</button>{notice}</div>}
    {callMenu && <div data-call-menu="" role="menu" aria-label={`Log call outcome for ${callMenu.patient}`} className="fixed z-50 w-60 p-2 bg-w1 border border-border rounded-xl shadow-lg" style={{ left: callMenu.left, top: callMenu.top }}>
      <p className="px-2 pt-1 pb-2 text-[11px] text-faint">Log call outcome · <span className="font-semibold text-heading">{callMenu.patient}</span></p>
      {CALL_OUTCOMES.map(action => <button key={action} type="button" role="menuitem" data-call-outcome={action} className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-sm text-text hover:bg-primary/5 transition-colors text-left"><i className={`ph ${AUDIT_ACTIONS[action].icon} text-base text-muted`}></i>{AUDIT_ACTIONS[action].label}</button>)}
    </div>}


<Navigation /><Header search={search} setSearch={setSearch} setPage={setPage} />
<main id="main-content" className="pt-16 pb-6 min-h-dvh ml-0 lg:ml-64 transition-all duration-300">
<div className="p-4 lg:p-6 space-y-5">

<div className="flex flex-wrap items-start justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center flex-shrink-0">
<i className="ph ph-users text-primary text-lg"></i>
</div>
<div>
<h1 className="text-lg font-semibold text-heading leading-tight">{"\n                Patients\n              "}</h1>
<p className="text-xs text-faint mt-0.5">{"\n                Manage and track all patient records & appointments\n              "}</p>
</div>
</div>
<button id="add-patient-btn" type="button" className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-strong text-on-primary text-xs font-medium flex items-center gap-2 transition-colors">
<i className="ph ph-plus text-sm"></i>{"\n            Add Patient\n          "}</button>
</div>

<div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">

<div className="dash-panel overflow-hidden flex flex-col">
<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border-subtle">
<div className="flex items-center gap-2.5">
<span className="dash-icon-chip is-info flex-shrink-0">
<i className="ph ph-map-pin"></i>
</span>
<div>
<h3 className="dash-title">{"Patients Location"}</h3>
<p className="dash-subtitle">{"\n                    Distribution across regions & demographics\n                  "}</p>
</div>
</div>
<div className="relative flex-shrink-0" data-dropdown="">
<button type="button" data-dropdown-trigger="" data-target="loc-period" data-period-btn="" aria-expanded="false" className="dash-period-btn">
<span data-period-label="" data-dropdown-label="">{"This Month"}</span>
<i className="ph ph-caret-down text-[10px] ml-0.5"></i>
</button>
<div id="loc-period" data-dropdown-menu="" data-period-menu="" role="menu" className="hidden absolute right-0 top-full mt-1.5 z-30 min-w-[160px] p-1.5 bg-w1 border border-border rounded-xl shadow-lg">
<button data-period-item="" className="block w-full text-left text-xs px-3 py-2 rounded-lg text-text hover:bg-primary/5 transition-colors">{"\n                    Today\n                  "}</button>
<button data-period-item="" className="block w-full text-left text-xs px-3 py-2 rounded-lg text-text hover:bg-primary/5 transition-colors">{"\n                    This Week\n                  "}</button>
<button data-period-item="" data-active="" className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-primary text-on-primary">{"\n                    This Month\n                  "}</button>
<button data-period-item="" className="block w-full text-left text-xs px-3 py-2 rounded-lg text-text hover:bg-primary/5 transition-colors">{"\n                    This Quarter\n                  "}</button>
<button data-period-item="" className="block w-full text-left text-xs px-3 py-2 rounded-lg text-text hover:bg-primary/5 transition-colors">{"\n                    This Year\n                  "}</button>
</div>
</div>
</div>
<div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 items-center md:min-h-[260px]">

<div className="md:col-span-5 flex flex-col gap-4">
<div className="grid grid-cols-2 gap-3">
<div className="rounded-xl bg-subtle border border-border-subtle p-4">
<p className="text-2xl font-bold text-heading leading-tight">{"\n                      15.9K\n                    "}</p>
<p className="text-[11px] text-muted mt-1">{"Total Patients"}</p>
</div>
<div className="rounded-xl bg-subtle border border-border-subtle p-4">
<p className="text-2xl font-bold text-heading leading-tight">{"\n                      10.4K\n                    "}</p>
<p className="text-[11px] text-muted mt-1">{"Local Patients"}</p>
</div>
<div className="rounded-xl bg-subtle border border-border-subtle p-4">
<p className="text-2xl font-bold text-heading leading-tight">{"\n                      3.6K\n                    "}</p>
<p className="text-[11px] text-muted mt-1">{"\n                      Foreigner Patients\n                    "}</p>
</div>
<div className="rounded-xl bg-subtle border border-border-subtle p-4">
<p className="text-2xl font-bold text-heading leading-tight">{"\n                      1.9K\n                    "}</p>
<p className="text-[11px] text-muted mt-1">{"Transfer Patients"}</p>
</div>
</div>

<div className="pt-1 pb-1">
<p className="text-[10px] font-semibold text-faint uppercase tracking-wide mb-2.5">{"\n                    Age Groups\n                  "}</p>
<div className="grid grid-cols-2 gap-y-2 gap-x-3">
<span className="flex items-center gap-2 text-[11px] text-muted">
<span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0"></span>{"0–5 Years\n                    "}</span>
<span className="flex items-center gap-2 text-[11px] text-muted">
<span className="w-2.5 h-2.5 rounded-full bg-chart-3 flex-shrink-0"></span>{"36–60 Years\n                    "}</span>
<span className="flex items-center gap-2 text-[11px] text-muted">
<span className="w-2.5 h-2.5 rounded-full bg-chart-4 flex-shrink-0"></span>{"60+ Years\n                    "}</span>
<span className="flex items-center gap-2 text-[11px] text-muted">
<span className="w-2.5 h-2.5 rounded-full bg-chart-5 flex-shrink-0"></span>{"6–17 Years\n                    "}</span>
<span className="flex items-center gap-2 text-[11px] text-muted">
<span className="w-2.5 h-2.5 rounded-full bg-chart-6 flex-shrink-0"></span>{"18–35 Years\n                    "}</span>
<span className="flex items-center gap-2 text-[11px] text-muted">
<span className="w-2.5 h-2.5 rounded-full bg-border flex-shrink-0"></span>{"Empty\n                    "}</span>
</div>
</div>
</div>

<div className="md:col-span-7 flex items-center justify-center min-h-[160px]">
<div id="us-states-map" className="w-full h-full flex items-center justify-center">
<svg viewBox="0 0 960 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className="w-full h-auto max-w-[520px]"></svg>
</div>
</div>
</div>
</div>

<div className="dash-panel overflow-hidden flex flex-col">
<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border-subtle">
<div className="flex items-center gap-2.5">
<span className="dash-icon-chip flex-shrink-0">
<i className="ph ph-calendar-check"></i>
</span>
<div>
<h3 className="dash-title">{"Patients Appointment"}</h3>
<p className="dash-subtitle">{"\n                    Appointment trends and scheduling overview\n                  "}</p>
</div>
</div>
<div className="relative flex-shrink-0" data-dropdown="">
<button type="button" data-dropdown-trigger="" data-target="apt-period" data-period-btn="" aria-expanded="false" className="dash-period-btn">
<span data-period-label="" data-dropdown-label="">{"Monthly"}</span>
<i className="ph ph-caret-down text-[10px] ml-0.5"></i>
</button>
<div id="apt-period" data-dropdown-menu="" data-period-menu="" role="menu" className="hidden absolute right-0 top-full mt-1.5 z-30 min-w-[140px] p-1.5 bg-w1 border border-border rounded-xl shadow-lg">
<button data-period-item="" className="block w-full text-left text-xs px-3 py-2 rounded-lg text-text hover:bg-primary/5 transition-colors">{"\n                    Daily\n                  "}</button>
<button data-period-item="" className="block w-full text-left text-xs px-3 py-2 rounded-lg text-text hover:bg-primary/5 transition-colors">{"\n                    Weekly\n                  "}</button>
<button data-period-item="" data-active="" className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-primary text-on-primary">{"\n                    Monthly\n                  "}</button>
<button data-period-item="" className="block w-full text-left text-xs px-3 py-2 rounded-lg text-text hover:bg-primary/5 transition-colors">{"\n                    Quarterly\n                  "}</button>
<button data-period-item="" className="block w-full text-left text-xs px-3 py-2 rounded-lg text-text hover:bg-primary/5 transition-colors">{"\n                    Yearly\n                  "}</button>
</div>
</div>
</div>
<div className="p-5 flex-1 flex flex-col justify-center">
<div id="patients-bar-chart" className="w-full" style={{"height": "240px"}}></div>
</div>
</div>
</div>

<div className="dash-panel p-0 overflow-hidden">

<div className="flex max-2xl:flex-wrap items-center justify-between gap-3 p-4 md:p-5 border-b border-border-subtle">

<div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0 pb-0.5 -mx-1 px-1">
<button data-filter-pill="" data-active="" className="filter-tab active flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors text-on-primary">{"\n                All Types\n              "}</button>
<button data-filter-pill="" className="filter-tab flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors text-muted hover:text-text hover:bg-subtle">{"\n                Days\n              "}</button>
<button data-filter-pill="" className="filter-tab flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors text-muted hover:text-text hover:bg-subtle">{"\n                Weekly\n              "}</button>
<button data-filter-pill="" className="filter-tab flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors text-muted hover:text-text hover:bg-subtle">{"\n                Monthly\n              "}</button>
<button data-filter-pill="" className="filter-tab flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors text-muted hover:text-text hover:bg-subtle">{"\n                Biannual\n              "}</button>
<button data-filter-pill="" className="filter-tab flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors text-muted hover:text-text hover:bg-subtle">{"\n                Yearly\n              "}</button>
</div>

<div className="flex items-center gap-2 w-full 2xl:w-auto flex-shrink-0">
<div className="relative flex-1 2xl:flex-none">
<i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none"></i>
<input id="patient-search" type="text" placeholder="Search patients…" className="h-9 w-full xl:w-60 pl-9 pr-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} aria-label="Search patients" />
</div>
</div>
</div>

<div className="overflow-x-auto whitespace-nowrap">
<table className="w-full text-sm min-w-[700px]">
<thead>
<tr className="bg-subtle border-b border-border-subtle">
<th className="text-left px-5 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"\n                    Patient\n                    "}<span className="inline-flex flex-col leading-[0.7] ml-1 align-middle">
<i className="ph ph-caret-up text-[8px]"></i>
<i className="ph ph-caret-down text-[8px]"></i>
</span>
</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"\n                    Address\n                    "}<span className="inline-flex flex-col leading-[0.7] ml-1 align-middle">
<i className="ph ph-caret-up text-[8px]"></i>
<i className="ph ph-caret-down text-[8px]"></i>
</span>
</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"\n                    Gender\n                    "}<span className="inline-flex flex-col leading-[0.7] ml-1 align-middle">
<i className="ph ph-caret-up text-[8px]"></i>
<i className="ph ph-caret-down text-[8px]"></i>
</span>
</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"\n                    Category\n                    "}<span className="inline-flex flex-col leading-[0.7] ml-1 align-middle">
<i className="ph ph-caret-up text-[8px]"></i>
<i className="ph ph-caret-down text-[8px]"></i>
</span>
</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"\n                    Treatment\n                    "}<span className="inline-flex flex-col leading-[0.7] ml-1 align-middle">
<i className="ph ph-caret-up text-[8px]"></i>
<i className="ph ph-caret-down text-[8px]"></i>
</span>
</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"\n                    Payment\n                    "}<span className="inline-flex flex-col leading-[0.7] ml-1 align-middle">
<i className="ph ph-caret-up text-[8px]"></i>
<i className="ph ph-caret-down text-[8px]"></i>
</span>
</th>
<th className="text-right px-5 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">{"\n                    Action\n                  "}</th>
</tr>
</thead>
<tbody id="patients-tbody">{visibleRows.map(row => <PatientRow key={row.id} row={row} dense={dense} />)}{visibleRows.length === 0 && <tr><td colSpan={7} className="p-5 text-center text-muted">No patients found.</td></tr>}</tbody>
</table>
</div>

<div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-5 py-3 border-t border-border-subtle bg-subtle/40">
<label className="inline-flex items-center gap-2 cursor-pointer">
<div className="relative w-11 h-6 shrink-0">
<input id="dense-toggle" type="checkbox" className="sr-only peer" checked={dense} onChange={e => setDense(e.target.checked)} />
<span className="block w-full h-full rounded-full bg-border peer-checked:bg-primary transition-colors"></span>
<span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></span>
</div>
<span className="text-xs font-medium text-text">{"Dense"}</span>
</label>
<div className="flex flex-wrap items-center gap-4">
<div className="flex items-center gap-2 text-[11px] text-muted">
<span>{"Rows per page:"}</span>
<select id="rows-per-page" className="h-7 px-2 rounded-lg bg-w1 border border-border text-xs text-text focus:outline-none focus:border-primary/50" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }} aria-label="Rows per page">
<option value="6">{"06"}</option>
<option value="10">{"10"}</option>
<option value="25">{"25"}</option>
<option value="50">{"50"}</option>
</select>
</div>
<span className="text-[11px] text-muted">{filteredRows.length ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, filteredRows.length)} of {filteredRows.length}</span>
<div className="flex items-center gap-0.5">
<button aria-label="Previous page" className="w-7 h-7 rounded-lg flex items-center justify-center text-faint hover:text-text hover:bg-subtle transition-colors disabled:opacity-40 disabled:hover:bg-transparent" disabled={page === 0} onClick={() => setPage(page - 1)}>
<i className="ph ph-caret-left text-xs"></i>
</button>
<button aria-label="Next page" className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-subtle transition-colors" disabled={(page + 1) * pageSize >= filteredRows.length} onClick={() => setPage(page + 1)}>
<i className="ph ph-caret-right text-xs"></i>
</button>
</div>
</div>
</div>
</div>
</div>
</main>

<div role="dialog" aria-modal="true" aria-labelledby="add-patient-title" aria-hidden="true" id="add-patient-modal" className="hidden fixed inset-0 z-50 items-center justify-center p-4">

<div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" data-modal-close=""></div>

<div className="relative w-full max-w-xl bg-w1 rounded-2xl border border-border shadow-2xl overflow-hidden">

<div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
<div className="flex items-center gap-2.5">
<span className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
<i className="ph ph-user-plus text-base"></i>
</span>
<div>
<h2 id="add-patient-title" className="text-sm font-semibold text-heading leading-tight">{"\n                Add Patient\n              "}</h2>
<p className="text-[11px] text-faint mt-0.5">{"\n                Register a new patient record\n              "}</p>
</div>
</div>
<button type="button" data-modal-close="" aria-label="Close" className="w-8 h-8 rounded-xl flex items-center justify-center text-faint hover:bg-subtle hover:text-text transition-colors">
<i className="ph ph-x text-sm"></i>
</button>
</div>

<form onSubmit={addPatient}>
<div className="px-5 py-4 max-h-[68vh] overflow-y-auto space-y-4">

<div className="flex items-center gap-4 p-3.5 bg-subtle rounded-xl border border-border-subtle">
<div className="w-14 h-14 rounded-xl bg-border flex items-center justify-center flex-shrink-0 overflow-hidden">
<i className="ph ph-image text-faint text-2xl"></i>
</div>
<div className="min-w-0 flex-1">
<p className="text-sm font-semibold text-heading mb-0.5">{"\n                Profile Photo\n              "}</p>
<p className="text-[11px] text-faint mb-2">{"\n                Upload photo (optional) to complete the patient profile.\n              "}</p>
<div className="flex items-center gap-2">
<button type="button" className="h-7 px-3 rounded-lg border border-border text-[11px] font-medium text-text hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors">
<i className="ph ph-upload-simple text-xs mr-1"></i>{"Upload\n                "}</button>
<button type="button" className="h-7 px-3 rounded-lg border border-border text-[11px] font-medium text-muted hover:border-danger/50 hover:text-danger hover:bg-danger-soft transition-colors">{"\n                  Remove\n                "}</button>
</div>
</div>
</div>

<div>
<label className="block text-[11px] font-semibold text-faint uppercase tracking-wide mb-1.5">{"Patient Name\n              "}<span className="text-danger normal-case font-normal">{"*"}</span></label>
<input aria-label="Patient name" type="text" required={true} placeholder="Enter full name…" className="w-full h-10 px-3.5 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors" />
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<div>
<label className="block text-[11px] font-semibold text-faint uppercase tracking-wide mb-1.5">{"Email\n                "}<span className="text-danger normal-case font-normal">{"*"}</span></label>
<div className="relative">
<i className="ph ph-envelope absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none"></i>
<input aria-label="Email" type="email" required={true} placeholder="email@example.com" className="w-full h-10 pl-9 pr-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors" />
</div>
</div>
<div>
<label className="block text-[11px] font-semibold text-faint uppercase tracking-wide mb-1.5">{"Phone\n                "}<span className="text-danger normal-case font-normal">{"*"}</span></label>
<div className="relative">
<i className="ph ph-phone absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none"></i>
<input aria-label="Phone" type="tel" required={true} placeholder="+1 (000) 000-0000" className="w-full h-10 pl-9 pr-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors" />
</div>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<div>
<label className="block text-[11px] font-semibold text-faint uppercase tracking-wide mb-1.5">{"Date of Birth\n                "}<span className="text-danger normal-case font-normal">{"*"}</span></label>
<div className="relative">
<i className="ph ph-calendar-blank absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none"></i>
<input aria-label="Date of birth" type="date" required={true} className="w-full h-10 pl-9 pr-3 rounded-xl bg-subtle border border-transparent text-sm text-text focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors [color-scheme:light] dark:[color-scheme:dark]" />
</div>
</div>
<div>
<label className="block text-[11px] font-semibold text-faint uppercase tracking-wide mb-1.5">{"Blood Group\n                "}<span className="text-danger normal-case font-normal">{"*"}</span></label>
<div className="relative">
<select aria-label="Blood group" defaultValue="" required={true} className="w-full h-10 pl-3.5 pr-9 rounded-xl bg-subtle border border-transparent text-sm text-text appearance-none cursor-pointer focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors">
<option value="" disabled={true}>{"Select group…"}</option>
<option>{"A+"}</option>
<option>{"A-"}</option>
<option>{"B+"}</option>
<option>{"B-"}</option>
<option>{"AB+"}</option>
<option>{"AB-"}</option>
<option>{"O+"}</option>
<option>{"O-"}</option>
</select>
<i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-faint pointer-events-none"></i>
</div>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<div>
<label className="block text-[11px] font-semibold text-faint uppercase tracking-wide mb-1.5">{"Gender\n                "}<span className="text-danger normal-case font-normal">{"*"}</span></label>
<div className="relative">
<select aria-label="Gender" defaultValue="" required={true} className="w-full h-10 pl-3.5 pr-9 rounded-xl bg-subtle border border-transparent text-sm text-text appearance-none cursor-pointer focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors">
<option value="" disabled={true}>{"Select gender…"}</option>
<option>{"Male"}</option>
<option>{"Female"}</option>
<option>{"Other"}</option>
</select>
<i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-faint pointer-events-none"></i>
</div>
</div>
<div>
<label className="block text-[11px] font-semibold text-faint uppercase tracking-wide mb-1.5">{"Treatment\n                "}<span className="text-danger normal-case font-normal">{"*"}</span></label>
<div className="relative">
<select aria-label="Treatment" defaultValue="" required={true} className="w-full h-10 pl-3.5 pr-9 rounded-xl bg-subtle border border-transparent text-sm text-text appearance-none cursor-pointer focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors">
<option value="" disabled={true}>{"Select treatment…"}</option>
<option>{"Cardiology"}</option>
<option>{"Dental"}</option>
<option>{"Dermatology"}</option>
<option>{"Neurology"}</option>
<option>{"Ophthalmology"}</option>
<option>{"Orthopedics"}</option>
<option>{"Pediatrics"}</option>
<option>{"Psychiatry"}</option>
<option>{"Pulmonary"}</option>
<option>{"Rhinology"}</option>
</select>
<i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-faint pointer-events-none"></i>
</div>
</div>
</div>

<div>
<label className="block text-[11px] font-semibold text-faint uppercase tracking-wide mb-1.5">{"Payment Status\n              "}<span className="text-danger normal-case font-normal">{"*"}</span></label>
<div className="relative">
<select aria-label="Payment status" defaultValue="" required={true} className="w-full h-10 pl-3.5 pr-9 rounded-xl bg-subtle border border-transparent text-sm text-text appearance-none cursor-pointer focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors">
<option value="" disabled={true}>{"\n                  Select payment status…\n                "}</option>
<option>{"Paid"}</option>
<option>{"Pending"}</option>
<option>{"Cancelled"}</option>
</select>
<i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-faint pointer-events-none"></i>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
<div>
<label className="block text-[11px] font-semibold text-faint uppercase tracking-wide mb-1.5">{"City"}</label>
<input aria-label="City" type="text" placeholder="City…" className="w-full h-10 px-3.5 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors" />
</div>
<div>
<label className="block text-[11px] font-semibold text-faint uppercase tracking-wide mb-1.5">{"State"}</label>
<input aria-label="State" type="text" placeholder="State…" className="w-full h-10 px-3.5 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors" />
</div>
<div>
<label className="block text-[11px] font-semibold text-faint uppercase tracking-wide mb-1.5">{"ZIP Code"}</label>
<input aria-label="Postal code" type="text" placeholder="ZIP…" className="w-full h-10 px-3.5 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors" />
</div>
</div>

<div>
<label className="block text-[11px] font-semibold text-faint uppercase tracking-wide mb-1.5">{"Address"}</label>
<textarea aria-label="Address" rows="3" placeholder="Street address…" className="w-full p-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors resize-none" style={{"fontFamily": "inherit"}}></textarea>
</div>
</div>

<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-border-subtle bg-subtle/40">
<p className="text-[11px] text-faint">
<span className="text-danger">{"*"}</span>{" Required fields\n          "}</p>
<div className="flex items-center gap-2">
<button type="button" data-modal-close="" className="h-8 px-4 rounded-xl border border-border text-muted text-xs font-medium hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors">{"\n              Cancel\n            "}</button>
<button type="submit" className="h-8 px-4 rounded-xl bg-primary hover:bg-primary-strong text-on-primary text-xs font-semibold transition-colors flex items-center gap-1.5">
<i className="ph ph-user-plus text-sm"></i>{"Add Patient\n            "}</button>
</div>
</div>
</form>
</div>
</div>






  </div>;
}
