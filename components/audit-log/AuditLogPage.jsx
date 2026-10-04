'use client';
import {useState} from 'react';
import DashboardShell from '../DashboardShell';
import {AUDIT_ACTIONS, AUDIT_GROUPS, useAuditLog, verifyAuditLog} from '../../lib/audit-log';
import {DEMO_USERS, ROLE_LABELS, canViewAuditLog, setCurrentUser, useCurrentUser} from '../../lib/current-user';
import './audit-log.css';

const FILTERS = [['all', 'All'], ['override', 'Ranking overrides'], ['note', 'Notes'], ['call', 'Call outcomes'], ['agent', 'Agent re-queues']];
const ROLE_ICONS = {doctor: 'ph-stethoscope', nurse: 'ph-first-aid', admin: 'ph-identification-badge', agent: 'ph-robot'};

function formatWhen(iso) {
 const date = new Date(iso);
 return {
  day: date.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}),
  time: date.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', second: '2-digit'}),
 };
}

function matches(entry, query) {
 if (!query) return true;
 const action = AUDIT_ACTIONS[entry.action];
 return [entry.actor.name, ROLE_LABELS[entry.actor.role], action?.label, AUDIT_GROUPS[action?.group], entry.patient ?? 'Queue-wide', entry.detail, entry.reason, entry.from, entry.to]
  .filter(Boolean).join(' ').toLowerCase().includes(query);
}

function AccessRestricted({user}) {
 const clinicians = DEMO_USERS.filter(canViewAuditLog);
 return <div className="dash-panel p-6 audit-gate">
<div className="w-12 h-12 rounded-xl bg-danger-soft flex items-center justify-center mx-auto mb-4">
<i className="ph ph-lock-simple text-danger text-2xl"></i>
</div>
<h1 className="text-lg font-semibold text-heading">Audit log is restricted to clinical staff</h1>
<p className="text-sm text-muted mt-2">You're signed in as <strong>{user.name}</strong> ({ROLE_LABELS[user.role]}). Only doctors and nurses can view the audit log.</p>
<div className="mt-5 pt-4 border-t border-border-subtle">
<p className="text-[11px] text-faint uppercase tracking-wide mb-2">Demo: switch user</p>
<div className="flex flex-wrap justify-center gap-2">{clinicians.map(c => <button key={c.id} type="button" onClick={() => setCurrentUser(c.id)} className="h-9 px-4 rounded-xl border border-border text-text hover:border-primary/50 hover:text-primary hover:bg-primary/5 text-sm font-medium flex items-center gap-2 transition-colors"><i className={'ph ' + ROLE_ICONS[c.role]}></i>{c.name} · {ROLE_LABELS[c.role]}</button>)}</div>
</div>
</div>;
}

function StatCard({label, value, icon, tone}) {
 return <div className="dash-panel p-4 flex items-center gap-3">
<span className={'audit-badge audit-tone-' + tone} style={{padding: '0.5rem', borderRadius: '0.75rem'}}><i className={'ph ' + icon + ' text-lg'}></i></span>
<div>
<p className="audit-stat-value">{value}</p>
<p className="text-xs text-muted mt-1">{label}</p>
</div>
</div>;
}

function AuditRow({entry}) {
 const action = AUDIT_ACTIONS[entry.action] ?? {label: entry.action, icon: 'ph-question', tone: 'neutral', group: 'note'};
 const when = formatWhen(entry.at);
 const override = action.group === 'override';
 return <tr className={'border-b border-border-subtle hover:bg-primary/[0.03] transition-colors align-top' + (override ? ' audit-override-row' : '')}>
<td className="px-5 py-3 whitespace-nowrap">
<p className="text-sm font-semibold text-heading audit-time">{when.time}</p>
<p className="text-[11px] text-faint mt-0.5">{when.day}</p>
</td>
<td className="px-4 py-3 text-sm font-medium text-heading whitespace-nowrap">{entry.patient ?? <span className="text-xs font-normal text-faint">Queue-wide</span>}</td>
<td className="px-4 py-3 whitespace-nowrap">
<span className={'audit-badge audit-tone-' + action.tone}><i className={'ph ' + action.icon}></i>{action.label}</span>
{override && <span className="audit-override-tag" title="Manual change to the ranking">Override</span>}
</td>
<td className="px-4 py-3 whitespace-nowrap">
<p className="text-xs text-text">{entry.actor.name}</p>
<p className="text-[11px] text-faint mt-0.5 inline-flex items-center gap-1"><i className={'ph ' + (ROLE_ICONS[entry.actor.role] ?? 'ph-user')}></i>{ROLE_LABELS[entry.actor.role] ?? entry.actor.role}</p>
</td>
<td className="px-4 py-3">
<p className="text-xs text-text">{entry.detail}</p>
{(entry.from || entry.to) && <p className="audit-change text-muted mt-1"><s>{entry.from ?? '—'}</s> <i className="ph ph-arrow-right"></i> <strong className="text-heading">{entry.to ?? '—'}</strong></p>}
{entry.reason && <p className="audit-reason mt-1">Reason: {entry.reason}</p>}
</td>
<td className="px-5 py-3 text-right whitespace-nowrap">
<p className="text-[11px] text-muted">#{entry.seq}</p>
<p className="audit-checksum" title="Chained checksum">{entry.checksum}</p>
</td>
</tr>;
}

export default function AuditLogPage() {
 const user = useCurrentUser();
 const entries = useAuditLog();
 const [search, setSearch] = useState('');
 const [filter, setFilter] = useState('all');
 const [page, setPage] = useState(0);
 const [pageSize, setPageSize] = useState(10);

 const allowed = canViewAuditLog(user);
 const integrity = verifyAuditLog(entries);
 const query = search.toLowerCase().trim();
 const newestFirst = [...entries].reverse();
 const filtered = newestFirst.filter(e => (filter === 'all' || AUDIT_ACTIONS[e.action]?.group === filter) && matches(e, query));
 const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);
 const count = group => entries.filter(e => AUDIT_ACTIONS[e.action]?.group === group).length;

 return <DashboardShell search={search} setSearch={setSearch} setPage={setPage} searchLabel="Search audit log" searchPlaceholder="Search audit log…">
<main id="main-content" className="pt-16 min-h-dvh ml-0 lg:ml-64 transition-all duration-300">
<div className="p-4 lg:p-6 space-y-5">
{user === null ? <p className="text-sm text-muted p-8 text-center">Loading…</p> : !allowed ? <AccessRestricted user={user}/> : <>

<div className="flex flex-wrap items-start justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center flex-shrink-0">
<i className="ph ph-clipboard-text text-primary text-lg"></i>
</div>
<div>
<h1 className="text-lg font-semibold text-heading leading-tight">Audit Log</h1>
<p className="text-xs text-faint mt-0.5">Every queue action, who did it and when</p>
</div>
</div>
<div className="flex flex-wrap items-center gap-2">
<span className="audit-badge audit-tone-neutral" title="Entries can't be edited or deleted"><i className="ph ph-lock-simple"></i>Read-only</span>
{integrity.ok
 ? <span className="audit-badge audit-tone-success" title="Every entry's checksum matches the chain"><i className="ph ph-shield-check"></i>Integrity verified · {entries.length} entries</span>
 : <span className="audit-badge audit-tone-danger" title="An entry was edited, removed or reordered"><i className="ph ph-shield-warning"></i>Tampering detected at entry #{integrity.seq}</span>}
</div>
</div>

<div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
<StatCard label="Total entries" value={entries.length} icon="ph-list-checks" tone="neutral"/>
<StatCard label="Ranking overrides" value={count('override')} icon="ph-hand-pointing" tone="warning"/>
<StatCard label="Call outcomes" value={count('call')} icon="ph-phone" tone="success"/>
<StatCard label="Agent re-queues" value={count('agent')} icon="ph-robot" tone="info"/>
</div>

<div className="dash-panel p-0 overflow-hidden">
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 md:p-5 border-b border-border-subtle">
<div className="flex items-center gap-1 overflow-x-auto pb-0.5 min-w-0" style={{scrollbarWidth: 'none'}}>
{FILTERS.map(([id, label]) => <button key={id} type="button" onClick={() => {setFilter(id);setPage(0);}} aria-pressed={filter === id} className={'filter-tab flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors ' + (filter === id ? 'active bg-primary text-on-primary' : 'text-muted hover:text-text hover:bg-subtle')}>{label}</button>)}
</div>
<div className="relative max-sm:w-full">
<i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none"></i>
<input type="text" placeholder="Search people, patients, reasons…" className="h-9 w-full md:w-64 pl-9 pr-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors" value={search} aria-label="Search audit log entries" onChange={e => {setSearch(e.target.value);setPage(0);}} />
</div>
</div>

<div className="overflow-x-auto">
<table className="w-full text-sm audit-table">
<thead>
<tr className="bg-subtle border-b border-border-subtle">
<th className="text-left px-5 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">When</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">Patient</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">Action</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">Who</th>
<th className="text-left px-4 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide">Details</th>
<th className="text-right px-5 py-3 text-[11px] font-semibold text-faint uppercase tracking-wide whitespace-nowrap">Entry</th>
</tr>
</thead>
<tbody>
{visible.map(entry => <AuditRow key={entry.id} entry={entry}/>)}
{!visible.length && <tr><td colSpan={6} className="p-8 text-center text-muted">No audit entries match.</td></tr>}
</tbody>
</table>
</div>

<div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-5 py-4 border-t border-border-subtle">
<p className="text-[11px] text-faint inline-flex items-center gap-1.5"><i className="ph ph-lock-simple"></i>Entries are append-only and can't be edited or deleted. Corrections are recorded as new entries.</p>
<div className="flex flex-wrap items-center gap-3">
<div className="flex items-center gap-2 text-xs text-muted">
<span>Rows per page:</span>
<select className="h-8 pl-2.5 pr-2 rounded-lg bg-subtle border border-transparent text-xs text-text focus:outline-none focus:border-primary/40 transition-colors" value={pageSize} aria-label="Rows per page" onChange={e => {setPageSize(Number(e.target.value));setPage(0);}}>
<option>10</option>
<option>25</option>
<option>50</option>
</select>
</div>
<span className="text-xs text-muted">{filtered.length ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}</span>
<button aria-label="Previous page" className="w-8 h-8 rounded-lg border border-border text-muted hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center" disabled={page === 0} onClick={() => setPage(page - 1)}><i className="ph ph-caret-left text-xs"></i></button>
<button aria-label="Next page" className="w-8 h-8 rounded-lg border border-border text-muted hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center" disabled={(page + 1) * pageSize >= filtered.length} onClick={() => setPage(page + 1)}><i className="ph ph-caret-right text-xs"></i></button>
</div>
</div>
</div>
</>}
</div>
</main>
</DashboardShell>;
}
