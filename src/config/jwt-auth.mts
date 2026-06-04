import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { JWTClaimsSet } from 'jose';
import { env } from './env.mts';

/**
 * JWT Claims mit Keycloak-spezifischen Rollen aus realm_access
 */
export interface KeycloakClaims extends JWTClaimsSet {
    realm_access?: {
        roles?: string[];
    };
}

/**
 * Cache für JWKS um wiederholte Anfragen zu sparen
 */
let cachedJWKSet: ReturnType<typeof createRemoteJWKSet> | null = null;

const getJWKSet = () => {
    if (cachedJWKSet === null) {
        cachedJWKSet = createRemoteJWKSet(
            new URL(env.keycloak.jwksUrl),
        );
    }
    return cachedJWKSet;
};

/**
 * Token validieren und Claims extrahieren
 * @param token JWT Token aus Authorization Header
 * @returns Keycloak Claims oder null bei Fehler
 */
export const verifyJWT = async (
    token: string,
): Promise<KeycloakClaims | null> => {
    try {
        const { payload } = await jwtVerify(
            token,
            getJWKSet(),
            {
                issuer: env.keycloak.issuer,
                audience: env.keycloak.audience,
            },
        );

        return payload as KeycloakClaims;
    } catch (error) {
        // Token ist ungültig, expired oder signature check fehlgeschlagen
        return null;
    }
};

/**
 * Prüfe ob User die Admin-Rolle hat
 */
export const hasAdminRole = (claims: KeycloakClaims): boolean => {
    const roles = claims.realm_access?.roles ?? [];
    return roles.includes('admin');
};

/**
 * Prüfe ob User die User-Rolle hat
 */
export const hasUserRole = (claims: KeycloakClaims): boolean => {
    const roles = claims.realm_access?.roles ?? [];
    return roles.includes('user') || roles.includes('admin');
};
