#!/usr/bin/env python3
import re

path = '/Users/az/Documents/Codex/2026-07-17/new-chat-2/urban-garage/src/app/api/products/route.ts'
with open(path) as f:
    content = f.read()

# Fix: add await to db.prepare().all() calls
content = content.replace('return NextResponse.json(db.prepare(q).all(...params));', 'return NextResponse.json(await db.prepare(q).all(...params));')

# Also make the function async
content = content.replace('export async function GET', 'export async function GET')

# Fix the slug query too
old_slug = "const p = db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.active = 1').get(slug);"
new_slug = "const p = await db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.active = 1').get(slug);"
content = content.replace(old_slug, new_slug)

with open(path, 'w') as f:
    f.write(content)
print('Fixed API route - added await')

# Now check all other API routes for same bug
import os
api_dir = '/Users/az/Documents/Codex/2026-07-17/new-chat-2/urban-garage/src/app/api'
for root, dirs, files in os.walk(api_dir):
    for f in files:
        if f == 'route.ts':
            fp = os.path.join(root, f)
            with open(fp) as ff:
                c = ff.read()
            # Check for db.prepare without await
            if 'db.prepare' in c and 'await db.prepare' not in c:
                print(f'FOUND un-awaited db call in: {fp}')
