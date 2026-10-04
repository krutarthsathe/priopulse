'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import AuthLayout from './AuthLayout';
import {DEMO_USERS, ROLE_LABELS, setCurrentUser} from '../../lib/current-user';

const DEMO_PASSWORD = 'demo1234';

export default function LoginPage() {
 const router = useRouter();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [errors, setErrors] = useState({});
 const [notice, setNotice] = useState('');
 const [loading, setLoading] = useState(false);

 function fillDemo(user) {
  setEmail(user.email);setPassword(DEMO_PASSWORD);setErrors({});setNotice('');
 }

 function submit(e) {
  e.preventDefault();
  const next = {};
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid work email.';
  if (!password) next.password = 'Enter your password.';
  setErrors(next);setNotice('');
  if (Object.keys(next).length) return;
  const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || password !== DEMO_PASSWORD) {setNotice('Email or password is incorrect. In this mockup, sign in with one of the demo accounts below.');return;}
  setLoading(true);
  setTimeout(() => {setCurrentUser(user.id);router.push('/patients');}, 700);
 }

 return <AuthLayout>
<div className="auth-card">
<span className="auth-mock-banner"><i className="ph ph-paint-brush"></i>Design mockup</span>
<h1 className="text-2xl font-bold text-heading mt-4">Welcome back</h1>
<p className="text-sm text-muted mt-1">Sign in to your PrioPulse account to continue.</p>

<form className="auth-section space-y-4" onSubmit={submit} noValidate>
<div>
<label htmlFor="login-email" className="block text-xs font-medium text-text mb-1.5">Work email</label>
<div className="auth-input-wrap">
<i className="ph ph-envelope-simple auth-lead"></i>
<input id="login-email" type="email" autoComplete="email" placeholder="name@hospital.com" className="auth-input auth-input-icon" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'login-email-error' : undefined} />
</div>
{errors.email && <p id="login-email-error" className="auth-error">{errors.email}</p>}
</div>
<div>
<div className="flex items-center justify-between mb-1.5">
<label htmlFor="login-password" className="block text-xs font-medium text-text">Password</label>
<button type="button" className="text-xs font-medium text-primary hover:text-primary-strong" onClick={() => setNotice('Password reset is not connected in this mockup.')}>Forgot password?</button>
</div>
<div className="auth-input-wrap">
<i className="ph ph-lock-simple auth-lead"></i>
<input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" className="auth-input auth-input-icon" style={{paddingRight: '2.75rem'}} value={password} onChange={e => setPassword(e.target.value)} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'login-password-error' : undefined} />
<button type="button" className="auth-input-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)}><i className={'ph ' + (showPassword ? 'ph-eye-slash' : 'ph-eye')}></i></button>
</div>
{errors.password && <p id="login-password-error" className="auth-error">{errors.password}</p>}
</div>
<label className="inline-flex items-center gap-2 text-xs text-muted cursor-pointer">
<input type="checkbox" style={{accentColor: 'var(--color-primary)'}} defaultChecked /> Keep me signed in on this device
</label>
{notice && <p role="alert" className="text-xs text-danger bg-danger-soft rounded-xl px-3 py-2.5">{notice}</p>}
<button type="submit" className="auth-submit" disabled={loading}>{loading ? <><i className="ph ph-circle-notch auth-spinner"></i>Signing in…</> : <>Sign in<i className="ph ph-arrow-right"></i></>}</button>
</form>

<div className="auth-divider my-5">or</div>
<button type="button" className="auth-sso w-full" onClick={() => setNotice('Hospital SSO is not connected in this mockup.')}><i className="ph ph-buildings text-base"></i>Continue with hospital SSO</button>

<div className="auth-section">
<p className="text-[11px] font-semibold text-faint uppercase tracking-wide mb-2">Demo accounts · password {DEMO_PASSWORD}</p>
<div className="space-y-2">{DEMO_USERS.map(user => <button key={user.id} type="button" className="auth-demo-account" aria-pressed={email === user.email} onClick={() => fillDemo(user)}>
<img src={user.image} alt="" />
<span className="flex-1 min-w-0"><span className="block text-sm font-medium text-heading">{user.name}</span><span className="block text-[11px] text-faint truncate">{user.email}</span></span>
<span className="text-[11px] text-muted">{ROLE_LABELS[user.role]}</span>
</button>)}</div>
</div>

<p className="text-sm text-muted text-center auth-section">New to PrioPulse? <a href="/register" className="font-semibold text-primary hover:text-primary-strong">Request an account</a></p>
</div>
</AuthLayout>;
}
