import { NextRequest, NextResponse } from 'next/server';

const URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  const b = await request.json();
  await fetch(`${URL}/rest/v1/contact_messages`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ name: b.name, email: b.email, message: b.message, created_at: new Date().toISOString() }),
  });
  return NextResponse.json({ success: true });
}
