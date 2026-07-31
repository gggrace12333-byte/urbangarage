import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.event) return NextResponse.json({ error: 'event required' }, { status: 400 });
    await fetch(`${SUPABASE_URL}/rest/v1/analytics`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ event: body.event, country: body.country || 'Unknown', page: body.page || '', value: body.value || 0, created_at: new Date().toISOString() }),
    });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: true }); }
}

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const days = parseInt(p.get('days') || '30');
  const since = new Date(); since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString();

  const fetchCount = async (event: string) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/analytics?select=id&event=eq.${event}&created_at=gte.${encodeURIComponent(sinceStr)}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
    const data = await res.json();
    return (data || []).length;
  };

  const totalVisits = await fetchCount('pageview');
  const cartAdds = await fetchCount('add_to_cart');

  const or = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=id,total,status&created_at=gte.${encodeURIComponent(sinceStr)}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  const orders = await or.json();
  const orderCount = (orders || []).length;
  const revenue = (orders || []).reduce((s: number, o: any) => s + (o.total || 0), 0);
  const refunds = (orders || []).filter((o: any) => o.status === 'cancelled').length;

  return NextResponse.json({ totalVisits, cartAdds, orders: orderCount, refunds, revenue, countries: [], trend: [] });
}
