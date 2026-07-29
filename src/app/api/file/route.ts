import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get('file') || '';
  if (!file || file.includes('..')) return new NextResponse('Not found', { status: 404 });
  
  const filePath = path.join(process.cwd(), 'public', 'uploads', path.basename(file));
  if (!existsSync(filePath)) return new NextResponse('Not found', { status: 404 });

  const data = await readFile(filePath);
  const ext = path.extname(file).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.mp4' ? 'video/mp4' : ext === '.webm' ? 'video/webm' : 'application/octet-stream';
  
  return new NextResponse(data, { headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000' } });
}
