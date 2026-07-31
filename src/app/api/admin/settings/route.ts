import { NextRequest, NextResponse } from 'next/server';

const URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const H = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' });

export async function GET() {
  const r = await fetch(`${URL}/rest/v1/site_settings?select=*`, { headers: H() });
  const rows: any[] = await r.json();
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.key] = row.value;
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  for (const [k, v] of Object.entries(body)) {
    // Upsert: delete then insert
    await fetch(`${URL}/rest/v1/site_settings?key=eq.${encodeURIComponent(k)}`, { method: 'DELETE', headers: H() });
    await fetch(`${URL}/rest/v1/site_settings`, { method: 'POST', headers: { ...H(), Prefer: 'return=minimal' }, body: JSON.stringify({ key: k, value: String(v) }) });
  }
  return NextResponse.json({ success: true });
}
