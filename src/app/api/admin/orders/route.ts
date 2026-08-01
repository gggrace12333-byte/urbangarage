import { NextRequest, NextResponse } from 'next/server';

const URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const H = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' });

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  let query = `${URL}/rest/v1/orders?select=*&order=created_at.desc`;
  if (email) query += `&customer_email=eq.${encodeURIComponent(email)}`;
  const r = await fetch(query, { headers: H() });
  const orders: any[] = await r.json();
  for (const order of orders) {
    const ir = await fetch(`${URL}/rest/v1/order_items?select=*&order_id=eq.${order.id}`, { headers: H() });
    order.items = await ir.json();
  }
  return NextResponse.json(orders);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const updates: any = {};
  if (body.tracking_number) {
    updates.tracking_number = body.tracking_number;
    updates.tracking_url = body.tracking_url || '';
    updates.status = body.status || 'shipped';
  } else {
    updates.status = body.status;
  }
  await fetch(`${URL}/rest/v1/orders?id=eq.${body.id}`, { method: 'PATCH', headers: { ...H(), Prefer: 'return=minimal' }, body: JSON.stringify(updates) });
  return NextResponse.json({ success: true });
}
