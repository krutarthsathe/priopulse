import rules from './rules.json' with { type: 'json' };
import { DEFAULT_SETTINGS } from '../heart-failure-ranking.js';
import { seededSplit, gradeRule, gradeOldestFirst, decide, learningMistakes, pushedOutAtRisk, diffLists, checkAcrossSplits, isGraded, totalDeaths } from './evaluate.js';
import { proposeNext, describeRule, describeGroup } from './propose.js';

export { rules };

const nextVersion = (version, promotions) => `${rules.startVersion}.${promotions}`;

/**
 * The agent loop as a generator of feed events. Every decision is computed here; the UI only
 * paces how fast events appear. Same patients and seed always give the same events.
 */
export function* runAgent(patients, { seed = rules.split.primarySeed } = {}) {
  const listSize = rules.listSize;
  const graded = patients.filter(isGraded);
  const split = seededSplit(patients, seed, rules.split.heldOutShare);
  yield { type: 'loaded', count: patients.length, graded: graded.length, ungraded: patients.length - graded.length, deaths: totalDeaths(graded), learn: split.learn.length, heldOut: split.heldOut.length };

  let rule = { ...DEFAULT_SETTINGS, ...rules.startRule };
  let score = gradeRule(rule, split, listSize);

  // The simple approach to beat: how often standard scoring out-performs oldest-first across the reshuffled groups.
  const standardWins = rules.split.checkSeeds.filter(checkSeed => {
    const other = seededSplit(patients, checkSeed, rules.split.heldOutShare);
    return gradeRule(rule, other, listSize).heldOut > gradeOldestFirst(other, listSize).heldOut;
  }).length;
  yield { type: 'baseline', label: 'Oldest first', score: gradeOldestFirst(split, listSize), standard: score, check: { wins: standardWins, total: rules.split.checkSeeds.length } };
  let version = rules.startVersion;
  const history = [{ version, rule, change: 'Standard scoring (starting point)', round: 0, score }];
  yield { type: 'champion', version, rule, text: describeRule(rule), score };

  const tried = new Set();
  let failuresInRow = 0, promotions = 0, round = 0, pushedOut = [], lastRejected = null;
  const first = rules.ideas.find(idea => idea.first);

  while (round < rules.limits.maxRounds && failuresInRow < rules.limits.maxFailuresInRow) {
    round += 1;
    let proposal;
    if (round === 1 && first) proposal = { idea: first, reason: 'A commonly suggested change. Test it before using it.' };
    else proposal = proposeNext({ ideas: rules.ideas, tried, rule, mistakes: learningMistakes(rule, split), pushedOut, lastRound: lastRejected });
    if (!proposal) { yield { type: 'exhausted', round }; break; }
    const { idea, reason } = proposal;
    tried.add(idea.id);
    const challengerRule = { ...rule, ...idea.change };
    yield { type: 'round_start', round, idea, reason, source: idea.source ?? `Suggested by round ${round - 1} results` };

    const challengerScore = gradeRule(challengerRule, split, listSize);
    const moved = diffLists(patients, rule, challengerRule, listSize);
    // Overfitting guard: a change must win on every seeded split, not just the one shown.
    const primary = decide(score, challengerScore);
    const check = checkAcrossSplits(patients, rule, challengerRule, rules.split.checkSeeds, listSize);
    const wins = check.verdicts.filter(v => v === 'promoted').length, total = check.seeds.length;
    const verdict = wins === total ? 'promoted' : 'rejected';
    const why = verdict === 'promoted' ? `${primary.why} Confirmed in all ${total} random test groups.`
      : primary.verdict === 'promoted' ? `It did better in only ${wins} of ${total} random test groups, which is not reliable enough.` : primary.why;
    const event = { round, idea, champion: score, challenger: challengerScore, moved, movedSummary: { entered: describeGroup(moved.entered), left: describeGroup(moved.left) }, why, check: { wins, total } };
    yield { type: 'tested', ...event };

    if (verdict === 'promoted') {
      promotions += 1; failuresInRow = 0; pushedOut = []; lastRejected = null;
      rule = challengerRule; score = challengerScore; version = nextVersion(version, promotions);
      history.push({ version, rule, change: idea.label, round, score });
      yield { type: 'promoted', ...event, version, rule, text: describeRule(rule) };
    } else {
      failuresInRow += 1; lastRejected = round;
      pushedOut = pushedOutAtRisk(rule, challengerRule, split);
      yield { type: 'rejected', ...event, version };
    }
  }

  yield { type: 'done', version, rule, text: describeRule(rule), score, history, rounds: round, promotions };
}

/** Runs the whole loop at once and returns all events plus the final state. */
export function runAgentToEnd(patients, options) {
  const events = [...runAgent(patients, options)];
  return { events, final: events.at(-1) };
}
