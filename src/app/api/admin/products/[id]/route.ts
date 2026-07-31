import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function headers() {
  return {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, any> = {
    name: body.name,
    description: body.description || '',
    price: body.price || 0,
    compare_at_price: body.compare_at_price || null,
    images: JSON.stringify(body.images || []),
    category_id: body.category_id || null,
    tags: body.tags || '',
    featured: body.featured ? 1 : 0,
    inventory: body.inventory || 0,
    active: body.active !== false ? 1 : 0,
    updated_at: new Date().toISOString(),
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  return NextResponse.json(data?.[0] || data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    method: 'DELETE',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  return NextResponse.json({ success: true });
}
