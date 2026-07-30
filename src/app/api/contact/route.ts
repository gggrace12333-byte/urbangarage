import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { notifyAdmin } from '@/lib/email';

export async function POST(request: NextRequest) {
  const { name, email, message } = await request.json();
  if (!name || !email || !message) return NextResponse.json({ error: 'All fields required' }, { status: 400 });

  const db = getDb();
  await db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(
    'last_contact_' + Date.now(), JSON.stringify({ name, email, message, time: new Date().toISOString() })
  );

  await notifyAdmin(`📩 New message from ${name}`,
    `<h3>New Contact Form Message</h3><p><b>From:</b> ${name} (${email})</p><p><b>Message:</b></p><p>${message.replace(/\n/g,'<br>')}</p>`
  );

  return NextResponse.json({ success: true });
}
