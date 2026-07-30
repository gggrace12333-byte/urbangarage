import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const db = getDb();
  const productId = request.nextUrl.searchParams.get('product_id');
  if (productId) {
    const __r = await db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(productId); return NextResponse.json(__r);
  }
  const __r = await db.prepare('SELECT r.*, p.name as product_name FROM reviews r LEFT JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC').all(); return NextResponse.json(__r);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const { product_id, user_name, rating, comment } = await request.json();
  const r = await db.prepare('INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?,?,?,?)').run(product_id, user_name, rating, comment || '');
  return NextResponse.json(await db.prepare('SELECT * FROM reviews WHERE id = ?').get(r.lastInsertRowid), { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const db = getDb();
  const { id } = await request.json();
  await db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
