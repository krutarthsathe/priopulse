import fs from 'node:fs';
import assert from 'node:assert/strict';
import { scorePatient, rankPatients, evaluateList, compareLists } from '../lib/heart-failure-ranking.js';
const { patients } = JSON.parse(fs.readFileSync(new URL('../data/heart-failure-patients.json', import.meta.url)));
const original = rankPatients(patients, 2).slice(0, 25);
const revised = rankPatients(patients, 3).slice(0, 25);
const oldest = rankPatients(patients, 2, true).slice(0, 25);
assert.equal(patients.length, 299);
for (const patient of patients) {
  assert.equal(scorePatient(patient, 3).score - scorePatient(patient, 2).score, patient.ejection_fraction < 35 ? 1 : 0);
  assert.equal(scorePatient({ ...patient, DEATH_EVENT: 1 - patient.DEATH_EVENT, time: 9999 }).score, scorePatient(patient).score);
}
assert.deepEqual(rankPatients([...patients].reverse()), rankPatients(patients));
assert.equal(new Set(original.map(patient => patient.id)).size, 25);
assert.equal(evaluateList(oldest).deaths, 18);
assert.equal(evaluateList(original).deaths, 20);
assert.equal(evaluateList(revised).deaths, 18);
assert.equal(compareLists(original, revised).overlap, 20);
const boundary = { id: 'TEST', age: 69, ejection_fraction: 35, serum_creatinine: 1.5, anaemia: 0, diabetes: 0, high_blood_pressure: 0 };
assert.equal(scorePatient(boundary).score, 0);
assert.equal(scorePatient({ ...boundary, age: 70 }).score, 1);
console.log('Ranking checks passed: boundaries, stable ties, outcome exclusion, isolated heart weight, and historical comparisons.');
