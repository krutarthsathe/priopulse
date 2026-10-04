'use client';
import {useEffect, useState} from 'react';
import Navigation from './Navigation';
import Header from './Header';
export default function DashboardShell({children, search, setSearch, setPage, searchLabel, searchPlaceholder}) {
 const [notice, setNotice] = useState('');
 function closeMenus() {
  document.querySelectorAll('#profile-dropdown, #notifications-dropdown').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('#profile-btn, #notifications-btn').forEach(el => el.setAttribute('aria-expanded','false'));
 }
 function closeMobile() {
  document.getElementById('mobile-sidebar')?.classList.add('-translate-x-full');
  document.getElementById('mobile-sidebar-overlay')?.classList.add('hidden');
 }
 useEffect(() => {
  document.documentElement.classList.toggle('dark', localStorage.getItem('priopulse-theme') === 'dark');
  document.documentElement.classList.toggle('sidebar-collapsed', localStorage.getItem('priopulse-sidebar') !== 'expanded');
  const onKey = e => {if (e.key === 'Escape') {closeMenus();closeMobile();}};
  document.addEventListener('keydown',onKey);
  return () => document.removeEventListener('keydown',onKey);
 },[]);
 function onClick(e) {
  const target=e.target, button=target.closest('button');
  if (target.closest('#mobile-sidebar-overlay, #mobile-sidebar-close')) return closeMobile();
  if (!e.defaultPrevented && target.closest('a[href="#"]')) {e.preventDefault();setNotice('This section is not connected in the demo.');}
  if (!target.closest('#profile-dropdown, #notifications-dropdown, #profile-btn, #notifications-btn')) closeMenus();
  if (!button) return;
  if (button.id === 'theme-toggle') {
   const dark=document.documentElement.classList.toggle('dark');localStorage.setItem('priopulse-theme',dark?'dark':'light');
  } else if (button.id === 'sidebar-toggle') {
   if (window.innerWidth < 1024) {document.getElementById('mobile-sidebar').classList.remove('-translate-x-full');document.getElementById('mobile-sidebar-overlay').classList.remove('hidden','opacity-0');}
   else {const collapsed=document.documentElement.classList.toggle('sidebar-collapsed');localStorage.setItem('priopulse-sidebar',collapsed?'collapsed':'expanded');}
  } else if (button.hasAttribute('data-nav-trigger')) {
   const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));button.parentElement.querySelector('[data-nav-menu]')?.classList.toggle('hidden',!expanded);
  } else if (['profile-btn','notifications-btn'].includes(button.id)) {
   const menu=document.getElementById(button.id.replace('-btn','-dropdown')), open=menu.classList.contains('hidden');closeMenus();menu.classList.toggle('hidden',!open);button.setAttribute('aria-expanded',String(open));
  }
 }
 return <div onClick={onClick}><Navigation/><Header search={search} setSearch={setSearch} setPage={setPage} searchLabel={searchLabel} searchPlaceholder={searchPlaceholder}/>{children}{notice && <div role="status" className="fixed bottom-4 right-4 z-50 p-4 bg-w1 border border-border rounded-xl shadow-lg text-sm"><button aria-label="Dismiss message" onClick={()=>setNotice('')} className="float-right ml-3">×</button>{notice}</div>}</div>;
}
