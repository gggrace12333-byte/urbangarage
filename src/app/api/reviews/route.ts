import { NextRequest, NextResponse } from 'next/server';

const URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const H = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' });

export async function GET(request: NextRequest) {
  const pid = request.nextUrl.searchParams.get('product_id');
  if (pid) {
    const r = await fetch(`${URL}/rest/v1/reviews?select=*&product_id=eq.${pid}&order=created_at.desc`, { headers: H() });
    return NextResponse.json(await r.json());
  }
  const r = await fetch(`${URL}/rest/v1/reviews?select=*,products(name)&order=created_at.desc`, { headers: H() });
  const rows: any[] = await r.json();
  return NextResponse.json(rows.map(row => ({ ...row, product_name: row.products?.name })));
}

export async function POST(request: NextRequest) {
  const b = await request.json();
  const r = await fetch(`${URL}/rest/v1/reviews`, { method: 'POST', headers: { ...H(), Prefer: 'return=representation' }, body: JSON.stringify({ product_id: b.product_id, user_name: b.user_name, rating: b.rating, comment: b.comment||'' }) });
  return NextResponse.json((await r.json())?.[0], { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  await fetch(`${URL}/rest/v1/reviews?id=eq.${id}`, { method: 'DELETE', headers: H() });
  return NextResponse.json({ success: true });
}
