'use client';
import { useState } from 'react';
import Drawer from './Drawer';

// [key, label, min, max, choices]; choices are shown as a dropdown instead of a number box.
const YES_NO = [['1', 'Yes'], ['0', 'No']];
const FIELDS = [
  ['age', 'Age (years)', 18, 110], ['ejection_fraction', 'Heart pumping (%)', 5, 80], ['serum_creatinine', 'Kidney, creatinine (mg/dL)', 0.3, 15],
  ['serum_sodium', 'Blood sodium (mEq/L)', 100, 160], ['anaemia', 'Anaemia', 0, 1, YES_NO], ['diabetes', 'Diabetes', 0, 1, YES_NO],
  ['high_blood_pressure', 'High blood pressure', 0, 1, YES_NO], ['sex', 'Sex', 0, 1, [['1', 'Male'], ['0', 'Female']]],
];
const EMPTY = Object.fromEntries(FIELDS.map(([key]) => [key, '']));

/** Validates the form; returns [patient, null] or [null, problem]. */
function validate(raw) {
  const patient = {};
  for (const [key, label, min, max, choices] of FIELDS) {
    const text = String(raw[key] ?? '').trim();
    if (text === '') return [null, `${label.toLowerCase()} is missing`];
    const value = Number(text);
    if (!Number.isFinite(value) || value < min || value > max) return [null, `${label.toLowerCase()} must be between ${min} and ${max}`];
    patient[key] = value;
  }
  return [patient, null];
}

export default function ImportDrawer({ onImport, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [message, setMessage] = useState(null);

  function submit(e) {
    e.preventDefault();
    const [patient, problem] = validate(form);
    if (!patient) return setMessage({ error: true, text: `Check the form: ${problem}.` });
    onImport([patient]);
    setForm(EMPTY);
    setMessage({ error: false, text: 'Patient added and scored. They appear on the call list marked NEW, and the agent is re-checking its scoring.' });
  }

  return <Drawer title="Add a patient" subtitle="New discharges are scored straight away" onClose={onClose} labelledBy="pd-import-title">
    <p>Enter the patient’s details from their discharge record. They are ranked with everyone else at once. New patients have no outcome yet, so they are never used to check the agent’s tests, and they stay on this page until it is reloaded.</p>
    <form onSubmit={submit}>
      <div className="pd-form">{FIELDS.map(([key, label, min, max, choices]) => <label key={key}>{label}{choices
        ? <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}><option value="">Select…</option>{choices.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>
        : <input type="number" step="any" min={min} max={max} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />}</label>)}</div>
      <button className="pd-btn pd-btn-primary" type="submit" style={{ marginTop: 14 }}><i className="ph ph-user-plus" />Add patient</button>
    </form>
    {message && <p className={message.error ? 'pd-error' : 'pd-ok'} role="status">{message.text}</p>}
  </Drawer>;
}
