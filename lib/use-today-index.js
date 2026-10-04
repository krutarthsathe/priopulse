'use client';
import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};
const todayIndex = () => (new Date().getDay() + 6) % 7;

/** Index into WEEK_DAYS (Mon = 0) for today, or null during server rendering so markup never mismatches across time zones. */
export function useTodayIndex() {
  return useSyncExternalStore(noopSubscribe, todayIndex, () => null);
}
