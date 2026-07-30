import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting: simple in-memory counter
const rateLimit = new Map<string, { count: number; reset: number }>();

export function middleware(request: NextRequest) {
  // Only rate-limit API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100; // 100 req/min per IP

    const entry = rateLimit.get(ip);
    if (!entry || now > entry.reset) {
      rateLimit.set(ip, { count: 1, reset: now + windowMs });
    } else {
      entry.count++;
      if (entry.count > maxRequests) {
        return new NextResponse('Too many requests', { status: 429 });
      }
    }
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
