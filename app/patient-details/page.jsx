import dataset from '../../data/heart-failure-patients.json';
import { rankPatients, DEFAULT_SETTINGS } from '../../lib/heart-failure-ranking';
import HeartFailureDetails from '../../components/patient-details/HeartFailureDetails';
export const metadata = { title: 'Heart-Failure Patient – PrioPulse' };
export default async function Page({ searchParams }) {
  const params = await searchParams;
  const patient = params.id ? dataset.patients.find(patient => patient.id === params.id) : rankPatients(dataset.patients, 2)[0];
  const ranges = { heartWeight: [0,5], kidneyWeight: [0,5], heartThreshold: [25,50], kidneyThreshold: [1,2.5] };
  const settings = Object.fromEntries(Object.entries(DEFAULT_SETTINGS).map(([key, fallback]) => {
    const value = Number(params[key] ?? (key === 'heartWeight' ? params.weight : undefined));
    return [key, Number.isFinite(value) && value >= ranges[key][0] && value <= ranges[key][1] ? value : fallback];
  }));
  return <HeartFailureDetails key={patient?.id} patient={patient || null} weight={settings.heartWeight} settings={settings} />;
}
