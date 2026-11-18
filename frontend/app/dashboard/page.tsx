'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/app-shell';
import { FoodArt, foodKind } from '@/components/food-art';
import { Icon, type IconName } from '@/components/icon';
import { EmptyState, Modal, Notice, ButtonContent } from '@/components/ui';
import { ProductForm } from '@/components/product-form';
import { api, ApiError, daysLeft, foodStatus, errorMessage, useSession, type FoodItem } from '@/lib/app';

type Filter = 'all' | 'critical' | 'fresh' | 'expired';
export default function DashboardPage() {
  const { token, name, logout } = useSession();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [edit, setEdit] = useState<FoodItem | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [deleting, setDeleting] = useState<FoodItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    api<FoodItem[]>('FoodItems', { signal: controller.signal }, token).then(result => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(result)) throw new Error('Ürün listesi alınamadı. Tekrar deneyebilirsin.');
      setItems(result); setError('');
    }).catch(err => {
      if (controller.signal.aborted) return;
      if (err instanceof ApiError && err.status === 401) { localStorage.removeItem('token'); window.location.replace('/'); return; }
      setError(errorMessage(err));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token, retry]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('added')) {
      queueMicrotask(() => setSuccess('Yeni ürünün dolabında. Güzel yemeklerde kullan!'));
      window.history.replaceState(null, '', '/dashboard');
    }
  }, []);

  async function deleteItem() {
    if (!deleting || !token) return;
    setBusy(true); setDeleteError('');
    try {
      await api(`FoodItems/${deleting.id}`, { method: 'DELETE' }, token);
      setItems(previous => previous.filter(item => item.id !== deleting.id));
      setSuccess(`${deleting.name} dolabından kaldırıldı.`); setDeleting(null);
    } catch (err) { if (err instanceof ApiError && err.status === 401) logout(); else setDeleteError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  const counts = {
    all: items.length,
    critical: items.filter(item => { const days = daysLeft(item.expirationDate); return days > 0 && days <= 5; }).length,
    fresh: items.filter(item => daysLeft(item.expirationDate) > 5).length,
    expired: items.filter(item => daysLeft(item.expirationDate) <= 0).length,
  };
  const filtered = items.filter(item => {
    const days = daysLeft(item.expirationDate);
    return item.name.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR')) && (filter === 'all' || (filter === 'critical' && days > 0 && days <= 5) || (filter === 'fresh' && days > 5) || (filter === 'expired' && days <= 0));
  }).sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
  const stats: { label: string; value: number; icon: IconName; color: string }[] = [
    { label: 'Dolabındaki ürün', value: counts.all, icon: 'basket', color: '' },
    { label: 'Taptaze ürün', value: counts.fresh, icon: 'leaf', color: '' },
    { label: 'Önce tüketilmeli', value: counts.critical, icon: 'clock', color: 'orange' },
    { label: 'Süresi dolmuş', value: counts.expired, icon: 'calendar', color: 'red' },
  ];
  const filters: { key: Filter; label: string }[] = [{ key: 'all', label: 'Tüm ürünler' }, { key: 'critical', label: 'Yaklaşanlar' }, { key: 'fresh', label: 'Taptaze' }, { key: 'expired', label: 'Süresi dolan' }];

  return <AppShell><div className="page-heading"><div><span className="eyebrow">MUTFAĞINA HOŞ GELDİN</span><h1>Merhaba, {name.split(' ')[0]}. <Icon name="sun" size={29} className="heading-sun"/></h1><p>Dolabında neler var? Bugün güzel bir şeyler pişirelim.</p></div><Link href="/dashboard/add" className="btn"><Icon name="plus" size={17}/> Ürün ekle</Link></div>
    <section className="feature-banner"><div className="feature-copy"><span className="eyebrow">BİRAZ İLHAM, BİRAZ MUTFAK SİHRİ</span><h2>Elindekilerle<br/><em>güzel şeyler pişir.</em></h2><p>Dolabındaki malzemeler, bir sonraki favori yemeğine dönüşsün.</p><Link href="/recipes" className="text-link">Bugün ne pişirsem? <Icon name="arrow" size={16}/></Link></div><div className="feature-photo"><Image src="/images/seasonal-bowl.jpg" alt="Taze sebzeler, yeşillikler ve nohutla hazırlanmış renkli bir salata" fill sizes="(max-width: 760px) 45vw, 40vw" priority/><span className="photo-note"><Icon name="leaf" size={15}/> İyi malzeme. Güzel bir sofra.</span></div></section>
    <section className="stats-strip stagger" aria-label="Dolap özeti">{stats.map(stat => <div className={`stat ${stat.color}`} key={stat.label}><span className="stat-icon"><Icon name={stat.icon} size={20}/></span><div><strong>{loading || error ? '—' : stat.value}</strong><p>{stat.label}</p></div></div>)}</section>
    <section aria-labelledby="inventory-title"><div className="section-heading"><h2 id="inventory-title">Dolabındakiler <span>{!loading && !error ? `${items.length} ürün` : ''}</span></h2><span><Icon name="calendar" size={13}/> Tarihe göre sıralı</span></div>
      <div className="inventory-tools"><div className="filter-tabs" aria-label="Ürünleri filtrele">{filters.map(option => <button key={option.key} onClick={() => setFilter(option.key)} className={filter === option.key ? 'active' : ''} aria-pressed={filter === option.key}>{option.key !== 'all' && <span className={`small-dot ${option.key}`}/>} {option.label}{option.key === 'all' && <span className="count">{items.length}</span>}</button>)}</div><div className="search-box"><Icon name="search" size={15}/><input aria-label="Dolabında ürün ara" type="search" value={search} placeholder="Dolabında ara…" onChange={e => setSearch(e.target.value)}/><div className="view-switch" aria-label="Görünüm"><button aria-label="Kart görünümü" aria-pressed={view === 'grid'} className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><Icon name="grid" size={15}/></button><button aria-label="Liste görünümü" aria-pressed={view === 'list'} className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><Icon name="list" size={17}/></button></div></div></div>
      {success && <div className="success-row"><Notice type="success">{success}</Notice><button className="icon-button" aria-label="Bildirimi kapat" onClick={() => setSuccess('')}><Icon name="close" size={16}/></button></div>}
      {loading ? <div className="food-grid" role="status" aria-label="Ürünlerin yükleniyor"><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></div> : error ? <><Notice>{error}</Notice><button className="btn btn-secondary" onClick={() => { setLoading(true); setRetry(value => value + 1); }}>Tekrar dene <Icon name="arrow" size={16}/></button></> : filtered.length === 0 ? <EmptyState title={items.length ? 'Burada henüz bir şey yok.' : 'Güzel bir başlangıca hazır.'} description={items.length ? 'Aramanı veya filtreni değiştirerek dolabındaki diğer ürünleri görebilirsin.' : 'İlk ürününü ekle. Tazeliği birlikte takip edelim, elindekileri lezzete dönüştürelim.'}>{items.length ? <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilter('all'); }}>Tüm ürünleri göster</button> : <Link className="btn" href="/dashboard/add"><Icon name="plus" size={17}/> İlk ürünümü ekle</Link>}</EmptyState> : <div className={`food-grid ${view === 'list' ? 'list-view' : ''}`}>{filtered.map(item => {
        const status = foodStatus(daysLeft(item.expirationDate));
        return <article className="food-card" data-kind={foodKind(item.name)} key={item.id}><div className="food-card-top"><span className={`status-badge ${status.key}`}><span className={`small-dot ${status.key}`}/>{status.label}</span><div className="food-actions"><button className="icon-button" onClick={() => setEdit(item)} aria-label={`${item.name} düzenle`} title="Düzenle"><Icon name="edit" size={14}/></button><button className="icon-button delete-action" onClick={() => { setDeleting(item); setDeleteError(''); }} aria-label={`${item.name} sil`} title="Sil"><Icon name="trash" size={14}/></button></div></div><div className="food-visual"><FoodArt name={item.name}/></div><div className="food-info"><div className="food-name-row"><h3>{item.name}</h3><span className="food-quantity">{item.quantity} adet</span></div><div className="food-date-row"><span><Icon name="calendar" size={12}/><time dateTime={item.expirationDate}>{new Date(item.expirationDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</time></span><span className={`food-days ${status.key}`}>{status.note}</span></div></div></article>;
      })}<Link href="/dashboard/add" className="add-card"><span><Icon name="plus" size={22}/></span><strong>Dolabına bir şey ekle</strong><p>Her malzeme yeni bir ihtimal.</p></Link></div>}
      <p className="inventory-bottom"><Icon name="leaf" size={14}/> Küçük bir hatırlatma: tarihi yaklaşan ürünlerini önce değerlendirmeyi unutma.</p>
    </section>
    {edit && token && <Modal dismissDisabled={editBusy} title="Bir küçük güncelleme." subtitle="Ürünün bilgilerini burada düzenleyebilirsin." onClose={() => { if (!editBusy) setEdit(null); }}><ProductForm onBusyChange={setEditBusy} token={token} item={edit} onCancel={() => setEdit(null)} onSaved={updated => { setItems(previous => previous.map(item => item.id === updated.id ? updated : item)); setEdit(current => current?.id === updated.id ? null : current); setSuccess('Ürün bilgilerin güncellendi.'); }} onUnauthorized={logout}/></Modal>}
    {deleting && <Modal dismissDisabled={busy} title="Dolabından kaldırılsın mı?" subtitle={deleting.name} onClose={() => { if (!busy) setDeleting(null); }}><p className="delete-copy">Bu ürün dolap listenden kaldırılacak. İstersen daha sonra yeniden ekleyebilirsin.</p>{deleteError && <Notice>{deleteError}</Notice>}<div className="modal-actions"><button className="btn btn-secondary" onClick={() => setDeleting(null)} disabled={busy}>Vazgeç</button><button className="btn btn-danger" onClick={deleteItem} disabled={busy}><ButtonContent loading={busy} icon="trash">{busy ? 'Kaldırılıyor' : 'Evet, kaldır'}</ButtonContent></button></div></Modal>}
  </AppShell>;
}
