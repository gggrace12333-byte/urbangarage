import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting: in-memory token bucket
const rateLimit = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;
const STRICT_MAX = 10;
const STRICT_PATHS = ['/api/checkout', '/api/contact', '/api/reviews'];

const ALLOWED_ORIGINS = ['http://localhost:3000', 'https://urbantrackgarage.com', 'https://www.urbantrackgarage.com', 'https://urban-garage.vercel.app'];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers for ALL routes
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';");
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  // CORS — only allow specific origins
  const origin = request.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const isStrict = STRICT_PATHS.some(p => request.nextUrl.pathname.startsWith(p));
    const maxReq = isStrict ? STRICT_MAX : MAX_REQUESTS;

    const entry = rateLimit.get(ip);
    if (!entry || now > entry.reset) {
      rateLimit.set(ip, { count: 1, reset: now + WINDOW_MS });
    } else {
      entry.count++;
      if (entry.count > maxReq) {
        return new NextResponse('Too many requests', {
          status: 429,
          headers: { 'Retry-After': '60' },
        });
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
