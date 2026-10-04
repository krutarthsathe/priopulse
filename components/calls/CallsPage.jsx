'use client';
import { useState } from 'react';
import DashboardShell from '../DashboardShell';
import { useCalls } from './CallProvider';
import { CallAccess, CallAlerts, CallRecord, CallSetupHelp } from './CallWorkspace';
import { ACTIVE_CALL_STATUSES, isReviewableCall } from '../../lib/call-transcript';
import '../heart-failure.css';
import './calls.css';

export default function CallsPage() {
  const { calls, unlocked, refresh, loading } = useCalls();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const needsReview = call => isReviewableCall(call) && !call.reviewed_at;
  const failed = call => ['failed', 'no_answer', 'busy'].includes(call.status);
  const groups = { all: () => true, active: call => ACTIVE_CALL_STATUSES.includes(call.status), review: needsReview, completed: call => call.status === 'completed', failed };
  const visible = calls.filter(call => groups[filter](call) && `${call.patient_id} ${call.destination_label} ${call.status}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <DashboardShell search={search} setSearch={setSearch} setPage={() => {}} searchLabel="Search calls" searchPlaceholder="Search patient or demo destination…"><main id="main-content" className="pt-16 pb-6 min-h-dvh ml-0 lg:ml-64"><div className="hf-dashboard"><div className="hf-heading"><div><span className="hf-eyebrow">PrioPulse · Follow-up operations</span><h1>Calls & nurse review</h1><p>One nurse-confirmed demo call at a time. Shared history continues beyond the browser session.</p></div><a className="hf-action" href="/patients">Choose a patient from the ranked queue <i className="ph ph-arrow-right" /></a></div><section className="hf-card"><CallAccess /><CallAlerts /><CallSetupHelp /></section>{unlocked && <><div className="hf-metrics call-metrics"><section className="hf-card"><span>Call attempts</span><strong>{calls.length}</strong><p>Most recent 100 attempts</p></section><section className="hf-card"><span>Awaiting nurse review</span><strong>{calls.filter(needsReview).length}</strong><p>Finished conversations with transcripts</p></section><section className="hf-card"><span>Reviewed notes</span><strong>{calls.filter(call => call.reviewed_at).length}</strong><p>Explicitly saved by a demo nurse</p></section></div><section className="hf-card"><div className="hf-section-heading"><h2>Shared call history</h2><button className="hf-action" onClick={refresh} disabled={loading}>Refresh status</button></div><div className="call-filters" aria-label="Filter call history">{[['all', 'All attempts'], ['active', 'Active'], ['review', 'Awaiting review'], ['completed', 'Completed'], ['failed', 'Failed / unanswered']].map(([key, label]) => <button className="hf-action" aria-pressed={filter === key} key={key} onClick={() => setFilter(key)}>{label}</button>)}</div><div className="call-history">{visible.length ? visible.map(call => <CallRecord key={call.id} call={call} />) : <div className="call-empty"><i className="ph ph-phone-call" /><h3>{calls.length ? 'No matching calls' : 'Ready for your first follow-up'}</h3><p>Choose a patient from the ranked queue and confirm a receiving demo number. Calls are never started automatically.</p><a href="/patients">Open call queue</a></div>}</div></section></>}<p className="hf-caption">Demo phone numbers belong to participating testers, not anonymous dataset patients. A completed call does not establish a clinical outcome. Rankings remain unchanged.</p></div></main></DashboardShell>;
}
