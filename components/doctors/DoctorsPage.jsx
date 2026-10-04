'use client';
import {useEffect, useMemo, useState} from 'react';
import DashboardShell from '../DashboardShell';
import DoctorCard from './DoctorCard';
import {createDoctor, doctors as directory, formatDate, readAddedDoctors, saveAddedDoctor} from '../../lib/doctors';
import {useTodayIndex} from '../../lib/use-today-index';
import './doctors.css';

const STATUS_FILTERS = [
 {id:'all',label:'All',test:()=>true},
 {id:'active',label:'Active',test:doctor=>doctor.status==='Active'},
 {id:'leave',label:'On leave',test:doctor=>doctor.status==='On Leave'},
 {id:'part-time',label:'Part time',test:doctor=>doctor.employment==='Part Time'},
];
const SORTS = {
 name:{label:'Name A–Z',compare:(a,b)=>a.name.replace(/^Dr\.?\s+/,'').localeCompare(b.name.replace(/^Dr\.?\s+/,''))},
 experience:{label:'Most experienced',compare:(a,b)=>(b.experienceYears??-1)-(a.experienceYears??-1)},
 patients:{label:'Most patients',compare:(a,b)=>b.patients-a.patients},
 joined:{label:'Recently joined',compare:(a,b)=>String(b.joined).localeCompare(String(a.joined))},
};
const HEART_TEAMS=['Acute Cardiac Care','Cardiac Imaging','Cardiac Surgery','Electrophysiology','General Cardiology','Heart Failure','Interventional Cardiology','Preventive Cardiology'];

export default function DoctorsPage() {
 const todayIndex=useTodayIndex();
 const [doctors,setDoctors]=useState(directory);
 useEffect(()=>{const added=readAddedDoctors();if(added.length)setDoctors([...added,...directory]);},[]);
 const [search,setSearch]=useState('');
 const [status,setStatus]=useState('all');
 const [department,setDepartment]=useState('all');
 const [sort,setSort]=useState('name');
 const [page,setPage]=useState(0);
 const [pageSize,setPageSize]=useState(12);
 const [modalOpen,setModalOpen]=useState(false);
 const [avatar,setAvatar]=useState('');
 const [notice,setNotice]=useState('');

 const departments=useMemo(()=>{
  const counts=new Map();
  for(const doctor of doctors)counts.set(doctor.department,(counts.get(doctor.department)||0)+1);
  return [...counts].sort((a,b)=>a[0].localeCompare(b[0]));
 },[doctors]);
 const stats=useMemo(()=>{
  const active=doctors.filter(doctor=>doctor.status==='Active');
  const onLeave=doctors.filter(doctor=>doctor.status==='On Leave');
  const experienced=doctors.filter(doctor=>doctor.experienceYears!==null);
  const nextReturn=onLeave.map(doctor=>doctor.leaveUntil).filter(Boolean).sort()[0];
  const largest=departments.reduce((best,entry)=>entry[1]>best[1]?entry:best,['—',0]);
  return {
   total:doctors.length,
   avgExperience:experienced.length?Math.round(experienced.reduce((sum,doctor)=>sum+doctor.experienceYears,0)/experienced.length):'—',
   active:active.length,
   partTime:doctors.filter(doctor=>doctor.employment==='Part Time').length,
   onLeave:onLeave.length,
   nextReturn,
   departments:departments.length,
   largest,
  };
 },[doctors,departments]);

 const query=search.toLowerCase().trim();
 const matchesQuery=doctor=>!query||[doctor.name,doctor.title,doctor.specialty,doctor.department,...(doctor.expertise||[])].join(' ').toLowerCase().includes(query);
 const inDepartment=doctor=>department==='all'||doctor.department===department;
 const statusCounts=Object.fromEntries(STATUS_FILTERS.map(filter=>[filter.id,doctors.filter(doctor=>filter.test(doctor)&&inDepartment(doctor)&&matchesQuery(doctor)).length]));
 const statusTest=STATUS_FILTERS.find(filter=>filter.id===status).test;
 const filteredDoctors=doctors.filter(doctor=>statusTest(doctor)&&inDepartment(doctor)&&matchesQuery(doctor)).sort(SORTS[sort].compare);
 const pageCount=Math.max(1,Math.ceil(filteredDoctors.length/pageSize));
 const currentPage=Math.min(page,pageCount-1);
 const visibleDoctors=filteredDoctors.slice(currentPage*pageSize,(currentPage+1)*pageSize);
 const filtersActive=status!=='all'||department!=='all'||query;
 function resetFilters(){setStatus('all');setDepartment('all');setSearch('');setPage(0);}

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
  e.preventDefault();
  const doctor=createDoctor(Object.fromEntries(new FormData(e.currentTarget)),avatar);
  if(!doctor.name){setNotice('Enter a doctor name.');return;}
  setDoctors(current=>[doctor,...current]);
  try {saveAddedDoctor(doctor);}catch{setNotice('Doctor added, but session storage is unavailable.');}
  resetFilters();setSort('joined');closeModal();setNotice(`${doctor.name} added for this session.`);
 }

 return <DashboardShell search={search} setSearch={setSearch} setPage={setPage} searchLabel="Global doctor search" searchPlaceholder="Search heart specialists, teams or expertise…">
<main id="main-content" className="pt-16 min-h-dvh ml-0 lg:ml-64 transition-all duration-300">
<div className="p-4 lg:p-6 dl-page">

<div className="dl-header">
 <div>
  <h1>Doctors</h1>
  <p>{stats.total} heart specialists across {stats.departments} teams at the PrioPulse Heart Institute · select a doctor to open their profile</p>
 </div>
 <button id="add-doctor-btn" type="button" className="dl-primary" onClick={()=>setModalOpen(true)}><i className="ph ph-plus" />Add Doctor</button>
</div>

<section className="dl-stats" aria-label="Staff summary">
 <div className="dash-panel dl-stat"><span className="dl-stat-icon tone-primary"><i className="ph ph-stethoscope" /></span><div><span>Total doctors</span><strong>{stats.total}</strong><p>Average {stats.avgExperience} years of experience</p></div></div>
 <div className="dash-panel dl-stat"><span className="dl-stat-icon tone-info"><i className="ph ph-user-check" /></span><div><span>Active</span><strong>{stats.active}</strong><div className="dl-meter"><span style={{width:`${stats.total?stats.active/stats.total*100:0}%`,background:'var(--color-info)'}} /></div><p>{stats.partTime} working part time</p></div></div>
 <div className="dash-panel dl-stat"><span className="dl-stat-icon tone-warning"><i className="ph ph-airplane-tilt" /></span><div><span>On leave</span><strong>{stats.onLeave}</strong><p>{stats.nextReturn?`Next return ${formatDate(stats.nextReturn,{month:'short',day:'numeric'})}`:'Everyone is on duty'}</p></div></div>
 <div className="dash-panel dl-stat"><span className="dl-stat-icon tone-danger"><i className="ph ph-heartbeat" /></span><div><span>Heart teams</span><strong>{stats.departments}</strong><p>Largest: {stats.largest[0]} ({stats.largest[1]})</p></div></div>
</section>

<section className="dash-panel dl-panel" aria-label="Doctor directory">
 <div className="dl-toolbar">
  <div className="dl-segments" role="group" aria-label="Filter by status">
   {STATUS_FILTERS.map(filter=><button key={filter.id} type="button" aria-pressed={status===filter.id} onClick={()=>{setStatus(filter.id);setPage(0);}}>{filter.label}<small>{statusCounts[filter.id]}</small></button>)}
  </div>
  <div className="dl-controls">
   <div className="dl-field"><i className="ph ph-magnifying-glass" /><input id="doctor-search" type="search" placeholder="Search doctors…" aria-label="Search doctors" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} /></div>
   <div className="dl-field"><select aria-label="Filter by team" value={department} onChange={e=>{setDepartment(e.target.value);setPage(0);}}><option value="all">All heart teams</option>{departments.map(([name,count])=><option key={name} value={name}>{name} ({count})</option>)}</select><i className="ph ph-caret-down dl-caret" /></div>
   <div className="dl-field"><select aria-label="Sort doctors" value={sort} onChange={e=>{setSort(e.target.value);setPage(0);}}>{Object.entries(SORTS).map(([id,option])=><option key={id} value={id}>{option.label}</option>)}</select><i className="ph ph-caret-down dl-caret" /></div>
  </div>
 </div>

 <div id="doctors-grid" className="dl-grid">
  {visibleDoctors.map(doctor=><DoctorCard key={doctor.id} doctor={doctor} todayIndex={todayIndex} onAction={setNotice} />)}
  {!visibleDoctors.length&&<div className="dl-empty"><i className="ph ph-user-focus" /><h3>No doctors match</h3><p>Try a different name, specialty or filter.</p>{filtersActive&&<button type="button" onClick={resetFilters}>Clear all filters</button>}</div>}
 </div>

 <div className="dl-pagination">
  <div><span>Per page</span><div className="dl-field"><select id="rows-per-page" aria-label="Doctors per page" value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(0);}}><option value={12}>12</option><option value={24}>24</option><option value={48}>48</option></select><i className="ph ph-caret-down dl-caret" /></div></div>
  <div>
   <span id="page-range" className="mr-1">{filteredDoctors.length?currentPage*pageSize+1:0}–{Math.min((currentPage+1)*pageSize,filteredDoctors.length)} of {filteredDoctors.length}</span>
   <button type="button" className="dl-page-btn" aria-label="Previous page" disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}><i className="ph ph-caret-left" /></button>
   {Array.from({length:pageCount},(_,index)=><button key={index} type="button" className="dl-page-btn" aria-label={`Page ${index+1}`} aria-current={index===currentPage?'page':undefined} onClick={()=>setPage(index)}>{index+1}</button>)}
   <button type="button" className="dl-page-btn" aria-label="Next page" disabled={currentPage>=pageCount-1} onClick={()=>setPage(currentPage+1)}><i className="ph ph-caret-right" /></button>
  </div>
 </div>
</section>
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
<h3 id="add-doctor-title" className="text-sm font-semibold text-heading leading-tight">Add New Doctor</h3>
<p className="text-[11px] text-faint">Fill in the details below</p>
</div>
</div>
<button id="add-doctor-close" type="button" aria-label="Close" className="w-8 h-8 rounded-lg flex items-center justify-center text-faint hover:bg-subtle hover:text-text transition-colors" onClick={closeModal}>
<i className="ph ph-x text-base"></i>
</button>
</div>

<form id="add-doctor-form" className="px-5 pb-5 pt-4 space-y-4" onSubmit={addDoctor}>
<h4 className="text-xs font-semibold text-muted uppercase tracking-wide">Personal Information</h4>

<div className="flex items-center gap-4 p-4 rounded-xl bg-subtle border border-border">
<div id="avatar-preview" className="w-14 h-14 rounded-xl bg-w1 border border-border overflow-hidden flex items-center justify-center text-faint flex-shrink-0">
<i id="avatar-icon" className={avatar ? "hidden" : "ph ph-user-circle text-2xl"}></i>
<img id="avatar-image" alt="Avatar preview" src={avatar || undefined} className={avatar ? "w-full h-full object-cover" : "hidden"} />
</div>
<div className="flex-1 min-w-0">
<input id="avatar-file" type="file" accept="image/png,image/jpeg,image/gif" className="hidden" onChange={uploadAvatar} aria-label="Doctor photo" />
<div className="flex items-center gap-3 text-sm font-medium mb-1">
<button id="avatar-upload-btn" type="button" className="text-primary hover:text-primary-strong transition-colors text-xs font-semibold" onClick={() => document.getElementById('avatar-file').click()}>Upload Photo</button>
<span className="text-border text-xs">|</span>
<button id="avatar-delete-btn" type="button" className="text-danger hover:opacity-80 transition-opacity text-xs font-semibold" onClick={() => setAvatar('')}>Remove</button>
</div>
<p className="text-[11px] text-faint">JPG, PNG or GIF. Max 2MB.</p>
</div>
</div>

<div>
<label className="block text-xs font-medium text-text mb-1.5">Doctor Name <span className="text-danger">*</span></label>
<input type="text" required={true} placeholder="Enter full name…" className="w-full h-10 px-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="name" aria-label="Doctor name" />
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<div>
<label className="block text-xs font-medium text-text mb-1.5">Gender <span className="text-danger">*</span></label>
<div className="relative">
<select required={true} className="w-full h-10 pl-3 pr-9 rounded-xl bg-subtle border border-transparent text-sm text-text focus:outline-none focus:border-primary/50 focus:bg-w1 appearance-none transition-colors" name="gender" aria-label="Gender">
<option>Male</option>
<option>Female</option>
<option>Other</option>
</select>
<i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint pointer-events-none"></i>
</div>
</div>
<div>
<label className="block text-xs font-medium text-text mb-1.5">Heart team <span className="text-danger">*</span></label>
<div className="relative">
<select required={true} className="w-full h-10 pl-3 pr-9 rounded-xl bg-subtle border border-transparent text-sm text-text focus:outline-none focus:border-primary/50 focus:bg-w1 appearance-none transition-colors" name="specialty" aria-label="Heart team" defaultValue="">
<option value="" disabled={true}>Select team</option>
{HEART_TEAMS.map(team=><option key={team}>{team}</option>)}
</select>
<i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint pointer-events-none"></i>
</div>
</div>
</div>

<div>
<label className="block text-xs font-medium text-text mb-1.5">Date of Birth <span className="text-danger">*</span></label>
<div className="relative">
<input type="date" required={true} placeholder="Choose date" className="w-full h-10 px-3 pr-10 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="dob" aria-label="Date of birth" />
<i className="ph ph-calendar-blank absolute right-3 top-1/2 -translate-y-1/2 text-sm text-faint pointer-events-none"></i>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<div>
<label className="block text-xs font-medium text-text mb-1.5">Email Address <span className="text-danger">*</span></label>
<input type="email" required={true} placeholder="doctor@hospital.com" className="w-full h-10 px-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="email" aria-label="Email" />
</div>
<div>
<label className="block text-xs font-medium text-text mb-1.5">Phone Number <span className="text-danger">*</span></label>
<input type="tel" required={true} placeholder="+1 (555) 000-0000" className="w-full h-10 px-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="phone" aria-label="Phone" />
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
<div>
<label className="block text-xs font-medium text-text mb-1.5">City <span className="text-danger">*</span></label>
<input type="text" required={true} placeholder="City" className="w-full h-10 px-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="city" aria-label="City" />
</div>
<div>
<label className="block text-xs font-medium text-text mb-1.5">State <span className="text-danger">*</span></label>
<input type="text" required={true} placeholder="State" className="w-full h-10 px-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="state" aria-label="State" />
</div>
<div>
<label className="block text-xs font-medium text-text mb-1.5">Zip Code <span className="text-danger">*</span></label>
<input type="text" required={true} placeholder="00000" className="w-full h-10 px-3 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors" name="zip" aria-label="Zip code" />
</div>
</div>

<div>
<label className="block text-xs font-medium text-text mb-1.5">Address</label>
<textarea rows="3" placeholder="Street address…" className="w-full px-3 py-2.5 rounded-xl bg-subtle border border-transparent text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary/50 focus:bg-w1 transition-colors resize-none" name="address" aria-label="Address"></textarea>
</div>

<div className="flex items-center gap-3 pt-1">
<button type="button" id="add-doctor-close-btn" className="flex-1 h-10 rounded-xl border border-border text-text hover:bg-subtle text-sm font-medium transition-colors" onClick={closeModal}>Cancel</button>
<button type="submit" className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary-strong text-on-primary text-sm font-semibold flex items-center justify-center gap-2 transition-colors">Add Doctor</button>
</div>
</form>
</div>
</div>{notice && <div role="status" className="fixed bottom-4 right-4 z-50 max-w-sm bg-w1 border border-border p-4 rounded-xl shadow-lg text-sm"><button aria-label="Dismiss message" onClick={()=>setNotice('')} className="float-right ml-3">×</button>{notice}</div>}
</DashboardShell>;
}
