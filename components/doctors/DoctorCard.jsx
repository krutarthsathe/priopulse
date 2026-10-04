import Link from 'next/link';
import DoctorAvatar from './DoctorAvatar';
import { availabilityToday } from '../../lib/doctors';

export function doctorHref(doctor) {
  return `/doctors/${encodeURIComponent(doctor.id)}`;
}

export default function DoctorCard({ doctor, todayIndex, onAction }) {
  const today = availabilityToday(doctor, todayIndex);
  const onLeave = doctor.status === 'On Leave';
  return (
    <article className="dc-card">
      <div className="dc-head">
        <div className="dc-avatar">
          <DoctorAvatar doctor={doctor} />
          <span className={`dc-presence dc-presence-${today.state}`} aria-hidden="true" />
        </div>
        <div className="dc-identity">
          <h3><Link className="dc-link" href={doctorHref(doctor)} aria-label={`View profile of ${doctor.name}`}>{doctor.name}</Link></h3>
          <p>{doctor.title}</p>
          <div className="dc-chips">
            <span className="dc-chip">{doctor.department}</span>
            {doctor.employment === 'Part Time' && <span className="dc-chip dc-chip-muted">Part time</span>}
            {doctor.added && <span className="dc-chip dc-chip-new">New</span>}
          </div>
        </div>
        <span className={`dc-status ${onLeave ? 'dc-status-leave' : 'dc-status-active'}`}>{onLeave ? 'On leave' : 'Active'}</span>
      </div>

      <dl className="dc-stats">
        <div><dt>Patients</dt><dd>{doctor.patients.toLocaleString('en-US')}</dd></div>
        <div><dt>Experience</dt><dd>{doctor.experienceYears === null ? '—' : `${doctor.experienceYears} yrs`}</dd></div>
        <div><dt>Response</dt><dd>{doctor.avgResponseMinutes === null ? '—' : `${doctor.avgResponseMinutes} min`}</dd></div>
      </dl>

      <p className={`dc-availability dc-availability-${today.state}`}>
        {today.state !== 'unknown' && <><i className={today.state === 'leave' ? 'ph ph-airplane-tilt' : today.state === 'available' ? 'ph ph-clock' : 'ph ph-moon'} aria-hidden="true" />{today.label}</>}
      </p>

      <div className="dc-footer">
        <span className="dc-cta">View profile <i className="ph ph-arrow-right" aria-hidden="true" /></span>
        <div className="dc-actions">
          <button type="button" aria-label={`Call ${doctor.name}`} title="Call" onClick={() => onAction(`Calling ${doctor.name} is not connected in this demo.`)}><i className="ph ph-phone" /></button>
          <button type="button" aria-label={`Message ${doctor.name}`} title="Message" onClick={() => onAction(`Messaging ${doctor.name} is not connected in this demo.`)}><i className="ph ph-chat-circle-dots" /></button>
        </div>
      </div>
    </article>
  );
}
