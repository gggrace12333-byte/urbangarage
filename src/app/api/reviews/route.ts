import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/db';

// Simple in-memory rate limiter for reviews
const rateLimit = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + 60000 }); // 1 review per minute
    return true;
  }
  if (entry.count >= 3) return false; // max 3 per minute
  entry.count++;
  return true;
}

export async function GET(request: NextRequest) {
  const db = getDb();
  const productId = request.nextUrl.searchParams.get('product_id');
  if (productId) {
    return NextResponse.json(await db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(productId));
  }
  return NextResponse.json(await db.prepare('SELECT r.*, p.name as product_name FROM reviews r LEFT JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC').all());
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many reviews. Please wait.' }, { status: 429 });
  }

  const db = getDb();
  const { product_id, user_name, rating, comment } = await request.json();

  // Validation
  if (!product_id || !user_name || !rating) {
    return NextResponse.json({ error: 'Product, name, and rating are required' }, { status: 400 });
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
  }
  if (user_name.length > 100) {
    return NextResponse.json({ error: 'Name too long' }, { status: 400 });
  }
  const sanitizedComment = (comment || '').substring(0, 2000); // max 2000 chars
  const sanitizedName = user_name.substring(0, 100).trim();
  if (!sanitizedName) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const r = await db.prepare('INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?,?,?,?)').run(product_id, sanitizedName, Math.round(rating), sanitizedComment);
  return NextResponse.json(await db.prepare('SELECT * FROM reviews WHERE id = ?').get(r.lastInsertRowid), { status: 201 });
}


export async function PUT(request: NextRequest) {
  const authErr = requireAdmin(request); if (authErr) return authErr;
  const db = getDb();
  const { id, reply } = await request.json();
  if (!id) return NextResponse.json({ error: "Review ID required" }, { status: 400 });
  await db.prepare("UPDATE reviews SET reply = ? WHERE id = ?").run(reply || "", id);
  return NextResponse.json(await db.prepare("SELECT * FROM reviews WHERE id = ?").get(id));
}
export async function DELETE(request: NextRequest) {
  const authErr = requireAdmin(request); if (authErr) return authErr;
  const db = getDb();
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
  await db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
