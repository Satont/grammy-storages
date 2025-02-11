# Redis storage adapter for grammY

Storage adapter that can be used to
[store your session data](https://grammy.dev/plugins/session.html) in
[Redis](https://redis.io/) when using sessions.

## Installation

Node

```bash
npm install @grammyjs/storage-redis ioredis --save
npm install @types/ioredis -D
```

```ts
import { RedisAdapter } from "@grammyjs/storage-redis";
import IORedis from "ioredis";
```

Deno

```ts
import { RedisAdapter } from "https://deno.land/x/grammy_storages/redis/src/mod.ts";
import { connect } from "https://deno.land/x/redis@v0.38.0/mod.ts";
```

## Usage

You can check
[examples](https://github.com/grammyjs/storages/tree/main/packages/redis/examples)
folder

## Vendor Examples

### [Vercel KV](https://vercel.com/docs/storage/vercel-kv) ([Upstash](https://upstash.com))

```js
import { kv as instance } from "@vercel/kv";
import { RedisAdapter } from "@grammyjs/storage-redis";

instance.opts.automaticDeserialization = false;

const storage = new RedisAdapter({instance});

bot.use(session({storage}));
```
