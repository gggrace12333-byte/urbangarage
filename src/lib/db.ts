import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

function query(q: string, params: any[] = []) {
  return sql(q, params);
}

export function getDb() {
  return {
    prepare(q: string) {
      return {
        async all(...params: any[]) {
          const rows = await query(q, params);
          return rows || [];
        },
        async get(...params: any[]) {
          const rows = await query(q, params);
          return rows?.[0];
        },
        async run(...params: any[]) {
          let s = q;
          if (/\binsert\b/i.test(s) && !/returning/i.test(s)) {
            s = s.replace(/;?\s*$/, ' RETURNING id');
          }
          const rows = await query(s, params);
          return { lastInsertRowid: rows?.[0]?.id || 0, changes: rows?.length || 0 };
        },
      };
    },
    async transaction(fn: any) {
      await fn(async (q: string, p: any[] = []) => {
        let s = q;
        if (/\binsert\b/i.test(s) && !/returning/i.test(s)) {
          s = s.replace(/;?\s*$/, ' RETURNING id');
        }
        const rows = await query(s, p);
        return { lastInsertRowid: rows?.[0]?.id || 0, changes: rows?.length || 0 };
      });
    },
  };
}
