import { NextRequest, NextResponse } from 'next/server';

const URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const H = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' });

export async function GET() {
  const r = await fetch(`${URL}/rest/v1/banners?select=*&order=sort_order`, { headers: H() });
  return NextResponse.json(await r.json());
}
export async function POST(request: NextRequest) {
  const b = await request.json();
  const r = await fetch(`${URL}/rest/v1/banners`, { method: 'POST', headers: { ...H(), Prefer: 'return=representation' }, body: JSON.stringify({ title: b.title||'', subtitle: b.subtitle||'', image: b.image||'', link: b.link||'', button_text: b.button_text||'', sort_order: b.sort_order||0, active: b.active!==false?1:0 }) });
  return NextResponse.json((await r.json())?.[0], { status: 201 });
}
export async function PUT(request: NextRequest) {
  const b = await request.json();
  await fetch(`${URL}/rest/v1/banners?id=eq.${b.id}`, { method: 'PATCH', headers: { ...H(), Prefer: 'return=minimal' }, body: JSON.stringify({ title: b.title, subtitle: b.subtitle, image: b.image, link: b.link, button_text: b.button_text, sort_order: b.sort_order, active: b.active!==false?1:0 }) });
  return NextResponse.json({ success: true });
}
export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  await fetch(`${URL}/rest/v1/banners?id=eq.${id}`, { method: 'DELETE', headers: H() });
  return NextResponse.json({ success: true });
}
