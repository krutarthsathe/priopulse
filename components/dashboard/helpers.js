import { DEFAULT_SETTINGS } from '../../lib/heart-failure-ranking';

export const OUTCOMES = [
  { action: 'call_called', icon: 'ph-phone-call', tone: 'success', label: 'Called', status: 'Reached', group: 'done' },
  { action: 'call_no_answer', icon: 'ph-phone-x', tone: 'warning', label: 'No answer', status: 'Call back later', group: 'callback' },
  { action: 'call_unreachable', icon: 'ph-phone-disconnect', tone: 'danger', label: 'Unreachable', status: 'Escalate or call back', group: 'callback' },
];
export const OUTCOME_BY_ACTION = Object.fromEntries(OUTCOMES.map(outcome => [outcome.action, outcome]));

export const isImported = patient => patient.imported === true;

/** Plain name for a scoring version: v1 is the standard scoring, later versions are the agent's updates. */
export const versionName = version => version === 'v1' ? 'Standard scoring' : `Updated scoring ${version}`;

/** Profile link carrying the active rule, so the profile ranks the patient the same way. */
export function profileLink(patient, rule) {
  const settings = { ...DEFAULT_SETTINGS, ...rule };
  return `/patient-details?id=${patient.id}&${new URLSearchParams(Object.entries(settings).map(([key, value]) => [key, String(value)])).toString()}`;
}

/** Short chip for each scoring reason, using the patient's own measurement. */
export function reasonChips(patient) {
  return patient.reasons.filter(reason => reason.points > 0).map(reason => {
    const label = reason.label;
    if (label.startsWith('Heart')) return { key: label, tone: 'heart', text: `Pump ${patient.ejection_fraction}%`, points: reason.points };
    if (label.startsWith('Kidney')) return { key: label, tone: 'kidney', text: `Kidney ${patient.serum_creatinine}`, points: reason.points };
    if (label.startsWith('Age 80')) return { key: label, tone: 'agent', text: 'Age 80+', points: reason.points };
    if (label.startsWith('Blood sodium')) return { key: label, tone: 'agent', text: `Sodium ${patient.serum_sodium}`, points: reason.points };
    if (label.startsWith('Age 70')) return { key: label, tone: '', text: `Age ${patient.age}`, points: reason.points };
    if (label === 'High blood pressure') return { key: label, tone: '', text: 'High BP', points: reason.points };
    return { key: label, tone: '', text: label, points: reason.points };
  });
}

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Today's call outcome per patient, read back from the audit log so it survives reloads.
 * The log is append-only, so an undo is its own entry: it cancels the most recent outcome still standing,
 * and the patient returns to the outcome before it (or to "not called").
 */
export function todaysCallStatus(entries, now = new Date()) {
  const stacks = new Map();
  for (const entry of entries) {
    if (!entry.patient || !sameDay(new Date(entry.at), now)) continue;
    if (entry.action === 'call_undo') { stacks.get(entry.patient)?.pop(); continue; }
    if (!OUTCOME_BY_ACTION[entry.action]) continue;
    if (!stacks.has(entry.patient)) stacks.set(entry.patient, []);
    stacks.get(entry.patient).push({ ...OUTCOME_BY_ACTION[entry.action], at: entry.at, by: entry.actor.name });
  }
  const status = new Map();
  stacks.forEach((stack, patient) => { if (stack.length) status.set(patient, { ...stack.at(-1), previous: stack.at(-2) ?? null }); });
  return status;
}

export const formatTime = iso => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
