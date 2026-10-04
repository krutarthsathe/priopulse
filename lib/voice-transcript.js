export function transcriptMessage(event) {
  if (!event || !['user', 'ai'].includes(event.source) || typeof event.message !== 'string' || !event.message.trim() || event.type === 'tentative') return null;
  return { speaker: event.source === 'user' ? 'Participant' : 'Agent', text: event.message.trim() };
}
export function transcriptDraft(patientId, sessionId, messages) {
  return `Patient: ${patientId}\nFictional browser follow-up demo; transcript-based note, not a clinical assessment.\nSession: ${sessionId || 'Unavailable'}\n\n${messages.map(message => `${message.speaker}: ${message.text}`).join('\n\n')}`;
}
