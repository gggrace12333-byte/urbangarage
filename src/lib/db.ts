import postgres from 'postgres';

let sql: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (!sql) {
    const url = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
    if (!url) throw new Error('POSTGRES_URL not set');
    sql = postgres(url, { max: 10, ssl: 'require' });
  }
  return sql;
}

function toPg(query: string, params: any[]): [string, any[]] {
  let i = 0;
  return [query.replace(/\?/g, () => '$' + (++i)), params];
}

export function getDb() {
  const s = getSql();

  return {
    prepare(query: string) {
      return {
        async all(...params: any[]) {
          const [q, p] = toPg(query, params);
          return await s.unsafe(q, p);
        },
        async get(...params: any[]) {
          const [q, p] = toPg(query, params);
          const rows = await s.unsafe(q, p);
          return rows[0];
        },
        async run(...params: any[]) {
          let [q, p] = toPg(query, params);
          if (/\binsert\b/i.test(q) && !/returning/i.test(q)) {
            q = q.replace(/;?\s*$/, ' RETURNING id');
          }
          const rows = await s.unsafe(q, p);
          return { lastInsertRowid: rows[0]?.id || 0, changes: rows.length || 0 };
        },
      };
    },
    async transaction(fn: (exec: (q: string, p?: any[]) => Promise<{ lastInsertRowid: number; changes: number }>) => Promise<void>) {
      await s.begin(async (tx) => {
        const exec = async (q: string, p: any[] = []) => {
          let [qp, pp] = toPg(q, p);
          if (/\binsert\b/i.test(qp) && !/returning/i.test(qp)) {
            qp = qp.replace(/;?\s*$/, ' RETURNING id');
          }
          const rows = await tx.unsafe(qp, pp);
          return { lastInsertRowid: rows[0]?.id || 0, changes: rows.length || 0 };
        };
        await fn(exec);
      });
    },
  };
}
