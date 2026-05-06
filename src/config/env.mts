import process from 'node:process';

const { LOG_LEVEL, NODE_ENV } = process.env;

export type Env = {
    LOG_LEVEL: string | undefined;
    NODE_ENV: string | undefined;
};

export const env: Env = {
    LOG_LEVEL,
    NODE_ENV,
} as const;
