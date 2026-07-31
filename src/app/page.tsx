import { getDb } from '@/lib/db';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const db = getDb();
  const settingsRows: any[] = await db.prepare('SELECT * FROM site_settings').all();
  const settings: Record<string, string> = {};
  for (const r of settingsRows) settings[r.key] = r.value;

  const products: any[] = await db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.active = 1 AND p.featured = 1 ORDER BY p.created_at DESC').all();
  const banners: any[] = await db.prepare('SELECT * FROM banners WHERE active = 1 ORDER BY sort_order').all();

  return <HomeClient settings={settings} products={JSON.parse(JSON.stringify(products))} banners={JSON.parse(JSON.stringify(banners))} />;
}
