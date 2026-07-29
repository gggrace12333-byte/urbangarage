import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/db';

// GET is public — used by product detail page to show variant options
export async function GET(request: NextRequest) {
  const db = getDb();
  const productId = request.nextUrl.searchParams.get('product_id');
  if (productId) {
    return NextResponse.json(db.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order').all(productId));
  }
  return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
  const authErr = requireAdmin(request); if (authErr) return authErr;
  const db = getDb();
  const { product_id, name, value, image, images, price, compare_at_price, inventory, sort_order } = await request.json();
  const r = db.prepare('INSERT INTO product_variants (product_id, name, value, image, images, price, compare_at_price, inventory, sort_order) VALUES (?,?,?,?,?,?,?,?,?)').run(
    product_id, name, value || '', image || '', JSON.stringify(images || []), price || 0, compare_at_price || null, inventory || 0, sort_order || 0
  );
  return NextResponse.json(db.prepare('SELECT * FROM product_variants WHERE id = ?').get(r.lastInsertRowid), { status: 201 });
}

export async function PUT(request: NextRequest) {
  const authErr = requireAdmin(request); if (authErr) return authErr;
  const db = getDb();
  const { id, name, value, image, images, price, compare_at_price, inventory, sort_order } = await request.json();
  db.prepare('UPDATE product_variants SET name=?, value=?, image=?, images=?, price=?, compare_at_price=?, inventory=?, sort_order=? WHERE id=?').run(
    name, value || '', image || '', JSON.stringify(images || []), price || 0, compare_at_price || null, inventory || 0, sort_order || 0, id
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const authErr = requireAdmin(request); if (authErr) return authErr;
  const db = getDb();
  const { id } = await request.json();
  db.prepare('DELETE FROM product_variants WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
