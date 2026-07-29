import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminSession, setAdminCookie, clearAdminCookie, validateAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const { username, password, action } = await request.json();

  // Login
  if (!action || action === 'login') {
    if (verifyAdminCredentials(username, password)) {
      const token = createAdminSession();
      const response = NextResponse.json({ success: true });
      setAdminCookie(response, token);
      return response;
    }
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  }

  // Logout
  if (action === 'logout') {
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      const { destroyAdminSession } = await import('@/lib/admin-auth');
      destroyAdminSession(token);
    }
    const response = NextResponse.json({ success: true });
    clearAdminCookie(response);
    return response;
  }

  // Check session
  if (action === 'check') {
    const token = request.cookies.get('admin_token')?.value;
    if (token && validateAdminSession(token)) {
      return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
