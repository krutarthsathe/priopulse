'use client';
import { useEffect, useRef, useState } from 'react';

const token = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Client-only ApexCharts mount. `build(colors)` returns options using the current theme colours. */
export default function ApexChart({ build, deps, className, label }) {
  const host = useRef(null);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const update = () => setDark(document.documentElement.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let chart, disposed = false;
    import('apexcharts').then(({ default: ApexCharts }) => {
      if (disposed || !host.current) return;
      const colors = { primary: token('--color-primary'), info: token('--color-info'), danger: token('--color-danger'), success: token('--color-success'), muted: token('--color-muted'), faint: token('--color-faint'), border: token('--color-border') };
      const options = build(colors);
      chart = new ApexCharts(host.current, { ...options, chart: { fontFamily: 'Inter, sans-serif', foreColor: colors.muted, background: 'transparent', toolbar: { show: false }, animations: { enabled: true, speed: 350 }, ...options.chart }, theme: { mode: dark ? 'dark' : 'light' }, tooltip: { theme: dark ? 'dark' : 'light', ...options.tooltip } });
      chart.render();
    }).catch(() => {});
    return () => { disposed = true; chart?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark, ...deps]);
  return <div ref={host} className={className} role="img" aria-label={label} />;
}
