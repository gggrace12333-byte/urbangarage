#!/usr/bin/env python3
import os, re, glob

api_dir = '/Users/az/Documents/Codex/2026-07-17/new-chat-2/urban-garage/src/app/api'

fixed = 0
for root, dirs, files in os.walk(api_dir):
    for f in files:
        if f == 'route.ts':
            fp = os.path.join(root, f)
            with open(fp) as ff:
                c = ff.read()
            orig = c
            # Fix: add await before db.prepare
            c = re.sub(r'(?<!await\s)db\.prepare\(', 'await db.prepare(', c)
            # Fix double await
            c = c.replace('await await db.prepare', 'await db.prepare')
            # Fix: wrap db.prepare().all() in parentheses when used as argument
            c = re.sub(r'return NextResponse\.json\(await db\.prepare\((.*?)\)\.(all|get)\((.*?)\)\);', 
                       r'const __r = await db.prepare(\1).\2(\3); return NextResponse.json(__r);', c)
            
            if c != orig:
                with open(fp, 'w') as ff:
                    ff.write(c)
                print(f'Fixed: {fp}')
                fixed += 1

print(f'\nTotal fixed: {fixed} files')
