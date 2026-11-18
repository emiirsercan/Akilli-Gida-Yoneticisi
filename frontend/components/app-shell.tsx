'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useSession } from '@/lib/app';
import { Brand } from './ui';
import { Icon, type IconName } from './icon';
const links: { href: string; label: string; icon: IconName }[] = [
  { href: '/dashboard', label: 'Dolabım', icon: 'fridge' }, { href: '/recipes', label: 'Ne pişirsem?', icon: 'chef' }, { href: '/dashboard/add', label: 'Ürün ekle', icon: 'plus' },
];
export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname(); const { name, logout } = useSession();
  return <div className="app-shell"><a className="skip-link" href="#main-content">İçeriğe geç</a><aside className="sidebar"><Brand/><div className="sidebar-label">SENİN MUTFAĞIN</div><nav aria-label="Ana menü">{links.map(link => <Link key={link.href} href={link.href} className={`nav-link ${path === link.href ? 'active' : ''}`} aria-current={path === link.href ? 'page' : undefined}><Icon name={link.icon}/><span>{link.label}</span>{path === link.href && <span className="nav-dot"/>}</Link>)}</nav><div className="sidebar-bottom"><div className="sidebar-note"><span className="tiny-leaf"><Icon name="leaf" size={25}/></span><h3>Küçük adımlar,<br/>daha az israf.</h3><p>İyi bir yemek, elindekilerin<br/>kıymetini bilmekle başlar.</p><span className="note-line"/></div><div className="profile"><span className="avatar">{name.charAt(0).toLocaleUpperCase('tr-TR')}</span><div><strong>{name}</strong><span>İyi ki buradasın.</span></div><button onClick={logout} className="icon-button" aria-label="Çıkış yap" title="Çıkış yap"><Icon name="logout" size={19}/></button></div></div></aside><div className="app-body"><header className="topbar"><div className="breadcrumb">Mutfağın <span>/</span> <strong>{links.find(link => link.href === path)?.label || 'Dolabım'}</strong></div><div className="topbar-right"><span className="season-dot"/> Daha bilinçli bir mutfak <span className="topbar-leaf"><Icon name="leaf" size={17}/></span></div><div className="mobile-brand"><Brand/></div><button className="icon-button mobile-logout" onClick={logout} aria-label="Çıkış yap"><Icon name="logout"/></button></header><main id="main-content" className="main-content">{children}</main><footer className="app-footer"><span>Az israf. Bol lezzet.</span><span>Mutfağına iyi bak <Icon name="heart" size={13}/></span></footer></div><nav className="mobile-nav" aria-label="Mobil menü">{links.map(link => <Link key={link.href} href={link.href} className={path === link.href ? 'active' : ''} aria-current={path === link.href ? 'page' : undefined}><Icon name={link.icon} size={21}/><span>{link.label}</span></Link>)}</nav></div>;
}
