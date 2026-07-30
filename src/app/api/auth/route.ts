import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

function hash(pw: string) { return crypto.createHash('sha256').update(pw).digest('hex'); }

export async function POST(request: NextRequest) {
  const { action, email, password, name } = await request.json();
  const db = getDb();

  if (action === 'register') {
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    const exists = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    await db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name || email.split('@')[0], email, hash(password));
    return NextResponse.json({ success: true });
  }

  if (action === 'login') {
    const user = await db.prepare('SELECT id, name, email FROM users WHERE email = ? AND password = ?').get(email, hash(password)) as any;
    if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    return NextResponse.json({ user });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
