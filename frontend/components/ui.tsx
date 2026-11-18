'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { Icon, type IconName } from './icon';
export function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/dashboard" className={`brand ${light ? 'brand-light' : ''}`} aria-label="FoodApp ana sayfa"><span className="brand-mark"><Icon name="leaf" size={25}/></span><span>foodapp<span className="brand-dot">.</span></span></Link>;
}
export function ButtonContent({ loading, children, icon = 'arrow' }: { loading?: boolean; children: ReactNode; icon?: IconName }) {
  return <>{children}{loading ? <span className="spinner" aria-hidden="true"/> : <Icon name={icon} size={18}/>}</>;
}
export function Notice({ children, type = 'error' }: { children: ReactNode; type?: 'error' | 'success' | 'info' }) {
  return <div className={`notice notice-${type}`} role={type === 'error' ? 'alert' : 'status'}><Icon name={type === 'error' ? 'warning' : type === 'success' ? 'check' : 'leaf'} size={19}/><span>{children}</span></div>;
}
export function EmptyState({ title, description, icon = 'basket', children }: { title: string; description: string; icon?: IconName; children?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name={icon} size={32}/></span><h2>{title}</h2><p>{description}</p>{children}</div>;
}
export function Modal({ title, subtitle, children, onClose, dismissDisabled = false }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void; dismissDisabled?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  useEffect(() => {
    const dialog = ref.current; const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  function dismiss() {
    if (closing.current || dismissDisabled) return;
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onClose(); return; }
    closing.current = true;
    const animation = ref.current.animate([{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(12px) scale(.96)' }], { duration: 150, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' });
    void animation.finished.then(onClose).catch(() => { closing.current = false; });
  }
  return <dialog ref={ref} className="modal" aria-labelledby="modal-title" onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const elements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')).filter(element => element.getClientRects().length > 0);
    const first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onCancel={event => { event.preventDefault(); if (!dismissDisabled) onClose(); }} onClick={event => {
    if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dismiss(); }
  }}><div className="modal-heading"><div><span className="eyebrow">DOLABIM</span><h2 id="modal-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" aria-label="Pencereyi kapat" onClick={dismiss} disabled={dismissDisabled}><Icon name="close"/></button></div>{children}</dialog>;
}
