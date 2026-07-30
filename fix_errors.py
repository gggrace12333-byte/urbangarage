#!/usr/bin/env python3
import re

path = '/Users/az/Documents/Codex/2026-07-17/new-chat-2/urban-garage/src/lib/db.ts'
with open(path) as f:
    content = f.read()

# Replace "if (error) { console.error(error); return []; }" with throwing the error
content = content.replace(
    "if (error) { console.error(error); return []; }",
    "if (error) { throw new Error(`Supabase RPC error: ${JSON.stringify(error)}`); }"
)

# Replace "if (error) { console.error(error); return { lastInsertRowid: 0, changes: 0 }; }" with throwing
content = content.replace(
    "if (error) { console.error(error); return { lastInsertRowid: 0, changes: 0 }; }",
    "if (error) { throw new Error(`Supabase RPC error (run): ${JSON.stringify(error)}`); }"
)

with open(path, 'w') as f:
    f.write(content)
print('Updated db.ts to throw errors instead of swallowing them')
