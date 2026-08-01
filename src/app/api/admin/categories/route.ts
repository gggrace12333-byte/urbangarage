import { NextRequest, NextResponse } from 'next/server';

const URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const H = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' });

export async function GET() {
  const r = await fetch(`${URL}/rest/v1/categories?select=*&order=sort_order`, { headers: H() });
  return NextResponse.json(await r.json());
}
export async function POST(request: NextRequest) {
  const { name, slug: cs, description, sort_order } = await request.json();
  const slug = cs || name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const r = await fetch(`${URL}/rest/v1/categories`, { method: 'POST', headers: { ...H(), Prefer: 'return=representation' }, body: JSON.stringify({ name, slug, description: description||'', sort_order: sort_order||0 }) });
  return NextResponse.json((await r.json())?.[0], { status: 201 });
}
export async function PUT(request: NextRequest) {
  const { id, name, slug: cs, description, sort_order } = await request.json();
  const slug = cs || name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  await fetch(`${URL}/rest/v1/categories?id=eq.${id}`, { method: 'PATCH', headers: { ...H(), Prefer: 'return=minimal' }, body: JSON.stringify({ name, slug, description: description||'', sort_order: sort_order||0 }) });
  return NextResponse.json({ success: true });
}
export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  await fetch(`${URL}/rest/v1/categories?id=eq.${id}`, { method: 'DELETE', headers: H() });
  return NextResponse.json({ success: true });
}
