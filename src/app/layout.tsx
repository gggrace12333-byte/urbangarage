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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const db = getDb();
  const categories: any[] = await db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  const settingsRows: any[] = await db.prepare('SELECT * FROM site_settings WHERE key IN (?,?,?,?)').all('site_logo','announcement_left','announcement_right','smtp_user');
  const serverSettings: Record<string, string> = {};
  for (const r of settingsRows) serverSettings[r.key] = r.value;

  return (
    <html lang="en"><body className={inter.className}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          section[style] { padding: 40px 16px !important; }
          div[style*="max-width:1400"], div[style*="maxWidth:1400"] { padding: 0 16px !important; }
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; gap: 12px !important; }
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
          section[style*="60vh"], section[style*="70vh"] { min-height: 35vh !important; }
          footer { padding: 40px 0 0 !important; }
          h1 { font-size: 24px !important; }
          h2 { font-size: 20px !important; }
        }
      `}} />
      <LocaleProvider><CartProvider><AnalyticsTracker /><Suspense fallback={null}><ClientShell serverCategories={JSON.parse(JSON.stringify(categories))} serverSettings={serverSettings}>{children}</ClientShell></Suspense></CartProvider></LocaleProvider>
    </body></html>
  );
}
