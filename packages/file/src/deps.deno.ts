export type { StorageAdapter } from 'https://lib.deno.dev/x/grammy@1.x/mod.ts';
import { exists, existsSync } from 'https://deno.land/std@0.224.0/fs/mod.ts';
import { resolve } from 'https://deno.land/std@0.224.0/path/mod.ts';

export const fs = {
  readFile: Deno.readTextFile,
  writeFile: Deno.writeTextFile,
  exists,
  existsSync,
  ensureDir: (path: string) => Deno.mkdir(path, { recursive: true }),
  ensureDirSync: (path: string) => Deno.mkdirSync(path, { recursive: true }),
  remove: Deno.remove,
};

export const path = {
  resolve,
};

export const cwd = Deno.cwd;
