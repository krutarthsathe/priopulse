'use client';
import {useSyncExternalStore} from 'react';

/*
 * Append-only audit trail. The module deliberately exposes no update or delete API:
 * entries are frozen, and each one carries a checksum chained to the previous entry,
 * so any edit or removal in storage is detected by verifyAuditLog().
 * This is a client-side demo; production needs server-side, write-once storage.
 */

export const AUDIT_GROUPS = {
 override: 'Ranking override',
 note: 'Note',
 call: 'Call outcome',
 agent: 'Agent',
};

export const AUDIT_ACTIONS = {
 pin: {label: 'Pinned', icon: 'ph-push-pin', tone: 'primary', group: 'override'},
 remove: {label: 'Removed', icon: 'ph-minus-circle', tone: 'danger', group: 'override'},
 weight_change: {label: 'Weight changed', icon: 'ph-sliders-horizontal', tone: 'info', group: 'override'},
 note: {label: 'Note added', icon: 'ph-note-pencil', tone: 'neutral', group: 'note'},
 call_called: {label: 'Called', icon: 'ph-phone-call', tone: 'success', group: 'call'},
 call_no_answer: {label: 'No answer', icon: 'ph-phone-x', tone: 'warning', group: 'call'},
 call_unreachable: {label: 'Unreachable', icon: 'ph-phone-disconnect', tone: 'danger', group: 'call'},
 agent_requeue: {label: 'Agent re-queued', icon: 'ph-robot', tone: 'info', group: 'agent'},
};

const KEY = 'priopulse-audit-log-v2';
const EVENT = 'priopulse-audit-log-change';
const GENESIS = '00000000';
const EMPTY = Object.freeze([]);
let cache = null;

function fnv1a(text) {
 let hash = 0x811c9dc5;
 for (let i = 0; i < text.length; i++) {hash ^= text.charCodeAt(i);hash = Math.imul(hash, 0x01000193) >>> 0;}
 return hash.toString(16).padStart(8, '0');
}

function checksumOf(entry) {
 const {seq, at, actor, action, patient, detail, from, to, reason, prevChecksum} = entry;
 return fnv1a(JSON.stringify([seq, at, actor.id, actor.name, actor.role, action, patient, detail, from, to, reason, prevChecksum]));
}

function freezeEntry(entry) {
 return Object.freeze({...entry, actor: Object.freeze({...entry.actor})});
}

function chain(entries, draft) {
 const prev = entries.at(-1);
 const entry = {
  seq: (prev?.seq ?? 0) + 1,
  id: draft.id ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
  at: draft.at ?? new Date().toISOString(),
  actor: {id: draft.actor.id, name: draft.actor.name, role: draft.actor.role},
  action: draft.action,
  patient: draft.patient ?? null,
  detail: draft.detail ?? '',
  from: draft.from ?? null,
  to: draft.to ?? null,
  reason: draft.reason ?? null,
  prevChecksum: prev?.checksum ?? GENESIS,
 };
 entry.checksum = checksumOf(entry);
 return freezeEntry(entry);
}

const NURSE_ANA = {id: 'nurse-ana', name: 'Jenus Ana', role: 'nurse'};
const NURSE_COOPER = {id: 'nurse-cooper', name: 'Jane Cooper', role: 'nurse'};
const DR_FOX = {id: 'dr-fox', name: 'Dr Robert Fox', role: 'doctor'};
const AGENT = {id: 'call-agent', name: 'PrioPulse Call Agent', role: 'agent'};

const SEED = [
 [410, AGENT, 'agent_requeue', 'Arlene McCoy', 'Moved up after missed callback window', '#7', '#3', 'SpO₂ trend worsening in remote readings'],
 [395, NURSE_ANA, 'call_no_answer', 'Arlene McCoy', 'Voicemail left, callback requested'],
 [380, NURSE_ANA, 'pin', 'Arlene McCoy', 'Pinned to top of queue', '#3', '#1', 'Reported shortness of breath on voicemail'],
 [362, NURSE_ANA, 'call_called', 'Arlene McCoy', 'Spoke with patient, advised same-day clinic visit'],
 [340, DR_FOX, 'note', 'Arlene McCoy', 'Review spirometry before visit; consider steroid taper.'],
 [300, NURSE_COOPER, 'call_no_answer', 'Theresa Webb', 'No answer, voicemail left'],
 [270, DR_FOX, 'weight_change', null, 'Ranking weight: symptom severity', '0.30', '0.45', 'Respiratory season protocol'],
 [240, AGENT, 'call_unreachable', 'Cody Fisher', 'Number out of service after 3 attempts'],
 [225, AGENT, 'agent_requeue', 'Cody Fisher', 'Routed to manual follow-up', '#9', '#5', 'Unreachable after 3 automated attempts'],
 [190, NURSE_COOPER, 'call_called', 'Cody Fisher', 'Reached via emergency contact'],
 [160, NURSE_ANA, 'remove', 'Guy Hawkins', 'Removed from queue', '#2', '—', 'Admitted to inpatient ward'],
 [120, NURSE_COOPER, 'note', 'Kristin Watson', 'Prefers morning calls; hard of hearing, speak slowly.'],
 [95, DR_FOX, 'weight_change', 'Ronald Richards', 'Patient weight: medication adherence', '1.0×', '1.5×', 'Missed 3 doses this week'],
 [60, NURSE_ANA, 'call_no_answer', 'Ronald Richards', 'No answer, no voicemail'],
 [40, AGENT, 'agent_requeue', 'Ronald Richards', 'Moved up after unanswered call', '#6', '#2', 'No answer combined with raised adherence weight'],
 [15, NURSE_ANA, 'call_no_answer', 'Kristin Watson', 'No answer, will retry after morning round'],
];

function buildSeed(now) {
 return SEED.reduce((entries, [minutesAgo, actor, action, patient, detail, from, to, reason]) =>
  [...entries, chain(entries, {id: `seed-${entries.length + 1}`, at: new Date(now - minutesAgo * 60000).toISOString(), actor, action, patient, detail, from, to, reason})], []);
}

function persist(entries) {
 try {localStorage.setItem(KEY, JSON.stringify(entries));} catch {}
}

function load() {
 if (cache) return cache;
 let stored = null;
 try {stored = JSON.parse(localStorage.getItem(KEY) || 'null');} catch {}
 if (Array.isArray(stored) && stored.length) {
  cache = Object.freeze(stored.map(freezeEntry));
 } else {
  cache = Object.freeze(buildSeed(Date.now()));
  persist(cache);
 }
 return cache;
}

function subscribe(callback) {
 const onStorage = e => {if (e.key === KEY) {cache = null;callback();}};
 window.addEventListener(EVENT, callback);
 window.addEventListener('storage', onStorage);
 return () => {window.removeEventListener(EVENT, callback);window.removeEventListener('storage', onStorage);};
}

export function readAuditLog() {
 return typeof window === 'undefined' ? EMPTY : load();
}

/** Live, read-only view of the log (oldest first). Empty during server render. */
export function useAuditLog() {
 return useSyncExternalStore(subscribe, readAuditLog, () => EMPTY);
}

/**
 * Append one entry. `actor` must be the signed-in user (or an automated agent);
 * the timestamp is always assigned here, never by the caller.
 */
export function recordAuditEvent({actor, action, patient, detail, from, to, reason}) {
 if (!AUDIT_ACTIONS[action]) throw new Error(`Unknown audit action: ${action}`);
 if (!actor?.id || !actor?.name || !actor?.role) throw new Error('Audit events require an actor with id, name and role');
 const entries = load();
 const entry = chain(entries, {actor, action, patient, detail, from, to, reason});
 cache = Object.freeze([...entries, entry]);
 persist(cache);
 window.dispatchEvent(new Event(EVENT));
 return entry;
}

/** Walks the checksum chain; returns the first entry that was edited, removed or reordered. */
export function verifyAuditLog(entries) {
 let prevChecksum = GENESIS, prevSeq = 0;
 for (const entry of entries) {
  if (entry.seq !== prevSeq + 1 || entry.prevChecksum !== prevChecksum || entry.checksum !== checksumOf(entry)) return {ok: false, seq: entry.seq ?? prevSeq + 1};
  prevChecksum = entry.checksum;prevSeq = entry.seq;
 }
 return {ok: true};
}
