'use client';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import DashboardShell from '../DashboardShell';
import DoctorCard from './DoctorCard';
import initialDoctors from './doctors-data.json';
export default function DoctorsPage() {
 const router=useRouter();
 const [doctors,setDoctors]=useState(initialDoctors);
 useEffect(()=>{try {const saved=JSON.parse(sessionStorage.getItem('priopulse-added-doctors')||'[]');if(Array.isArray(saved))setDoctors([...saved,...initialDoctors]);}catch{}},[]);
 const [search,setSearch]=useState('');
 const [filter,setFilter]=useState('all');
 const [sort,setSort]=useState('Name A–Z');
 const [page,setPage]=useState(0);
 const [pageSize,setPageSize]=useState(18);
 const [modalOpen,setModalOpen]=useState(false);
 const [avatar,setAvatar]=useState('');
 const [notice,setNotice]=useState('');
 const filteredDoctors=doctors.filter(doctor => (filter==='all'||doctor.specialty.toLowerCase().includes(filter)) && `${doctor.name} ${doctor.specialty}`.toLowerCase().includes(search.toLowerCase().trim())).sort((a,b)=>sort==='Rating'?(b.rating??-1)-(a.rating??-1):sort==='Newest'?doctors.indexOf(a)-doctors.indexOf(b):a.name.localeCompare(b.name));
 const visibleDoctors=filteredDoctors.slice(page*pageSize,(page+1)*pageSize);
 function closeModal(){setModalOpen(false);setAvatar('');document.getElementById('add-doctor-form')?.reset();}
 useEffect(()=>{
  if(!modalOpen)return;
  const previous=document.activeElement;
  document.body.style.overflow='hidden';
  const dialog=document.getElementById('add-doctor-modal');
  const focusables=()=>[...dialog.querySelectorAll('button,input,select,textarea')].filter(el=>!el.disabled&&el.getClientRects().length);
  focusables()[0]?.focus();
  const keydown=e=>{
   if(e.key==='Escape'){closeModal();}
   if(e.key==='Tab'){const els=focusables(),first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  };
  document.addEventListener('keydown',keydown);
  return ()=>{document.body.style.overflow='';document.removeEventListener('keydown',keydown);previous?.focus();};
 },[modalOpen]);
 function uploadAvatar(e){
  const file=e.target.files?.[0];if(!file)return;
  if(!['image/png','image/jpeg','image/gif'].includes(file.type)||file.size>2*1024*1024){setNotice('Choose a JPG, PNG or GIF image under 2MB.');e.target.value='';return;}
  const reader=new FileReader();reader.onload=()=>setAvatar(String(reader.result));reader.readAsDataURL(file);
 }
 function addDoctor(e){
  e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));
  const doctor={...data,id:crypto.randomUUID(),name:data.name.trim(),image:avatar||'/assets/images/doctor.png',rating:null,patients:'0',experience:'—',status:'Active',employment:'—'};
  if(!doctor.name){setNotice('Enter a doctor name.');return;}
  setDoctors(current=>[doctor,...current]);try {const saved=JSON.parse(sessionStorage.getItem('priopulse-added-doctors')||'[]');sessionStorage.setItem('priopulse-added-doctors',JSON.stringify([doctor,...saved]));}catch{setNotice('Doctor added, but session storage is unavailable.');}setFilter('all');setSearch('');setSort('Newest');setPage(0);closeModal();setNotice(`${doctor.name} added for this session.`);
 }
 return <DashboardShell search={search} setSearch={setSearch} setPage={setPage} searchLabel="Global doctor search" searchPlaceholder="Search doctors or specialties…">
<main id="main-content" className="pt-16 min-h-dvh ml-0 lg:ml-64 transition-all duration-300">
<div className="p-4 lg:p-6 space-y-5">

<div className="flex flex-wrap items-start justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center flex-shrink-0">
<i className="ph ph-stethoscope text-primary text-lg"></i>
</div>
<div>
<h1 className="text-lg font-semibold text-heading leading-tight">{"\n                Doctors\n              "}</h1>
<p className="text-xs text-faint mt-0.5">{"\n                Manage your medical staff and their information\n              "}</p>
</div>
</div>
<div className="flex flex-wrap items-center gap-2">
<a className="h-9 px-4 rounded-xl border border-border text-text hover:border-primary/50 hover:text-primary hover:bg-primary/5 text-sm font-medium flex items-center gap-2 transition-colors" href="#">
<i className="ph ph-calendar-blank text-base"></i>
<span className="hidden sm:inline">{"Schedule"}</span>
</a>
<button id="add-doctor-btn" type="button" className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-strong text-on-primary text-sm font-medium flex items-center gap-2 transition-colors" onClick={() => setModalOpen(true)}>
<i className="ph ph-plus text-base"></i>{"\n              Add Doctor\n            "}</button>
</div>
</div>

<div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

<div className="dash-panel p-4 flex flex-col gap-3">
<div className="flex items-center justify-between">
<span className="text-xs font-medium text-[var(--color-muted)]">{"Total Doctors"}</span>
<button className="text-[var(--color-faint)] hover:text-[var(--color-muted)] transition-colors">
<i className="ph ph-dots-three-vertical text-base"></i>
</button>
</div>
<div className="flex items-end gap-2">
<p className="text-2xl font-bold text-[var(--color-heading)] leading-none">{"\n                248\n              "}</p>
<span className="dash-trend dash-trend-up mb-0.5">
<i className="ph ph-trend-up text-xs"></i>{"4%\n              "}</span>
</div>
<div className="flex items-end gap-0.5 h-8">
<div className="flex-1 rounded-sm bg-[var(--color-primary)] opacity-30" style={{"height": "40%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-primary)] opacity-40" style={{"height": "55%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-primary)] opacity-50" style={{"height": "45%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-primary)] opacity-60" style={{"height": "70%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-primary)] opacity-50" style={{"height": "60%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-primary)] opacity-70" style={{"height": "80%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-primary)] opacity-60" style={{"height": "65%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-primary)]" style={{"height": "100%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-primary)] opacity-80" style={{"height": "85%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-primary)] opacity-70" style={{"height": "75%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-primary)] opacity-90" style={{"height": "90%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-primary)]" style={{"height": "100%"}}></div>
</div>
<p className="text-[10px] text-[var(--color-faint)]">{"VS last week"}</p>
</div>

<div className="dash-panel p-4 flex flex-col gap-3">
<div className="flex items-center justify-between">
<span className="text-xs font-medium text-[var(--color-muted)]">{"Active Doctors"}</span>
<button className="text-[var(--color-faint)] hover:text-[var(--color-muted)] transition-colors">
<i className="ph ph-dots-three-vertical text-base"></i>
</button>
</div>
<div className="flex items-end gap-2">
<p className="text-2xl font-bold text-[var(--color-heading)] leading-none">{"\n                210\n              "}</p>
<span className="dash-trend dash-trend-up mb-0.5">
<i className="ph ph-trend-up text-xs"></i>{"2%\n              "}</span>
</div>
<div className="flex items-end gap-0.5 h-8">
<div className="flex-1 rounded-sm bg-[var(--color-info)] opacity-30" style={{"height": "50%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-info)] opacity-40" style={{"height": "60%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-info)] opacity-50" style={{"height": "40%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-info)] opacity-60" style={{"height": "75%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-info)] opacity-50" style={{"height": "55%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-info)] opacity-70" style={{"height": "85%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-info)] opacity-60" style={{"height": "70%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-info)]" style={{"height": "100%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-info)] opacity-80" style={{"height": "90%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-info)] opacity-70" style={{"height": "80%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-info)] opacity-90" style={{"height": "95%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-info)]" style={{"height": "100%"}}></div>
</div>
<p className="text-[10px] text-[var(--color-faint)]">{"VS last week"}</p>
</div>

<div className="dash-panel p-4 flex flex-col gap-3">
<div className="flex items-center justify-between">
<span className="text-xs font-medium text-[var(--color-muted)]">{"On Leave"}</span>
<button className="text-[var(--color-faint)] hover:text-[var(--color-muted)] transition-colors">
<i className="ph ph-dots-three-vertical text-base"></i>
</button>
</div>
<div className="flex items-end gap-2">
<p className="text-2xl font-bold text-[var(--color-heading)] leading-none">{"\n                24\n              "}</p>
<span className="dash-trend dash-trend-down mb-0.5">
<i className="ph ph-trend-down text-xs"></i>{"8%\n              "}</span>
</div>
<div className="flex items-end gap-0.5 h-8">
<div className="flex-1 rounded-sm bg-[var(--color-warning)] opacity-40" style={{"height": "60%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-warning)]" style={{"height": "100%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-warning)] opacity-60" style={{"height": "70%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-warning)] opacity-50" style={{"height": "50%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-warning)] opacity-80" style={{"height": "85%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-warning)] opacity-40" style={{"height": "45%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-warning)] opacity-70" style={{"height": "80%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-warning)] opacity-60" style={{"height": "65%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-warning)]" style={{"height": "100%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-warning)] opacity-50" style={{"height": "55%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-warning)] opacity-80" style={{"height": "90%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-warning)] opacity-70" style={{"height": "75%"}}></div>
</div>
<p className="text-[10px] text-[var(--color-faint)]">{"VS last week"}</p>
</div>

<div className="dash-panel p-4 flex flex-col gap-3">
<div className="flex items-center justify-between">
<span className="text-xs font-medium text-[var(--color-muted)]">{"Departments"}</span>
<button className="text-[var(--color-faint)] hover:text-[var(--color-muted)] transition-colors">
<i className="ph ph-dots-three-vertical text-base"></i>
</button>
</div>
<div className="flex items-end gap-2">
<p className="text-2xl font-bold text-[var(--color-heading)] leading-none">{"\n                14\n              "}</p>
<span className="dash-trend dash-trend-up mb-0.5">
<i className="ph ph-trend-up text-xs"></i>{"9%\n              "}</span>
</div>
<div className="flex items-end gap-0.5 h-8">
<div className="flex-1 rounded-sm bg-[var(--color-danger)] opacity-30" style={{"height": "45%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-danger)] opacity-50" style={{"height": "65%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-danger)] opacity-40" style={{"height": "50%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-danger)] opacity-70" style={{"height": "80%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-danger)] opacity-60" style={{"height": "70%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-danger)]" style={{"height": "100%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-danger)] opacity-50" style={{"height": "60%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-danger)] opacity-80" style={{"height": "90%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-danger)] opacity-60" style={{"height": "75%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-danger)]" style={{"height": "100%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-danger)] opacity-70" style={{"height": "85%"}}></div>
<div className="flex-1 rounded-sm bg-[var(--color-danger)] opacity-90" style={{"height": "95%"}}></div>
</div>
<p className="text-[10px] text-[var(--color-faint)]">{"VS last week"}</p>
</div>
</div>

<div className="dash-panel p-0 overflow-hidden">

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 md:p-5 border-b border-border-subtle">

<div className="flex items-center gap-1 overflow-x-auto pb-0.5 min-w-0" style={{"scrollbarWidth": "none"}}>
<button data-filter="all" onClick={() => {setFilter("all");setPage(0);}} aria-pressed={filter === "all"} className={"filter-tab flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors " + (filter === "all" ? "active bg-primary text-on-primary" : "text-muted hover:text-text hover:bg-subtle")}>{"\n                All\n              "}</button>
<button data-filter="cardiology" onClick={() => {setFilter("cardiology");setPage(0);}} aria-pressed={filter === "cardiology"} className={"filter-tab flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors " + (filter === "cardiology" ? "active bg-primary text-on-primary" : "text-muted hover:text-text hover:bg-subtle")}>{"\n                Cardiology\n              "}</button>
<button data-filter="surgery" onClick={() => {setFilter("surgery");setPage(0);}} aria-pressed={filter === "surgery"} className={"filter-tab flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors " + (filter === "surgery" ? "active bg-primary text-on-primary" : "text-muted hover:text-text hover:bg-subtle")}>{"\n                Surgery\n              "}</button>
<button data-filter="orthopedics" onClick={() => {setFilter("orthopedics");setPage(0);}} aria-pressed={filter === "orthopedics"} className={"filter-tab flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors " + (filter === "orthopedics" ? "active bg-primary text-on-primary" : "text-muted hover:text-text hover:bg-subtle")}>{"\n                Orthopedics\n              "}</button>
<button data-filter="radiology" onClick={() => {setFilter("radiology");setPage(0);}} aria-pressed={filter === "radiology"} className={"filter-tab flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors " + (filter === "radiology" ? "active bg-primary text-on-primary" : "text-muted hover:text-text hover:bg-subtle")}>{"\n                Radiology\n              "}</button>
<button data-filter="dermatology" onClick={() => {setFilter("dermatology");setPage(0);}} aria-pressed={filter === "dermatology"} className={"filter-tab flex-shrink-0 h-8 px-3.5 rounded-lg text-xs font-medium transition-colors " + (filter === "dermatology" ? "active bg-primary text-on-primary" : "text-muted hover:text-text hover:bg-subtle")}>{"\n                Dermatology\n              "}</button>
</div>

<div className="flex flex-wrap! items-center justify-between gap-2 flex-shrink-0">
<div className="relative max-sm:w-full">
<i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none"></i>
<input id="doctor-search" type="text" placeholder="Search doctors…" className="h-9 w-full md:w-52 pl-9 pr-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors" value={search} aria-label="Search doctors" onChange={e => {setSearch(e.target.value);setPage(0);}} />
</div>
<div className="flex items-center gap-2 text-xs text-muted flex-shrink-0">
<span>{"Sort:"}</span>
<div className="relative">
<select className="h-9 pl-2.5 pr-7 rounded-xl bg-subtle border border-transparent text-xs text-text focus:outline-none focus:border-primary/40 appearance-none transition-colors" value={sort} aria-label="Sort doctors" onChange={e => {setSort(e.target.value);setPage(0);}}>
<option>{"Name A–Z"}</option>
<option>{"Rating"}</option>
<option>{"Newest"}</option>
</select>
<i className="ph ph-caret-down absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-faint pointer-events-none"></i>
</div>
</div>
</div>
</div>

<div id="doctors-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-px bg-border-subtle">{visibleDoctors.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} onSelect={doctor => router.push('/doctor-details?id=' + encodeURIComponent(doctor.id))} onAction={setNotice} />)}{!visibleDoctors.length && <p className="col-span-full bg-w1 p-8 text-center text-muted">No doctors found.</p>}</div>

<div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-5 py-4 border-t border-border-subtle">
<div className="flex items-center gap-2 text-xs text-muted">
<span>{"Rows per page:"}</span>
<div className="relative">
<select id="rows-per-page" className="h-8 pl-2.5 pr-7 rounded-lg bg-subtle border border-transparent text-xs text-text focus:outline-none focus:border-primary/40 appearance-none transition-colors" value={pageSize} aria-label="Rows per page" onChange={e => {setPageSize(Number(e.target.value));setPage(0);}}>
<option>{"18"}</option>
<option>{"24"}</option>
<option>{"36"}</option>
</select>
<i className="ph ph-caret-down absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-faint pointer-events-none"></i>
</div>
</div>
<div className="flex flex-wrap items-center gap-1.5">
<span id="page-range" className="text-xs text-muted mr-1">{filteredDoctors.length ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, filteredDoctors.length)} of {filteredDoctors.length}</span>
<button aria-label="Previous page" className="w-8 h-8 rounded-lg border border-border text-muted hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center" disabled={page === 0} onClick={() => setPage(page - 1)}>
<i className="ph ph-caret-left text-xs"></i>
</button>





<button aria-label="Next page" className="w-8 h-8 rounded-lg border border-border text-muted hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center" disabled={(page + 1) * pageSize >= filteredDoctors.length} onClick={() => setPage(page + 1)}>
<i className="ph ph-caret-right text-xs"></i>
</button>
</div>
</div>
</div>
</div>
</main>
<div id="add-doctor-modal" role="dialog" aria-modal="true" aria-labelledby="add-doctor-title" className={"fixed inset-0 z-50 items-center justify-center p-4 " + (modalOpen ? "flex" : "hidden")} aria-hidden={!modalOpen}>
<div id="add-doctor-backdrop" className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={closeModal}></div>
<div className="relative w-full max-w-xl bg-w1 rounded-2xl border border-border shadow-2xl max-h-[90dvh] overflow-y-auto">

<div className="flex items-center justify-between px-5 py-4 border-b border-border">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center">
<i className="ph ph-user-plus text-primary text-sm"></i>
</div>
<div>
<h3 id="add-doctor-title" className="text-sm font-semibold text-heading leading-tight">{"\n                Add New Doctor\n              "}</h3>
<p className="text-[11px] text-faint">{"Fill in the details below"}</p>
</div>
</div>
<button id="add-doctor-close" type="button" aria-label="Close" className="w-8 h-8 rounded-lg flex items-center justify-center text-faint hover:bg-subtle hover:text-text transition-colors" onClick={closeModal}>
<i className="ph ph-x text-base"></i>
</button>
</div>

<form id="add-doctor-form" className="px-5 pb-5 space-y-4" onSubmit={addDoctor}>
<h4 className="text-xs font-semibold text-muted uppercase tracking-wide">{"\n            Personal Information\n          "}</h4>

<div className="flex items-center gap-4 p-4 rounded-xl bg-subtle border border-border">
<div id="avatar-preview" className="w-14 h-14 rounded-xl bg-w1 border border-border overflow-hidden flex items-center justify-center text-faint flex-shrink-0">
<i id="avatar-icon" className={avatar ? "hidden" : "ph ph-user-circle text-2xl"}></i>
<img id="avatar-image" alt="Avatar preview" src={avatar || undefined} className={avatar ? "w-full h-full object-cover" : "hidden"} />
</div>
<div className="flex-1 min-w-0">
<input id="avatar-file" type="file" accept="image/png,image/jpeg,image/gif" className="hidden" onChange={uploadAvatar} aria-label="Doctor photo" />
<div className="flex items-center gap-3 text-sm font-medium mb-1">
<button id="avatar-upload-btn" type="button" className="text-primary hover:text-primary-strong transition-colors text-xs font-semibold" onClick={() => document.getElementById('avatar-file').click()}>{"\n                  Upload Photo\n                "}</button>
<span className="text-border text-xs">{"|"}</span>
<button id="avatar-delete-btn" type="button" className="text-danger hover:opacity-80 transition-opacity text-xs font-semibold" onClick={() => setAvatar('')}>{"\n                  Remove\n                "}</button>
</div>
<p className="text-[11px] text-faint">{"JPG, PNG or GIF. Max 2MB."}</p>
</div>
</div>

<div>
<label className="block text-xs font-medium text-text mb-1.5">{"Doctor Name "}<span className="text-danger">{"*"}</span></label>
<input type="text" required={true} placeholder="Enter full name…" className="w-full h-10 px-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="name" aria-label="Doctor name" />
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<div>
<label className="block text-xs font-medium text-text mb-1.5">{"Gender "}<span className="text-danger">{"*"}</span></label>
<div className="relative">
<select required={true} className="w-full h-10 pl-3 pr-9 rounded-xl bg-subtle border border-transparent text-sm text-text focus:outline-none focus:border-primary/50 focus:bg-w1 appearance-none transition-colors" name="gender" aria-label="Gender">
<option>{"Male"}</option>
<option>{"Female"}</option>
<option>{"Other"}</option>
</select>
<i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint pointer-events-none"></i>
</div>
</div>
<div>
<label className="block text-xs font-medium text-text mb-1.5">{"Specialty "}<span className="text-danger">{"*"}</span></label>
<div className="relative">
<select required={true} className="w-full h-10 pl-3 pr-9 rounded-xl bg-subtle border border-transparent text-sm text-text focus:outline-none focus:border-primary/50 focus:bg-w1 appearance-none transition-colors" name="specialty" aria-label="Specialty" defaultValue="">
<option value="" disabled={true}>{"Select specialty"}</option>
<option>{"Cardiology"}</option>
<option>{"Dermatology"}</option>
<option>{"Endocrinology"}</option>
<option>{"Family Medicine"}</option>
<option>{"Geriatrics"}</option>
<option>{"Neurology"}</option>
<option>{"Ophthalmology"}</option>
<option>{"Orthopedics"}</option>
<option>{"Plastic Surgery"}</option>
<option>{"Psychiatry"}</option>
<option>{"Pulmonology"}</option>
<option>{"Radiology"}</option>
<option>{"Rheumatology"}</option>
<option>{"Surgery"}</option>
<option>{"Urology"}</option>
</select>
<i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint pointer-events-none"></i>
</div>
</div>
</div>

<div>
<label className="block text-xs font-medium text-text mb-1.5">{"Date of Birth "}<span className="text-danger">{"*"}</span></label>
<div className="relative">
<input type="date" required={true} placeholder="Choose date" className="w-full h-10 px-3 pr-10 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="dob" aria-label="Date of birth" />
<i className="ph ph-calendar-blank absolute right-3 top-1/2 -translate-y-1/2 text-sm text-faint pointer-events-none"></i>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<div>
<label className="block text-xs font-medium text-text mb-1.5">{"Email Address "}<span className="text-danger">{"*"}</span></label>
<input type="email" required={true} placeholder="doctor@hospital.com" className="w-full h-10 px-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="email" aria-label="Email" />
</div>
<div>
<label className="block text-xs font-medium text-text mb-1.5">{"Phone Number "}<span className="text-danger">{"*"}</span></label>
<input type="tel" required={true} placeholder="+1 (555) 000-0000" className="w-full h-10 px-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="phone" aria-label="Phone" />
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
<div>
<label className="block text-xs font-medium text-text mb-1.5">{"City "}<span className="text-danger">{"*"}</span></label>
<input type="text" required={true} placeholder="City" className="w-full h-10 px-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="city" aria-label="City" />
</div>
<div>
<label className="block text-xs font-medium text-text mb-1.5">{"State "}<span className="text-danger">{"*"}</span></label>
<input type="text" required={true} placeholder="State" className="w-full h-10 px-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="state" aria-label="State" />
</div>
<div>
<label className="block text-xs font-medium text-text mb-1.5">{"Zip Code "}<span className="text-danger">{"*"}</span></label>
<input type="text" required={true} placeholder="00000" className="w-full h-10 px-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="zip" aria-label="Zip code" />
</div>
</div>

<div>
<label className="block text-xs font-medium text-text mb-1.5">{"Address"}</label>
<textarea rows="3" placeholder="Street address…" className="w-full px-3 py-2.5 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors resize-none" name="address" aria-label="Address"></textarea>
</div>

<div className="flex items-center gap-3 pt-1">
<button type="button" id="add-doctor-close-btn" className="flex-1 h-10 rounded-xl border border-border text-text hover:bg-subtle text-sm font-medium transition-colors" onClick={closeModal}>{"\n              Cancel\n            "}</button>
<button type="submit" className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary-strong text-on-primary text-sm font-semibold flex items-center justify-center gap-2 transition-colors">Add Doctor</button>
</div>
</form>
</div>
</div>{notice && <div role="status" className="fixed bottom-4 right-4 z-50 max-w-sm bg-w1 border border-border p-4 rounded-xl shadow-lg text-sm"><button aria-label="Dismiss message" onClick={()=>setNotice('')} className="float-right ml-3">×</button>{notice}</div>}
</DashboardShell>;
}
