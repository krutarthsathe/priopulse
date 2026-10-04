'use client';
import { useState } from 'react';
import { initials } from '../../lib/doctors';

export default function DoctorAvatar({ doctor, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!doctor.image || failed) {
    return <span className={`doc-avatar-fallback ${className}`} role="img" aria-label={doctor.name}>{initials(doctor.name)}</span>;
  }
  return <img src={doctor.image} alt={doctor.name} className={className} onError={() => setFailed(true)} />;
}
