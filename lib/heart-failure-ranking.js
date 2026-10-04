export function scorePatient(patient, heartWeight = 2) {
  const reasons = [];
  const add = (condition, label, points) => { if (condition) reasons.push({ label, points }); };
  add(patient.ejection_fraction < 35, 'Heart pumping percentage below 35%', heartWeight);
  add(patient.serum_creatinine > 1.5, 'Kidney measurement above 1.5 mg/dL', 2);
  add(patient.anaemia === 1, 'Anaemia', 1);
  add(patient.diabetes === 1, 'Diabetes', 1);
  add(patient.high_blood_pressure === 1, 'High blood pressure', 1);
  add(patient.age >= 70, 'Age 70 or older', 1);
  return { ...patient, score: reasons.reduce((sum, reason) => sum + reason.points, 0), reasons };
}

export function rankPatients(patients, heartWeight = 2, oldestFirst = false) {
  return patients.map(patient => scorePatient(patient, heartWeight)).sort((a, b) =>
    (oldestFirst ? b.age - a.age : b.score - a.score || b.age - a.age) || a.id.localeCompare(b.id)
  ).map((patient, index) => ({ ...patient, rank: index + 1 }));
}

export function evaluateList(list) {
  return { deaths: list.reduce((sum, patient) => sum + patient.DEATH_EVENT, 0), count: list.length };
}

export function compareLists(original, revised) {
  const originalIds = new Set(original.map(patient => patient.id));
  const revisedIds = new Set(revised.map(patient => patient.id));
  return {
    overlap: original.filter(patient => revisedIds.has(patient.id)).length,
    entered: revised.filter(patient => !originalIds.has(patient.id)),
    left: original.filter(patient => !revisedIds.has(patient.id)),
  };
}
