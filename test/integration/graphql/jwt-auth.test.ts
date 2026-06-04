import { describe, it, expect } from 'vitest';

describe('GraphQL Auth Integration (JWT & Token Support)', () => {
    const baseUrl = 'http://127.0.0.1:4017/graphql';

    const headers = {
        'Content-Type': 'application/json',
    };

    const adminHeaders = {
        ...headers,
        'Authorization': 'Bearer admin-token',
    };

    const userHeaders = {
        ...headers,
        'Authorization': 'Bearer user-token',
    };

    const createMutation = `
        mutation CreateGebrauchtwagen($input: GebrauchtwagenInput!) {
            createGebrauchtwagen(input: $input) {
                id
                marke
            }
        }
    `;

    const validInput = {
        marke: 'BMW',
        modell: 'X5',
        baujahr: 2020,
        kilometerstand: 50000,
        schaden: [],
        hauptuntersuchung: {
            gültigBis: new Date().toISOString().split('T')[0],
        },
        standorte: [],
    };

    it('lehnt Mutation ohne Token ab (401)', async () => {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query: createMutation,
                variables: { input: validInput },
            }),
        });

        expect(response.status).toBe(200); // GraphQL returns 200, error in body
        const body = await response.json();
        expect(body.errors).toBeDefined();
        expect(body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });

    it('lehnt Mutation mit falscher Rolle ab (403)', async () => {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: userHeaders,
            body: JSON.stringify({
                query: createMutation,
                variables: { input: validInput },
            }),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.errors).toBeDefined();
        expect(body.errors[0].extensions.code).toBe('FORBIDDEN');
    });

    it('akzeptiert Mutation mit gueltigem Admin-Token', async () => {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                query: createMutation,
                variables: { input: validInput },
            }),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.errors).toBeUndefined();
        expect(body.data?.createGebrauchtwagen?.id).toBeDefined();
    });

    it('liest Daten ohne Token ab (keine Auth erforderlich)', async () => {
        const query = `
            query {
                gebrauchtwagenListe {
                    id
                    marke
                }
            }
        `;

        const response = await fetch(baseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query }),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.data?.gebrauchtwagenListe).toBeDefined();
    });
});
