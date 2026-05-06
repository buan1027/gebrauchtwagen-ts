import { describe, expect, test } from 'vitest';
import { app } from '../../src/app.mts';

describe('Health-Endpunkte', () => {
    test('liefert Liveness', async () => {
        const response = await app.request('/health/liveness');

        await expect(response.json()).resolves.toStrictEqual({ status: 'up' });
        expect(response.status).toBe(200);
    });

    test('liefert Readiness', async () => {
        const response = await app.request('/health/readiness');

        await expect(response.json()).resolves.toStrictEqual({ status: 'up' });
        expect(response.status).toBe(200);
    });
});
