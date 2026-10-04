'use client';
import {useEffect} from 'react';
import './auth.css';

const FEATURES = [
 ['ph-list-numbers', 'Ranked patient queue', 'Know who to call first, every shift.'],
 ['ph-phone-call', 'Call outcomes in one tap', 'Called, no answer or unreachable, logged instantly.'],
 ['ph-clipboard-text', 'Full audit trail', 'Every override recorded with who and when.'],
];

export default function AuthLayout({children}) {
 useEffect(() => {document.documentElement.classList.toggle('dark', localStorage.getItem('priopulse-theme') === 'dark');}, []);
 function toggleTheme() {
  const dark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('priopulse-theme', dark ? 'dark' : 'light');
 }
 return <div className="auth-shell">
<aside className="auth-brand" aria-hidden="true">
<div className="flex items-center gap-3">
<div className="auth-brand-logo"><img src="/assets/images/logo.png" alt="" /></div>
<span className="flex flex-col leading-none">
<span className="font-bold text-lg">PrioPulse</span>
<span className="text-[11px] font-medium tracking-wide" style={{opacity: 0.75}}>Medical Suite</span>
</span>
</div>
<div className="space-y-6">
<h2>Prioritised patient outreach for clinical teams.</h2>
<div className="space-y-3">{FEATURES.map(([icon, title, text]) => <div key={title} className="auth-brand-feature"><i className={'ph ' + icon}></i><div><p className="font-semibold" style={{opacity: 1, fontSize: '0.875rem', marginTop: 0}}>{title}</p><p>{text}</p></div></div>)}</div>
</div>
<p className="auth-brand-quote">© 2026 PrioPulse Medical · Built for doctors and nurses</p>
</aside>
<main className="auth-main">
<div className="flex items-center justify-between">
<a href="/login" className="auth-mobile-brand flex items-center gap-2.5">
<div className="brand-logo w-9 h-9"><img src="/assets/images/logo.png" alt="PrioPulse" /></div>
<span className="brand-wordmark font-bold text-lg">PrioPulse</span>
</a>
<button type="button" onClick={toggleTheme} className="topbar-icon-btn size-10" aria-label="Toggle theme"><i className="ph ph-moon text-xl"></i></button>
</div>
<div className="auth-main-body">{children}</div>
<p className="text-center text-[11px] text-faint">Design mockup · authentication is not connected</p>
</main>
</div>;
}
