import type pino from 'pino';
import { parentLogger } from '../config/logger.mts';

export const getLogger = (
    context: string,
    kind = 'class',
): pino.Logger<string> => {
    const bindings: Record<string, string> = {};
    bindings[kind] = context;

    return parentLogger.child(bindings);
};
