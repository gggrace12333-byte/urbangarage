import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = crypto.createHash('sha256').update('411319').digest('hex');
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Admin session tokens (server-side only, no DB)
const validSessions = new Set<string>();

export function createAdminSession(): string {
  const token = crypto.randomBytes(32).toString('hex');
  validSessions.add(token);
  // Session expires after 24h
  setTimeout(() => validSessions.delete(token), 24 * 60 * 60 * 1000);
  return token;
}

export function validateAdminSession(token: string): boolean {
  return validSessions.has(token);
}

export function destroyAdminSession(token: string): void {
  validSessions.delete(token);
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const passHash = crypto.createHash('sha256').update(password || '').digest('hex');
  return username === ADMIN_USER && passHash === ADMIN_PASS_HASH;
}

// Middleware helper: checks admin session cookie, returns 401 if invalid
export function requireAdmin(request: NextRequest): NextResponse | null {
  const token = request.cookies.get('admin_token')?.value;
  if (!token || !validateAdminSession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null; // null = authorized
}

// Response helper: set admin session cookie
export function setAdminCookie(response: NextResponse, token: string): void {
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  });
}

export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}
