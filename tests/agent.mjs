import fs from 'node:fs';
import assert from 'node:assert/strict';
import { rankPatients, scorePatient, evaluateList, DEFAULT_SETTINGS } from '../lib/heart-failure-ranking.js';
import { runAgentToEnd, rules } from '../lib/agent/runAgent.js';
import { seededSplit } from '../lib/agent/evaluate.js';
const { patients } = JSON.parse(fs.readFileSync(new URL('../data/heart-failure-patients.json', import.meta.url)));

// Optional factors are off by default and change nothing.
for (const patient of patients) assert.deepEqual(scorePatient(patient), scorePatient(patient, DEFAULT_SETTINGS));
const senior = { ...DEFAULT_SETTINGS, seniorPoints: 1 };
assert.equal(scorePatient({ id: 'T', age: 80, ejection_fraction: 60, serum_creatinine: 1, serum_sodium: 140, anaemia: 0, diabetes: 0, high_blood_pressure: 0 }, senior).score, 2);
assert.equal(scorePatient({ id: 'T', age: 79, ejection_fraction: 60, serum_creatinine: 1, serum_sodium: 130, anaemia: 0, diabetes: 0, high_blood_pressure: 0 }, { ...DEFAULT_SETTINGS, sodiumPoints: 1 }).score, 2);

// Condition and age points are configurable; 0 removes their points.
const plain = { id: 'T', age: 72, ejection_fraction: 60, serum_creatinine: 1, serum_sodium: 140, anaemia: 1, diabetes: 1, high_blood_pressure: 1 };
assert.equal(scorePatient(plain).score, 4);
assert.equal(scorePatient(plain, { ...DEFAULT_SETTINGS, anaemiaPoints: 3, diabetesPoints: 0, bloodPressurePoints: 2, agePoints: 0 }).score, 5);

// Headline numbers with fixed tie-breaking.
const hits = (settings, k, oldest = false) => evaluateList(rankPatients(patients, settings, oldest).slice(0, k)).deaths;
assert.equal(hits(DEFAULT_SETTINGS, 25, true), 18);
assert.equal(hits(DEFAULT_SETTINGS, 25), 20);
assert.equal(hits({ ...DEFAULT_SETTINGS, heartWeight: 3 }, 25), 18);
assert.equal(hits(DEFAULT_SETTINGS, 100, true), 48);
assert.equal(hits(DEFAULT_SETTINGS, 100), 58);

// The agent's run: deterministic, rejects the clinic suggestion, promotes age 80+.
const run = runAgentToEnd(patients);
assert.deepEqual(JSON.parse(JSON.stringify(runAgentToEnd(patients))), JSON.parse(JSON.stringify(run)));
const decisions = run.events.filter(e => e.type === 'promoted' || e.type === 'rejected');
assert.equal(decisions[0].idea.id, 'heart-weight-3');
assert.equal(decisions[0].type, 'rejected');
assert.equal(decisions.find(e => e.type === 'promoted').idea.id, 'senior-80');
assert.equal(run.final.version, 'v1.1');
assert.equal(run.final.rule.seniorPoints, 1);
assert.equal(hits(run.final.rule, 25), 20);
assert.equal(hits(run.final.rule, 100), 60);
for (const seed of rules.split.checkSeeds) assert.equal(runAgentToEnd(patients, { seed }).final.version, 'v1.1', `seed ${seed}`);

// Trap checks: shuffled input and flipped outcomes / follow-up time give the same ranking.
const ids = list => list.map(patient => patient.id);
const shuffled = [...patients].sort((a, b) => b.id.localeCompare(a.id));
assert.deepEqual(ids(rankPatients(shuffled, run.final.rule)), ids(rankPatients(patients, run.final.rule)));
const flipped = patients.map(patient => ({ ...patient, DEATH_EVENT: 1 - patient.DEATH_EVENT, time: 9999 }));
assert.deepEqual(ids(rankPatients(flipped, run.final.rule)), ids(rankPatients(patients, run.final.rule)));

// Split: 199 learn / 100 held back, no overlap; imported (ungraded) patients are never graded.
const split = seededSplit(patients, 42);
assert.equal(split.learn.length, 199);
assert.equal(split.heldOut.length, 100);
assert.equal(new Set([...ids(split.learn), ...ids(split.heldOut)]).size, 299);
const imported = { id: 'NEW-001', age: 85, ejection_fraction: 20, serum_creatinine: 2.5, serum_sodium: 130, anaemia: 1, diabetes: 1, high_blood_pressure: 1, sex: 1 };
assert.equal(seededSplit([...patients, imported], 42).all.length, 299);
assert.equal(runAgentToEnd([...patients, imported]).events[0].ungraded, 1);

// Leakage scan: outcomes only in evaluate.js; follow-up time nowhere in the agent.
for (const file of fs.readdirSync(new URL('../lib/agent/', import.meta.url))) {
  const source = fs.readFileSync(new URL(`../lib/agent/${file}`, import.meta.url), 'utf8');
  if (file !== 'evaluate.js') assert.ok(!source.includes('DEATH_EVENT'), `${file} reads outcomes`);
  assert.ok(!/\btime\b\s*[:\]]|\.time\b|'time'|"time"/.test(source), `${file} reads follow-up time`);
}
console.log('Agent checks passed: deterministic run, clinic suggestion rejected, age 80+ promoted on every split, trap checks, leakage scan.');
