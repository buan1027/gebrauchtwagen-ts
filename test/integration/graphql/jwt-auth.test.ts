import { describe, expect, test } from 'vitest';
import '../setup.ts';

type GraphqlResponse = {
    data?: unknown;
    errors?: { extensions?: { code?: string } }[];
};

const headers = {
    'Content-Type': 'application/json',
};

const adminHeaders = {
    ...headers,
    Authorization: 'Bearer admin-token',
};

const userHeaders = {
    ...headers,
    Authorization: 'Bearer user-token',
};

const validInput = {
    marke: 'BMW',
    modell: 'X5',
    fahrzeugklasse: 'SUV',
    kraftstoffart: 'BENZIN',
    schadenfrei: true,
    kilometerstand: 50_000,
};

const createMutation = `
    mutation CreateGebrauchtwagen($input: GebrauchtwagenInput!) {
        createGebrauchtwagen(input: $input) {
            id
            marke
        }
    }
`;

const getBaseUrl = (): string => {
    const baseUrl = process.env['TEST_BASE_URL'];
    if (baseUrl === undefined) {
        throw new Error('TEST_BASE_URL ist nicht gesetzt');
    }

    return baseUrl;
};

const graphql = async (
    query: string,
    requestHeaders: Record<string, string>,
    variables: Record<string, unknown> = {},
): Promise<GraphqlResponse> => {
    const response = await fetch(`${getBaseUrl()}/graphql`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({ query, variables }),
    });

    expect(response.status).toBe(200);

    return (await response.json()) as GraphqlResponse;
};

describe('GraphQL Auth Integration', () => {
    test('lehnt Mutation ohne Token ab', async () => {
        const body = await graphql(createMutation, headers, {
            input: validInput,
        });

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED');
    });

    test('lehnt Mutation mit User-Rolle ab', async () => {
        const body = await graphql(createMutation, userHeaders, {
            input: validInput,
        });

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });

    test('akzeptiert Mutation mit Admin-Rolle', async () => {
        const body = await graphql(createMutation, adminHeaders, {
            input: validInput,
        });

        expect(body.errors).toBeUndefined();
        expect(body.data).toBeDefined();
    });

    test('liest Daten ohne Token', async () => {
        const body = await graphql(
            `
                query {
                    gebrauchtwagenListe(input: { page: 1, size: 1 }) {
                        data {
                            id
                            marke
                        }
                    }
                }
            `,
            headers,
        );

        expect(body.errors).toBeUndefined();
        expect(body.data).toBeDefined();
    });
});
