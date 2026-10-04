/* Picks the agent's next idea from patient measurements only (no outcomes are read here). */

export const TRAITS = {
  weakHeart: { label: 'with a weak heart (pumping below 35%)', test: p => p.ejection_fraction < 35 },
  mildHeart: { label: 'with heart pumping of 30–34%', test: p => p.ejection_fraction >= 30 && p.ejection_fraction < 35 },
  borderHeart: { label: 'with heart pumping of 35–39%', test: p => p.ejection_fraction >= 35 && p.ejection_fraction < 40 },
  weakKidney: { label: 'with weak kidneys (creatinine above 1.5 mg/dL)', test: p => p.serum_creatinine > 1.5 },
  mildKidney: { label: 'with creatinine of 1.5–1.8 mg/dL', test: p => p.serum_creatinine > 1.5 && p.serum_creatinine <= 1.8 },
  borderKidney: { label: 'with creatinine of 1.3–1.5 mg/dL', test: p => p.serum_creatinine > 1.3 && p.serum_creatinine <= 1.5 },
  senior: { label: 'aged 80 or older', test: p => p.age >= 80 },
  lowSodium: { label: 'with low blood sodium (below 135)', test: p => p.serum_sodium < 135 },
};

const share = (patients, trait) => patients.length ? patients.filter(TRAITS[trait].test).length / patients.length : 0;
const percent = value => `${Math.round(value * 100)}%`;
const conditions = p => p.anaemia + p.diabetes + p.high_blood_pressure;

export const isNoOp = (idea, rule) => Object.entries(idea.change).every(([key, value]) => rule[key] === value);

/** Describes a group of patients in one phrase, e.g. "mostly 70 or older with 2+ conditions". */
export function describeGroup(patients) {
  if (!patients.length) return '';
  const older = patients.filter(p => p.age >= 70).length, multi = patients.filter(p => conditions(p) >= 2).length;
  const parts = [];
  if (older * 2 >= patients.length) parts.push('70 or older');
  if (multi * 2 >= patients.length) parts.push('with 2 or more conditions');
  return parts.length ? `mostly ${parts.join(' ')}` : 'a mix of ages and conditions';
}

// Smoothed share, so a trait seen in 0 of a small group is not treated as certain.
const smoothed = (patients, trait) => (patients.filter(TRAITS[trait].test).length + 1) / (patients.length + 2);

/**
 * Ranks untried ideas by how over-represented their trait is in the current rule's own mistakes.
 * "add" ideas give points to a trait: promising when missed at-risk patients have it more often than survivors on the list.
 * "remove" ideas take points away: promising when survivors on the list have it more often than missed patients.
 * At-risk patients pushed out by the last rejected change join the missed group.
 */
export function proposeNext({ ideas, tried, rule, mistakes, pushedOut = [], lastRound }) {
  const missedGroup = [...mistakes.missed, ...pushedOut.filter(p => !mistakes.missed.some(m => m.id === p.id))];
  const candidates = ideas.filter(idea => !tried.has(idea.id) && !isNoOp(idea, rule)).map(idea => {
    const missed = smoothed(missedGroup, idea.trait), alarms = smoothed(mistakes.falseAlarms, idea.trait);
    const gap = share(missedGroup, idea.trait) - share(mistakes.falseAlarms, idea.trait);
    return { idea, lift: idea.direction === 'add' ? missed / alarms : alarms / missed, consistent: idea.direction === 'add' ? gap > 0 : gap < 0 };
  }).filter(candidate => candidate.consistent).sort((a, b) => b.lift - a.lift || a.idea.id.localeCompare(b.idea.id));
  const best = candidates[0];
  if (!best || best.lift <= 1) return null;
  const trait = TRAITS[best.idea.trait].label;
  const missedShare = percent(share(missedGroup, best.idea.trait)), alarmShare = percent(share(mistakes.falseAlarms, best.idea.trait));
  const lead = pushedOut.length ? `The change in round ${lastRound} pushed ${pushedOut.length} at-risk patient${pushedOut.length === 1 ? '' : 's'} off the list, so they are counted as missed. ` : '';
  const reason = best.idea.direction === 'add'
    ? `${lead}Of the at-risk patients who just missed the call list, ${missedShare} are ${trait.replace(/^with /, 'people with ')}, compared with ${alarmShare} of the survivors on the list.`
    : `${lead}Of the survivors on the call list, ${alarmShare} are ${trait.replace(/^with /, 'people with ')}, compared with ${missedShare} of the at-risk patients who just missed it, so those points may be going to the wrong people.`;
  return { idea: best.idea, reason, lift: best.lift };
}

/** Each piece of patient data the scoring uses, when it counts, and the points it adds. */
export function scoringRows(rule) {
  const rows = [
    { key: 'heart', data: 'Heart pumping (ejection fraction)', when: `below ${rule.heartThreshold}%`, points: rule.heartWeight },
    { key: 'kidney', data: 'Kidney function (serum creatinine)', when: `above ${rule.kidneyThreshold} mg/dL`, points: rule.kidneyWeight },
    { key: 'anaemia', data: 'Anaemia', when: 'recorded', points: rule.anaemiaPoints },
    { key: 'diabetes', data: 'Diabetes', when: 'recorded', points: rule.diabetesPoints },
    { key: 'bp', data: 'High blood pressure', when: 'recorded', points: rule.bloodPressurePoints },
    { key: 'age70', data: 'Age', when: '70 or older', points: rule.agePoints },
  ];
  if (rule.seniorPoints > 0) rows.push({ key: 'age80', data: 'Age', when: '80 or older (extra)', points: rule.seniorPoints });
  if (rule.sodiumPoints > 0) rows.push({ key: 'sodium', data: 'Blood sodium', when: `below ${rule.sodiumThreshold} mEq/L`, points: rule.sodiumPoints });
  return rows;
}

/** One-line version of a rule, built from the same rows. */
export function describeRule(rule) {
  return scoringRows(rule).map(row => `${row.data} ${row.when}: ${row.points} ${row.points === 1 ? 'point' : 'points'}`).join(' · ');
}
