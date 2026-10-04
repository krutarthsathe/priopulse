import dataset from '../../data/heart-failure-patients.json';
import { rankPatients } from '../../lib/heart-failure-ranking';
import HeartFailureDetails from '../../components/patient-details/HeartFailureDetails';
export const metadata = { title: 'Heart-Failure Patient – PrioPulse' };
export default async function Page({ searchParams }) {
  const params = await searchParams;
  const patient = params.id ? dataset.patients.find(patient => patient.id === params.id) : rankPatients(dataset.patients, 2)[0];
  return <HeartFailureDetails patient={patient || null} weight={params.weight === '3' ? 3 : 2} />;
}
