import doctors from '../doctors/doctors-data.json';
import recent from './recent-doctors.json';
export const defaultDoctor = {
 id:'olivia-martin',name:'Dr. Olivia Martin',image:'/assets/images/doctor.png',specialty:'Cardiologist',department:'Cardiology',headline:'Cardiologist · Dept. of Cardiology',phone:'(217) 555-0113',email:'demo@gmail.com',location:'Shiloh, Hawaii 81063',qualifications:'MBBS, MD',education:'MBBS, California Univ.',treatmentSummary:'Cardiology treatments',fee:'$120 / visit',joined:'Mar 12, 2013',employment:'Full Time',gpa:'3.89',experience:'12+',rating:4.8,status:'Active'
};
export function directoryProfile(record) {
 return {...record,headline:record.specialty,department:record.specialty,experience:record.experience?.replace(/yr$/,'')||null,location:[record.city,record.state,record.zip].filter(Boolean).join(', ')||null,treatmentSummary:record.specialty+' treatments'};
}
export function findDoctor(id) {
 if(!id||id===defaultDoctor.id)return defaultDoctor;
 const record=doctors.find(doctor=>doctor.id===id)||recent.find(doctor=>doctor.id===id);
 return record?directoryProfile(record):null;
}
