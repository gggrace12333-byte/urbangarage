import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = crypto.createHash('sha256').update('411319').digest('hex');

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const passHash = crypto.createHash('sha256').update(password || '').digest('hex');
  
  if (username === ADMIN_USER && passHash === ADMIN_PASS_HASH) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
