import { NextRequest, NextResponse } from 'next/server';

const URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const H = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' });

export async function GET(request: NextRequest) {
  const pid = request.nextUrl.searchParams.get('product_id');
  if (!pid) return NextResponse.json([]);
  const r = await fetch(`${URL}/rest/v1/product_variants?select=*&product_id=eq.${pid}&order=sort_order`, { headers: H() });
  return NextResponse.json(await r.json());
}

export async function POST(request: NextRequest) {
  const b = await request.json();
  const r = await fetch(`${URL}/rest/v1/product_variants`, { method: 'POST', headers: { ...H(), Prefer: 'return=representation' }, body: JSON.stringify({ product_id: b.product_id, name: b.name, value: b.value||'', image: b.image||'', price_adjustment: b.price_adjustment||0, inventory: b.inventory||0, sort_order: b.sort_order||0 }) });
  return NextResponse.json((await r.json())?.[0], { status: 201 });
}

export async function PUT(request: NextRequest) {
  const b = await request.json();
  await fetch(`${URL}/rest/v1/product_variants?id=eq.${b.id}`, { method: 'PATCH', headers: { ...H(), Prefer: 'return=minimal' }, body: JSON.stringify({ name: b.name, value: b.value||'', image: b.image||'', price_adjustment: b.price_adjustment||0, inventory: b.inventory||0, sort_order: b.sort_order||0 }) });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  await fetch(`${URL}/rest/v1/product_variants?id=eq.${id}`, { method: 'DELETE', headers: H() });
  return NextResponse.json({ success: true });
}
