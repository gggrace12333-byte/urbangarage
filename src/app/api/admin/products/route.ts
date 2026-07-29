import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const products = await db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC').all();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const authErr = requireAdmin(request); if (authErr) return authErr;
  const db = getDb();
  const body = await request.json();
  if (!body.name || body.price == null) return NextResponse.json({ error: 'Name and price required' }, { status: 400 });
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const images = body.images || [];
  const imageJson = JSON.stringify(images);
  const descImagesJson = JSON.stringify(body.description_images || []);
  const r = await db.prepare('INSERT INTO products (name,slug,description,price,compare_at_price,images,description_images,category_id,tags,sku,featured,inventory,active,spec_dimensions,spec_scale,spec_power,spec_lighting,features) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(
    body.name, slug, body.description || '', body.price, body.compare_at_price || null, imageJson, descImagesJson,
    body.category_id || null, body.tags || '', images[0] || '', body.featured ? 1 : 0, body.inventory || 100, body.active !== false ? 1 : 0,
    body.spec_dimensions || '', body.spec_scale || '', body.spec_power || '', body.spec_lighting || '', body.features || ''
  );
  const productId = r.lastInsertRowid;
  await db.prepare('INSERT INTO product_variants (product_id, name, value, image, images, price, compare_at_price, inventory, sort_order) VALUES (?,?,?,?,?,?,?,?,0)').run(
    productId, body.name, 'Default', images[0] || '', imageJson, body.price, body.compare_at_price || null, body.inventory || 100
  );
  const p = await db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(productId);
  return NextResponse.json(p, { status: 201 });
}
