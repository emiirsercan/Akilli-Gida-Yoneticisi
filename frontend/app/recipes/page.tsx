'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

interface RecipeStep { stepNumber: number; description: string; }
interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  steps: RecipeStep[];
  prepTime: string;
  difficulty: string;
  tips: string;
}

function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    'Kolay':  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
    'Orta':   { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
    'Zor':    { bg: 'rgba(239,68,68,0.12)',    color: '#ef4444' },
  };
  const style = colors[level] || colors['Orta'];
  return (
    <span style={{ background: style.bg, color: style.color, fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', border: `1px solid ${style.color}33` }}>
      {level}
    </span>
  );
}

export default function RecipesPage() {
  const [token, setToken]           = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput]           = useState('');
  const [recipes, setRecipes]       = useState<Recipe[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [expanded, setExpanded]     = useState<number | null>(null);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/'); return; }
    setToken(t);
    loadExpiringItems(t);
  }, []);

  const loadExpiringItems = async (t: string) => {
    try {
      const res = await fetch(`${API_URL}/api/FoodItems`, { headers: { Authorization: `Bearer ${t}` } });
      if (!res.ok) return;
      const items: Array<{ name: string; expirationDate: string }> = await res.json();
      const expiring = items
        .filter(i => {
          const days = Math.ceil((new Date(i.expirationDate).getTime() - Date.now()) / 86400000);
          return days <= 7 && days >= 0;
        })
        .map(i => i.name);
      if (expiring.length > 0) {
        setIngredients(expiring);
        setAutoLoaded(true);
      }
    } catch { /* ignore */ }
  };

  const addIngredient = () => {
    const trimmed = input.trim();
    if (!trimmed || ingredients.includes(trimmed)) return;
    setIngredients(prev => [...prev, trimmed]);
    setInput('');
  };

  const removeIngredient = (item: string) => setIngredients(prev => prev.filter(i => i !== item));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addIngredient(); }
  };

  const getSuggestions = async () => {
    if (ingredients.length === 0) { setError('En az bir malzeme ekleyin.'); return; }
    setLoading(true); setError(''); setRecipes([]); setExpanded(null);
    try {
      const res = await fetch(`${API_URL}/api/Recipes/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tarif alınamadı.');
      setRecipes(data.recipes || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Sidebar */}
      <div className="sidebar">
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ padding: '28px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🥗</div>
              <span style={{ fontSize: '18px', fontWeight: '800' }}><span className="gradient-text">Food</span><span>App</span></span>
            </div>
          </div>
        </Link>
        <nav style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link href="/dashboard" className="sidebar-item">
            <span>🏠</span> <span>Dashboard</span>
          </Link>
          <a className="sidebar-item active" href="#">
            <span>🍳</span> <span>Tarif Önerileri</span>
          </a>
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => { localStorage.removeItem('token'); router.push('/'); }} className="btn-ghost" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚪</span> Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: '260px', flex: 1, padding: '40px', maxWidth: '900px' }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
            <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              🍳
            </div>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '-1px' }}>
                <span className="gradient-text">AI</span> Tarif Önerileri
              </h1>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '3px' }}>
                Elindeki malzemeleri gir, Gemini AI senin için tarif üretsin
              </p>
            </div>
          </div>
        </div>

        {/* Auto-loaded notice */}
        {autoLoaded && (
          <div className="alert alert-warning animate-fade-up" style={{ marginBottom: '24px', borderRadius: '14px' }}>
            <span style={{ fontSize: '18px' }}>✨</span>
            <span>Yakında bozulacak ürünlerin otomatik olarak eklendi! İstersen değiştirebilirsin.</span>
          </div>
        )}

        {/* Input Card */}
        <div className="glass animate-fade-up" style={{ padding: '28px', marginBottom: '32px', animationDelay: '0.1s' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#f1f5f9' }}>
            🧄 Elindeki Malzemeleri Ekle
          </h2>

          {/* Ingredient Input */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <input className="input-field" type="text" placeholder="Malzeme adı yaz (örn: domates, yumurta, süt...)"
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              style={{ flex: 1 }} />
            <button onClick={addIngredient} style={{ padding: '13px 20px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '14px' }}>
              + Ekle
            </button>
          </div>

          {/* Ingredient Tags */}
          {ingredients.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {ingredients.map(item => (
                <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', color: '#34d399' }}>
                  {item}
                  <button onClick={() => removeIngredient(item)} style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer', fontSize: '14px', padding: '0', lineHeight: 1, opacity: 0.7 }}>✕</button>
                </span>
              ))}
              <button onClick={() => setIngredients([])} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '6px 12px', fontSize: '12px', color: '#f87171', cursor: 'pointer', fontWeight: '600' }}>
                Temizle
              </button>
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>⚠️ <span>{error}</span></div>}

          <button onClick={getSuggestions} disabled={loading || ingredients.length === 0} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {loading ? (
              <>
                <span className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                Gemini AI tarif hazırlıyor...
              </>
            ) : (
              <>✨ {ingredients.length} malzemeyle tarif öner</>
            )}
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2].map(i => (
              <div key={i} style={{ height: '120px', borderRadius: '18px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border)', animation: 'fadeIn 0.5s ease both', animationDelay: `${i * 0.1}s` }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '18px' }} />
              </div>
            ))}
          </div>
        )}

        {/* Recipes */}
        {!loading && recipes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
              🎉 {recipes.length} tarif önerisi hazır!
            </h2>
            {recipes.map((recipe, i) => (
              <div key={i} className="glass animate-fade-up" style={{ borderRadius: '20px', overflow: 'hidden', animationDelay: `${i * 0.1}s`, border: expanded === i ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)' }}>
                {/* Recipe Header */}
                <button onClick={() => setExpanded(expanded === i ? null : i)}
                  style={{ width: '100%', padding: '24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.3px' }}>{recipe.name}</h3>
                      <DifficultyBadge level={recipe.difficulty} />
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⏱ {recipe.prepTime}
                      </span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{recipe.description}</p>
                  </div>
                  <div style={{ fontSize: '20px', color: '#64748b', transition: 'transform 0.3s', transform: expanded === i ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>▼</div>
                </button>

                {/* Expanded Content */}
                {expanded === i && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '24px' }} className="animate-fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>

                      {/* Ingredients */}
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🧄 Malzemeler</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {recipe.ingredients.map((ing, j) => (
                            <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#cbd5e1' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                              {ing}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Steps */}
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 Yapılış</h4>
                        <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {recipe.steps.map((step) => (
                            <li key={step.stepNumber} style={{ display: 'flex', gap: '12px' }}>
                              <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0, marginTop: '1px', color: 'white' }}>
                                {step.stepNumber}
                              </span>
                              <span style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', paddingTop: '4px' }}>{step.description}</span>
                            </li>
                          ))}
                        </ol>

                        {/* Tips */}
                        {recipe.tips && (
                          <div style={{ marginTop: '20px', padding: '14px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px' }}>
                            <span style={{ fontSize: '13px', color: '#fcd34d', fontWeight: '600' }}>💡 İpucu: </span>
                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{recipe.tips}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && recipes.length === 0 && ingredients.length > 0 && !error && (
          <div className="glass" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
            <div style={{ fontSize: '16px', color: '#64748b' }}>Tarif önerisi almak için yukarıdaki butona tıkla</div>
          </div>
        )}

        {!loading && ingredients.length === 0 && (
          <div className="glass" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Malzeme ekle</div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Buzdolabındaki malzemeleri girerek AI'dan tarif önerisi al</div>
          </div>
        )}
      </div>
    </div>
  );
}
