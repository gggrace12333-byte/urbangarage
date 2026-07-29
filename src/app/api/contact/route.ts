import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { notifyAdmin } from '@/lib/email';

// Rate limiter: 3 contact submissions per IP per hour
const contactLimits = new Map<string, { count: number; reset: number }>();

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const entry = contactLimits.get(ip);

  if (entry && now < entry.reset && entry.count >= 3) {
    return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
  }

  const { name, email, message } = await request.json();
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  // Sanitize lengths
  const safeName = name.trim().substring(0, 100);
  const safeEmail = email.trim().toLowerCase().substring(0, 200);
  const safeMessage = message.trim().substring(0, 5000);

  // Update rate limit
  if (!entry || now > entry.reset) {
    contactLimits.set(ip, { count: 1, reset: now + 3600000 }); // 1 hour window
  } else {
    entry.count++;
  }

  const db = getDb();
  db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(
    'last_contact_' + Date.now(), JSON.stringify({ name: safeName, email: safeEmail, message: safeMessage, time: new Date().toISOString() })
  );

  notifyAdmin(`New message from ${safeName}`,
    `<h3>New Contact Form Message</h3><p><b>From:</b> ${safeName} (${safeEmail})</p><p><b>Message:</b></p><p>${safeMessage.replace(/\n/g,'<br>')}</p>`
  ).catch(() => {});

  return NextResponse.json({ success: true });
}
