'use client';
import {useEffect,useState} from 'react';
import DashboardShell from '../DashboardShell';
import TreatmentRows from './TreatmentRows';
import treatmentText from './treatment-text.json';
import {directoryProfile} from './profiles';
export default function DoctorDetailsPage({initialDoctor,requestedId}) {
 const [profile,setProfile]=useState(initialDoctor);
 const [loaded,setLoaded]=useState(Boolean(initialDoctor));
 const [search,setSearch]=useState('');
 const [page,setPage]=useState(0);
 const [pageSize,setPageSize]=useState(8);
 const [dense,setDense]=useState(true);
 const [notice,setNotice]=useState('');
 const [rowMenu,setRowMenu]=useState(null);
 const [period,setPeriod]=useState('Today');
 const [periodOpen,setPeriodOpen]=useState(false);
 const recordCount=treatmentText.filter(text=>text.toLowerCase().includes(search.toLowerCase().trim())).length;
 useEffect(()=>{
  setProfile(initialDoctor);setLoaded(Boolean(initialDoctor));setSearch('');setPage(0);
  if(!initialDoctor){try {const saved=JSON.parse(sessionStorage.getItem('priopulse-added-doctors')||'[]');const doctor=saved.find(doctor=>doctor.id===requestedId);if(doctor)setProfile(directoryProfile(doctor));}catch{}setLoaded(true);}
 },[initialDoctor,requestedId]);
 useEffect(()=>{
  const close=()=>setRowMenu(null);
  const key=e=>{if(e.key==='Escape'){close();setPeriodOpen(false);}};
  document.addEventListener('keydown',key);window.addEventListener('resize',close);window.addEventListener('scroll',close,true);
  return ()=>{document.removeEventListener('keydown',key);window.removeEventListener('resize',close);window.removeEventListener('scroll',close,true);};
 },[]);
 function handleClick(e) {
  const button=e.target.closest('button');
  if(!e.target.closest('[data-treatment-menu], .row-btn'))setRowMenu(null);
  if(!e.target.closest('[data-dropdown]'))setPeriodOpen(false);
  if(!button)return;
  if(button.closest('.doc-card'))e.preventDefault();
  if(button.hasAttribute('data-dropdown-trigger'))setPeriodOpen(current=>!current);
  else if(button.dataset.value){setPeriod(button.dataset.value);setPeriodOpen(false);}
  else if(button.classList.contains('row-btn')){const r=button.getBoundingClientRect();setRowMenu({text:button.closest('tr').innerText.trim().replace(/\s+/g,' '),left:Math.max(8,Math.min(r.right-280,window.innerWidth-288)),top:Math.max(8,Math.min(r.bottom+6,window.innerHeight-150))});}
  else if(!['Previous','Next'].includes(button.getAttribute('aria-label')) && !button.closest('[data-treatment-menu]')){setNotice('This action is not connected in the demo.');}
 }
 const doctor=profile;
 if(!doctor)return <DashboardShell search={search} setSearch={setSearch} setPage={setPage}><main id="main-content" className="pt-16 ml-0 lg:ml-64 min-h-dvh"><div className="p-6"><h1 className="text-lg font-semibold">{loaded?'Doctor not found':'Loading doctor…'}</h1><a href="/doctors" className="text-primary inline-block mt-3">Back to doctors</a></div></main></DashboardShell>;
 return <DashboardShell search={search} setSearch={setSearch} setPage={setPage} searchLabel="Search patient treatments" searchPlaceholder="Search patient treatments…"><div className="doctor-details-page" onClick={handleClick}>
<main id="main-content" className="pt-16 pb-6 min-h-dvh ml-0 lg:ml-64 transition-all duration-300">
<div className="p-4 lg:p-6 space-y-5">

<div className="flex flex-wrap items-start justify-between gap-4">
<div className="flex items-center gap-3">
<a aria-label="Back to doctors" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors flex-shrink-0" href="/doctors">
<i className="ph ph-arrow-left text-base"></i>
</a>
<div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center flex-shrink-0">
<i className="ph ph-stethoscope text-primary text-lg"></i>
</div>
<div>
<h1 className="text-lg font-semibold text-heading leading-tight">{"Doctor Details"}</h1>
<p className="text-xs text-faint mt-0.5">
<a className="hover:text-primary transition-colors" href="/doctors">{"Doctors"}</a>
<i className="ph ph-caret-right text-[10px] mx-1"></i>{doctor.name ?? "—"}</p>
</div>
</div>
<div className="flex flex-wrap items-center gap-2">
<a className="h-9 px-4 rounded-xl border border-border text-text hover:border-primary/50 hover:text-primary hover:bg-primary/5 text-sm font-medium flex items-center gap-2 transition-colors no-underline" href="#">
<i className="ph ph-pencil-simple text-base"></i>
<span className="hidden sm:inline">{"Edit Profile"}</span>
</a>
<a className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-strong text-on-primary text-sm font-medium flex items-center gap-2 transition-colors" href="#">
<i className="ph ph-calendar-plus text-base"></i>{"\n              Schedule Appointment\n            "}</a>
</div>
</div>

<div className="grid grid-cols-12 gap-4 items-start">

<aside className="col-span-12 md:col-span-4 lg:col-span-3 3xl:col-span-2 md:sticky md:top-20 self-start w-full max-md:order-1">
<div className="dash-panel w-full flex flex-col">

<div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 border-b border-border-subtle">
<div className="flex items-center gap-2.5">
<span className="dash-icon-chip is-info">
<i className="ph ph-clock-clockwise"></i>
</span>
<div>
<h2 className="dash-title">{"Recent Doctors"}</h2>
<p className="text-[11px] text-faint">{"6 recently viewed"}</p>
</div>
</div>
<div className="relative" data-dropdown="">
<button type="button" data-dropdown-trigger="" aria-haspopup="true" aria-expanded={periodOpen} className="dash-period-btn">
<span data-dropdown-label="">{period}</span>
<i className="ph ph-caret-down text-[10px] ml-0.5"></i>
</button>
<div data-dropdown-menu="" role="menu" className={"absolute right-0 top-full mt-1 z-30 min-w-[140px] p-1 bg-w1 border border-border rounded-xl shadow-lg " + (periodOpen ? "" : "hidden")}>
<button data-value="Today" className="block w-full text-left px-2.5 py-1.5 text-xs rounded-lg text-text hover:bg-primary/5 transition-colors">{"Today"}</button>
<button data-value="This Week" className="block w-full text-left px-2.5 py-1.5 text-xs rounded-lg text-text hover:bg-primary/5 transition-colors">{"This Week"}</button>
<button data-value="This Month" className="block w-full text-left px-2.5 py-1.5 text-xs rounded-lg text-text hover:bg-primary/5 transition-colors">{"This Month"}</button>
</div>
</div>
</div>

<div className="p-3 space-y-2 overflow-y-auto flex-1 max-h-[calc(100vh-9rem)]">

<a href="/doctor-details?id=michael-patel-pulmonology" aria-current={doctor.id === "michael-patel-pulmonology" ? "page" : undefined} className={"doc-card block " + (doctor.id === "michael-patel-pulmonology" ? "ring-1 ring-primary/20 !border-primary/30" : "")}>
<div className="flex items-start justify-between gap-2.5">
<img src="/assets/images/doctor4.png" alt="" className="doc-card-avatar" />
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<button className="doc-icon-btn" aria-label="Call">
<i className="ph ph-phone text-sm"></i>
</button>
<button className="doc-icon-btn" aria-label="Message">
<i className="ph ph-chat-circle text-sm"></i>
</button>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"Dr. Michael Patel"}</p>
<p className="text-[11px] text-faint mt-0.5">{"Pulmonology"}</p>
</div>
<span className="w-6 h-6 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors border border-primary/20">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>

<a href="/doctor-details?id=olivia-martin" aria-current={doctor.id === "olivia-martin" ? "page" : undefined} className={"doc-card block " + (doctor.id === "olivia-martin" ? "ring-1 ring-primary/20 !border-primary/30" : "")}>
<div className="flex items-start justify-between gap-2.5">
<div className="relative">
<img src="/assets/images/doctor.png" alt="" className="doc-card-avatar" />
<span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-w1"></span>
</div>
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<button className="doc-icon-btn" aria-label="Call">
<i className="ph ph-phone text-sm"></i>
</button>
<button className="doc-icon-btn" aria-label="Message">
<i className="ph ph-chat-circle text-sm"></i>
</button>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"Dr. Olivia Martin"}</p>
<p className="text-[11px] text-faint mt-0.5">{"Cardiologist"}</p>
</div>
<span className="w-6 h-6 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors border border-primary/20">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>

<a href="/doctor-details?id=david-wilson-internal-medicine" aria-current={doctor.id === "david-wilson-internal-medicine" ? "page" : undefined} className={"doc-card block " + (doctor.id === "david-wilson-internal-medicine" ? "ring-1 ring-primary/20 !border-primary/30" : "")}>
<div className="flex items-start justify-between gap-2.5">
<img src="/assets/images/doctor7.png" alt="" className="doc-card-avatar" />
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<button className="doc-icon-btn" aria-label="Call"><i className="ph ph-phone text-sm"></i></button>
<button className="doc-icon-btn" aria-label="Message"><i className="ph ph-chat-circle text-sm"></i></button>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"Dr. David Wilson"}</p>
<p className="text-[11px] text-faint mt-0.5">{"Internal Medicine"}</p>
</div>
<span className="w-6 h-6 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors border border-primary/20">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>

<a href="/doctor-details?id=kevin-lee-nephrology" aria-current={doctor.id === "kevin-lee-nephrology" ? "page" : undefined} className={"doc-card block " + (doctor.id === "kevin-lee-nephrology" ? "ring-1 ring-primary/20 !border-primary/30" : "")}>
<div className="flex items-start justify-between gap-2.5">
<img src="/assets/images/doctor9.png" alt="" className="doc-card-avatar" />
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<button className="doc-icon-btn" aria-label="Call"><i className="ph ph-phone text-sm"></i></button>
<button className="doc-icon-btn" aria-label="Message"><i className="ph ph-chat-circle text-sm"></i></button>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"Dr. Kevin Lee"}</p>
<p className="text-[11px] text-faint mt-0.5">{"Nephrology"}</p>
</div>
<span className="w-6 h-6 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors border border-primary/20">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>

<a href="/doctor-details?id=michael-patel-urology" aria-current={doctor.id === "michael-patel-urology" ? "page" : undefined} className={"doc-card block " + (doctor.id === "michael-patel-urology" ? "ring-1 ring-primary/20 !border-primary/30" : "")}>
<div className="flex items-start justify-between gap-2.5">
<img src="/assets/images/doctor11.png" alt="" className="doc-card-avatar" />
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<button className="doc-icon-btn" aria-label="Call"><i className="ph ph-phone text-sm"></i></button>
<button className="doc-icon-btn" aria-label="Message"><i className="ph ph-chat-circle text-sm"></i></button>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"Dr. Michael Patel"}</p>
<p className="text-[11px] text-faint mt-0.5">{"Urology"}</p>
</div>
<span className="w-6 h-6 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors border border-primary/20">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>

<a href="/doctor-details?id=samantha-taylor-surgery" aria-current={doctor.id === "samantha-taylor-surgery" ? "page" : undefined} className={"doc-card block " + (doctor.id === "samantha-taylor-surgery" ? "ring-1 ring-primary/20 !border-primary/30" : "")}>
<div className="flex items-start justify-between gap-2.5">
<img src="/assets/images/doctor13.png" alt="" className="doc-card-avatar" />
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<button className="doc-icon-btn" aria-label="Call"><i className="ph ph-phone text-sm"></i></button>
<button className="doc-icon-btn" aria-label="Message"><i className="ph ph-chat-circle text-sm"></i></button>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"Dr. Samantha Taylor"}</p>
<p className="text-[11px] text-faint mt-0.5">{"Surgery"}</p>
</div>
<span className="w-6 h-6 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors border border-primary/20">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>
</div>
</div>
</aside>

<section className="col-span-12 md:col-span-8 lg:col-span-9 3xl:col-span-10 flex flex-col gap-4 min-w-0 max-md:order-0">

<div className="grid grid-cols-12 gap-4 items-start">

<div className="col-span-12 3xl:col-span-7 dash-panel overflow-hidden">

<div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 to-transparent"></div>
</div>
<div className="px-5 pb-5 -mt-10">
<div className="flex flex-wrap items-end gap-4">

<div className="relative flex-shrink-0">
<img src={doctor.image} alt={doctor.name} className="w-38 h-38 rounded-2xl object-cover object-top ring-4 ring-secondary/40 bg-primary-soft" />
<span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-soft border-2 border-w1 flex items-center justify-center">
<i className="ph ph-stethoscope text-primary text-[10px]"></i>
</span>
</div>

<div className="flex-1 min-w-0 pb-1">
<div className="flex flex-wrap items-center gap-2 mb-1.5">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
<span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>{doctor.status ?? "—"}</span>
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-subtle text-muted border border-border">{doctor.employment ?? "—"}</span>
</div>
<h2 className="text-xl font-bold text-heading leading-tight">{doctor.name ?? "—"}</h2>
<p className="text-sm text-muted mt-0.5">{doctor.headline ?? "—"}</p>
</div>

<div className="flex items-center gap-1.5 pb-1 flex-shrink-0">
<div className="flex items-center gap-0.5">
<i className="ph-fill ph-star text-warning text-sm"></i>
<i className="ph-fill ph-star text-warning text-sm"></i>
<i className="ph-fill ph-star text-warning text-sm"></i>
<i className="ph-fill ph-star text-warning text-sm"></i>
<i className="ph-fill ph-star-half text-warning text-sm"></i>
</div>
<span className="text-sm font-semibold text-heading">{doctor.rating ?? "—"}</span>
<span className="text-[11px] text-faint">{"/5.0"}</span>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border-subtle">
<div className="flex items-center gap-2.5">
<span className="w-8 h-8 rounded-xl bg-subtle flex items-center justify-center flex-shrink-0 text-muted">
<i className="ph ph-phone text-sm"></i>
</span>
<div className="min-w-0">
<p className="text-[10px] text-faint uppercase tracking-wide font-medium">{"Phone"}</p>
<p className="text-sm font-medium text-text truncate">{doctor.phone ?? "—"}</p>
</div>
</div>
<div className="flex items-center gap-2.5">
<span className="w-8 h-8 rounded-xl bg-subtle flex items-center justify-center flex-shrink-0 text-muted">
<i className="ph ph-envelope text-sm"></i>
</span>
<div className="min-w-0">
<p className="text-[10px] text-faint uppercase tracking-wide font-medium">{"Email"}</p>
<p className="text-sm font-medium text-text truncate">{doctor.email ?? "—"}</p>
</div>
</div>
<div className="flex items-center gap-2.5">
<span className="w-8 h-8 rounded-xl bg-subtle flex items-center justify-center flex-shrink-0 text-muted">
<i className="ph ph-map-pin text-sm"></i>
</span>
<div className="min-w-0">
<p className="text-[10px] text-faint uppercase tracking-wide font-medium">{"Location"}</p>
<p className="text-sm font-medium text-text truncate">{doctor.location ?? "—"}</p>
</div>
</div>
</div>

<div className="flex items-center gap-2 mt-4">
<button className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary-strong text-on-primary text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-sm transition-colors">
<i className="ph ph-phone-call text-sm"></i>{"Call\n                    "}</button>
<button className="flex-1 h-9 rounded-xl border border-primary text-primary hover:bg-primary-soft text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors">
<i className="ph ph-chat-circle-dots text-sm"></i>{"Chat\n                    "}</button>
<button className="h-9 w-9 rounded-xl border border-border text-muted hover:border-primary/50 hover:text-primary hover:bg-primary/5 inline-flex items-center justify-center transition-colors flex-shrink-0" aria-label="More options">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</div>
</div>
</div>

<div className="col-span-12 3xl:col-span-5 dash-panel p-5 flex flex-col gap-5">

<div className="flex items-start justify-between gap-3">
<div className="flex items-start gap-2.5">
<span className="dash-icon-chip">
<i className="ph ph-stethoscope"></i>
</span>
<div>
<h2 className="dash-title">{"Doctor Summary"}</h2>
<p className="dash-subtitle mt-0.5">{"Trusted expert providing quality care and patient treatment."}</p>
</div>
</div>
<span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full flex-shrink-0">{doctor.qualifications ?? "—"}</span>
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

<div className="bg-subtle rounded-xl p-3 flex flex-col gap-1.5">
<div className="flex items-center gap-1.5 text-[11px] text-muted">
<i className="ph-fill ph-diamond text-[8px] text-primary"></i>{"\n                      Education\n                    "}</div>
<p className="text-xl font-bold text-heading leading-none">{doctor.gpa ?? "—"}<span className="text-xs text-muted font-medium">{"GPA"}</span>
</p>
<p className="text-[10px] text-muted truncate">{doctor.education ?? "—"}</p>
<div className="h-1 rounded-full bg-border overflow-hidden mt-1">
<div className="h-full w-[78%] bg-primary rounded-full"></div>
</div>
<p className="text-[10px] text-primary">{doctor.id === "olivia-martin" ? "↑ 3.82 avg semester" : "—"}</p>
</div>

<div className="bg-subtle rounded-xl p-3 flex flex-col gap-1.5">
<div className="flex items-center gap-1.5 text-[11px] text-muted">
<i className="ph-fill ph-diamond text-[8px] text-warning"></i>{"\n                      Experience\n                    "}</div>
<p className="text-xl font-bold text-heading leading-none">{doctor.experience ?? "—"}<span className="text-xs text-muted font-medium">{"Years"}</span>
</p>
<p className="text-[10px] text-muted truncate">{doctor.treatmentSummary ?? "—"}</p>
<div className="h-1 rounded-full bg-border overflow-hidden mt-1">
<div className="h-full w-[60%] bg-warning rounded-full"></div>
</div>
<p className="text-[10px] text-warning">{doctor.id === "olivia-martin" ? "↑ 55.8% performance" : "—"}</p>
</div>

<div className="bg-subtle rounded-xl p-3 flex flex-col gap-1.5">
<div className="flex items-center gap-1.5 text-[11px] text-muted">
<i className="ph-fill ph-diamond text-[8px] text-info"></i>{"\n                      Rating\n                    "}</div>
<p className="text-xl font-bold text-heading leading-none">{doctor.rating ?? "—"}<span className="text-xs text-muted font-medium">{"/5.0"}</span>
</p>
<p className="text-[10px] text-muted truncate">{"Average patient rating"}</p>
<div className="h-1 rounded-full bg-border overflow-hidden mt-1">
<div className="h-full w-[96%] bg-info rounded-full"></div>
</div>
<p className="text-[10px] text-info">{doctor.id === "olivia-martin" ? "↑ 96% satisfaction" : "—"}</p>
</div>
</div>

<div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-subtle">
<div className="flex items-center gap-2">
<span className="w-7 h-7 rounded-lg bg-primary-soft flex items-center justify-center flex-shrink-0">
<i className="ph ph-hospital text-primary text-xs"></i>
</span>
<div>
<p className="text-[10px] text-faint">{"Department"}</p>
<p className="text-xs font-semibold text-heading">{doctor.department ?? "—"}</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
<i className="ph ph-currency-dollar text-warning text-xs"></i>
</span>
<div>
<p className="text-[10px] text-faint">{"Consultation Fee"}</p>
<p className="text-xs font-semibold text-heading">{doctor.fee ?? "—"}</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="w-7 h-7 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
<i className="ph ph-calendar-blank text-info text-xs"></i>
</span>
<div>
<p className="text-[10px] text-faint">{"Joined"}</p>
<p className="text-xs font-semibold text-heading">{doctor.joined ?? "—"}</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0">
<i className="ph ph-heartbeat text-danger text-xs"></i>
</span>
<div>
<p className="text-[10px] text-faint">{"Specialty"}</p>
<p className="text-xs font-semibold text-heading">{doctor.specialty ?? "—"}</p>
</div>
</div>
</div>
</div>
</div>

<div className="dash-panel p-0 overflow-hidden">

<div className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-5 border-b border-border-subtle">
<div className="flex items-center gap-2.5">
<span className="dash-icon-chip">
<i className="ph ph-users-three"></i>
</span>
<div>
<h2 className="dash-title">{"Patient Treatment"}</h2>
<p className="dash-subtitle mt-0.5">{"Sample treatment records"}</p>
</div>
</div>
<div className="flex items-center gap-2 flex-shrink-0">

<div className="relative hidden sm:block">
<i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none"></i>
<input type="text" placeholder="Search patients…" className="h-9 w-44 pl-9 pr-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors" aria-label="Search treatments" value={search} onChange={e => {setSearch(e.target.value);setPage(0);}} />
</div>
<button type="button" className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-strong text-on-primary text-xs font-medium flex items-center gap-1.5 transition-colors">
<i className="ph ph-plus text-sm"></i>{"\n                    Schedule\n                  "}</button>
</div>
</div>

<div className="overflow-x-auto">
<table className="w-full min-w-[860px] text-sm">
<thead>
<tr className="text-left text-[11px] font-semibold text-muted bg-subtle border-b border-border-subtle">
<th className="px-4 py-3 rounded-none">
<button type="button" className="inline-flex items-center gap-1 hover:text-text transition-colors">{"\n                          Date | Time\n                          "}<span className="inline-flex flex-col leading-none text-faint">
<i className="ph-fill ph-caret-up text-[7px]"></i>
<i className="ph-fill ph-caret-down text-[7px]"></i>
</span>
</button>
</th>
<th className="px-4 py-3">
<button type="button" className="inline-flex items-center gap-1 hover:text-text transition-colors">{"\n                          Patient\n                          "}<span className="inline-flex flex-col leading-none text-faint">
<i className="ph-fill ph-caret-up text-[7px]"></i>
<i className="ph-fill ph-caret-down text-[7px]"></i>
</span>
</button>
</th>
<th className="px-4 py-3">
<button type="button" className="inline-flex items-center gap-1 hover:text-text transition-colors">{"\n                          Condition\n                          "}<span className="inline-flex flex-col leading-none text-faint">
<i className="ph-fill ph-caret-up text-[7px]"></i>
<i className="ph-fill ph-caret-down text-[7px]"></i>
</span>
</button>
</th>
<th className="px-4 py-3">
<button type="button" className="inline-flex items-center gap-1 hover:text-text transition-colors">{"\n                          Treatment Plan\n                          "}<span className="inline-flex flex-col leading-none text-faint">
<i className="ph-fill ph-caret-up text-[7px]"></i>
<i className="ph-fill ph-caret-down text-[7px]"></i>
</span>
</button>
</th>
<th className="px-4 py-3">
<button type="button" className="inline-flex items-center gap-1 hover:text-text transition-colors">{"\n                          Status\n                          "}<span className="inline-flex flex-col leading-none text-faint">
<i className="ph-fill ph-caret-up text-[7px]"></i>
<i className="ph-fill ph-caret-down text-[7px]"></i>
</span>
</button>
</th>
<th className="px-4 py-3 text-right">{"Action"}</th>
</tr>
</thead>
<TreatmentRows rows={[{text:"22 Apr, 25 06:42 am Jane Cooper ID #PT-0012 Arrhythmia Medication + Monitoring Scheduled",content:(<tr className="hover:bg-primary/[0.02] transition-colors group">
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<p className="text-text font-medium text-[13px]">{"22 Apr, 25"}</p>
<p className="text-[11px] text-faint">{"06:42 am"}</p>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-2.5">
<img src="/assets/images/user1.png" className="w-8 h-8 rounded-xl object-cover ring-1 ring-border" alt="" />
<div>
<p className="text-[13px] font-medium text-text">{"Jane Cooper"}</p>
<p className="text-[10px] text-faint">{"ID #PT-0012"}</p>
</div>
</div>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Arrhythmia"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Medication + Monitoring"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-danger/30 text-danger bg-danger-soft">
<span className="w-1.5 h-1.5 rounded-full bg-danger inline-block"></span>{"Scheduled\n                        "}</span>
</td>
<td className={"px-4  text-right" + (dense ? " py-2" : " py-4")}>
<button type="button" className="row-btn w-7 h-7 rounded-lg flex items-center justify-center text-faint hover:text-text hover:bg-subtle transition-colors ml-auto opacity-0 group-hover:opacity-100" aria-label="Row actions" aria-haspopup="menu" aria-expanded="false">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"12 Feb, 25 07:38 am Ronald Richards ID #PT-0058 Coronary Artery Disease Angioplasty Completed",content:(<tr className="hover:bg-primary/[0.02] transition-colors group">
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<p className="text-text font-medium text-[13px]">{"12 Feb, 25"}</p>
<p className="text-[11px] text-faint">{"07:38 am"}</p>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-2.5">
<img src="/assets/images/user2.png" className="w-8 h-8 rounded-xl object-cover ring-1 ring-border" alt="" />
<div>
<p className="text-[13px] font-medium text-text">{"Ronald Richards"}</p>
<p className="text-[10px] text-faint">{"ID #PT-0058"}</p>
</div>
</div>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Coronary Artery Disease"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Angioplasty"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">
<span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>{"Completed\n                        "}</span>
</td>
<td className={"px-4  text-right" + (dense ? " py-2" : " py-4")}>
<button type="button" className="row-btn w-7 h-7 rounded-lg flex items-center justify-center text-faint hover:text-text hover:bg-subtle transition-colors ml-auto opacity-0 group-hover:opacity-100" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"07 Dec, 24 01:34 pm Bessie Cooper ID #PT-0103 Hypertension Lifestyle + Drugs Scheduled",content:(<tr className="bg-primary-soft/30 hover:bg-primary-soft/50 transition-colors group">
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<p className="text-text font-medium text-[13px]">{"07 Dec, 24"}</p>
<p className="text-[11px] text-faint">{"01:34 pm"}</p>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-2.5">
<img src="/assets/images/user3.png" className="w-8 h-8 rounded-xl object-cover ring-1 ring-border" alt="" />
<div>
<p className="text-[13px] font-medium text-text">{"Bessie Cooper"}</p>
<p className="text-[10px] text-faint">{"ID #PT-0103"}</p>
</div>
</div>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Hypertension"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Lifestyle + Drugs"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-danger/30 text-danger bg-danger-soft">
<span className="w-1.5 h-1.5 rounded-full bg-danger inline-block"></span>{"Scheduled\n                        "}</span>
</td>
<td className={"px-4  text-right" + (dense ? " py-2" : " py-4")}>
<button type="button" className="row-btn w-7 h-7 rounded-lg flex items-center justify-center text-faint hover:text-text hover:bg-subtle transition-colors ml-auto opacity-0 group-hover:opacity-100" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"22 Nov, 24 01:55 pm Courtney Henry ID #PT-0077 Valve Disorder Surgery Ongoing",content:(<tr className="hover:bg-primary/[0.02] transition-colors group">
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<p className="text-text font-medium text-[13px]">{"22 Nov, 24"}</p>
<p className="text-[11px] text-faint">{"01:55 pm"}</p>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-2.5">
<img src="/assets/images/user4.png" className="w-8 h-8 rounded-xl object-cover ring-1 ring-border" alt="" />
<div>
<p className="text-[13px] font-medium text-text">{"Courtney Henry"}</p>
<p className="text-[10px] text-faint">{"ID #PT-0077"}</p>
</div>
</div>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Valve Disorder"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Surgery"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-warning/30 text-warning bg-warning-soft">
<span className="w-1.5 h-1.5 rounded-full bg-warning inline-block"></span>{"Ongoing\n                        "}</span>
</td>
<td className={"px-4  text-right" + (dense ? " py-2" : " py-4")}>
<button type="button" className="row-btn w-7 h-7 rounded-lg flex items-center justify-center text-faint hover:text-text hover:bg-subtle transition-colors ml-auto opacity-0 group-hover:opacity-100" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"17 Sep, 24 05:36 pm Arlene McCoy ID #PT-0209 Heart Murmur Echocardiogram Completed",content:(<tr className="hover:bg-primary/[0.02] transition-colors group">
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<p className="text-text font-medium text-[13px]">{"17 Sep, 24"}</p>
<p className="text-[11px] text-faint">{"05:36 pm"}</p>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-2.5">
<img src="/assets/images/user5.png" className="w-8 h-8 rounded-xl object-cover ring-1 ring-border" alt="" />
<div>
<p className="text-[13px] font-medium text-text">{"Arlene McCoy"}</p>
<p className="text-[10px] text-faint">{"ID #PT-0209"}</p>
</div>
</div>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Heart Murmur"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Echocardiogram"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-primary/30 text-primary bg-primary-soft">
<span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>{"Completed\n                        "}</span>
</td>
<td className={"px-4  text-right" + (dense ? " py-2" : " py-4")}>
<button type="button" className="row-btn w-7 h-7 rounded-lg flex items-center justify-center text-faint hover:text-text hover:bg-subtle transition-colors ml-auto opacity-0 group-hover:opacity-100" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"13 Aug, 24 04:02 am Brooklyn Simmons ID #PT-0318 Arrhythmia Medication + Monitoring Ongoing",content:(<tr className="hover:bg-primary/[0.02] transition-colors group">
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<p className="text-text font-medium text-[13px]">{"13 Aug, 24"}</p>
<p className="text-[11px] text-faint">{"04:02 am"}</p>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-2.5">
<img src="/assets/images/user6.png" className="w-8 h-8 rounded-xl object-cover ring-1 ring-border" alt="" />
<div>
<p className="text-[13px] font-medium text-text">{"Brooklyn Simmons"}</p>
<p className="text-[10px] text-faint">{"ID #PT-0318"}</p>
</div>
</div>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Arrhythmia"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Medication + Monitoring"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-warning/30 text-warning bg-warning-soft">
<span className="w-1.5 h-1.5 rounded-full bg-warning inline-block"></span>{"Ongoing\n                        "}</span>
</td>
<td className={"px-4  text-right" + (dense ? " py-2" : " py-4")}>
<button type="button" className="row-btn w-7 h-7 rounded-lg flex items-center justify-center text-faint hover:text-text hover:bg-subtle transition-colors ml-auto opacity-0 group-hover:opacity-100" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"13 Aug, 24 04:02 am Darrell Steward ID #PT-0441 Arrhythmia Medication + Monitoring Ongoing",content:(<tr className="hover:bg-primary/[0.02] transition-colors group">
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<p className="text-text font-medium text-[13px]">{"13 Aug, 24"}</p>
<p className="text-[11px] text-faint">{"04:02 am"}</p>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-2.5">
<img src="/assets/images/user7.png" className="w-8 h-8 rounded-xl object-cover ring-1 ring-border" alt="" />
<div>
<p className="text-[13px] font-medium text-text">{"Darrell Steward"}</p>
<p className="text-[10px] text-faint">{"ID #PT-0441"}</p>
</div>
</div>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Arrhythmia"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Medication + Monitoring"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-warning/30 text-warning bg-warning-soft">
<span className="w-1.5 h-1.5 rounded-full bg-warning inline-block"></span>{"Ongoing\n                        "}</span>
</td>
<td className={"px-4  text-right" + (dense ? " py-2" : " py-4")}>
<button type="button" className="row-btn w-7 h-7 rounded-lg flex items-center justify-center text-faint hover:text-text hover:bg-subtle transition-colors ml-auto opacity-0 group-hover:opacity-100" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)},{text:"01 Jun, 24 02:02 am Eleanor Pena ID #PT-0512 Hypertension Angioplasty Follow-up",content:(<tr className="hover:bg-primary/[0.02] transition-colors group">
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<p className="text-text font-medium text-[13px]">{"01 Jun, 24"}</p>
<p className="text-[11px] text-faint">{"02:02 am"}</p>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<div className="flex items-center gap-2.5">
<img src="/assets/images/user8.png" className="w-8 h-8 rounded-xl object-cover ring-1 ring-border" alt="" />
<div>
<p className="text-[13px] font-medium text-text">{"Eleanor Pena"}</p>
<p className="text-[10px] text-faint">{"ID #PT-0512"}</p>
</div>
</div>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Hypertension"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="text-[13px] text-text">{"Angioplasty"}</span>
</td>
<td className={"px-4 " + (dense ? " py-2" : " py-4")}>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-info/30 text-info bg-info-soft">
<span className="w-1.5 h-1.5 rounded-full bg-info inline-block"></span>{"Follow-up\n                        "}</span>
</td>
<td className={"px-4  text-right" + (dense ? " py-2" : " py-4")}>
<button type="button" className="row-btn w-7 h-7 rounded-lg flex items-center justify-center text-faint hover:text-text hover:bg-subtle transition-colors ml-auto opacity-0 group-hover:opacity-100" aria-label="Row actions">
<i className="ph ph-dots-three-vertical text-sm"></i>
</button>
</td>
</tr>)}]} search={search} page={page} pageSize={pageSize} />
</table>
</div>

<div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-5 py-3.5 border-t border-border-subtle bg-subtle/40">
<label className="inline-flex items-center gap-2 cursor-pointer">
<span className="relative inline-flex h-5 w-9">
<input id="dense-toggle" type="checkbox" className="peer sr-only" checked={dense} onChange={e => setDense(e.target.checked)} />
<span className="absolute inset-0 rounded-full bg-border peer-checked:bg-primary transition-colors"></span>
<span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-w1 peer-checked:translate-x-4 transition-transform"></span>
</span>
<span className="text-xs text-text">{"Dense"}</span>
</label>
<div className="flex flex-wrap items-center gap-3 text-xs text-muted">
<span className="flex flex-wrap items-center gap-2">{"\n                    Rows per page:\n                    "}<span className="relative">
<select className="h-8 pl-2.5 pr-7 rounded-lg bg-w1 border border-border text-xs text-text appearance-none focus:outline-none focus:border-primary transition-colors" aria-label="Rows per page" value={pageSize} onChange={e => {setPageSize(Number(e.target.value));setPage(0);}}>
<option value={8}>{"08"}</option>
<option value={16}>{"16"}</option>
<option value={32}>{"32"}</option>
</select>
<i className="ph ph-caret-down absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-faint pointer-events-none"></i>
</span>
</span>
<span className="font-medium text-text">{recordCount ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize,recordCount)}</span>
<span className="text-faint">of {recordCount}</span>
<div className="flex items-center gap-1">
<button aria-label="Previous" className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors" disabled={page === 0} onClick={() => setPage(page - 1)}>
<i className="ph ph-caret-left text-xs"></i>
</button>
<button aria-label="Next" className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors" disabled={(page + 1) * pageSize >= recordCount} onClick={() => setPage(page + 1)}>
<i className="ph ph-caret-right text-xs"></i>
</button>
</div>
</div>
</div>
</div>
</section>
</div>
</div>
</main>{rowMenu&&<div data-treatment-menu role="dialog" aria-label="Treatment details" className="fixed z-50 w-[280px] bg-w1 border border-border rounded-xl p-4 shadow-lg text-sm" style={{left:rowMenu.left,top:rowMenu.top}}><button aria-label="Close treatment details" className="float-right ml-2" onClick={()=>setRowMenu(null)}>×</button>{rowMenu.text}</div>}
{notice&&<div role="status" className="fixed bottom-4 right-4 z-50 max-w-sm bg-w1 border border-border rounded-xl p-4 shadow-lg text-sm"><button aria-label="Dismiss message" className="float-right ml-3" onClick={()=>setNotice('')}>×</button>{notice}</div>}
</div></DashboardShell>;
}
