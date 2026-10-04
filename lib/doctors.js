import doctors from '../data/doctors.json';

export { doctors };

export const ADDED_DOCTORS_KEY = 'priopulse-added-doctors';
export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_PROFILE = {
  gender: 'other',
  image: null,
  title: '',
  status: 'Active',
  employment: 'Full Time',
  patients: 0,
  experienceYears: null,
  avgResponseMinutes: null,
  fee: null,
  joined: null,
  phone: '',
  email: '',
  location: '',
  room: '',
  languages: [],
  bio: '',
  expertise: [],
  education: [],
  certifications: [],
  availability: [],
  treatments: [],
};

export function findDoctor(id) {
  return doctors.find((doctor) => doctor.id === id) ?? null;
}

function toNumber(value) {
  const number = Number(value);
  return value !== null && value !== '' && Number.isFinite(number) ? number : null;
}

/** Fills gaps in doctors added through the "Add Doctor" form (including records saved by older versions of the form). */
export function normalizeDoctor(record) {
  const specialty = record.specialty || 'General Cardiology';
  return {
    ...DEFAULT_PROFILE,
    ...record,
    gender: String(record.gender || 'other').toLowerCase(),
    specialty,
    department: record.department || specialty,
    title: record.title || (specialty === 'Cardiac Surgery' ? 'Cardiac Surgeon' : 'Cardiologist'),
    patients: toNumber(record.patients) ?? 0,
    experienceYears: toNumber(record.experienceYears),
    location: record.location || [record.address, record.city, [record.state, record.zip].filter(Boolean).join(' ')].filter(Boolean).join(', '),
    languages: record.languages?.length ? record.languages : ['English'],
    bio: record.bio || `${record.name} recently joined PrioPulse. Their full profile will be filled in once onboarding is complete.`,
    added: !doctors.some((doctor) => doctor.id === record.id),
  };
}

export function createDoctor(form, image) {
  const rawName = String(form.name || '').trim();
  const name = !rawName || /^dr\.?\s/i.test(rawName) ? rawName : `Dr. ${rawName}`;
  const slug = name.toLowerCase().replace(/^dr\.?\s+/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalizeDoctor({
    ...form,
    id: `${slug || 'doctor'}-${crypto.randomUUID().slice(0, 6)}`,
    name,
    image: image || null,
    joined: new Date().toISOString().slice(0, 10),
  });
}

export function readAddedDoctors() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(ADDED_DOCTORS_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((record) => record?.id && record?.name).map(normalizeDoctor) : [];
  } catch {
    return [];
  }
}

export function saveAddedDoctor(doctor) {
  const saved = JSON.parse(sessionStorage.getItem(ADDED_DOCTORS_KEY) || '[]');
  sessionStorage.setItem(ADDED_DOCTORS_KEY, JSON.stringify([doctor, ...(Array.isArray(saved) ? saved : [])]));
}

export function initials(name) {
  return String(name || '?').replace(/^dr\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
}

/** Today's slot for a doctor: on leave, working (with hours), off, or unknown before hydration. */
export function availabilityToday(doctor, dayIndex) {
  if (doctor.status === 'On Leave') return { state: 'leave', label: doctor.leaveUntil ? `On leave · back ${formatDate(doctor.leaveUntil, { month: 'short', day: 'numeric' })}` : 'On leave' };
  if (dayIndex === null) return { state: 'unknown', label: '' };
  if (!doctor.availability?.length) return { state: 'off', label: 'Schedule not set' };
  const slot = doctor.availability.find((entry) => entry.day === WEEK_DAYS[dayIndex]);
  return slot?.hours ? { state: 'available', label: `Available today · ${slot.hours}` } : { state: 'off', label: 'Off today' };
}

export function formatDate(iso, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!iso) return '—';
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', options);
}
