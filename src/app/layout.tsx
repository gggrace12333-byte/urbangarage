import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { CartProvider } from '@/components/CartProvider';
import { LocaleProvider } from '@/components/LocaleProvider';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import ClientShell from '@/components/ClientShell';
import { getDb } from '@/lib/db';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['200','300','400','500','600','700'] });

export const metadata: Metadata = { title: 'Urban Garage — DriftPad for Hot Wheels', description: 'Premium motorised drifting display for 1:64 diecast collectors.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  const settingsRows = db.prepare('SELECT * FROM site_settings WHERE key IN (?,?,?,?)').all('site_logo','announcement_left','announcement_right','smtp_user') as { key: string; value: string }[];
  const serverSettings: Record<string, string> = {};
  for (const r of settingsRows) serverSettings[r.key] = r.value;

  return (
    <html lang="en"><body className={inter.className}><LocaleProvider><CartProvider><AnalyticsTracker /><Suspense fallback={null}><ClientShell serverCategories={JSON.parse(JSON.stringify(categories))} serverSettings={serverSettings}>{children}</ClientShell></Suspense></CartProvider></LocaleProvider></body></html>
  );
}
