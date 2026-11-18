import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'FoodApp — Az israf, bol lezzet.',
  description: 'Dolabındakileri keşfet, tazeliği takip et ve elindeki malzemelerle güzel yemekler pişir.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f7f7f0' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}
