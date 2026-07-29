import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { writeFile } from 'fs/promises';
import path from 'path';

// Magic bytes for allowed file types
const MAGIC_BYTES: Record<string, number[] | number[][]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'video/mp4': [[0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]],
  'video/webm': [0x1A, 0x45, 0xDF, 0xA3],
};

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm']);

function checkMagicBytes(buffer: Buffer): string | null {
  for (const [mime, patterns] of Object.entries(MAGIC_BYTES)) {
    for (const pattern of (Array.isArray(patterns[0]) ? patterns : [patterns])) {
      const bytes = pattern as number[];
      if (buffer.length >= bytes.length) {
        let match = true;
        for (let i = 0; i < bytes.length; i++) {
          if (buffer[i] !== bytes[i]) { match = false; break; }
        }
        if (match) return mime;
      }
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const authErr = requireAdmin(request);
  if (authErr) return authErr;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Validate file extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: `File extension "${ext}" not allowed.` }, { status: 400 });
    }

    // Double extension check (e.g., malicious.php.jpg)
    const nameParts = file.name.split('.');
    if (nameParts.length > 2) {
      const secondExt = nameParts[nameParts.length - 2]?.toLowerCase();
      const dangerousExts = ['php', 'asp', 'aspx', 'jsp', 'cgi', 'py', 'sh', 'exe', 'bat', 'cmd'];
      if (dangerousExts.includes(secondExt)) {
        return NextResponse.json({ error: 'File name not allowed' }, { status: 400 });
      }
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 50MB` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic bytes validation — validate actual content, not just MIME type
    const detectedType = checkMagicBytes(buffer);
    if (!detectedType) {
      return NextResponse.json({ error: 'Unrecognized file format. Content does not match allowed types.' }, { status: 400 });
    }

    // Sanitize filename (remove path traversal attempts)
    const safeName = path.basename(file.name.replace(/[^a-zA-Z0-9._-]/g, '_'));
    const filename = Date.now() + '-' + safeName;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Ensure final path stays within uploads directory (path traversal protection)
    const resolvedPath = path.resolve(filepath);
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    if (!resolvedPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    await writeFile(filepath, buffer);
    return NextResponse.json({ url: '/uploads/' + filename });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
