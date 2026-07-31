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

export async function GET() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*,categories(name)&order=created_at.desc`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  const data = await res.json();
  return NextResponse.json((data || []).map((p: any) => ({ ...p, category_name: p.categories?.name })));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  const product = {
    name: body.name,
    slug,
    description: body.description || '',
    price: body.price || 0,
    compare_at_price: body.compare_at_price || null,
    images: JSON.stringify(body.images || []),
    category_id: body.category_id || null,
    tags: body.tags || '',
    featured: body.featured ? 1 : 0,
    inventory: body.inventory || 100,
    active: body.active !== false ? 1 : 0,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, { method: 'POST', headers: headers(), body: JSON.stringify(product) });
  const data = await res.json();
  return NextResponse.json(data?.[0] || data, { status: 201 });
}
