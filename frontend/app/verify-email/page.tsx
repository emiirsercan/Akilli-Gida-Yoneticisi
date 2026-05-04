'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Doğrulama başarısız.');
      setSuccess('E-postanız başarıyla doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => router.push('/'), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'radial-gradient(ellipse at top, rgba(16,185,129,0.08) 0%, transparent 60%), #0f172a' }}>
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📬</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            <span className="gradient-text">E-posta Doğrulama</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Mailinize gelen kodu girin</p>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#6ee7b7', fontSize: '14px' }}>
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>E-posta Adresiniz</label>
              <input className="input-field" type="email" placeholder="ornek@gmail.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>Doğrulama Kodu</label>
              <input className="input-field" type="text" placeholder="Mailinize gelen kod" required value={token} onChange={e => setToken(e.target.value)} style={{ fontFamily: 'monospace', letterSpacing: '2px' }} />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Doğrulanıyor...' : 'E-postamı Doğrula'}
            </button>
          </form>

          <button onClick={() => router.push('/')} style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'transparent', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}>
            ← Giriş sayfasına dön
          </button>
        </div>
      </div>
    </div>
  );
}
