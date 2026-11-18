'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api, errorMessage, setSession } from '@/lib/app';
import { Brand, ButtonContent, Notice } from '@/components/ui';
import { Icon } from '@/components/icon';
import { FoodArt } from '@/components/food-art';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  function changeTab(next: 'login' | 'register') { setTab(next); setError(''); setRegistered(false); setVisible(false); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email')).trim();
    const password = String(form.get('password'));
    if (tab === 'register' && password !== form.get('confirmPassword')) { setError('Şifreler uyuşmuyor. Lütfen tekrar kontrol et.'); return; }
    setLoading(true); setError(''); setRegistered(false);
    try {
      if (tab === 'login') {
        const data = await api<{ token: string }>('auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        setSession(data.token); router.push('/dashboard');
      } else {
        await api('auth/register', { method: 'POST', body: JSON.stringify({ email, password, firstName: String(form.get('firstName')).trim(), lastName: String(form.get('lastName')).trim() }) });
        changeTab('login');
        setRegistered(true);
      }
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }

  return <div className="auth-page">
    <section className="auth-story" aria-label="FoodApp hakkında">
      <Brand light/>
      <div className="auth-story-content">
        <span className="eyebrow">MUTFAĞINDA YENİ BİR HİKÂYE</span>
        <h1>Az israf.<br/>Bol lezzet.<br/><em>İyi hisset.</em></h1>
        <p>Dolabındaki küçük bir malzeme, harika bir yemeğin başlangıcı olabilir. Birlikte keşfedelim.</p>
        <div className="auth-art" aria-hidden="true"><span className="auth-art-label">Elindekiler yeter.</span><div className="auth-plate"><FoodArt name="avokado"/></div><FoodArt name="domates" className="auth-float tomato"/><FoodArt name="havuç" className="auth-float carrot"/><FoodArt name="yeşillik" className="auth-float greens"/><div className="auth-mini-note"><Icon name="leaf" size={17}/> Biraz özen, çok güzel bir sofra.</div></div>
      </div>
      <div className="auth-story-footer"><span><Icon name="heart" size={13}/> Mutfağın için, gezegen için.</span><span>DAHA İYİ BİR YARINA</span></div>
    </section>
    <main className="auth-main">
      <div className="auth-mobile-brand"><Brand/></div>
      <div className="auth-topline"><span><Icon name="leaf" size={14}/> Her malzemenin bir hikâyesi var.</span></div>
      <div className="auth-form-wrap">
        <span className="eyebrow">GÜZEL ŞEYLER MUTFAKTA BAŞLAR</span>
        <h2>{tab === 'login' ? 'Yeniden merhaba.' : 'Birlikte başlayalım.'}</h2>
        <p>{tab === 'login' ? 'Dolabın, tariflerin ve yeni fikirlerin seni bekliyor.' : 'Daha bilinçli, daha lezzetli bir mutfağa ilk adım.'}</p>
        <div className="auth-tabs" data-tab={tab} aria-label="Hesap işlemi">
          <button type="button" className={tab === 'login' ? 'active' : ''} aria-pressed={tab === 'login'} onClick={() => changeTab('login')} disabled={loading}>Giriş yap</button>
          <button type="button" className={tab === 'register' ? 'active' : ''} aria-pressed={tab === 'register'} onClick={() => changeTab('register')} disabled={loading}>Hesap oluştur</button>
        </div>
        {error && <Notice>{error}</Notice>}
        {registered && <Notice type="success">Hesabın hazır. E-posta adresin ve şifrenle giriş yapabilirsin.</Notice>}
        <form key={tab} className="auth-form auth-form-enter" onSubmit={submit} aria-busy={loading}>
          {tab === 'register' && <div className="form-grid"><div className="field"><label htmlFor="firstName">Adın</label><input id="firstName" name="firstName" placeholder="Adın" autoComplete="given-name" required maxLength={80}/></div><div className="field"><label htmlFor="lastName">Soyadın</label><input id="lastName" name="lastName" placeholder="Soyadın" autoComplete="family-name" required maxLength={80}/></div></div>}
          <div className="field"><label htmlFor="email">E-posta adresin</label><div className="input-with-icon"><Icon name="mail" size={18}/><input id="email" name="email" type="email" placeholder="merhaba@ornek.com" required autoComplete="email"/></div></div>
          <div className="field"><label htmlFor="password">Şifren{tab === 'register' && <span>En az 6 karakter</span>}</label><div className="input-with-icon"><Icon name="lock" size={18}/><input id="password" className={visible ? 'password-visible' : ''} name="password" type={visible ? 'text' : 'password'} placeholder="Şifreni yaz" required minLength={tab === 'register' ? 6 : undefined} autoComplete={tab === 'login' ? 'current-password' : 'new-password'}/><button type="button" className="icon-button" aria-label={visible ? 'Şifreyi gizle' : 'Şifreyi göster'} aria-pressed={visible} onClick={() => setVisible(!visible)}><Icon name={visible ? 'eyeOff' : 'eye'} size={18}/></button></div></div>
          {tab === 'register' && <><div className="field"><label htmlFor="confirmPassword">Şifreni tekrar yaz</label><div className="input-with-icon"><Icon name="lock" size={18}/><input id="confirmPassword" name="confirmPassword" type={visible ? 'text' : 'password'} placeholder="Bir kez daha" required autoComplete="new-password" minLength={6}/></div></div><div className="auth-privacy"><Icon name="leaf" size={16}/><span>Yalnızca hesabını oluşturmak için gereken bilgileri istiyoruz. Şifren güvenli biçimde saklanır.</span></div></>}
          <button type="submit" className="btn btn-wide" disabled={loading}><ButtonContent loading={loading}>{loading ? (tab === 'login' ? 'Giriş yapılıyor' : 'Hesabın oluşturuluyor') : (tab === 'login' ? 'Mutfağıma git' : 'Hesabımı oluştur')}</ButtonContent></button>
        </form>
        <div className="auth-bottom-note"><Icon name="leaf" size={15}/> Daha az israf için güzel bir başlangıç.</div>
      </div>
      <footer className="auth-footer">FoodApp · Mutfağına iyi bak.</footer>
    </main>
  </div>;
}
