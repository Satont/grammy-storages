import { session } from 'https://lib.deno.dev/x/grammy@1.x/mod.ts';
import { expect } from 'https://deno.land/x/expect/mod.ts';
import { PsqlAdapter } from '../src/mod.ts';
import { Client } from 'https://deno.land/x/postgres@v0.19.3/mod.ts';
import * as utils from '../../../libs/utils/src/mod.ts';

Deno.test('Pizza counter tests', async () => {
  const client = new Client({
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
    hostname: 'localhost',
    port: 5432,
  });
  const bot = utils.createBot();

  bot.use(
    session({
      initial: () => ({ pizzaCount: 0 }),
      storage: await PsqlAdapter.create({ tableName: 'pizzacounter', client }),
    })
  );

  bot.hears('first', (ctx) => {
    expect(ctx.session.pizzaCount).toEqual(0);
    ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
  });

  bot.hears('second', (ctx) => {
    expect(ctx.session.pizzaCount).toEqual(1);
  });

  await bot.handleUpdate(utils.createMessage(bot, 'first').update);
  await bot.handleUpdate(utils.createMessage(bot, 'second').update);

  await client.end();
});

Deno.test('Simple string tests', async () => {
  const client = new Client({
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
    hostname: 'localhost',
    port: 5432,
  });

  const bot = utils.createBot(false);

  bot.use(
    session({
      initial() {
        return 'test';
      },
      storage: await PsqlAdapter.create({ tableName: 'simplestring', client }),
    })
  );

  bot.hears('first', async (ctx) => {
    ctx.session = `${ctx.session} edited`;
  });

  bot.hears('second', async (ctx) => {
    expect(ctx.session).toEqual('test edited');
  });

  await bot.handleUpdate(utils.createMessage(bot, 'first').update);
  await bot.handleUpdate(utils.createMessage(bot, 'second').update);

  await client.end();
});

