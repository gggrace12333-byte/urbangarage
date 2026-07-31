const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikjbbfgrwynixtpfdauj.supabase.co').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

async function rest(method: string, path: string, body?: any) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers: Record<string, string> = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };
  if (method === 'POST' || method === 'PATCH') headers['Prefer'] = 'return=representation';
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${method} ${path}: ${res.status} - ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

export function getDb() {
  const db = {
    prepare(sql: string) {
      const q = sql.toLowerCase().trim();
      const self = this as any;
      return {
        async all(...p: any[]) {
          if (q.startsWith('select')) {
            const tableMatch = sql.match(/from\s+(\w+)/i);
            if (!tableMatch) return [];
            const table = tableMatch[1];
            let path = `${table}?select=*`;
            const whereMatch = sql.match(/where\s+(.+?)(\s+order\s+|\s+limit\s+|\s*$)/i);
            if (whereMatch) {
              const parts = whereMatch[1].split(/\s+and\s+/i);
              for (const part of parts) {
                const eqMatch = part.match(/(\w+)\s*=\s*\$(\d+)/i);
                if (eqMatch) {
                  const paramIdx = parseInt(eqMatch[2]) - 1;
                  path += `&${eqMatch[1]}=eq.${encodeURIComponent(p[paramIdx] || '')}`;
                }
              }
            }
            const orderMatch = sql.match(/order by\s+(.+?)(\s+limit\s+|\s*$)/i);
            if (orderMatch) {
              const orderPart = orderMatch[1].trim();
              const desc = orderPart.toLowerCase().endsWith(' desc');
              const col = orderPart.replace(/\s+desc$/i, '').trim();
              path += `&order=${col}.${desc ? 'desc' : 'asc'}`;
            }
            const limitMatch = sql.match(/limit\s+(\d+)/i);
            if (limitMatch) path += `&limit=${limitMatch[1]}`;
            return rest('GET', path);
          }
          if (q.includes('count(*)')) {
            const tableMatch = sql.match(/from\s+(\w+)/i);
            if (!tableMatch) return [{ c: 0 }];
            const table = tableMatch[1];
            let path = `${table}?select=id`;
            const eqMatch = sql.match(/where\s+(\w+)\s*=\s*\$1/i);
            if (eqMatch) path += `&${eqMatch[1]}=eq.${encodeURIComponent(p[0] || '')}`;
            const rows = await rest('GET', path);
            return [{ c: rows?.length || 0 }];
          }
          return [];
        },
        async get(...p: any[]) {
          const rows = await this.all(...p);
          return rows?.[0];
        },
        async run(...p: any[]) {
          if (q.startsWith('insert into')) {
            const tableMatch = sql.match(/insert into\s+(\w+)/i);
            if (!tableMatch) return { lastInsertRowid: 0, changes: 0 };
            const table = tableMatch[1];
            const colMatch = sql.match(/\(([^)]+)\)\s*values\s*\(([^)]+)\)/i);
            if (colMatch) {
              const cols = colMatch[1].split(',').map((c: string) => c.trim());
              const body: Record<string, any> = {};
              cols.forEach((col: string, i: number) => {
                body[col] = p[i];
              });
              const rows = await rest('POST', table, body);
              return { lastInsertRowid: rows?.[0]?.id || 0, changes: rows?.length || 0 };
            }
          }
          if (q.startsWith('update')) {
            const tableMatch = sql.match(/update\s+(\w+)/i);
            const whereMatch = sql.match(/where\s+(\w+)\s*=\s*\$(\d+)/i);
            if (tableMatch && whereMatch) {
              const table = tableMatch[1];
              const setMatch = sql.match(/set\s+(.+?)\s+where/i);
              if (setMatch) {
                const body: Record<string, any> = {};
                const parts = setMatch[1].split(',');
                parts.forEach((part: string) => {
                  const kv = part.match(/(\w+)\s*=\s*\$(\d+)/);
                  if (kv) {
                    const idx = parseInt(kv[2]) - 1;
                    body[kv[1]] = p[idx];
                  }
                });
                const whereCol = whereMatch[1];
                const whereIdx = parseInt(whereMatch[2]) - 1;
                const path = `${table}?${whereCol}=eq.${encodeURIComponent(p[whereIdx] || '')}`;
                await rest('PATCH', path, body);
              }
            }
            return { lastInsertRowid: 0, changes: 1 };
          }
          if (q.startsWith('delete from')) {
            const tableMatch = sql.match(/delete from\s+(\w+)/i);
            const whereMatch = sql.match(/where\s+(\w+)\s*=\s*\$1/i);
            if (tableMatch && whereMatch) {
              await rest('DELETE', `${tableMatch[1]}?${whereMatch[1]}=eq.${encodeURIComponent(p[0] || '')}`);
            }
            return { lastInsertRowid: 0, changes: 1 };
          }
          return { lastInsertRowid: 0, changes: 0 };
        },
      };
    },
    async transaction(fn: any) {
      await fn(async (q: string, p: any[] = []) => {
        const stmt = db.prepare(q);
        return stmt.run(...p);
      });
    },
  };
  return db;
}
