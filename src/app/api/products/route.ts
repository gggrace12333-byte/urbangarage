import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');

  if (slug) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*,categories(name)&slug=eq.${encodeURIComponent(slug)}&active=eq.1`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    const data = await res.json();
    const p = data?.[0];
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      ...p,
      category_name: p.categories?.name,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
    });
  }

  let url = `${SUPABASE_URL}/rest/v1/products?select=*,categories(name)&active=eq.1&order=created_at.desc`;
  if (featured === '1') url += '&featured=eq.1';

  const res = await fetch(url, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  const data: any[] = await res.json();

  const products = (data || []).map((p: any) => ({
    ...p,
    category_name: p.categories?.name,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
  }));

  return NextResponse.json(products);
}
