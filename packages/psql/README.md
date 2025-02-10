# PSQL storage adapter for grammY

Storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) in
[PostgreSQL](https://www.postgresql.org/) when using sessions.

## Installation

Node

```bash
npm install @grammyjs/storage-psql pg --save
```

Deno

```ts
import { PsqlAdapter } from "https://deno.land/x/grammy_storages/psql/src/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";
```

## Usage

You can check
[examples](https://github.com/grammyjs/storages/tree/main/packages/psql/examples)
folder

## Vendor Examples

### [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) ([Neon](https://neon.tech))

```js
import { createClient } from "@vercel/postgres";
import { PsqlAdapter } from "@grammyjs/storage-psql";

const client = createClient();

await client.connect();

bot.use(
  session({
    storage: await PsqlAdapter.create({ tableName: 'sessions', client }),
  })
);
```
