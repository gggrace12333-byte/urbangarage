import { getDb } from '@/lib/db';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

const SENSITIVE_KEYS = ['smtp_pass', 'smtp_user', 'smtp_host', 'smtp_port'];

export default async function HomePage() {
  let settings: Record<string, string> = {};
  let products: any[] = [];
  let banners: any[] = [];
  try {
    const db = getDb();
    const settingsRows = await db.prepare('SELECT * FROM site_settings').all() as { key: string; value: string }[];
    for (const r of settingsRows) {
      if (!SENSITIVE_KEYS.includes(r.key)) {
        settings[r.key] = r.value;
      }
    }
    products = await db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.active = 1 AND p.featured = 1 ORDER BY p.created_at DESC').all();
    banners = await db.prepare('SELECT * FROM banners WHERE active = 1 ORDER BY sort_order').all();
  } catch { /* DB not available during build */ }

  return <HomeClient settings={settings} products={JSON.parse(JSON.stringify(products))} banners={JSON.parse(JSON.stringify(banners))} />;
}
