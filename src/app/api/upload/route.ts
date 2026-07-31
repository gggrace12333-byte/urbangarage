import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://ikjbbfgrwynixtpfdauj.supabase.co';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    if (!key) return NextResponse.json({ error: 'Supabase key not configured' }, { status: 500 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    const url = `${SUPABASE_URL}/storage/v1/object/products/${filename}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': file.type || 'image/jpeg',
        'x-upsert': 'true',
      },
      body: buffer,
    });

    const responseText = await res.text();
    if (!res.ok) {
      return NextResponse.json({ error: `Upload failed: ${res.status} - ${responseText}` }, { status: 500 });
    }

    let data;
    try { data = JSON.parse(responseText); } catch { data = responseText; }
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/products/${filename}`;
    return NextResponse.json({ url: publicUrl, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 });
  }
}
