import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/products/${filename}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: buffer,
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Upload failed: ${err}` }, { status: 500 });
  }

  const url = `${SUPABASE_URL}/storage/v1/object/public/products/${filename}`;
  return NextResponse.json({ url });
}
