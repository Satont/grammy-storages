import type { StorageAdapter } from 'grammy';

type DenoClient = {
	queryArray: (
		opts: { text: string; args: Record<string, any> | any[] | undefined },
	) => Promise<{ rows: any[] }>;
};

type NodeClient = {
	query: (query: string, params: unknown[]) => Promise<{ rows: any[] }>;
};

type Client = DenoClient | NodeClient;
type Query = (query: string, args?: string[]) => Promise<any[]>;

interface AdapterConstructor {
	client: Client;
	tableName: string;

	__query: Query;
	__internalConstructor: boolean;
}

interface DbOject {
	key: string;
	value: string;
}

export class PsqlAdapter<T> implements StorageAdapter<T> {
	private tableName: string;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private query: Query;

	/**
	 * @private
	 */
	private constructor(opts: AdapterConstructor) {
		if (!opts.__internalConstructor) {
			throw new Error(
				'Cannot be created without invoke "await PsqlAdapter.create()" static method',
			);
		}

		this.tableName = opts.tableName;
		this.query = opts.__query;
	}

	static async create<T>(
		opts = { tableName: 'sessions' } as Omit<
			AdapterConstructor,
			'__query' | '__internalConstructor'
		>,
	): Promise<PsqlAdapter<T>> {
		const queryString = `
      CREATE TABLE IF NOT EXISTS "${opts.tableName}" (
        "key" VARCHAR NOT NULL,
        "value" TEXT
      )`;

		const query = buildQueryRunner(opts.client);
		await query(queryString);
		await query(
			`CREATE UNIQUE INDEX IF NOT EXISTS IDX_${opts.tableName} ON "${opts.tableName}" ("key")`,
		);

		return new PsqlAdapter({
			...opts,
			__query: query,
			__internalConstructor: true,
		});
	}

	private async findSession(key: string): Promise<DbOject> {
		const results =
			(await this.query(`select * from "${this.tableName}" where key = $1`, [key])) as DbOject[];
		const session = results[0];

		return session;
	}

	async read(key: string): Promise<T | undefined> {
		const session = await this.findSession(key);

		if (!session) {
			return undefined;
		}

		return JSON.parse(session.value as string) as T;
	}

	async write(key: string, value: T): Promise<void> {
		await this.query(
			`
      INSERT INTO "${this.tableName}" (key, value)
      values ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = $2`,
			[key, JSON.stringify(value)],
		);
	}

	async delete(key: string): Promise<void> {
		await this.query(`delete from ${this.tableName} where key = $1`, [key]);
	}
}

function buildQueryRunner(client: Client) {
	if ('queryArray' in client) {
		return async (text: string, args?: string[]) => {
			const result = await client.queryArray({
				text,
				args: args ?? [],
			});

			return result.rows.map((row) => ({ key: row[0], value: row[1] }));
		};
	} else if ('query' in client) {
		return async (query: string, args?: string[]) => {
			const { rows } = await client.query(query, args ?? []);

			return rows;
		};
	} else {
		throw new Error(
			'Unknown postgres client passed, please refer to docs for check supported clients.',
		);
	}
}
