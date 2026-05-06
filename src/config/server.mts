import { hostname } from 'node:os';
import { config } from './app.mts';
import { env } from './env.mts';

const defaultPort = 3000;
const { server } = config;

if (server?.port !== undefined && typeof server.port !== 'number') {
    throw new TypeError('Der konfigurierte Port ist keine Zahl');
}

export type RuntimeEnvironment =
    | 'development'
    | 'production'
    | 'test'
    | undefined;

export type AppServerConfig = {
    host: string;
    nodeEnv: RuntimeEnvironment;
    port: number;
};

export const serverConfig: AppServerConfig = {
    host: hostname(),
    nodeEnv: env.NODE_ENV as RuntimeEnvironment,
    port: server?.port ?? defaultPort,
} as const;
