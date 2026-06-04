import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { env } from './env.mts';

export type KeycloakClaims = JWTPayload & {
    ['realm_access']?: {
        roles?: string[];
    };
};

export type AdminAuthorizationResult =
    | { status: 'authorized' }
    | { status: 'missing' }
    | { status: 'invalid' }
    | { status: 'forbidden' };

let cachedJWKSet: ReturnType<typeof createRemoteJWKSet> | undefined;
const bearerScheme = new Set(['bearer']);
const staticAdminTokens = new Set(['admin-token']);
const staticUserTokens = new Set(['user-token']);

const getJWKSet = () => {
    if (cachedJWKSet === undefined) {
        cachedJWKSet = createRemoteJWKSet(new URL(env.keycloak.jwksUrl));
    }
    return cachedJWKSet;
};

const allowsStaticTokens = (): boolean =>
    env.nodeEnv === 'development' || env.nodeEnv === 'test';

export const parseBearerToken = (
    authorizationHeader: string | null | undefined,
): string | undefined => {
    if (authorizationHeader === null || authorizationHeader === undefined) {
        return undefined;
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme === undefined || !bearerScheme.has(scheme.toLowerCase())) {
        return undefined;
    }

    if (token === undefined || token.length === 0) {
        return undefined;
    }

    return token;
};

export const verifyJWT = async (
    token: string,
): Promise<KeycloakClaims | undefined> => {
    try {
        const { payload } = await jwtVerify(token, getJWKSet(), {
            issuer: env.keycloak.issuer,
            audience: env.keycloak.audience,
        });

        return payload;
    } catch {
        return undefined;
    }
};

export const hasAdminRole = (claims: KeycloakClaims): boolean => {
    const roles = claims.realm_access?.roles ?? [];
    return roles.includes('admin');
};

export const hasUserRole = (claims: KeycloakClaims): boolean => {
    const roles = claims.realm_access?.roles ?? [];
    return roles.includes('user') || roles.includes('admin');
};

export const requireAdminAuthorization = async (
    authorizationHeader: string | null | undefined,
): Promise<AdminAuthorizationResult> => {
    const token = parseBearerToken(authorizationHeader);

    if (token === undefined) {
        return { status: 'missing' };
    }

    if (allowsStaticTokens()) {
        if (staticAdminTokens.has(token)) {
            return { status: 'authorized' };
        }

        if (staticUserTokens.has(token)) {
            return { status: 'forbidden' };
        }
    }

    const claims = await verifyJWT(token);
    if (claims === undefined) {
        return { status: 'invalid' };
    }

    if (!hasAdminRole(claims)) {
        return { status: 'forbidden' };
    }

    return { status: 'authorized' };
};
