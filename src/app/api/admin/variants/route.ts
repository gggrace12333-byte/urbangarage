import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const db = getDb();
  const productId = request.nextUrl.searchParams.get('product_id');
  if (productId) {
    const __r = await db.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order').all(productId); return NextResponse.json(__r);
  }
  return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const { product_id, name, value, price_adjustment, inventory, sort_order } = await request.json();
  const r = await db.prepare('INSERT INTO product_variants (product_id, name, value, image, price_adjustment, inventory, sort_order) VALUES (?,?,?,?,?,?,?)').run(product_id, name, value || '', price_adjustment || 0, inventory || 0, sort_order || 0);
  return NextResponse.json(await db.prepare('SELECT * FROM product_variants WHERE id = ?').get(r.lastInsertRowid), { status: 201 });
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  const { id, name, value, price_adjustment, inventory, sort_order } = await request.json();
  await db.prepare('UPDATE product_variants SET name=?, value=?, image=?, price_adjustment=?, inventory=?, sort_order=? WHERE id=?').run(name, value || '', price_adjustment || 0, inventory || 0, sort_order || 0, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const db = getDb();
  const { id } = await request.json();
  await db.prepare('DELETE FROM product_variants WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
