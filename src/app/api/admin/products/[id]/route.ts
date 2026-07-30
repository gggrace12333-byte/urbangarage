import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb(); const { id } = await params; const body = await request.json();
  await db.prepare('UPDATE products SET name=?,description=?,price=?,compare_at_price=?,images=?,category_id=?,tags=?,featured=?,inventory=?,active=?,updated_at=datetime(\'now\') WHERE id=?').run(
    body.name, body.description||'', body.price, body.compare_at_price||null, JSON.stringify(body.images||[]), body.category_id||null, body.tags||'', body.sku||'', body.featured?1:0, body.inventory||0, body.active!==false?1:0, id
  );
  const p = await db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(id);
  return NextResponse.json(p);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb(); const { id } = await params;
  await db.prepare('DELETE FROM products WHERE id=?').run(id);
  return NextResponse.json({success:true});
}
