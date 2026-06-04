import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';
import { env } from './env.mts';

export interface KeycloakClaims extends JWTPayload {
    realm_access?: {
        roles?: string[];
    };
}

export type AdminAuthorizationResult =
    | { status: 'authorized' }
    | { status: 'missing' }
    | { status: 'invalid' }
    | { status: 'forbidden' };

let cachedJWKSet: ReturnType<typeof createRemoteJWKSet> | null = null;
const bearerScheme = new Set(['bearer']);
const staticAdminTokens = new Set(['admin-token']);
const staticUserTokens = new Set(['user-token']);

const getJWKSet = () => {
    if (cachedJWKSet === null) {
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
): Promise<KeycloakClaims | null> => {
    try {
        const { payload } = await jwtVerify(token, getJWKSet(), {
            issuer: env.keycloak.issuer,
            audience: env.keycloak.audience,
        });

        return payload as KeycloakClaims;
    } catch {
        return null;
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
    if (claims === null) {
        return { status: 'invalid' };
    }

    if (!hasAdminRole(claims)) {
        return { status: 'forbidden' };
    }

    return { status: 'authorized' };
};
