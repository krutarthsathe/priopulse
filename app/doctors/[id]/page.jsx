import DoctorDetailsPage from '../../../components/doctor-details/DoctorDetailsPage';
import {findDoctor} from '../../../lib/doctors';
export async function generateMetadata({params}) {
 const {id}=await params;const doctor=findDoctor(decodeURIComponent(id));
 return {title:`${doctor?.name||'Doctor profile'} – PrioPulse`,description:doctor?`${doctor.name}, ${doctor.title} – profile, schedule and patient treatments.`:'Doctor profile, schedule and patient treatments.'};
}
export default async function Page({params}) {
 const {id}=await params;const requestedId=decodeURIComponent(id);
 return <DoctorDetailsPage initialDoctor={findDoctor(requestedId)} requestedId={requestedId}/>;
}
