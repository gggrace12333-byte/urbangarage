// Production (Vercel) PostgreSQL via @neondatabase/serverless
// Uses WebSocket-based connection that works in serverless
import { Pool } from '@neondatabase/serverless';

let pool: any = null;

function getPool() {
  if (!pool) {
    const url = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
    pool = new Pool({ connectionString: url });
  }
  return pool;
}

function toPg(sql: string, params: any[]): [string, any[]] {
  let i = 0;
  return [sql.replace(/\?/g, () => '$' + (++i)), params];
}

export function getDb() {
  const p = getPool();
  return {
    prepare(sql: string) {
      const [q] = toPg(sql, []);
      return {
        async all(...params: any[]) {
          const r = await p.query(q, params);
          return r.rows;
        },
        async get(...params: any[]) {
          const r = await p.query(q, params);
          return r.rows[0];
        },
        async run(...params: any[]) {
          let s = q;
          if (/\binsert\b/i.test(s) && !/returning/i.test(s)) s = s.replace(/;?\s*$/, ' RETURNING id');
          const r = await p.query(s, params);
          return { lastInsertRowid: r.rows[0]?.id || 0, changes: r.rowCount || 0 };
        },
      };
    },
    async transaction(fn: any) {
      const client = await p.connect();
      try {
        await client.query('BEGIN');
        await fn(async (sql: string, params: any[] = []) => {
          let s = sql.replace(/\?/g, () => '$' + (++params.length || 1));
          if (/\binsert\b/i.test(s) && !/returning/i.test(s)) s = s.replace(/;?\s*$/, ' RETURNING id');
          const r = await client.query(s, params);
          return { lastInsertRowid: r.rows[0]?.id || 0, changes: r.rowCount || 0 };
        });
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    },
  };
}
