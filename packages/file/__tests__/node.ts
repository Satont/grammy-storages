import test from 'node:test';
import assert from 'node:assert';

import { session } from 'grammy';
import { FileAdapter } from '../src/mod.ts';
import { createBot, createMessage } from '@grammyjs/storage-utils';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { rm as remove } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const dirPath = resolve(cwd(), 'sessions');
const cleanDir = async () => {
	await remove(dirPath, { recursive: true });
};

test('Should create sessions dir', async () => {
	await cleanDir();

	new FileAdapter({ dirName: 'sessions' });
	assert.ok(existsSync(dirPath));
});

test('Pizza counter tests', async () => {
	await cleanDir();

	const bot = createBot();

	bot.use(session({
		initial: () => ({ pizzaCount: 0 }),
		storage: new FileAdapter({ dirName: 'sessions' }),
	}));

	bot.hears('first', (ctx) => {
		console.log('session', ctx.session);
		assert.equal(ctx.session.pizzaCount, 0);
		ctx.session.pizzaCount = ctx.session.pizzaCount + 1;
	});

	bot.hears('second', (ctx) => {
		assert.equal(ctx.session.pizzaCount, 1);
	});

	await bot.handleUpdate(createMessage(bot, 'first').update);
	await bot.handleUpdate(createMessage(bot, 'second').update);
});

test('Simple string tests', async () => {
	await cleanDir();

	const bot = createBot(false);

	bot.use(session({
		initial: () => 'test',
		storage: new FileAdapter({ dirName: 'sessions' }),
	}));

	bot.hears('first', (ctx) => {
		ctx.session = `${ctx.session} edited`;
	});

	bot.hears('second', (ctx) => {
		assert.equal(ctx.session, 'test edited');
	});

	await bot.handleUpdate(createMessage(bot, 'first').update);
	await bot.handleUpdate(createMessage(bot, 'second').update);
});
