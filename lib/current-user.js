'use client';
import {useSyncExternalStore} from 'react';

export const ROLE_LABELS = {doctor: 'Doctor', nurse: 'Nurse', admin: 'Administrator', agent: 'Automated agent'};

export const DEMO_USERS = [
 {id: 'nurse-ana', name: 'Jenus Ana', role: 'nurse', title: 'Charge Nurse', email: 'j.ana@priopulse.com', image: '/assets/images/author1.jpg'},
];

const KEY = 'priopulse-demo-user';
const EVENT = 'priopulse-demo-user-change';
let memoryId = DEMO_USERS[0].id;

function subscribe(callback) {
 const onStorage = e => {if (e.key === KEY) callback();};
 window.addEventListener(EVENT, callback);
 window.addEventListener('storage', onStorage);
 return () => {window.removeEventListener(EVENT, callback);window.removeEventListener('storage', onStorage);};
}
function getSnapshot() {
 try {return localStorage.getItem(KEY) || memoryId;} catch {return memoryId;}
}
const getServerSnapshot = () => null;

export function findDemoUser(id) {
 return DEMO_USERS.find(user => user.id === id) || DEMO_USERS[0];
}

/** Returns null during server render / hydration so callers can avoid flashing role-gated UI. */
export function useCurrentUser() {
 const id = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
 return id === null ? null : findDemoUser(id);
}

export function setCurrentUser(id) {
 memoryId = findDemoUser(id).id;
 try {localStorage.setItem(KEY, memoryId);} catch {}
 window.dispatchEvent(new Event(EVENT));
}

export const canViewAuditLog = user => user?.role === 'doctor' || user?.role === 'nurse';
