'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { runAgentToEnd } from '../../lib/agent/runAgent';
import { recordAuditEvent } from '../../lib/audit-log';

export const SPEEDS = { slow: 1700, normal: 950, fast: 380 };
const AGENT_ACTOR = { id: 'call-agent', name: 'PrioPulse Call Agent', role: 'agent' };

/** Latest rule the feed has reached so far (the champion at that point in the run). */
function ruleAt(events) {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.type === 'promoted' || event.type === 'done') return { rule: event.rule, version: event.version };
    if (event.type === 'champion') return { rule: event.rule, version: event.version };
  }
  return null;
}

function logDecision(event) {
  try {
    recordAuditEvent({
      actor: AGENT_ACTOR, action: 'agent_rule_review',
      detail: `Round ${event.round} · ${event.idea.label} (${event.idea.detail}): ${event.type === 'promoted' ? 'adopted' : 'rejected'}. ${event.why}`,
      from: `${event.champion.heldOut} of 25 in test group`, to: `${event.challenger.heldOut} of 25 in test group`,
      reason: event.idea.source ?? 'Suggested by the patients the scoring was missing',
    });
  } catch {}
}

/**
 * The agent's full run is computed at once ("morning review"). Replay reveals the same events one at a
 * time for presenting; decisions are identical, only the pace changes. Replays write to the audit log.
 */
export function useAgentRun(patients) {
  const run = useMemo(() => runAgentToEnd(patients), [patients]);
  const [shown, setShown] = useState(run.events.length);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState('normal');
  const [reviewedAt, setReviewedAt] = useState(null);
  const logging = useRef(false);
  const replayNextRun = useRef(false);
  const replaying = shown < run.events.length;

  // New patients produce a new run; replay it when the change asked for that (e.g. after an import).
  useEffect(() => {
    const replayIt = replayNextRun.current;
    replayNextRun.current = false;
    logging.current = replayIt;
    setReviewedAt(new Date());
    setShown(replayIt ? 0 : run.events.length);
    setPlaying(replayIt);
  }, [run]);

  useEffect(() => {
    if (!playing) return;
    if (shown >= run.events.length) { setPlaying(false); logging.current = false; return; }
    const timer = setTimeout(() => setShown(count => count + 1), SPEEDS[speed]);
    return () => clearTimeout(timer);
  }, [playing, shown, speed, run]);

  useEffect(() => {
    const event = run.events[shown - 1];
    if (logging.current && event && (event.type === 'promoted' || event.type === 'rejected')) logDecision(event);
  }, [shown, run]);

  const events = run.events.slice(0, shown);
  return {
    events, final: run.final, allEvents: run.events, reviewedAt, playing, replaying, speed, setSpeed,
    current: ruleAt(events) ?? { rule: run.final.rule, version: run.final.version },
    replay() { logging.current = true; setShown(0); setPlaying(true); },
    pause() { setPlaying(false); },
    resume() { if (replaying) setPlaying(true); },
    step() { setPlaying(false); setShown(count => Math.min(run.events.length, count + 1)); },
    skip() {
      if (logging.current) run.events.slice(shown).filter(e => e.type === 'promoted' || e.type === 'rejected').forEach(logDecision);
      logging.current = false; setPlaying(false); setShown(run.events.length);
    },
    replayAfterChange() { replayNextRun.current = true; },
  };
}
