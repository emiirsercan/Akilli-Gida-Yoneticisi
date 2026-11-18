'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { ProductForm, type ProductValues } from '@/components/product-form';
import { FoodArt, foodKind } from '@/components/food-art';
import { Icon } from '@/components/icon';
import { useSession } from '@/lib/app';

export default function AddProductPage() {
  const { token, logout } = useSession();
  const router = useRouter();
  const [preview, setPreview] = useState<ProductValues>({ name: '', quantity: 1, expirationDate: '', barcode: '' });
  return <AppShell><Link href="/dashboard" className="text-link back-link"><Icon name="back" size={16}/> Dolabıma dön</Link><div className="page-heading add-heading"><div><span className="eyebrow">TAZE BİR BAŞLANGIÇ</span><h1>Dolabına bir iyilik ekle.</h1><p>Yeni aldıklarını kaydet, hiçbir malzeme gözden kaçmasın.</p></div></div><div className="add-layout stagger"><section className="form-panel"><div className="panel-heading"><h2>Ne aldın bugün?</h2><p>Birkaç küçük bilgi, daha düzenli bir mutfak.</p></div>{token ? <ProductForm token={token} onSaved={() => router.push('/dashboard?added=1')} onCancel={() => router.push('/dashboard')} onPreview={setPreview} onUnauthorized={logout}/> : <p role="status">Mutfağın hazırlanıyor…</p>}</section><aside className="preview-column"><div className="product-preview"><span className="eyebrow">DOLABINDA BÖYLE GÖRÜNECEK</span><div className="preview-art" key={foodKind(preview.name)}><FoodArt name={preview.name}/></div><h3>{preview.name || 'Güzel bir malzeme'}</h3><p>{preview.quantity || 0} adet · {preview.expirationDate ? new Date(preview.expirationDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) : 'Tarihini eklemeyi unutma'}</p><div className="preview-footer"><Icon name="leaf" size={15}/> Her malzemenin bir yeri var.</div></div><div className="tip-note"><span className="eyebrow"><Icon name="sun" size={16}/> KÜÇÜK BİR MUTFAK NOTU</span><p>Ambalaj üzerindeki tarihi kaydetmek, dolabındakileri doğru sırayla kullanmana yardımcı olur.</p></div></aside></div></AppShell>;
}
