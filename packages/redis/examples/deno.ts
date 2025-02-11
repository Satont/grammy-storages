import { Bot, Context, session, SessionFlavor } from 'https://lib.deno.dev/x/grammy@1.x/mod.ts';
import { RedisAdapter } from 'https://deno.land/x/grammy_storages/redis/src/mod.ts';
import { connect } from 'https://deno.land/x/redis@v0.38.0/mod.ts';

interface SessionData {
  counter: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

const redisInstance = await connect({
  hostname: '127.0.0.1',
  port: 6379,
  db: 0,
});

//create storage
const storage = new RedisAdapter({ instance: redisInstance, ttl: 10, autoParseDates: true });

// Create bot and register session middleware
const bot = new Bot<MyContext>('');
bot.use(
  session({
    initial: () => ({ counter: 0 }),
    storage,
  }),
);

// Register your usual middleware, and start the bot
bot.command('stats', (ctx) => ctx.reply(`Already got ${ctx.session.counter} photos!`));
bot.on(':photo', (ctx) => ctx.session.counter++);

bot.start();
