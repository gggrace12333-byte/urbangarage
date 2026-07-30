import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const products = await db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC').all();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const r = await db.prepare(`INSERT INTO products (name,slug,description,price,compare_at_price,images,category_id,tags,sku,featured,inventory,active) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    body.name, slug, body.description||'', body.price, body.compare_at_price||null, JSON.stringify(body.images||[]), body.category_id||null, body.tags||'', body.featured?1:0, body.inventory||100, body.active!==false?1:0
  );
  const p = await db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(r.lastInsertRowid);
  return NextResponse.json(p, {status:201});
}
