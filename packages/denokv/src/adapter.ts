import { StorageAdapter } from 'grammy';

export class DenoKVAdapter<T> implements StorageAdapter<T> {
	constructor(
		private kv: Deno.Kv,
		private prefix: Deno.KvKeyPart[] = ['sessions'],
	) {}

	async read(key: string): Promise<T | undefined> {
		const result = await this.kv.get([...this.prefix, key]);
		return result.value !== null ? result.value as T : undefined;
	}

	async write(key: string, value: T): Promise<void> {
		await this.kv.set([...this.prefix, key], value);
	}

	async delete(key: string): Promise<void> {
		await this.kv.delete([...this.prefix, key]);
	}
}
