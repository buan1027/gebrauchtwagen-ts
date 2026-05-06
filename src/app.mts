import { Hono, type Context, type Next } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import { secureHeaders } from 'hono/secure-headers';
import { router as healthRouter } from './admin/health-router.mts';
import { corsOptions } from './config/cors.mts';
import { paths } from './config/paths.mts';
import { getLogger } from './logger/logger.mts';
import { requestLogger } from './logger/request-logger.mts';
import { responseTime } from './logger/response-time.mts';

export const app = new Hono();

const logger = getLogger('app', 'file');
const notFoundStatus = 404;
const internalServerErrorStatus = 500;

const additionalSecurityHeaders = createMiddleware(
    async (c: Context, next: Next) => {
        c.header('X-Content-Type-Options', 'nosniff');
        c.header('X-Frame-Options', 'SAMEORIGIN');
        await next();
    },
);

app.use(
    secureHeaders(),
    cors(corsOptions),
    additionalSecurityHeaders,
    compress(),
    responseTime,
    requestLogger,
);

app.route(paths.health, healthRouter);

app.get('/', (c) => c.json({ app: 'gebrauchtwagen', status: 'up' }));

app.notFound((c) =>
    c.json(
        { detail: 'Nicht gefunden', status: notFoundStatus },
        notFoundStatus,
    ),
);

app.onError((err, c) => {
    logger.error('Interner Fehler: %o', err);
    return c.json(
        { detail: 'Interner Fehler', status: internalServerErrorStatus },
        internalServerErrorStatus,
    );
});
