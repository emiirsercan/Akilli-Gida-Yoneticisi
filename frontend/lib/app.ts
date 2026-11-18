'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
export interface FoodItem { id: string; name: string; barcode?: string; expirationDate: string; quantity: number; createdAt: string }
export interface Recipe { name: string; description: string; ingredients: string[]; steps: { stepNumber: number; description: string }[]; prepTime: string; difficulty: string; tips: string }
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function api<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let response: Response;
  try { response = await fetch(`${API_URL}/api/${path}`, { ...options, headers }); }
  catch { throw new Error('Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.'); }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status >= 500) {
      throw new ApiError('Sunucuda bir sorun oluştu. Biraz sonra tekrar dene.', response.status);
    }
    const validation = data?.errors ? Object.values(data.errors).flat().join(' ') : '';
    const fallback = response.status === 401 && token
      ? 'Oturumun sona erdi. Lütfen tekrar giriş yap.'
      : 'İşlem tamamlanamadı. Lütfen tekrar dene.';
    throw new ApiError(data?.error || validation || fallback, response.status);
  }
  return data as T;
}
function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange); window.addEventListener('foodapp-session', onChange);
  return () => { window.removeEventListener('storage', onChange); window.removeEventListener('foodapp-session', onChange); };
}
export function setSession(token: string | null) {
  if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
  window.dispatchEvent(new Event('foodapp-session'));
}
export function useSession() {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, () => localStorage.getItem('token'), () => null);
  let name = 'Mutfak dostum';
  try {
    if (token) {
      const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(encoded), c => c.charCodeAt(0))));
      name = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Mutfak dostum';
    }
  } catch { /* API validates the token; keep the fallback name. */ }
  useEffect(() => { if (!localStorage.getItem('token')) router.replace('/'); }, [router, token]);
  const logout = () => { setSession(null); router.replace('/'); };
  return { token, name, logout };
}
export function daysLeft(date: string) {
  const today = new Date(); const expiration = new Date(date);
  today.setHours(0, 0, 0, 0); expiration.setHours(0, 0, 0, 0);
  return Math.ceil((expiration.getTime() - today.getTime()) / 86400000);
}
export function foodStatus(days: number) {
  if (days <= 0) return { key: 'expired', label: 'Süresi doldu', note: 'Tarihini kontrol et' };
  if (days <= 2) return { key: 'critical', label: 'Önce bunu tüket', note: `${days} gün kaldı` };
  if (days <= 5) return { key: 'warning', label: 'Yaklaşıyor', note: `${days} gün kaldı` };
  return { key: 'fresh', label: 'Taptaze', note: `${days} gün kaldı` };
}
export function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Bir hata oluştu. Tekrar deneyebilirsin.'; }
