import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { event, country, page, value } = await request.json();
  if (!event) return NextResponse.json({ error: 'event required' }, { status: 400 });
  const db = getDb();
  await db.prepare('INSERT INTO analytics (event, country, page, value) VALUES (?,?,?,?)').run(event, country || 'Unknown', page || '', value || 0);
  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const db = getDb();
  const p = request.nextUrl.searchParams;
  const days = parseInt(p.get('days') || '30');
  const since = new Date(); since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().replace('T',' ').substring(0,19);

  try {
    const totalVisits = ((await db.prepare('SELECT COUNT(*) as c FROM analytics WHERE event=? AND created_at >= ?').get('pageview', sinceStr)) as any)?.c || 0;
    const cartAdds = ((await db.prepare('SELECT COUNT(*) as c FROM analytics WHERE event=? AND created_at >= ?').get('add_to_cart', sinceStr)) as any)?.c || 0;
    const orders = ((await db.prepare('SELECT COUNT(*) as c FROM orders WHERE created_at >= ?').get(sinceStr)) as any)?.c || 0;
    const refunds = ((await db.prepare("SELECT COUNT(*) as c FROM orders WHERE status='cancelled' AND created_at >= ?").get(sinceStr)) as any)?.c || 0;
    const revenue = ((await db.prepare("SELECT COALESCE(SUM(total),0) as c FROM orders WHERE status IN ('paid','shipped','delivered') AND created_at >= ?").get(sinceStr)) as any)?.c || 0;
    const countries = (await db.prepare('SELECT country, COUNT(*) as count FROM analytics WHERE event=? AND created_at >= ? GROUP BY country ORDER BY count DESC LIMIT 10').all('pageview', sinceStr)) || [];
    const trend = (await db.prepare('SELECT DATE(created_at) as date, event, COUNT(*) as count FROM analytics WHERE created_at >= ? GROUP BY DATE(created_at), event ORDER BY date').all(sinceStr)) || [];
    return NextResponse.json({ totalVisits, cartAdds, orders, refunds, revenue, countries, trend });
  } catch {
    return NextResponse.json({ totalVisits:0, cartAdds:0, orders:0, refunds:0, revenue:0, countries:[], trend:[] });
  }
}
