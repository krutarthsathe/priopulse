// Condition and age points default to 1. seniorPoints and sodiumPoints are optional agent factors; at 0 they add no reason and no points.
export const DEFAULT_SETTINGS = { heartWeight: 2, kidneyWeight: 2, heartThreshold: 35, kidneyThreshold: 1.5, anaemiaPoints: 1, diabetesPoints: 1, bloodPressurePoints: 1, agePoints: 1, seniorPoints: 0, sodiumPoints: 0, sodiumThreshold: 135 };
export function rankingSettings(value = 2) { return { ...DEFAULT_SETTINGS, ...(typeof value === 'number' ? { heartWeight: value } : value) }; }

export function scorePatient(patient, heartWeight = 2) {
  const settings = rankingSettings(heartWeight);
  const reasons = [];
  const add = (condition, label, points) => { if (condition) reasons.push({ label, points }); };
  add(patient.ejection_fraction < settings.heartThreshold, `Heart pumping percentage below ${settings.heartThreshold}%`, settings.heartWeight);
  add(patient.serum_creatinine > settings.kidneyThreshold, `Kidney measurement above ${settings.kidneyThreshold} mg/dL`, settings.kidneyWeight);
  add(patient.anaemia === 1, 'Anaemia', settings.anaemiaPoints);
  add(patient.diabetes === 1, 'Diabetes', settings.diabetesPoints);
  add(patient.high_blood_pressure === 1, 'High blood pressure', settings.bloodPressurePoints);
  add(patient.age >= 70, 'Age 70 or older', settings.agePoints);
  add(settings.seniorPoints > 0 && patient.age >= 80, 'Age 80 or older', settings.seniorPoints);
  add(settings.sodiumPoints > 0 && patient.serum_sodium < settings.sodiumThreshold, `Blood sodium below ${settings.sodiumThreshold} mEq/L`, settings.sodiumPoints);
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

export function simulatePatient(patients, patientId, measurements, settings = 2) {
  return rankPatients(patients.map(patient => patient.id === patientId ? { ...patient, ejection_fraction: measurements.ejection_fraction, serum_creatinine: measurements.serum_creatinine } : patient), settings).find(patient => patient.id === patientId);
}
