'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

interface FoodItem {
  id: string;
  name: string;
  barcode?: string;
  expirationDate: string;
  quantity: number;
  createdAt: string;
}

function getDaysLeft(dateStr: string): number {
  const now = new Date();
  const exp = new Date(dateStr);
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatus(days: number) {
  if (days <= 0)  return { label: 'Süresi Doldu', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', dot: '#ef4444', icon: '💀' };
  if (days <= 2)  return { label: 'Kritik',       color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', dot: '#ef4444', icon: '🚨' };
  if (days <= 5)  return { label: 'Dikkat',        color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', dot: '#f59e0b', icon: '⚠️' };
  return           { label: 'Taze',          color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', dot: '#10b981', icon: '✅' };
}



export default function DashboardPage() {
  const [items, setItems]         = useState<FoodItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editItem, setEditItem]   = useState<FoodItem | null>(null);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<'all' | 'critical' | 'warning' | 'fresh'>('all');
  const [token, setToken]         = useState<string | null>(null);
  const [userName, setUserName]   = useState('');
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/'); return; }
    setToken(t);
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      setUserName(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Kullanıcı');
    } catch { setUserName('Kullanıcı'); }
    fetchItems(t);
  }, []);

  const fetchItems = async (t?: string) => {
    const tok = t || token;
    if (!tok) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/FoodItems`, { headers: { Authorization: `Bearer ${tok}` } });
      if (res.status === 401) { router.push('/'); return; }
      setItems(await res.json());
    } catch { console.error('Yüklenemedi'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    await fetch(`${API_URL}/api/FoodItems/${deleteId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    setItems(prev => prev.filter(i => i.id !== deleteId));
    setDeleteId(null);
    setDeleteLoading(false);
  };

  const handleLogout = () => { localStorage.removeItem('token'); router.push('/'); };

  // Stats
  const critical    = items.filter(i => getDaysLeft(i.expirationDate) <= 2 && getDaysLeft(i.expirationDate) > 0);
  const warning     = items.filter(i => getDaysLeft(i.expirationDate) > 2 && getDaysLeft(i.expirationDate) <= 5);
  const fresh       = items.filter(i => getDaysLeft(i.expirationDate) > 5);
  const expired     = items.filter(i => getDaysLeft(i.expirationDate) <= 0);

  const filteredItems = items
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    .filter(i => {
      const d = getDaysLeft(i.expirationDate);
      if (filter === 'critical') return d <= 2;
      if (filter === 'warning')  return d > 2 && d <= 5;
      if (filter === 'fresh')    return d > 5;
      return true;
    })
    .sort((a, b) => getDaysLeft(a.expirationDate) - getDaysLeft(b.expirationDate));

  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Sidebar ── */}
      <div className="sidebar">
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ padding: '28px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                🥗
              </div>
              <span style={{ fontSize: '18px', fontWeight: '800' }}><span className="gradient-text">Food</span><span>App</span></span>
            </div>
          </div>
        </Link>

        <nav style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <a className="sidebar-item active" href="#">
            <span>🏠</span> <span>Dashboard</span>
          </a>
          <a className="sidebar-item" href="#" onClick={e => { e.preventDefault(); setShowModal(true); }}>
            <span>➕</span> <span>Ürün Ekle</span>
          </a>
          <a className="sidebar-item" href="/recipes">
            <span>🍳</span> <span>Tarif Önerileri</span>
          </a>
        </nav>

        {/* User block */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}
              suppressHydrationWarning>
              {userName.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{userName}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Kullanıcı</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚪</span> Çıkış Yap
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ marginLeft: '260px', flex: 1, padding: '40px', overflow: 'auto' }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>{today}</div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', lineHeight: '1.1' }}>
              Merhaba, <span className="gradient-text">{userName}</span> 👋
            </h1>
            <p style={{ color: '#64748b', marginTop: '6px', fontSize: '14px' }}>
              Buzdolabında {items.length} ürün var
              {critical.length > 0 && <span style={{ color: '#ef4444', fontWeight: '600' }}> · {critical.length} kritik ürün!</span>}
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '13px 22px' }}>
            <span style={{ fontSize: '16px' }}>+</span> Ürün Ekle
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '36px', animationDelay: '0.05s' }}>
          {[
            { icon: '🛒', label: 'Toplam Ürün',     value: items.length,    color: '#3b82f6',  glow: 'rgba(59,130,246,0.3)' },
            { icon: '💀', label: 'Süresi Dolmuş',   value: expired.length,  color: '#94a3b8',  glow: 'rgba(148,163,184,0.15)' },
            { icon: '🚨', label: 'Kritik (≤2 gün)', value: critical.length, color: '#ef4444',  glow: 'rgba(239,68,68,0.3)' },
            { icon: '✅', label: 'Taze (>5 gün)',   value: fresh.length,    color: '#10b981',  glow: 'rgba(16,185,129,0.3)' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: s.color, filter: 'blur(30px)', opacity: 0.15 }} />
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>{s.icon}</div>
              <div style={{ fontSize: '36px', fontWeight: '900', color: s.color, letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Warning Banner */}
        {critical.length > 0 && (
          <div className="animate-fade-up alert alert-error" style={{ marginBottom: '28px', animationDelay: '0.2s', borderRadius: '16px', padding: '16px 20px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>🚨</span>
            <div>
              <div style={{ fontWeight: '700', marginBottom: '2px' }}>{critical.length} ürün 2 gün içinde bozulacak!</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>{critical.map(i => i.name).join(' · ')}</div>
            </div>
          </div>
        )}

        {/* ── Filters & Search ── */}
        <div className="animate-fade-up" style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', animationDelay: '0.15s' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#64748b' }}>🔍</span>
            <input className="input-field" type="text" placeholder="Ürün ara..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '42px' }} />
          </div>
          {[
            { key: 'all',      label: 'Tümü' },
            { key: 'critical', label: '🚨 Kritik' },
            { key: 'warning',  label: '⚠️ Dikkat' },
            { key: 'fresh',    label: '✅ Taze' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as typeof filter)}
              style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
                borderColor: filter === f.key ? 'rgba(16,185,129,0.5)' : 'var(--border)',
                background: filter === f.key ? 'rgba(16,185,129,0.1)' : 'rgba(15,23,42,0.6)',
                color: filter === f.key ? '#10b981' : '#64748b' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Items Grid ── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '180px', borderRadius: '18px', background: 'rgba(15,23,42,0.5)', border: '1px solid var(--border)', animation: 'fadeIn 0.5s ease both', animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="glass" style={{ padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>{items.length === 0 ? '🧊' : '🔍'}</div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
              {items.length === 0 ? 'Buzdolabın boş!' : 'Ürün bulunamadı'}
            </div>
            <div style={{ color: '#64748b', marginBottom: '28px', fontSize: '14px' }}>
              {items.length === 0 ? 'İlk ürününü ekleyerek başla' : 'Farklı bir arama dene'}
            </div>
            {items.length === 0 && (
              <button onClick={() => setShowModal(true)} className="btn-primary" style={{ width: 'auto', padding: '13px 32px' }}>
                ➕ İlk Ürünü Ekle
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredItems.map((item, i) => {
              const days = getDaysLeft(item.expirationDate);
              const st   = getStatus(days);
              return (
                <div key={item.id} className="food-card animate-fade-up"
                  style={{ borderColor: st.border, background: st.bg, animationDelay: `${i * 0.04}s` }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.3px' }}>{item.name}</h3>
                      {item.barcode && <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>Barkod: {item.barcode}</span>}
                    </div>
                    <span className="badge" style={{ background: `${st.color}22`, color: st.color, border: `1px solid ${st.color}44`, flexShrink: 0, marginLeft: '8px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                      {st.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Miktar</div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: '#f1f5f9' }}>{item.quantity}</div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>adet</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(148,163,184,0.08)' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SKT</div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: st.color }}>
                        {days <= 0 ? '—' : days}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>
                        {days <= 0 ? 'doldu' : 'gün kaldı'}
                      </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                      <div style={{ fontSize: '36px' }}>{st.icon}</div>
                    </div>
                  </div>

                  {/* Expiry bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ height: '4px', borderRadius: '4px', background: 'rgba(148,163,184,0.1)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(Math.max((days / 30) * 100, 0), 100)}%`, background: st.color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditItem(item)}
                      style={{ flex: 1, padding: '9px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '10px', color: '#93c5fd', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.12)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.06)'; }}>
                      ✏️ Düzenle
                    </button>
                    <button onClick={() => setDeleteId(item.id)}
                      style={{ flex: 1, padding: '9px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)'; }}>
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Item Modal ── */}
      {showModal && <AddItemModal token={token!} onClose={() => setShowModal(false)} onAdded={fetchItems} />}

      {/* ── Edit Item Modal ── */}
      {editItem && <EditItemModal token={token!} item={editItem} onClose={() => setEditItem(null)} onUpdated={fetchItems} />}

      {/* ── Delete Confirmation Modal ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🗑️</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Ürünü sil?</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6' }}>
              Bu ürün kalıcı olarak silinecek.<br />Bu işlem geri alınamaz.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteId(null)} className="btn-ghost" style={{ flex: 1 }}>İptal</button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{ flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontWeight: '700', fontSize: '15px', padding: '13px', borderRadius: '12px', border: 'none', cursor: 'pointer', opacity: deleteLoading ? 0.6 : 1 }}>
                {deleteLoading ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddItemModal({ token, onClose, onAdded }: { token: string; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ name: '', barcode: '', expirationDate: '', quantity: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/FoodItems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, expirationDate: new Date(form.expirationDate).toISOString() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Hata oluştu'); }
      onAdded(); onClose();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Hata'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>Ürün Ekle</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Buzdolabına yeni ürün ekle</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid var(--border)', borderRadius: '10px', color: '#64748b', fontSize: '18px', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>⚠️ <span>{error}</span></div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="label">Ürün Adı *</label>
            <input className="input-field" type="text" placeholder="Süt, Yoğurt, Domates..." required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Barkod <span style={{ color: '#334155', textTransform: 'none', fontWeight: '400' }}>(opsiyonel)</span></label>
            <input className="input-field" type="text" placeholder="8691234567890"
              value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="label">Son Kullanma Tarihi *</label>
              <input className="input-field" type="date" required
                value={form.expirationDate} onChange={e => setForm({ ...form, expirationDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Miktar (adet) *</label>
              <input className="input-field" type="number" min="1" max="9999" required
                value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>İptal</button>
            <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 2 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                  Ekleniyor...
                </span>
              ) : '✅ Ürünü Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditItemModal({ token, item, onClose, onUpdated }: { token: string; item: FoodItem; onClose: () => void; onUpdated: () => void }) {
  const toDateInput = (iso: string) => iso.split('T')[0];

  const [form, setForm] = useState({
    name: item.name,
    barcode: item.barcode || '',
    expirationDate: toDateInput(item.expirationDate),
    quantity: item.quantity,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/FoodItems/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, expirationDate: new Date(form.expirationDate).toISOString() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Güncelleme başarısız'); }
      onUpdated();
      onClose();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Hata'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>✏️ Ürün Düzenle</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Ürün bilgilerini güncelleyin</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid var(--border)', borderRadius: '10px', color: '#64748b', fontSize: '18px', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>⚠️ <span>{error}</span></div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="label">Ürün Adı *</label>
            <input className="input-field" type="text" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Barkod <span style={{ color: '#334155', textTransform: 'none', fontWeight: '400' }}>(opsiyonel)</span></label>
            <input className="input-field" type="text" placeholder="8691234567890"
              value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="label">Son Kullanma Tarihi *</label>
              <input className="input-field" type="date" required
                value={form.expirationDate} onChange={e => setForm({ ...form, expirationDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Miktar (adet) *</label>
              <input className="input-field" type="number" min="1" max="9999" required
                value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>İptal</button>
            <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 2, background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                  Güncelleniyor...
                </span>
              ) : '💾 Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
