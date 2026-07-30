import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const __r = await db.prepare('SELECT * FROM categories ORDER BY sort_order').all(); return NextResponse.json(__r);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const { name, slug: customSlug, description, sort_order } = await request.json();
  const slug = customSlug || name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const r = await db.prepare('INSERT INTO categories (name,slug,description,sort_order) VALUES (?,?,?,?)').run(name,slug,description||'',sort_order||0);
  return NextResponse.json(await db.prepare('SELECT * FROM categories WHERE id=?').get(r.lastInsertRowid),{status:201});
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  const { id, name, slug: customSlug, description, sort_order } = await request.json();
  const slug = customSlug || name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  await db.prepare('UPDATE categories SET name=?,slug=?,description=?,sort_order=? WHERE id=?').run(name,slug,description||'',sort_order||0,id);
  return NextResponse.json({success:true});
}

export async function DELETE(request: NextRequest) {
  const db = getDb();
  const { id } = await request.json();
  await db.prepare('DELETE FROM categories WHERE id=?').run(id);
  return NextResponse.json({success:true});
}
