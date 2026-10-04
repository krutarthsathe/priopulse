'use client';
import {useEffect, useRef, useState} from 'react';
import {patientPhoto, patientPhotoFallback, patientThumbnail} from '../lib/patient-photo';

export default function PatientPhoto({patient, thumbnail = false, className, alt = ''}) {
 const ref = useRef(null);
 const [failed, setFailed] = useState(false);
 // The image can fail before hydration attaches onError, so check once on mount too.
 useEffect(() => {
  const img = ref.current;
  if (img?.complete && img.naturalWidth === 0) setFailed(true);
 }, []);
 const src = failed ? patientPhotoFallback(patient) : thumbnail ? patientThumbnail(patient) : patientPhoto(patient);
 return <img ref={ref} src={src} alt={alt} className={className} loading={thumbnail ? 'lazy' : undefined} onError={() => setFailed(true)} />;
}
