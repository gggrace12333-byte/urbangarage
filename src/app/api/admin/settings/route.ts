import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/db';

const SENSITIVE_KEYS = ['smtp_pass'];

// GET is public — but sensitive values are masked
export async function GET() {
  const db = getDb();
  const rows = await db.prepare('SELECT * FROM site_settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = SENSITIVE_KEYS.includes(r.key) ? '********' : r.value;
  }
  return NextResponse.json(settings);
}

// POST/PUT requires admin auth — only updates provided keys
export async function POST(request: NextRequest) {
  const authErr = requireAdmin(request); if (authErr) return authErr;
  const db = getDb();
  const body = await request.json();
  const upsert = await db.prepare('INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value');

  for (const [k, v] of Object.entries(body)) {
    // Skip masked values — don't overwrite with placeholder
    if (v === '********' && SENSITIVE_KEYS.includes(k)) continue;
    upsert.run(k, String(v));
  }
  return NextResponse.json({ success: true });
}
