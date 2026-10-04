import './doctor-details.css';
import DoctorDetailsPage from '../../components/doctor-details/DoctorDetailsPage';
import {findDoctor} from '../../components/doctor-details/profiles';
export async function generateMetadata({searchParams}) {
 const {id}=await searchParams;const doctor=findDoctor(typeof id==='string'?id:undefined);
 return {title:`${doctor?.name||'Doctor Details'} – PrioPulse`,description:'Doctor profile, summary and sample patient treatments.'};
}
export default async function Page({searchParams}) {
 const {id}=await searchParams;const requestedId=typeof id==='string'?id:undefined;
 return <DoctorDetailsPage initialDoctor={findDoctor(requestedId)} requestedId={requestedId}/>;
}
