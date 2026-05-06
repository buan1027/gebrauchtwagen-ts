import { Hono } from 'hono';

export const router = new Hono();

router.get('/liveness', (c) => c.json({ status: 'up' }));

router.get('/readiness', (c) => c.json({ status: 'up' }));
