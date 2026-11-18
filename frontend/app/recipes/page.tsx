'use client';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { AppShell } from '@/components/app-shell';
import { FoodArt } from '@/components/food-art';
import { Icon } from '@/components/icon';
import { EmptyState, ButtonContent, Notice } from '@/components/ui';
import { api, ApiError, errorMessage, useSession, type FoodItem, type Recipe } from '@/lib/app';

function RecipeCard({ recipe, index }: { recipe: Recipe; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const id = useId();
  return <article className="recipe-card" data-open={open}><button className="recipe-card-heading" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><span className="recipe-number">0{index + 1}</span><div><h3>{recipe.name}</h3><p>{recipe.description}</p><div className="recipe-meta"><span><Icon name="clock" size={12}/>{recipe.prepTime}</span><span className="difficulty"><Icon name="chef" size={13}/>{recipe.difficulty}</span><span>{recipe.ingredients.length} malzeme</span></div></div><Icon name="down" size={17} className="recipe-chevron"/></button><div id={id} hidden={!open}>{open && <div className="recipe-details"><h4>Tezgâhında neler olsun?</h4><ul className="recipe-ingredients">{recipe.ingredients.map((ingredient, itemIndex) => <li key={`${itemIndex}-${ingredient}`}><Icon name="check" size={13}/>{ingredient}</li>)}</ul><h4>Hadi mutfağa</h4><ol className="recipe-steps">{recipe.steps.map((step, stepIndex) => <li key={`${step.stepNumber}-${stepIndex}`}><span className="step-number">{step.stepNumber}</span><p>{step.description}</p></li>)}</ol>{recipe.tips && <div className="recipe-tip"><Icon name="sun" size={20}/><p><strong>Şefin küçük notu</strong><br/>{recipe.tips}</p></div>}</div>}</div></article>;
}

export default function RecipesPage() {
  const { token, logout } = useSession();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [inventoryError, setInventoryError] = useState('');
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    async function load() {
      try {
        const items = await api<FoodItem[]>('FoodItems', { signal: controller.signal }, token);
        const expiring = items.filter(item => {
          const days = Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / 86400000);
          return days <= 7 && days >= 0;
        }).map(item => item.name);
        if (expiring.length) { setIngredients([...new Set(expiring)]); setAutoLoaded(true); }
      } catch (err) {
        if (!controller.signal.aborted) {
          if (err instanceof ApiError && err.status === 401) { localStorage.removeItem('token'); window.location.replace('/'); return; }
          setInventoryError('Dolabındaki ürünler alınamadı. Malzemelerini elle ekleyerek devam edebilirsin.');
        }
      } finally { if (!controller.signal.aborted) setInventoryLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [token]);

  function addIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const value = input.trim();
    if (!value) return;
    if (ingredients.some(item => item.toLocaleLowerCase('tr-TR') === value.toLocaleLowerCase('tr-TR'))) { setInput(''); return; }
    setIngredients(previous => [...previous, value]); setInput(''); setError('');
  }
  async function suggest() {
    if (!ingredients.length || loading || !token) return;
    setLoading(true); setError(''); setRecipes([]); setGenerated(false);
    try {
      const result = await api<{ recipes: Recipe[] }>('Recipes/suggest', { method: 'POST', body: JSON.stringify({ ingredients }) }, token);
      setRecipes(result.recipes || []); setGenerated(true);
    } catch (err) { if (err instanceof ApiError && err.status === 401) logout(); else setError(errorMessage(err)); }
    finally { setLoading(false); }
  }

  return <AppShell><div className="page-heading"><div><span className="eyebrow">ELİNDEKİLERDEN İLHAM AL</span><h1>Bugün ne pişirsem?</h1><p>Biraz malzeme, biraz yaratıcılık. Gerisi bizde.</p></div></div><section className="recipe-intro"><div><span className="eyebrow">MUTFAKTA HER ŞEY DEĞERLİ</span><h2>Dolabından sofrana,<br/>yeni bir fikir.</h2><p>Malzemelerini seç, yapay zekâ destekli mutfak asistanın sana üç farklı tarif hazırlasın.</p></div><FoodArt name="havuç"/></section><div className="recipe-layout"><section className="ingredients-panel"><h2>Elinde neler var?</h2><p>Dolabından gelenleri kullan veya aklına gelen bir malzemeyi ekle.</p><form className="ingredient-input" onSubmit={addIngredient}><input id="ingredient" aria-label="Malzeme adı" placeholder="Örn. domates, yumurta…" value={input} maxLength={100} onChange={e => setInput(e.target.value)} disabled={loading || inventoryLoading}/><button type="submit" aria-label="Malzemeyi ekle" disabled={!input.trim() || loading || inventoryLoading}><Icon name="plus" size={19}/></button></form>{inventoryLoading && <p className="ingredient-help" role="status"><span className="spinner"/> Dolabına göz atıyoruz…</p>}{inventoryError && <Notice type="info">{inventoryError}</Notice>}<div className="ingredient-count"><span>{ingredients.length} malzeme seçildi</span>{ingredients.length > 0 && <button onClick={() => setIngredients([])} disabled={loading}>Temizle</button>}</div><div className="ingredient-chips" aria-live="polite">{ingredients.map(ingredient => <span className="ingredient-chip" key={ingredient}>{ingredient}<button aria-label={`${ingredient} malzemesini kaldır`} disabled={loading} onClick={() => setIngredients(previous => previous.filter(item => item !== ingredient))}><Icon name="close" size={11}/></button></span>)}</div><div className="ingredient-help"><Icon name="leaf" size={15}/><span>{autoLoaded ? 'Tarihi 7 gün içinde yaklaşan ürünlerini senin için ekledik. Listeyi dilediğin gibi değiştirebilirsin.' : 'En az bir malzeme ekle. Elindekileri birlikte güzel bir yemeğe dönüştürelim.'}</span></div><button className="btn btn-wide" onClick={suggest} disabled={!ingredients.length || loading || inventoryLoading || !token}><ButtonContent loading={loading} icon="sparkles">{loading ? 'Tarifler hazırlanıyor' : 'Bana ilham ver'}</ButtonContent></button></section><section className="recipe-results" aria-labelledby="recipes-title"><div className="section-heading"><h2 id="recipes-title">Senin için sofrada <span>{recipes.length ? `${recipes.length} tarif` : ''}</span></h2><Icon name="chef" size={20}/></div>{error && <Notice>{error}</Notice>}{loading ? <div className="recipe-loading" role="status"><span className="spinner"/><h3>Güzel fikirler pişiyor.</h3><p>Malzemelerine uygun tarifleri hazırlıyoruz.</p></div> : recipes.length ? <div className="recipe-stack stagger">{recipes.map((recipe, index) => <RecipeCard key={`${index}-${recipe.name}`} recipe={recipe} index={index}/>)}</div> : <EmptyState title={generated ? 'Bu kez bir tarif çıkmadı.' : 'Sıradaki favorin burada.'} description={generated ? 'Farklı malzemeler ekleyip yeniden deneyebilirsin.' : 'Soldan malzemelerini seç, sana özel tarifler bu alanda yerini alsın.'} icon="chef"/>}</section></div></AppShell>;
}
