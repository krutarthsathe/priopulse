export const ACTIVE_CALL_STATUSES = ['initiating', 'uncertain', 'submitted', 'in_progress', 'processing'];
export const CALL_STATUS_LABELS = {
  initiating: 'Preparing call', uncertain: 'Status uncertain', submitted: 'Call requested',
  in_progress: 'Conversation in progress', processing: 'Preparing transcript', completed: 'Completed',
  failed: 'Failed', no_answer: 'No answer', busy: 'Busy',
};
export const isReviewableCall = call => ['completed', 'failed'].includes(call.status) && call.transcript?.length > 0;

export function normalizeTranscript(transcript) {
  if (!Array.isArray(transcript)) return [];
  return transcript.filter(turn => ['agent', 'user'].includes(turn?.role) && typeof turn.message === 'string' && turn.message.trim())
    .slice(0, 1000).map(turn => ({ speaker: turn.role === 'agent' ? 'Agent' : 'Participant', text: turn.message.trim().slice(0, 20000) }));
}

export function callNoteDraft(call) {
  return `Patient: ${call.patient_id}\nFictional phone follow-up; transcript-based note, not a clinical assessment.\nConversation: ${call.conversation_id || 'Unavailable'}\n\n${(call.transcript || []).map(turn => `${turn.speaker}: ${turn.text}`).join('\n\n')}`;
}
