class Storage {
  public jwt: string | undefined;
  constructor(
    private readonly token: string,
    private readonly rootUrl = 'https://grammy-free-session.deno.dev/api',
  ) {}

  async login() {
    if (this.jwt === undefined) {
      const url = `${this.rootUrl}/login`;
      const body = JSON.stringify({ token: this.token });
      const response = await retryFetch(url, { method: 'POST', body });
      const { token } = await response.json();
      if (typeof token !== 'string') {
        throw new Error('Cannot use free session, invalid bot token!');
      }
      this.jwt = token;
    }
    return this.jwt;
  }

  logout() {
    this.jwt = undefined;
  }

  async call(
    method: 'GET' | 'POST' | 'DELETE',
    key?: string, // make key optional to allow global calls
    body?: string,
  ): Promise<string | undefined> {
    // perform request
    const url = key !== undefined ? `${this.rootUrl}/session/${key}` : `${this.rootUrl}/sessions`; // define url based on key
    const jwt = await this.login();
    const headers = { 'Authorization': `Bearer ${jwt}` };
    const response = await retryFetch(url, { method, body, headers });
    // handle response
    if (response.status === 401) {
      // token was revoked, must login again
      this.logout();
      return await this.call(method, key, body);
    } else if (response.status === 404) {
      // empty session
      return undefined;
    } else if (200 <= response.status && response.status < 300) {
      // success
      return method === 'GET' ? await response.text() : undefined;
    } else {
      // error
      throw new Error(`${response.status}: ${(await response.json()).error}`);
    }
  }
}

/**
 * Options for creating a storage adapter.
 */
export interface StorageOptions {
  /**
   * The root URL of the storage backend. Useful if you want to host your own
   * storage backend behind a different URL.
   */
  rootUrl?: string;
  /**
   * A storage authentication token that will be used when authenticating at the
   * backend. Note that the library will automatically renew the token if
   * authentication fails. Hence, you will still need to provide the bot token.
   */
  jwt?: string;
}

/**
 * @param token The bot token of your bot.
 * @param opts Further configuration options
 * @returns An adapter to grammY's free session storage
 */
export function freeStorage<T>(token: string, opts?: StorageOptions) {
  const storage = new Storage(token, opts?.rootUrl);
  if (opts?.jwt !== undefined) storage.jwt = opts.jwt;
  return {
    async readAllKeys(): Promise<T> {
      const keys = await storage.call('GET');
      return keys === undefined ? undefined : JSON.parse(keys);
    },
    async read(key: string): Promise<T> {
      const session = await storage.call('GET', key);
      return session === undefined ? undefined : JSON.parse(session);
    },
    async write(key: string, data: T) {
      await storage.call('POST', key, JSON.stringify(data));
    },
    async delete(key: string) {
      await storage.call('DELETE', key);
    },
    /**
     * Returns the storage authentication token which is used to store the
     * session data. Only useful if you want to avoid the login call that will
     * be performed automatically when the storage adapter contacts its backend
     * for the first time. This can improve startup performance and is
     * especially useful in serverless environments.
     */
    async getToken() {
      return await storage.login();
    },
  };
}

async function retryFetch(
  ...args: Parameters<typeof fetch>
): ReturnType<typeof fetch> {
  let res: Awaited<ReturnType<typeof fetch>>;
  let delay = 10; // ms
  do {
    res = await fetch(...args);
    if (res.status >= 500) {
      console.error(`${res.status} in free session service, retrying!`);
      await sleep(delay);
      delay += delay; // exponential back-off
      delay = Math.min(delay, 1000 * 60 * 60); // cap at 1 hour
    }
  } while (res.status >= 500);
  return res;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}
