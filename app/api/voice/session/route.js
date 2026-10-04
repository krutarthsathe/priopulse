import dataset from '../../../../data/heart-failure-patients.json';
import { createVoiceSession } from '../../../../lib/voice-session-server';
export const runtime = 'nodejs';
const patientIds = new Set(dataset.patients.map(patient => patient.id));
export async function POST(request) { return createVoiceSession(request, { env: process.env, patientIds }); }
