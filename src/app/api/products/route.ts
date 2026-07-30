import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const slug = searchParams.get('slug');
    const db = getDb();

    if (slug) {
      const p = await db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.active = 1').get(slug);
      if (!p) return NextResponse.json({error:'Not found'},{status:404});
      return NextResponse.json(p);
    }

    let q = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.active = 1';
    const params: any[] = [];
    if (category) { q += ' AND (c.name = ? OR c.slug = ?)'; params.push(category, category); }
    if (featured === '1') { q += ' AND p.featured = 1'; }
    q += ' ORDER BY p.featured DESC, p.created_at DESC';
    const __r = await db.prepare(q).all(...params);
    return NextResponse.json(__r);
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
  }
}
