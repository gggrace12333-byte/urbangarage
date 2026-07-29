import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CartProvider } from '@/components/CartProvider';
import { LocaleProvider } from '@/components/LocaleProvider';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import ClientShell from '@/components/ClientShell';
import { getDb } from '@/lib/db';
import './globals.css';

export const metadata: Metadata = { title: 'Urban Garage — DriftPad for Hot Wheels', description: 'Premium motorised drifting display for 1:64 diecast collectors.' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let categories: any[] = [];
  let serverSettings: Record<string, string> = {};
  try {
    const db = getDb();
    categories = await db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
    const settingsRows = await db.prepare("SELECT * FROM site_settings WHERE key IN ('site_logo','announcement_left','announcement_right')").all() as { key: string; value: string }[];
    for (const r of settingsRows) serverSettings[r.key] = r.value;
  } catch { /* DB not available during build */ }

  return (
    <html lang="en"><body style={{fontFamily:'Inter,-apple-system,BlinkMacSystemFont,sans-serif',fontWeight:300}}><LocaleProvider><CartProvider><AnalyticsTracker /><Suspense fallback={null}><ClientShell serverCategories={JSON.parse(JSON.stringify(categories))} serverSettings={serverSettings}>{children}</ClientShell></Suspense></CartProvider></LocaleProvider></body></html>
  );
}
