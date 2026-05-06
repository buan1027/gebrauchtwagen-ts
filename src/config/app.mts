import { readFile } from 'node:fs/promises';
import { parse } from 'smol-toml';
import { resourcesURL } from './resources.mts';

export type ServerConfig = {
    port?: number;
};

export type LogConfig = {
    level?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    pretty?: boolean;
};

export type AppConfig = {
    server?: ServerConfig;
    log?: LogConfig;
};

const appUrl = new URL('app.toml', resourcesURL);
const appText = await readFile(appUrl, { encoding: 'utf8' });

export const config = parse(appText) as AppConfig;
