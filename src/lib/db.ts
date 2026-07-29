import { sql } from '@vercel/postgres';
import { QueryResultRow } from '@vercel/postgres';

function toPg(query: string, params: any[]): [string, any[]] {
  let i = 0;
  return [query.replace(/\?/g, () => '$' + (++i)), params];
}

export function getDb() {
  return {
    prepare(query: string) {
      return {
        async all(...params: any[]) {
          const [q, p] = toPg(query, params);
          const r = await sql.query(q, p);
          return r.rows;
        },
        async get(...params: any[]) {
          const [q, p] = toPg(query, params);
          const r = await sql.query(q, p);
          return r.rows[0];
        },
        async run(...params: any[]) {
          let [q, p] = toPg(query, params);
          if (/\binsert\b/i.test(q) && !/returning/i.test(q)) {
            q = q.replace(/;?\s*$/, ' RETURNING id');
          }
          const r = await sql.query(q, p);
          return { lastInsertRowid: r.rows[0]?.id || 0, changes: r.rowCount || 0 };
        },
      };
    },
    async transaction(fn: (exec: (q: string, p?: any[]) => Promise<{ lastInsertRowid: number; changes: number }>) => Promise<void>) {
      await sql.query('BEGIN');
      try {
        const exec = async (q: string, p: any[] = []) => {
          let [qp, pp] = toPg(q, p);
          if (/\binsert\b/i.test(qp) && !/returning/i.test(qp)) {
            qp = qp.replace(/;?\s*$/, ' RETURNING id');
          }
          const r = await sql.query(qp, pp);
          return { lastInsertRowid: r.rows[0]?.id || 0, changes: r.rowCount || 0 };
        };
        await fn(exec);
        await sql.query('COMMIT');
      } catch (e) {
        await sql.query('ROLLBACK');
        throw e;
      }
    },
  };
}
