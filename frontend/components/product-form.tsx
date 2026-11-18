'use client';
import { useState, type FormEvent } from 'react';
import { api, ApiError, errorMessage, type FoodItem } from '@/lib/app';
import { ButtonContent, Notice } from './ui';

export interface ProductValues { name: string; quantity: number; expirationDate: string; barcode: string }
export function ProductForm({ token, item, onSaved, onCancel, onPreview, onUnauthorized, onBusyChange }: { token: string; item?: FoodItem; onSaved: (item: FoodItem) => void; onCancel: () => void; onPreview?: (values: ProductValues) => void; onUnauthorized: () => void; onBusyChange?: (busy: boolean) => void }) {
  const [form, setForm] = useState<ProductValues>({ name: item?.name || '', quantity: item?.quantity || 1, expirationDate: item?.expirationDate.split('T')[0] || '', barcode: item?.barcode || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  function update(patch: Partial<ProductValues>) { const next = { ...form, ...patch }; setForm(next); onPreview?.(next); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); onBusyChange?.(true); setError('');
    try {
      const result = await api<FoodItem>(item ? `FoodItems/${item.id}` : 'FoodItems', { method: item ? 'PUT' : 'POST', body: JSON.stringify({ ...form, name: form.name.trim(), expirationDate: new Date(form.expirationDate).toISOString() }) }, token);
      onSaved(result);
    } catch (err) { if (err instanceof ApiError && err.status === 401) onUnauthorized(); else setError(errorMessage(err)); }
    finally { setLoading(false); onBusyChange?.(false); }
  }
  return <form onSubmit={submit} aria-busy={loading}>{error && <Notice>{error}</Notice>}
    <div className="form-grid"><div className="field full"><label htmlFor="product-name">Ürün adı <span>Gerekli</span></label><input id="product-name" name="name" value={form.name} onChange={e => update({ name: e.target.value })} placeholder="Örneğin: Domates, süt, avokado…" required maxLength={200}/></div>
      <div className="field"><label htmlFor="product-quantity">Miktar <span>Adet</span></label><input id="product-quantity" name="quantity" type="number" min="1" max="10000" step="1" required value={form.quantity || ''} onChange={e => update({ quantity: Number(e.target.value) })}/></div>
      <div className="field"><label htmlFor="product-date">Son kullanma tarihi</label><input id="product-date" name="expirationDate" type="date" required value={form.expirationDate} onChange={e => update({ expirationDate: e.target.value })}/></div>
      <div className="field full"><label htmlFor="product-barcode">Barkod <span>İsteğe bağlı</span></label><input id="product-barcode" name="barcode" type="text" inputMode="numeric" placeholder="Ambalaj üzerindeki barkod numarası" value={form.barcode} onChange={e => update({ barcode: e.target.value })} maxLength={100}/><small>Barkodun yoksa boş bırakabilirsin.</small></div>
    </div><div className="form-actions"><button className="btn btn-secondary" type="button" onClick={onCancel} disabled={loading}>Vazgeç</button><button type="submit" className="btn" disabled={loading}><ButtonContent loading={loading} icon="check">{loading ? 'Kaydediliyor' : item ? 'Değişiklikleri kaydet' : 'Dolabıma ekle'}</ButtonContent></button></div>
  </form>;
}
