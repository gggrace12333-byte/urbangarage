import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const q = (request.nextUrl.searchParams.get('q') || '').trim();
    if (!q || q.length < 2) return NextResponse.json([]);
    if (q.length > 100) return NextResponse.json([]);
    
    const db = getDb();
    const results = db.prepare(
      'SELECT id, name, slug, price, images FROM products WHERE active = 1 AND (name LIKE ? OR description LIKE ?) LIMIT 5'
    ).all(`%${q}%`, `%${q}%`);
    return NextResponse.json(results);
  } catch (error) {
    // Search error — returning empty results
    return NextResponse.json([], { status: 200 });
  }
}
