import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const rows = await db.prepare('SELECT * FROM site_settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const upsert = await db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(body)) {
    upsert.run(k, String(v));
  }
  return NextResponse.json({ success: true });
}
