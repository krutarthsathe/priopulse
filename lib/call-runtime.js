import dataset from '../data/heart-failure-patients.json';
import { createCallStore } from './call-store.js';

export const callDependencies = {
  env: process.env,
  patientIds: new Set(dataset.patients.map(patient => patient.id)),
  getStore: () => createCallStore(process.env),
};
