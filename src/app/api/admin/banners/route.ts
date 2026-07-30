import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const banners = await db.prepare('SELECT * FROM banners ORDER BY sort_order').all();
  return NextResponse.json(banners);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const result = await db.prepare(
    'INSERT INTO banners (title, subtitle, image, link, button_text, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(body.title || '', body.subtitle || '', body.image || '', body.link || '', body.button_text || '', body.sort_order || 0, body.active !== false ? 1 : 0);
  const banner = await db.prepare('SELECT * FROM banners WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(banner, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  await db.prepare(
    'UPDATE banners SET title=?, subtitle=?, image=?, link=?, button_text=?, sort_order=?, active=? WHERE id=?'
  ).run(body.title || '', body.subtitle || '', body.image || '', body.link || '', body.button_text || '', body.sort_order || 0, body.active !== false ? 1 : 0, body.id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const db = getDb();
  const { id } = await request.json();
  await db.prepare('DELETE FROM banners WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
