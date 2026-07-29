import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(request); if (authErr) return authErr;
  const db = getDb(); const { id } = await params; const body = await request.json();
  db.prepare('UPDATE products SET name=?,description=?,price=?,compare_at_price=?,images=?,description_images=?,category_id=?,tags=?,sku=?,featured=?,inventory=?,active=?,spec_dimensions=?,spec_scale=?,spec_power=?,spec_lighting=?,features=?,updated_at=datetime(\'now\') WHERE id=?').run(
    body.name, body.description||'', body.price, body.compare_at_price||null, JSON.stringify(body.images||[]), JSON.stringify(body.description_images||[]),
    body.category_id||null, body.tags||'', body.sku||'', body.featured?1:0, body.inventory||0, body.active!==false?1:0,
    body.spec_dimensions||'', body.spec_scale||'', body.spec_power||'', body.spec_lighting||'', body.features||'', id
  );
  const p = db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(id);
  return NextResponse.json(p);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authErr = requireAdmin(request); if (authErr) return authErr;
  const db = getDb(); const { id } = await params;
  db.prepare('DELETE FROM products WHERE id=?').run(id);
  return NextResponse.json({success:true});
}
