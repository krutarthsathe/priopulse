'use client';
import { useEffect, useRef } from 'react';

/** Right-side sheet. Escape or the overlay closes it; focus moves into it when it opens. */
export default function Drawer({ title, subtitle, onClose, children, labelledBy = 'pd-drawer-title', wide = false, actions = null }) {
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    panel.current?.focus();
    const onKey = e => { if (e.key === 'Escape') close.current(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus?.(); };
  }, []);
  return <>
    <div className="pd-drawer-overlay" onClick={onClose} />
    <aside className={`pd-drawer${wide ? ' is-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} ref={panel}>
      <div className="pd-drawer-head"><div><h2 id={labelledBy}>{title}</h2>{subtitle && <p className="hf-caption">{subtitle}</p>}</div><div className="pd-shift-actions">{actions}<button className="pd-close" aria-label="Close panel" onClick={onClose}><i className="ph ph-x" /></button></div></div>
      <div className="pd-drawer-body">{children}</div>
    </aside>
  </>;
}
