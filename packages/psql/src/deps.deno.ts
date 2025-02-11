import type { Client } from 'https://deno.land/x/postgres@v0.19.3/mod.ts';
export type { StorageAdapter } from 'https://lib.deno.dev/x/grammy@1.x/mod.ts';
export type { Client } from 'https://deno.land/x/postgres@v0.19.3/mod.ts';

export function buildQueryRunner(client: Client) {
  return async (text: string, args?: string[]) => {
    const result = await client.queryArray({
      text,
      args,
    });

    return result.rows.map((row) => ({ key: row[0], value: row[1] }));
  };
}
