import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const db = getDb();
  const email = request.nextUrl.searchParams.get('email');

  // Public lookup by email — used by order tracking page (no auth needed)
  if (email) {
    const orders = await db.prepare('SELECT id, order_number, customer_name, customer_email, status, tracking_number, tracking_url, subtotal, shipping, tax, total, created_at, updated_at FROM orders WHERE customer_email = ? ORDER BY created_at DESC').all(email);
    for (const order of orders as any[]) {
      order.items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    }
    return NextResponse.json(orders);
  }

  // Admin listing — requires auth
  const authErr = requireAdmin(request); if (authErr) return authErr;
  const orders = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  for (const order of orders as any[]) {
    order.items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  }
  return NextResponse.json(orders);
}

export async function PUT(request: NextRequest) {
  const authErr = requireAdmin(request); if (authErr) return authErr;
  const db = getDb();
  const body = await request.json();
  if (body.tracking_number) {
    await db.prepare('UPDATE orders SET tracking_number=?, tracking_url=?, status=?, updated_at=datetime(\'now\') WHERE id=?').run(body.tracking_number, body.tracking_url||'', body.status||'shipped', body.id);
  } else {
    await db.prepare('UPDATE orders SET status=?, updated_at=datetime(\'now\') WHERE id=?').run(body.status, body.id);
  }
  return NextResponse.json({success:true});
}
