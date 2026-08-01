import { NextRequest, NextResponse } from 'next/server';

const URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';
  if (q.length < 2) return NextResponse.json([]);
  const res = await fetch(`${URL}/rest/v1/products?select=id,name,slug,price,images&active=eq.1&or=(name.ilike.*${encodeURIComponent(q)}*,description.ilike.*${encodeURIComponent(q)}*)&limit=10`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  return NextResponse.json(await res.json());
}
