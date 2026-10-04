import { rankPatients, compareLists, DEFAULT_SETTINGS } from '../heart-failure-ranking.js';

/*
 * The only agent module that reads outcomes (DEATH_EVENT). Outcomes grade a rule after the fact;
 * they never score or rank a patient. Follow-up time is not read anywhere in the agent.
 */

const died = patient => patient.DEATH_EVENT === 1;
export const isGraded = patient => patient.DEATH_EVENT === 0 || patient.DEATH_EVENT === 1;
export const quarter = list => Math.max(1, Math.round(list.length / 4));

export function hitsAtK(rankedList, k) {
  return rankedList.slice(0, k).filter(died).length;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32;
}

/** Graded patients in a fixed, seeded random order (independent of file order, which follows follow-up length). */
export function seededOrder(patients, seed) {
  const graded = patients.filter(isGraded).sort((a, b) => a.id.localeCompare(b.id));
  const random = seededRandom(seed);
  return graded.map(patient => [random(), patient]).sort((a, b) => a[0] - b[0]).map(([, patient]) => patient);
}

/** Fixed, seeded learn / held-back split of the graded patients. Same seed always gives the same split. */
export function seededSplit(patients, seed, heldOutShare = 1 / 3) {
  const graded = patients.filter(isGraded).sort((a, b) => a.id.localeCompare(b.id));
  const shuffled = seededOrder(graded, seed);
  const heldOutCount = Math.round(graded.length * heldOutShare);
  return { seed, all: graded, heldOut: shuffled.slice(0, heldOutCount), learn: shuffled.slice(heldOutCount) };
}

/** At-risk patients reached: top `listSize` of all graded patients, and the top quarter of each split group. */
export function gradeRule(settings, split, listSize, oldestFirst = false) {
  const reached = (patients, k) => hitsAtK(rankPatients(patients, settings, oldestFirst), k);
  return {
    full: reached(split.all, listSize),
    learn: reached(split.learn, quarter(split.learn)),
    heldOut: reached(split.heldOut, quarter(split.heldOut)),
  };
}

export const gradeOldestFirst = (split, listSize) => gradeRule(DEFAULT_SETTINGS, split, listSize, true);

/** Pre-set decision rule. */
export function decide(champion, challenger) {
  if (challenger.heldOut > champion.heldOut && challenger.learn >= champion.learn) return { verdict: 'promoted', why: 'It found more at-risk patients in the test group, and no fewer in the learning group.' };
  if (challenger.heldOut < champion.heldOut) return { verdict: 'rejected', why: 'It found fewer at-risk patients in the test group.' };
  if (challenger.heldOut > champion.heldOut) return { verdict: 'rejected', why: 'It did better in the test group but worse in the learning group, so the result is not reliable.' };
  return { verdict: 'rejected', why: 'It made no difference in the test group, so the simpler current scoring stays.' };
}

/** Learning-set mistakes of a rule: at-risk patients just below the cut-off, and survivors on the list. */
export function learningMistakes(settings, split) {
  const ranked = rankPatients(split.learn, settings);
  const k = quarter(split.learn);
  return { missed: ranked.slice(k, k * 2).filter(died), falseAlarms: ranked.slice(0, k).filter(patient => !died(patient)) };
}

/** Learning-set at-risk patients that a challenger pushed out of the champion's list. */
export function pushedOutAtRisk(championSettings, challengerSettings, split) {
  const k = quarter(split.learn);
  const { left } = compareLists(rankPatients(split.learn, championSettings).slice(0, k), rankPatients(split.learn, challengerSettings).slice(0, k));
  return left.filter(died);
}

/** Who enters and leaves the real call list (all patients, outcome-free). */
export function diffLists(patients, championSettings, challengerSettings, listSize) {
  const before = rankPatients(patients, championSettings);
  const after = rankPatients(patients, challengerSettings);
  const beforeRank = new Map(before.map(patient => [patient.id, patient.rank]));
  const afterRank = new Map(after.map(patient => [patient.id, patient.rank]));
  const { overlap, entered, left } = compareLists(before.slice(0, listSize), after.slice(0, listSize));
  const withRanks = patient => ({ ...patient, from: beforeRank.get(patient.id), to: afterRank.get(patient.id) });
  return { overlap, entered: entered.map(withRanks), left: left.map(withRanks) };
}

/** Repeats a decision on other seeded splits to show it is not luck of one split. */
export function checkAcrossSplits(patients, championSettings, challengerSettings, seeds, listSize) {
  const verdicts = seeds.map(seed => {
    const split = seededSplit(patients, seed);
    return decide(gradeRule(championSettings, split, listSize), gradeRule(challengerSettings, split, listSize)).verdict;
  });
  return { verdicts, seeds };
}

export const totalDeaths = patients => patients.filter(died).length;
