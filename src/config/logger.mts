import pino from 'pino';
import { config } from './app.mts';
import { env } from './env.mts';

export type LogLevel = 'debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn';

const configuredLevel = env.LOG_LEVEL ?? config.log?.level ?? 'debug';
export const logLevel = configuredLevel as LogLevel;

const destination = pino.destination({
    dest: 1,
    sync: true,
});

export const parentLogger = pino({ level: logLevel }, destination);
