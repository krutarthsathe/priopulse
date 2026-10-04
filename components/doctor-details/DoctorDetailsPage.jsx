'use client';
import {useEffect, useState} from 'react';
import Link from 'next/link';
import DashboardShell from '../DashboardShell';
import DoctorAvatar from '../doctors/DoctorAvatar';
import {WEEK_DAYS, availabilityToday, formatDate, initials, readAddedDoctors} from '../../lib/doctors';
import {useTodayIndex} from '../../lib/use-today-index';
import '../doctors/doctors.css';
import './doctor-profile.css';

const TREATMENT_STATUSES = ['Scheduled', 'Ongoing', 'Follow-up', 'Completed'];
const STATUS_TONES = {Scheduled: 'info', Ongoing: 'primary', 'Follow-up': 'warning', Completed: 'muted'};
const PAGE_SIZE = 6;

export default function DoctorDetailsPage({initialDoctor, requestedId}) {
  const [addedDoctor, setAddedDoctor] = useState(null);
  const [lookupDone, setLookupDone] = useState(false);
  useEffect(() => {
    if (initialDoctor) return;
    setAddedDoctor(readAddedDoctors().find((doctor) => doctor.id === requestedId) ?? null);
    setLookupDone(true);
  }, [initialDoctor, requestedId]);

  const doctor = initialDoctor ?? addedDoctor;
  if (doctor) return <DoctorProfile key={doctor.id} doctor={doctor} />;
  return (
    <DashboardShell>
      <main id="main-content" className="pt-16 pb-6 min-h-dvh ml-0 lg:ml-64">
        <div className="p-4 lg:p-6">
          <div className="dash-panel dp-missing">
            <i className={lookupDone ? 'ph ph-user-circle-dashed' : 'ph ph-spinner'} aria-hidden="true" />
            <h1>{lookupDone ? 'Doctor not found' : 'Loading doctor…'}</h1>
            {lookupDone && <p>This profile may have been removed or the link is out of date.</p>}
            <Link href="/doctors" className="dl-primary"><i className="ph ph-arrow-left" />Back to doctors</Link>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}

function DoctorProfile({doctor}) {
  const todayIndex = useTodayIndex();
  const today = availabilityToday(doctor, todayIndex);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState('');
  const onLeave = doctor.status === 'On Leave';
  const surname = doctor.name.replace(/^Dr\.?\s+/, '').split(' ').at(-1);

  const query = search.toLowerCase().trim();
  const matching = doctor.treatments.filter((row) => !query || [row.patient, row.id, row.condition, row.plan].join(' ').toLowerCase().includes(query));
  const statusCounts = Object.fromEntries(TREATMENT_STATUSES.map((value) => [value, matching.filter((row) => row.status === value).length]));
  const rows = status === 'all' ? matching : matching.filter((row) => row.status === status);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleRows = rows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const notConnected = (action) => setNotice(`${action} is not connected in this demo.`);

  const contact = [
    {icon: 'ph-phone', label: 'Phone', value: doctor.phone, href: doctor.phone && `tel:${doctor.phone.replace(/[^\d+]/g, '')}`},
    {icon: 'ph-envelope-simple', label: 'Email', value: doctor.email, href: doctor.email && `mailto:${doctor.email}`},
    {icon: 'ph-map-pin', label: 'Location', value: doctor.location},
    {icon: 'ph-door-open', label: 'Office', value: doctor.room},
  ].filter((item) => item.value);

  const kpis = [
    {icon: 'ph-users-three', label: 'Patients treated', value: doctor.patients ? doctor.patients.toLocaleString('en-US') : '—', note: 'Since joining PrioPulse'},
    {icon: 'ph-calendar-check', label: 'Upcoming visits', value: doctor.treatments.filter((row) => row.status === 'Scheduled').length, note: 'Scheduled patient treatments'},
    {icon: 'ph-timer', label: 'Avg. response time', value: doctor.avgResponseMinutes === null ? '—' : `${doctor.avgResponseMinutes} min`, note: 'To nurse and patient messages'},
    {icon: 'ph-currency-dollar', label: 'Consultation fee', value: doctor.fee === null ? '—' : `$${doctor.fee}`, note: 'Per standard visit'},
  ];

  return (
    <DashboardShell search={search} setSearch={setSearch} setPage={setPage} searchLabel="Search patient treatments" searchPlaceholder="Search this doctor's patients…">
      <main id="main-content" className="pt-16 pb-6 min-h-dvh ml-0 lg:ml-64 transition-all duration-300">
        <div className="p-4 lg:p-6 dp-page">
          <nav className="dp-breadcrumb" aria-label="Breadcrumb">
            <Link href="/doctors"><i className="ph ph-arrow-left" />Doctors</Link>
            <i className="ph ph-caret-right" aria-hidden="true" />
            <span aria-current="page">{doctor.name}</span>
          </nav>

          <section className="dp-hero" aria-label="Doctor profile">
            <div className="dp-hero-art" aria-hidden="true"><i className="ph ph-stethoscope" /></div>
            <div className="dp-identity">
              <div className="dp-avatar"><DoctorAvatar doctor={doctor} /></div>
              <div>
                <span className="dp-kicker">HEART INSTITUTE · {doctor.department.toUpperCase()}</span>
                <h1>{doctor.name}</h1>
                <p className="dp-title">{doctor.title}</p>
                <div className="dp-meta">
                  {doctor.experienceYears !== null && <span><i className="ph ph-briefcase" />{doctor.experienceYears} years experience</span>}
                  <span><i className="ph ph-translate" />{doctor.languages.join(', ')}</span>
                  {doctor.joined && <span><i className="ph ph-calendar-check" />Joined {formatDate(doctor.joined, {month: 'short', year: 'numeric'})}</span>}
                </div>
                <div className="dp-badges">
                  <span className={onLeave ? 'dp-badge dp-badge-leave' : 'dp-badge dp-badge-active'}><span />{onLeave ? `On leave${doctor.leaveUntil ? ` until ${formatDate(doctor.leaveUntil, {month: 'short', day: 'numeric'})}` : ''}` : 'Active'}</span>
                  <span className="dp-badge">{doctor.employment}</span>
                  {!onLeave && today.state !== 'unknown' && <span className="dp-badge"><i className={today.state === 'available' ? 'ph ph-clock' : 'ph ph-moon'} />{today.label}</span>}
                </div>
              </div>
            </div>
            <div className="dp-hero-side">
              <div className="dp-hero-actions">
                <button type="button" className="dp-btn-light" disabled={onLeave} title={onLeave ? 'Unavailable while on leave' : undefined} onClick={() => notConnected('Booking')}><i className="ph ph-calendar-plus" />Book appointment</button>
                <button type="button" className="dp-btn-ghost" onClick={() => notConnected('Messaging')}><i className="ph ph-chat-circle-dots" />Message</button>
              </div>
            </div>
          </section>

          <section className="dp-kpis" aria-label="Key figures">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="dash-panel dp-kpi">
                <div><span>{kpi.label}</span><i className={`ph ${kpi.icon}`} aria-hidden="true" /></div>
                <strong>{kpi.value}</strong>
                <p>{kpi.note}</p>
              </div>
            ))}
          </section>

          <div className="dp-layout">
            <aside className="dp-sidebar">
              <section className="dash-panel dp-card">
                <h2 className="dp-card-title"><i className="ph ph-address-book" />Contact</h2>
                <ul className="dp-contact">
                  {contact.map((item) => (
                    <li key={item.label}>
                      <span className="dp-contact-icon"><i className={`ph ${item.icon}`} aria-hidden="true" /></span>
                      <div><small>{item.label}</small>{item.href ? <a href={item.href}>{item.value}</a> : <p>{item.value}</p>}</div>
                    </li>
                  ))}
                  {!contact.length && <li className="dp-muted">No contact details yet.</li>}
                </ul>
              </section>

              <section className="dash-panel dp-card">
                <h2 className="dp-card-title"><i className="ph ph-calendar-dots" />Weekly schedule</h2>
                {onLeave && <p className="dp-leave-note"><i className="ph ph-airplane-tilt" />Appointments are paused{doctor.leaveUntil ? ` until ${formatDate(doctor.leaveUntil, {month: 'long', day: 'numeric'})}` : ''}.</p>}
                {doctor.availability.length ? (
                  <ul className="dp-schedule">
                    {WEEK_DAYS.map((day, index) => {
                      const hours = doctor.availability.find((entry) => entry.day === day)?.hours;
                      return (
                        <li key={day} className={index === todayIndex ? 'dp-today' : undefined} aria-current={index === todayIndex ? 'date' : undefined}>
                          <span>{day}{index === todayIndex && <em>Today</em>}</span>
                          <strong className={hours ? undefined : 'dp-off'}>{hours ?? 'Off'}</strong>
                        </li>
                      );
                    })}
                  </ul>
                ) : <p className="dp-muted">Schedule not set yet.</p>}
              </section>
            </aside>

            <div className="dp-main">
              <section className="dash-panel dp-card">
                <h2 className="dp-card-title"><i className="ph ph-user-focus" />About Dr. {surname}</h2>
                <p className="dp-bio">{doctor.bio}</p>
                {doctor.expertise.length > 0 && <>
                  <h3 className="dp-subtitle">Areas of expertise</h3>
                  <div className="dp-tags">{doctor.expertise.map((item) => <span key={item}>{item}</span>)}</div>
                </>}
                <dl className="dp-facts">
                  <div><dt>Heart team</dt><dd>{doctor.department}</dd></div>
                  <div><dt>Role</dt><dd>{doctor.title}</dd></div>
                  <div><dt>Employment</dt><dd>{doctor.employment}</dd></div>
                  <div><dt>Member since</dt><dd>{formatDate(doctor.joined)}</dd></div>
                </dl>
              </section>

              <div className="dp-split">
                <section className="dash-panel dp-card">
                  <h2 className="dp-card-title"><i className="ph ph-graduation-cap" />Education</h2>
                  {doctor.education.length ? (
                    <ol className="dp-timeline">
                      {[...doctor.education].reverse().map((item) => (
                        <li key={`${item.degree}-${item.year}`}><span className="dp-year">{item.year}</span><div><strong>{item.degree}</strong><p>{item.institution}</p></div></li>
                      ))}
                    </ol>
                  ) : <p className="dp-muted">Education history not added yet.</p>}
                </section>
                <section className="dash-panel dp-card">
                  <h2 className="dp-card-title"><i className="ph ph-seal-check" />Certifications</h2>
                  {doctor.certifications.length ? (
                    <ul className="dp-certs">{doctor.certifications.map((item) => <li key={item}><i className="ph-fill ph-check-circle" aria-hidden="true" />{item}</li>)}</ul>
                  ) : <p className="dp-muted">No certifications on file yet.</p>}
                </section>
              </div>

              <section className="dash-panel dp-card dp-treatments">
                <div className="dp-treatments-head">
                  <h2 className="dp-card-title"><i className="ph ph-clipboard-text" />Patient treatments<span className="dp-count">{doctor.treatments.length}</span></h2>
                  <div className="dl-field"><i className="ph ph-magnifying-glass" /><input type="search" placeholder="Search patients or conditions…" aria-label="Search patient treatments" value={search} onChange={(e) => {setSearch(e.target.value); setPage(0);}} /></div>
                </div>
                <div className="dl-segments dp-status-filter" role="group" aria-label="Filter treatments by status">
                  <button type="button" aria-pressed={status === 'all'} onClick={() => {setStatus('all'); setPage(0);}}>All<small>{matching.length}</small></button>
                  {TREATMENT_STATUSES.map((value) => <button key={value} type="button" aria-pressed={status === value} onClick={() => {setStatus(value); setPage(0);}}>{value}<small>{statusCounts[value]}</small></button>)}
                </div>

                {visibleRows.length ? (
                  <div className="dp-table-wrap">
                    <table className="dp-table">
                      <thead><tr><th scope="col">Patient</th><th scope="col">Condition</th><th scope="col">Treatment plan</th><th scope="col">Date</th><th scope="col">Status</th></tr></thead>
                      <tbody>
                        {visibleRows.map((row) => (
                          <tr key={row.id}>
                            <td><div className="dp-patient"><PatientAvatar row={row} /><div><strong>{row.patient}</strong><small>{row.id} · {row.age} yrs · {row.gender === 'male' ? 'Male' : 'Female'}</small></div></div></td>
                            <td>{row.condition}</td>
                            <td className="dp-plan">{row.plan}</td>
                            <td className="dp-date"><strong>{formatDate(row.date)}</strong><small>{row.time}</small></td>
                            <td><span className={`dp-status dp-status-${STATUS_TONES[row.status]}`}>{row.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="dl-empty"><i className="ph ph-clipboard" /><h3>{doctor.treatments.length ? 'No treatments match' : 'No treatments recorded yet'}</h3><p>{doctor.treatments.length ? 'Try a different search or status.' : 'Treatments will appear here once patients are assigned.'}</p></div>
                )}

                {rows.length > PAGE_SIZE && (
                  <div className="dp-pagination">
                    <span>{currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, rows.length)} of {rows.length}</span>
                    <div>
                      <button type="button" className="dl-page-btn" aria-label="Previous page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><i className="ph ph-caret-left" /></button>
                      {Array.from({length: pageCount}, (_, index) => <button key={index} type="button" className="dl-page-btn" aria-label={`Page ${index + 1}`} aria-current={index === currentPage ? 'page' : undefined} onClick={() => setPage(index)}>{index + 1}</button>)}
                      <button type="button" className="dl-page-btn" aria-label="Next page" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}><i className="ph ph-caret-right" /></button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
      {notice && <div role="status" className="fixed bottom-4 right-4 z-50 max-w-sm bg-w1 border border-border p-4 rounded-xl shadow-lg text-sm"><button aria-label="Dismiss message" onClick={() => setNotice('')} className="float-right ml-3">×</button>{notice}</div>}
    </DashboardShell>
  );
}

function PatientAvatar({row}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="dp-patient-photo doc-avatar-fallback" aria-hidden="true">{initials(row.patient)}</span>;
  return <img className="dp-patient-photo" src={row.photo} alt="" loading="lazy" onError={() => setFailed(true)} />;
}
