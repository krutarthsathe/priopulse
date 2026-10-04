'use client';
import {useState} from 'react';
import AuthLayout from './AuthLayout';

const ROLES = [
 ['nurse', 'Nurse', 'ph-first-aid'],
 ['doctor', 'Doctor', 'ph-stethoscope'],
 ['staff', 'Other staff', 'ph-identification-badge'],
];
const DEPARTMENTS = ['Cardiology', 'Dermatology', 'Emergency', 'Family Medicine', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology', 'Radiology'];

function passwordScore(value) {
 if (!value) return 0;
 return Math.max(1, [value.length >= 8, /[A-Z]/.test(value) && /[a-z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length);
}
const SCORE_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export default function RegisterPage() {
 const [form, setForm] = useState({name: '', email: '', role: 'nurse', department: '', password: '', confirm: '', terms: false});
 const [showPassword, setShowPassword] = useState(false);
 const [errors, setErrors] = useState({});
 const [loading, setLoading] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const score = passwordScore(form.password);
 const set = key => e => {
  const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  setForm(f => ({...f, [key]: value}));
  setErrors(({[key]: _, ...rest}) => rest);
 };

 function submit(e) {
  e.preventDefault();
  const next = {};
  if (form.name.trim().length < 2) next.name = 'Enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid work email.';
  if (!form.department) next.department = 'Choose your department.';
  if (score < 3) next.password = 'Use 8+ characters with upper and lower case letters and a number.';
  if (form.confirm !== form.password) next.confirm = 'Passwords don’t match.';
  if (!form.terms) next.terms = 'Please accept the terms to continue.';
  setErrors(next);
  if (Object.keys(next).length) return;
  setLoading(true);
  setTimeout(() => {setLoading(false);setSubmitted(true);}, 800);
 }

 if (submitted) {
  const role = ROLES.find(([id]) => id === form.role)[1];
  return <AuthLayout>
<div className="auth-card text-center">
<div className="auth-success-icon"><i className="ph ph-hourglass-medium"></i></div>
<h1 className="text-2xl font-bold text-heading">Request submitted</h1>
<p className="text-sm text-muted mt-2">Thanks, {form.name.trim().split(' ')[0]}. An administrator will verify your details and approve your <strong>{role}</strong> access for <strong>{form.department}</strong>.</p>
<div className="dash-panel p-4 auth-section text-left space-y-3">
{[['ph-check-circle text-primary', 'Account request received', 'Just now'], ['ph-circle-dashed text-warning', 'Admin verification', 'Usually within 1 business day'], ['ph-circle text-faint', 'Access granted', `We’ll email ${form.email.trim()}`]].map(([icon, title, sub]) => <div key={title} className="flex items-start gap-3">
<i className={'ph ' + icon + ' text-lg'}></i>
<div><p className="text-sm font-medium text-heading">{title}</p><p className="text-[11px] text-faint">{sub}</p></div>
</div>)}
</div>
<a href="/login" className="auth-submit auth-section">Back to sign in</a>
</div>
</AuthLayout>;
 }

 return <AuthLayout>
<div className="auth-card auth-card-wide">
<span className="auth-mock-banner"><i className="ph ph-paint-brush"></i>Design mockup</span>
<h1 className="text-2xl font-bold text-heading mt-4">Request an account</h1>
<p className="text-sm text-muted mt-1">Clinical access is granted after an administrator approves your request.</p>

<form className="auth-section space-y-4" onSubmit={submit} noValidate>
<div>
<label htmlFor="reg-name" className="block text-xs font-medium text-text mb-1.5">Full name</label>
<div className="auth-input-wrap"><i className="ph ph-user auth-lead"></i><input id="reg-name" autoComplete="name" placeholder="e.g. Jane Cooper" className="auth-input auth-input-icon" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} /></div>
{errors.name && <p className="auth-error">{errors.name}</p>}
</div>
<div>
<label htmlFor="reg-email" className="block text-xs font-medium text-text mb-1.5">Work email</label>
<div className="auth-input-wrap"><i className="ph ph-envelope-simple auth-lead"></i><input id="reg-email" type="email" autoComplete="email" placeholder="name@hospital.com" className="auth-input auth-input-icon" value={form.email} onChange={set('email')} aria-invalid={!!errors.email} /></div>
{errors.email && <p className="auth-error">{errors.email}</p>}
</div>

<fieldset>
<legend className="block text-xs font-medium text-text mb-1.5">Requested role</legend>
<div className="grid grid-cols-3 gap-2">{ROLES.map(([id, label, icon]) => <label key={id} className="auth-role">
<input type="radio" name="role" value={id} checked={form.role === id} onChange={set('role')} className="sr-only" />
<i className={'ph ' + icon}></i>
<span className="text-sm font-medium text-heading">{label}</span>
</label>)}</div>
<p className="text-[11px] text-faint mt-1.5 inline-flex items-center gap-1"><i className="ph ph-info"></i>Only approved doctors and nurses can view patient queues and the audit log.</p>
</fieldset>

<div>
<label htmlFor="reg-department" className="block text-xs font-medium text-text mb-1.5">Department</label>
<div className="auth-input-wrap">
<i className="ph ph-buildings auth-lead"></i>
<select id="reg-department" className="auth-input auth-input-icon" value={form.department} onChange={set('department')} aria-invalid={!!errors.department}>
<option value="" disabled>Select department</option>
{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
</select>
<i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint pointer-events-none"></i>
</div>
{errors.department && <p className="auth-error">{errors.department}</p>}
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<div>
<label htmlFor="reg-password" className="block text-xs font-medium text-text mb-1.5">Password</label>
<div className="auth-input-wrap">
<i className="ph ph-lock-simple auth-lead"></i>
<input id="reg-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create password" className="auth-input auth-input-icon" style={{paddingRight: '2.75rem'}} value={form.password} onChange={set('password')} aria-invalid={!!errors.password} />
<button type="button" className="auth-input-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)}><i className={'ph ' + (showPassword ? 'ph-eye-slash' : 'ph-eye')}></i></button>
</div>
</div>
<div>
<label htmlFor="reg-confirm" className="block text-xs font-medium text-text mb-1.5">Confirm password</label>
<div className="auth-input-wrap"><i className="ph ph-lock-key auth-lead"></i><input id="reg-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Repeat password" className="auth-input auth-input-icon" value={form.confirm} onChange={set('confirm')} aria-invalid={!!errors.confirm} /></div>
{errors.confirm && <p className="auth-error">{errors.confirm}</p>}
</div>
</div>
<div>
<div className="auth-strength" data-score={score} aria-hidden="true"><span></span><span></span><span></span><span></span></div>
<p className={'text-[11px] mt-1 ' + (errors.password ? 'text-danger' : 'text-faint')}>{errors.password || (score ? `Password strength: ${SCORE_LABELS[score]}` : 'Use 8+ characters with upper and lower case letters and a number.')}</p>
</div>

<div>
<label className="inline-flex items-start gap-2 text-xs text-muted cursor-pointer">
<input type="checkbox" className="mt-0.5" style={{accentColor: 'var(--color-primary)'}} checked={form.terms} onChange={set('terms')} />
<span>I agree to the <a href="#" className="text-primary font-medium">terms of use</a> and confirm I'll handle patient data per hospital policy.</span>
</label>
{errors.terms && <p className="auth-error">{errors.terms}</p>}
</div>

<button type="submit" className="auth-submit" disabled={loading}>{loading ? <><i className="ph ph-circle-notch auth-spinner"></i>Submitting…</> : <>Submit request<i className="ph ph-arrow-right"></i></>}</button>
</form>

<p className="text-sm text-muted text-center auth-section">Already have an account? <a href="/login" className="font-semibold text-primary hover:text-primary-strong">Sign in</a></p>
</div>
</AuthLayout>;
}
