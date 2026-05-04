'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ firstName: '', lastName: '', email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Giriş başarısız.');
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız.');
      setSuccess('Kayıt başarılı! E-posta adresinize doğrulama kodu gönderildi.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally { setLoading(false); }
  };

  const features = [
    { icon: '🧊', title: 'Akıllı Buzdolabı', desc: 'Tüm ürünlerinizi tek yerden yönetin' },
    { icon: '⏰', title: 'Son Kullanma Takibi', desc: 'Bozulmadan önce uyarı alın' },
    { icon: '🌱', title: 'Sıfır İsraf', desc: 'Gıda israfını %70 azaltın' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', overflow: 'hidden' }}>

      {/* ── Left Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="animate-fade-up" style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '64px' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 8px 32px rgba(16,185,129,0.3)', animation: 'glow 3s ease infinite' }}>
              🥗
            </div>
            <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              <span className="gradient-text">Food</span><span style={{ color: '#f1f5f9' }}>App</span>
            </span>
          </div>

          <h1 style={{ fontSize: '52px', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-2px', marginBottom: '20px' }}>
            Buzdolabını<br />
            <span className="gradient-text">akıllıca</span> yönet
          </h1>
          <p style={{ color: '#64748b', fontSize: '17px', lineHeight: '1.7', marginBottom: '56px', maxWidth: '380px' }}>
            Son kullanma tarihlerini takip et, gıda israfını önle ve her zaman taze ürünlere sahip ol.
          </p>

          {/* Feature List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {features.map((f, i) => (
              <div key={i} className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '16px', animationDelay: `${0.1 + i * 0.1}s` }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '2px' }}>{f.title}</div>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'rgba(8,15,35,0.6)', borderLeft: '1px solid rgba(148,163,184,0.06)' }}>
        <div className="animate-fade-up" style={{ width: '100%', animationDelay: '0.2s' }}>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              {tab === 'login' ? 'Tekrar hoş geldin 👋' : 'Hesap oluştur ✨'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              {tab === 'login' ? 'Hesabına giriş yap ve buzdolabına bak' : 'Dakikalar içinde başla, ücretsiz'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: 'rgba(8,15,35,0.8)', borderRadius: '12px', padding: '4px', marginBottom: '28px', border: '1px solid var(--border)' }}>
            {(['login', 'register'] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', transition: 'all 0.25s ease',
                  background: tab === t ? 'linear-gradient(135deg, #10b981, #3b82f6)' : 'transparent',
                  color: tab === t ? 'white' : '#475569' }}>
                {t === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            ))}
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>⚠️ <span>{error}</span></div>}
          {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}>✅ <span>{success}</span></div>}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="label">E-posta</label>
                <input className="input-field" type="email" placeholder="ornek@gmail.com" required
                  value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Şifre</label>
                <input className="input-field" type="password" placeholder="••••••••" required
                  value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
              </div>
              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '6px' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                    Giriş yapılıyor...
                  </span>
                ) : 'Giriş Yap →'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="label">Ad</label>
                  <input className="input-field" type="text" placeholder="Ahmet" required
                    value={registerData.firstName} onChange={e => setRegisterData({ ...registerData, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="label">Soyad</label>
                  <input className="input-field" type="text" placeholder="Yılmaz" required
                    value={registerData.lastName} onChange={e => setRegisterData({ ...registerData, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">E-posta</label>
                <input className="input-field" type="email" placeholder="ornek@gmail.com" required
                  value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Şifre</label>
                <input className="input-field" type="password" placeholder="En az 6 karakter" required
                  value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} />
              </div>
              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '6px' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                    Hesap oluşturuluyor...
                  </span>
                ) : 'Hesap Oluştur →'}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', color: '#334155', fontSize: '12px', marginTop: '28px', lineHeight: '1.6' }}>
            Devam ederek Gizlilik Politikası ve Kullanım Koşullarını kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
}
