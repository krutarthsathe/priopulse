'use client';
import {useEffect, useState} from 'react';
import DashboardShell from '../DashboardShell';
import AppointmentsPanel from './AppointmentsPanel';
import PrescriptionsPanel from './PrescriptionsPanel';
import LabResultsPanel from './LabResultsPanel';
import BillingPanel from './BillingPanel';
import recordText from './record-text.json';
import {filterRecords} from './RecordTable';
export default function PatientDetailsPage() {
 const [tab,setTab]=useState('appointment');
 const [search,setSearch]=useState('');
 const [page,setPage]=useState(0);
 const [pageSize,setPageSize]=useState(7);
 const [dense,setDense]=useState(false);
 const [selected,setSelected]=useState(1);
 const [notice,setNotice]=useState('');
 const [rowMenu,setRowMenu]=useState(null);
 const recordCount=filterRecords(recordText[tab]||[],search).length;
 const panelProps={tab,search,dense,page,pageSize,setPage,setPageSize,recordCount};
 useEffect(() => {
  function close(e) {if(e.key==='Escape'){setRowMenu(null);document.getElementById('today-menu')?.classList.add('hidden');document.getElementById('today-btn')?.setAttribute('aria-expanded','false');}}
  const closeRow=()=>setRowMenu(null);
  document.addEventListener('keydown',close);window.addEventListener('resize',closeRow);window.addEventListener('scroll',closeRow,true);
  return ()=>{document.removeEventListener('keydown',close);window.removeEventListener('resize',closeRow);window.removeEventListener('scroll',closeRow,true);};
 },[]);
 useEffect(() => {
  if(tab!=='billing') return;
  let disposed=false, cleanup;
  import('./billing-charts').then(async ({mountBillingCharts})=>{const destroy=await mountBillingCharts();if(disposed)destroy();else cleanup=destroy;}).catch(()=>setNotice('Billing charts could not be loaded.'));
  return ()=>{disposed=true;cleanup?.();};
 },[tab]);
 function handleClick(e) {
  const button=e.target.closest('button');
  if(!e.target.closest('[data-record-menu], .row-btn'))setRowMenu(null);
  if(!e.target.closest('#today-menu, #today-btn')) {document.getElementById('today-menu')?.classList.add('hidden');document.getElementById('today-btn')?.setAttribute('aria-expanded','false');}
  if(!button)return;
  if(button.id==='today-btn') {const menu=document.getElementById('today-menu');const open=menu.classList.toggle('hidden')===false;button.setAttribute('aria-expanded',String(open));}
  else if(button.hasAttribute('data-value')) {document.getElementById('today-label').textContent=button.dataset.value;document.getElementById('today-menu').classList.add('hidden');document.getElementById('today-btn').setAttribute('aria-expanded','false');}
  else if(button.classList.contains('filter-pill')) {document.querySelectorAll('.filter-pill').forEach(pill=>{const active=pill===button;['active','border-primary','bg-primary/10','text-primary'].forEach(cls=>pill.classList.toggle(cls,active));['border-border','text-muted'].forEach(cls=>pill.classList.toggle(cls,!active));});setNotice('The source has no demographic data for the recent-patient list.');}
  else if(button.classList.contains('row-btn')) {const r=button.getBoundingClientRect();setRowMenu({text:button.closest('tr').innerText.trim().replace(/\s+/g,' '),left:Math.max(8,Math.min(r.right-280,window.innerWidth-288)),top:Math.max(8,Math.min(r.bottom+6,window.innerHeight-160))});}
  else if(!button.closest('[role="tablist"]') && !button.hasAttribute('data-tab') && !button.hasAttribute('aria-label')) {setNotice('This action is not connected in the demo.');}
 }
 return <DashboardShell search={search} setSearch={setSearch} setPage={setPage}><div onClick={handleClick}>
<main id="main-content" className="pt-16 pb-6 min-h-dvh ml-0 lg:ml-64 transition-all duration-300">
<div className="p-4 lg:p-6 space-y-5">

<div className="flex flex-wrap items-center justify-between gap-4">
<div className="flex items-center gap-3">
<a className="w-9 h-9 rounded-xl border border-border bg-w1 text-muted hover:text-primary hover:border-primary/50 flex items-center justify-center transition-colors flex-shrink-0" href="/patients">
<i className="ph ph-arrow-left text-sm"></i>
</a>
<span className="dash-icon-chip flex-shrink-0">
<i className="ph ph-user"></i>
</span>
<div>
<h1 className="text-lg font-semibold text-heading leading-tight">{"\n                Patient Details\n              "}</h1>
<p className="text-xs text-faint mt-0.5">{"\n                Eleanor Pena · Patient ID: P547512\n              "}</p>
</div>
</div>
<div className="flex items-center gap-2">
<button type="button" className="h-9 px-4 rounded-xl border border-border bg-w1 text-muted text-xs font-medium flex items-center gap-2 hover:border-primary/50 hover:text-primary transition-colors">
<i className="ph ph-pencil-simple text-sm"></i>{"Edit Profile\n            "}</button>
<button type="button" className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-strong text-on-primary text-xs font-medium flex items-center gap-2 transition-colors">
<i className="ph ph-calendar-plus text-sm"></i>{"Schedule\n            "}</button>
</div>
</div>

<div className="grid grid-cols-12 gap-4 items-start">

<aside className="col-span-12 md:col-span-4 xl:col-span-3  md:sticky md:top-20 self-start w-full max-md:order-1">
<div className="dash-panel flex flex-col">

<div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-border-subtle">
<div className="flex items-center gap-2.5 min-w-0">
<div className="min-w-0">
<h2 className="dash-title">{"Recent Patients"}</h2>
<p className="text-[11px] text-faint">{"7 patients today"}</p>
</div>
</div>
<div className="relative flex-shrink-0">
<button id="today-btn" type="button" aria-haspopup="true" aria-expanded="false" className="dash-period-btn">
<span id="today-label">{"Today"}</span>
<i className="ph ph-caret-down text-[10px] ml-0.5"></i>
</button>
<div id="today-menu" role="menu" className="hidden absolute right-0 top-full mt-1.5 z-30 min-w-[140px] p-1.5 bg-w1 border border-border rounded-xl shadow-lg">
<button data-value="Today" className="block w-full text-left text-xs px-3 py-2 rounded-lg text-text hover:bg-primary/5 transition-colors">{"\n                      Today\n                    "}</button>
<button data-value="This Week" className="block w-full text-left text-xs px-3 py-2 rounded-lg text-text hover:bg-primary/5 transition-colors">{"\n                      This Week\n                    "}</button>
<button data-value="This Month" className="block w-full text-left text-xs px-3 py-2 rounded-lg text-text hover:bg-primary/5 transition-colors">{"\n                      This Month\n                    "}</button>
<button data-value="This Year" className="block w-full text-left text-xs px-3 py-2 rounded-lg text-text hover:bg-primary/5 transition-colors">{"\n                      This Year\n                    "}</button>
</div>
</div>
</div>

<div className="px-3 pt-3 flex items-center gap-1.5 flex-wrap">
<button className="filter-pill active px-3 py-1 rounded-full text-[11px] font-semibold border border-primary bg-primary/10 text-primary transition-colors">{"\n                  All\n                "}</button>
<button className="filter-pill px-3 py-1 rounded-full text-[11px] font-semibold border border-border text-muted hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-colors">{"\n                  Male\n                "}</button>
<button className="filter-pill px-3 py-1 rounded-full text-[11px] font-semibold border border-border text-muted hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-colors">{"\n                  Female\n                "}</button>
<button className="filter-pill px-3 py-1 rounded-full text-[11px] font-semibold border border-border text-muted hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-colors">{"\n                  Child\n                "}</button>
</div>

<div className="p-3 space-y-2 overflow-y-auto flex-1 max-h-[calc(100vh-12rem)]">

<a href="#" aria-current={selected === 0 ? "page" : undefined} onClick={e => {e.preventDefault(); if (!e.target.closest('[data-stop]')) {setSelected(0);setNotice('Recent patient selected. This template contains the detailed record for Eleanor Pena.');}}} className={"pat-card block rounded-xl border border-border-subtle bg-subtle/60 hover:border-primary/40 p-3 transition-colors" + (selected === 0 ? " pat-active" : "")}>
<div className="flex items-start justify-between gap-2.5">
<img src="/assets/images/user1.png" alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-phone text-sm"></i>
</span>
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-chat-circle text-sm"></i>
</span>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"\n                        Ronald Richards\n                      "}</p>
<p className="pat-role text-[11px] text-faint mt-0.5">{"\n                        Psychiatry\n                      "}</p>
</div>
<span className="pat-arrow w-6 h-6 rounded-full flex items-center justify-center text-primary border border-primary/20 transition-colors">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>

<a href="#" aria-current={selected === 1 ? "page" : undefined} onClick={e => {e.preventDefault(); if (!e.target.closest('[data-stop]')) {setSelected(1);setNotice('Recent patient selected. This template contains the detailed record for Eleanor Pena.');}}} className={"pat-card block rounded-xl border border-border-subtle bg-subtle/60 hover:border-primary/40 p-3 transition-colors" + (selected === 1 ? " pat-active" : "")}>
<div className="flex items-start justify-between gap-2.5">
<img src="/assets/images/user3.png" alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-phone text-sm"></i>
</span>
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-chat-circle text-sm"></i>
</span>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"\n                        Eleanor Pena\n                      "}</p>
<p className="pat-role text-[11px] text-faint mt-0.5">{"\n                        Ophthalmology\n                      "}</p>
</div>
<span className="pat-arrow w-6 h-6 rounded-full flex items-center justify-center text-primary border border-primary/20 transition-colors">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>

<a href="#" aria-current={selected === 2 ? "page" : undefined} onClick={e => {e.preventDefault(); if (!e.target.closest('[data-stop]')) {setSelected(2);setNotice('Recent patient selected. This template contains the detailed record for Eleanor Pena.');}}} className={"pat-card block rounded-xl border border-border-subtle bg-subtle/60 hover:border-primary/40 p-3 transition-colors" + (selected === 2 ? " pat-active" : "")}>
<div className="flex items-start justify-between gap-2.5">
<img src="/assets/images/user4.png" alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-phone text-sm"></i>
</span>
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-chat-circle text-sm"></i>
</span>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"\n                        Jane Cooper\n                      "}</p>
<p className="pat-role text-[11px] text-faint mt-0.5">{"\n                        Cardiology\n                      "}</p>
</div>
<span className="pat-arrow w-6 h-6 rounded-full flex items-center justify-center text-primary border border-primary/20 transition-colors">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>

<a href="#" aria-current={selected === 3 ? "page" : undefined} onClick={e => {e.preventDefault(); if (!e.target.closest('[data-stop]')) {setSelected(3);setNotice('Recent patient selected. This template contains the detailed record for Eleanor Pena.');}}} className={"pat-card block rounded-xl border border-border-subtle bg-subtle/60 hover:border-primary/40 p-3 transition-colors" + (selected === 3 ? " pat-active" : "")}>
<div className="flex items-start justify-between gap-2.5">
<img src="/assets/images/user5.png" alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-phone text-sm"></i>
</span>
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-chat-circle text-sm"></i>
</span>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"\n                        Eleanor Pena\n                      "}</p>
<p className="pat-role text-[11px] text-faint mt-0.5">{"\n                        Rhinology\n                      "}</p>
</div>
<span className="pat-arrow w-6 h-6 rounded-full flex items-center justify-center text-primary border border-primary/20 transition-colors">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>

<a href="#" aria-current={selected === 4 ? "page" : undefined} onClick={e => {e.preventDefault(); if (!e.target.closest('[data-stop]')) {setSelected(4);setNotice('Recent patient selected. This template contains the detailed record for Eleanor Pena.');}}} className={"pat-card block rounded-xl border border-border-subtle bg-subtle/60 hover:border-primary/40 p-3 transition-colors" + (selected === 4 ? " pat-active" : "")}>
<div className="flex items-start justify-between gap-2.5">
<img src="/assets/images/user6.png" alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-phone text-sm"></i>
</span>
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-chat-circle text-sm"></i>
</span>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"\n                        Savannah Nguyen\n                      "}</p>
<p className="pat-role text-[11px] text-faint mt-0.5">{"\n                        Dental\n                      "}</p>
</div>
<span className="pat-arrow w-6 h-6 rounded-full flex items-center justify-center text-primary border border-primary/20 transition-colors">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>

<a href="#" aria-current={selected === 5 ? "page" : undefined} onClick={e => {e.preventDefault(); if (!e.target.closest('[data-stop]')) {setSelected(5);setNotice('Recent patient selected. This template contains the detailed record for Eleanor Pena.');}}} className={"pat-card block rounded-xl border border-border-subtle bg-subtle/60 hover:border-primary/40 p-3 transition-colors" + (selected === 5 ? " pat-active" : "")}>
<div className="flex items-start justify-between gap-2.5">
<img src="/assets/images/user7.png" alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-phone text-sm"></i>
</span>
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-chat-circle text-sm"></i>
</span>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"\n                        Marvin McKinney\n                      "}</p>
<p className="pat-role text-[11px] text-faint mt-0.5">{"\n                        Pulmonary\n                      "}</p>
</div>
<span className="pat-arrow w-6 h-6 rounded-full flex items-center justify-center text-primary border border-primary/20 transition-colors">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>

<a href="#" aria-current={selected === 6 ? "page" : undefined} onClick={e => {e.preventDefault(); if (!e.target.closest('[data-stop]')) {setSelected(6);setNotice('Recent patient selected. This template contains the detailed record for Eleanor Pena.');}}} className={"pat-card block rounded-xl border border-border-subtle bg-subtle/60 hover:border-primary/40 p-3 transition-colors" + (selected === 6 ? " pat-active" : "")}>
<div className="flex items-start justify-between gap-2.5">
<img src="/assets/images/user8.png" alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
<div className="flex items-center gap-0.5 shrink-0 mt-0.5">
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-phone text-sm"></i>
</span>
<span data-stop="" className="pat-icon-btn w-7 h-7 bg-w1 rounded-lg flex items-center justify-center text-faint hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer">
<i className="ph ph-chat-circle text-sm"></i>
</span>
</div>
</div>
<div className="flex justify-between items-end mt-2">
<div className="flex-1 min-w-0">
<p className="text-[13px] font-semibold text-heading leading-tight truncate">{"\n                        Bessie Cooper\n                      "}</p>
<p className="pat-role text-[11px] text-faint mt-0.5">{"\n                        Neurology\n                      "}</p>
</div>
<span className="pat-arrow w-6 h-6 rounded-full flex items-center justify-center text-primary border border-primary/20 transition-colors">
<i className="ph ph-arrow-up-right text-[11px]"></i>
</span>
</div>
</a>
</div>
</div>
</aside>

<section className="col-span-12 md:col-span-8 xl:col-span-9 flex flex-col gap-4 min-w-0 max-md:order-0">

<div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 items-start">

<div className="dash-panel overflow-hidden">
<div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
<div className="flex items-center gap-2.5">
<span className="dash-icon-chip flex-shrink-0">
<i className="ph ph-identification-card"></i>
</span>
<div>
<h2 className="dash-title">{"Patient Profile"}</h2>
<p className="dash-subtitle">{"\n                        Personal information & contact details\n                      "}</p>
</div>
</div>
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">{"Active"}</span>
</div>
<div className="p-5 flex flex-wrap gap-5">

<div className="relative w-36 h-48 rounded-2xl overflow-hidden flex-shrink-0 bg-subtle">
<img src="/assets/images/patients.png" alt="Eleanor Pena" className="absolute inset-0 w-full h-full object-cover object-top" />
<div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5 px-2">
<button className="h-7 px-2.5 rounded-lg bg-primary hover:bg-primary-strong text-on-primary text-[11px] font-semibold inline-flex items-center gap-1 shadow-sm transition-colors">
<i className="ph ph-phone-call text-xs"></i>{"Call\n                      "}</button>
<button className="h-7 px-2.5 rounded-lg bg-white/95 dark:bg-w1/90 backdrop-blur border border-primary/30 text-primary text-[11px] font-semibold inline-flex items-center gap-1 shadow-sm hover:bg-white dark:hover:bg-w1 transition-colors">
<i className="ph ph-chat-circle-dots text-xs"></i>{"Chat\n                      "}</button>
</div>
</div>

<div className="w-full sm:flex-1 min-w-0 flex flex-col gap-3">
<div>
<div className="flex flex-wrap items-center gap-2 mb-2">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">{"Active"}</span>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-danger/10 text-danger border border-danger/20">{"AB+"}</span>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-info/10 text-info border border-info/20">
<i className="ph ph-gender-female text-[10px]"></i>{"Female\n                        "}</span>
</div>
<h2 className="text-xl font-bold text-heading leading-tight">{"\n                        Eleanor Pena\n                      "}</h2>
<p className="text-xs text-muted mt-0.5">{"\n                        Patient ID: P547512 · Age 32\n                      "}</p>
</div>
<div className="grid grid-cols-1 gap-2.5">
<div className="flex items-center gap-2.5 p-3 bg-subtle rounded-xl border border-border-subtle">
<span className="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
<i className="ph ph-phone text-xs"></i>
</span>
<div className="min-w-0">
<p className="text-[10px] text-faint">{"Phone"}</p>
<p className="text-xs font-semibold text-heading">{"\n                            (217) 555-0113\n                          "}</p>
</div>
</div>
<div className="flex items-center gap-2.5 p-3 bg-subtle rounded-xl border border-border-subtle">
<span className="w-7 h-7 rounded-lg bg-info-soft text-info flex items-center justify-center flex-shrink-0">
<i className="ph ph-envelope text-xs"></i>
</span>
<div className="min-w-0">
<p className="text-[10px] text-faint">{"Email"}</p>
<p className="text-xs font-semibold text-heading truncate">{"\n                            demo@gmail.com\n                          "}</p>
</div>
</div>
<div className="flex items-start gap-2.5 p-3 bg-subtle rounded-xl border border-border-subtle">
<span className="w-7 h-7 rounded-lg bg-warning-soft text-warning flex items-center justify-center flex-shrink-0 mt-0.5">
<i className="ph ph-map-pin text-xs"></i>
</span>
<div className="min-w-0">
<p className="text-[10px] text-faint">{"Address"}</p>
<p className="text-xs font-semibold text-heading leading-relaxed">{"\n                            1901 Thornridge Cir. Shiloh, Hawaii 81063\n                          "}</p>
</div>
</div>
</div>
</div>
</div>
</div>

<div className="dash-panel overflow-hidden">
<div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
<div className="flex items-center gap-2.5">
<span className="dash-icon-chip is-danger flex-shrink-0">
<i className="ph ph-heart"></i>
</span>
<div>
<h2 className="dash-title">{"Health Summary"}</h2>
<p className="dash-subtitle">{"\n                        Latest vitals and health metrics\n                      "}</p>
</div>
</div>
<button type="button" className="h-8 px-3 rounded-xl border border-primary text-primary text-xs font-medium flex items-center gap-1.5 hover:bg-primary-soft transition-colors flex-shrink-0">
<i className="ph ph-pencil-simple text-sm"></i>{"Edit\n                  "}</button>
</div>
<div className="p-5 space-y-3">

<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

<div className="rounded-xl border border-border bg-subtle p-3.5 flex flex-col gap-1">
<div className="flex items-center gap-2 mb-1">
<span className="w-6 h-6 rounded-lg bg-danger/10 text-danger flex items-center justify-center flex-shrink-0">
<i className="ph ph-heart text-[11px]"></i>
</span>
<p className="text-[11px] text-muted">{"Blood Pressure"}</p>
</div>
<p className="text-lg font-bold text-heading leading-none">{"\n                        125/85\n                        "}<span className="text-xs text-muted font-medium">{"bp"}</span>
</p>
<p className="text-[10px] text-faint">{"Checked: Apr 22, 2025"}</p>
<div className="h-1 rounded-full bg-border overflow-hidden mt-1.5">
<div className="h-full w-[78%] bg-danger rounded-full"></div>
</div>
<p className="text-[10px] text-danger mt-1">{"\n                        ↑ +12.4% Slightly Elevated\n                      "}</p>
</div>

<div className="rounded-xl border border-border bg-subtle p-3.5 flex flex-col gap-1">
<div className="flex items-center gap-2 mb-1">
<span className="w-6 h-6 rounded-lg bg-info/10 text-info flex items-center justify-center flex-shrink-0">
<i className="ph ph-drop text-[11px]"></i>
</span>
<p className="text-[11px] text-muted">{"Blood Glucose"}</p>
</div>
<p className="text-lg font-bold text-heading leading-none">{"\n                        115\n                        "}<span className="text-xs text-muted font-medium">{"mg/dL"}</span>
</p>
<p className="text-[10px] text-faint">{"Checked: Apr 5, 2025"}</p>
<div className="h-1 rounded-full bg-border overflow-hidden mt-1.5">
<div className="h-full w-[60%] bg-info rounded-full"></div>
</div>
<p className="text-[10px] text-info mt-1">{"\n                        ↑ +0.8% Above Normal\n                      "}</p>
</div>

<div className="rounded-xl border border-border bg-subtle p-3.5 flex flex-col gap-1">
<div className="flex items-center gap-2 mb-1">
<span className="w-6 h-6 rounded-lg bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
<i className="ph ph-scales text-[11px]"></i>
</span>
<p className="text-[11px] text-muted">{"Weight"}</p>
</div>
<p className="text-lg font-bold text-heading leading-none">{"\n                        75\n                        "}<span className="text-xs text-muted font-medium">{"kg"}</span>
</p>
<p className="text-[10px] text-faint">{"Checked: Apr 14, 2025"}</p>
<div className="h-1 rounded-full bg-border overflow-hidden mt-1.5">
<div className="h-full w-[45%] bg-warning rounded-full"></div>
</div>
<p className="text-[10px] text-warning mt-1">{"\n                        ↕ 0.00% Stable\n                      "}</p>
</div>
</div>

<div className="grid grid-cols-4 gap-2.5">
<div className="rounded-xl bg-w1 border border-border-subtle p-3 text-center">
<p className="text-[10px] text-faint mb-1">{"Age"}</p>
<p className="text-base font-bold text-heading">{"32"}</p>
</div>
<div className="rounded-xl bg-w1 border border-border-subtle p-3 text-center">
<p className="text-[10px] text-faint mb-1">{"Blood"}</p>
<p className="text-base font-bold text-danger">{"AB+"}</p>
</div>
<div className="rounded-xl bg-w1 border border-border-subtle p-3 text-center">
<p className="text-[10px] text-faint mb-1">{"Height"}</p>
<p className="text-base font-bold text-heading">{"165cm"}</p>
</div>
<div className="rounded-xl bg-w1 border border-border-subtle p-3 text-center">
<p className="text-[10px] text-faint mb-1">{"BMI"}</p>
<p className="text-base font-bold text-warning">{"27.6"}</p>
</div>
</div>
</div>
</div>
</div>

<div className="dash-panel overflow-hidden p-0">
<div className="flex flex-col sm:flex-row sm:items-center">

<div role="tablist" aria-label="Patient records" onKeyDown={e => {if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return; e.preventDefault(); const keys=['appointment','prescriptions','lab-results','billing'];const index=keys.indexOf(tab);const next=e.key==='Home'?0:e.key==='End'?3:(index+(e.key==='ArrowRight'?1:3))%4;setTab(keys[next]);setPage(0);setSearch('');document.getElementById('tab-'+keys[next])?.focus();}} className="flex overflow-x-auto flex-1 min-w-0" style={{"scrollbarWidth": "none"}}>
<button type="button" data-tab="appointment" role="tab" id="tab-appointment" aria-controls="panel-appointment" aria-selected={tab === "appointment"} onClick={() => {setTab("appointment"); setSearch(''); setPage(0);}} className={"main-tab shrink-0 grow basis-0 min-w-[110px] px-4 py-3 text-xs font-semibold transition-colors border-b-2 text-nowrap" + (tab === "appointment" ? " border-primary text-primary bg-primary/5" : " border-transparent text-muted hover:text-heading hover:bg-subtle")}>
<span className="flex items-center justify-center gap-1.5">
<i className="ph ph-calendar-blank text-sm"></i>{"Appointment\n                    "}</span>
</button>
<button type="button" data-tab="prescriptions" role="tab" id="tab-prescriptions" aria-controls="panel-prescriptions" aria-selected={tab === "prescriptions"} onClick={() => {setTab("prescriptions"); setSearch(''); setPage(0);}} className={"main-tab shrink-0 grow basis-0 min-w-[110px] px-4 py-3 text-xs font-semibold transition-colors border-b-2 text-nowrap" + (tab === "prescriptions" ? " border-primary text-primary bg-primary/5" : " border-transparent text-muted hover:text-heading hover:bg-subtle")}>
<span className="flex items-center justify-center gap-1.5">
<i className="ph ph-pill text-sm"></i>{"Prescriptions\n                    "}</span>
</button>
<button type="button" data-tab="lab-results" role="tab" id="tab-lab-results" aria-controls="panel-lab-results" aria-selected={tab === "lab-results"} onClick={() => {setTab("lab-results"); setSearch(''); setPage(0);}} className={"main-tab shrink-0 grow basis-0 min-w-[110px] px-4 py-3 text-xs font-semibold transition-colors border-b-2 text-nowrap" + (tab === "lab-results" ? " border-primary text-primary bg-primary/5" : " border-transparent text-muted hover:text-heading hover:bg-subtle")}>
<span className="flex items-center justify-center gap-1.5">
<i className="ph ph-test-tube text-sm"></i>{"Lab Results\n                    "}</span>
</button>
<button type="button" data-tab="billing" role="tab" id="tab-billing" aria-controls="panel-billing" aria-selected={tab === "billing"} onClick={() => {setTab("billing"); setSearch(''); setPage(0);}} className={"main-tab shrink-0 grow basis-0 min-w-[100px] px-4 py-3 text-xs font-semibold transition-colors border-b-2 text-nowrap" + (tab === "billing" ? " border-primary text-primary bg-primary/5" : " border-transparent text-muted hover:text-heading hover:bg-subtle")}>
<span className="flex items-center justify-center gap-1.5">
<i className="ph ph-receipt text-sm"></i>{"Billing\n                    "}</span>
</button>
</div>

<div className="border-t border-border sm:border-t-0 sm:border-l sm:border-border px-3 py-2.5 shrink-0">
<div className="relative">
<i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none"></i>
<input type="text" placeholder="Search records…" className="h-9 w-full sm:w-48 pl-9 pr-3 rounded-xl bg-subtle border border-transparent text-xs text-text placeholder:text-faint focus:outline-none focus:border-primary/40 focus:bg-w1 transition-colors" aria-label="Search patient records" value={search} onChange={e => {setSearch(e.target.value);setPage(0);}} />
</div>
</div>
</div>
</div>


<AppointmentsPanel {...panelProps} />

<PrescriptionsPanel {...panelProps} />

<LabResultsPanel {...panelProps} />

<BillingPanel {...panelProps} />
</section>
</div>
</div>
</main>{rowMenu && <div role="dialog" aria-label="Record details" data-record-menu className="fixed z-50 w-[280px] p-4 bg-w1 border border-border rounded-xl shadow-lg text-sm" style={{left:rowMenu.left,top:rowMenu.top}}><button aria-label="Close record details" onClick={()=>setRowMenu(null)} className="float-right ml-2">×</button>{rowMenu.text}</div>}
{notice && <div role="status" className="fixed bottom-4 right-4 z-50 max-w-sm p-4 bg-w1 border border-border rounded-xl shadow-lg text-sm"><button aria-label="Dismiss details message" onClick={()=>setNotice('')} className="float-right ml-3">×</button>{notice}</div>}
</div></DashboardShell>;
}
