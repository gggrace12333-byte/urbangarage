import { createClient } from '@supabase/supabase-js';

let client: any = null;

function getClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ikjbbfgrwynixtpfdauj.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
    client = createClient(url, key);
  }
  return client;
}

// Helper: execute raw SQL via Supabase REST API
async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const query = strings.reduce((acc, s, i) => acc + s + (i < values.length ? '\$' + (i + 1) : ''), '');
  const { data, error } = await getClient().rpc('exec_sql', { query, params: values });
  if (error) throw error;
  return data || [];
}

export function getDb() {
  return {
    prepare(query: string) {
      return {
        async all(...params: any[]) {
          let i = 0;
          const q = query.replace(/\?/g, () => '\$' + (++i));
          const { data, error } = await getClient().rpc('exec_sql', { query: q, params });
          if (error) { throw new Error(`Supabase RPC error: ${JSON.stringify(error)}`); }
          return data || [];
        },
        async get(...params: any[]) {
          const rows = await this.all(...params);
          return rows?.[0];
        },
        async run(...params: any[]) {
          let i = 0;
          let q = query.replace(/\?/g, () => '\$' + (++i));
          if (/\binsert\b/i.test(q) && !/returning/i.test(q)) q = q.replace(/;?\s*\$/, ' RETURNING id');
          const { data, error } = await getClient().rpc('exec_sql', { query: q, params });
          if (error) { throw new Error(`Supabase RPC error (run): ${JSON.stringify(error)}`); }
          return { lastInsertRowid: data?.[0]?.id || 0, changes: data?.length || 0 };
        },
      };
    },
    async transaction(fn: any) {
      await fn(async (q: string, p: any[] = []) => {
        let i = 0;
        let s = q.replace(/\?/g, () => '\$' + (++i));
        if (/\binsert\b/i.test(s) && !/returning/i.test(s)) s = s.replace(/;?\s*\$/, ' RETURNING id');
        const { data, error } = await getClient().rpc('exec_sql', { query: s, params: p });
        if (error) throw error;
        return { lastInsertRowid: data?.[0]?.id || 0, changes: data?.length || 0 };
      });
    },
  };
}
