import { describe, it, expect } from 'vitest';
import { hasAdminRole, hasUserRole } from '../../src/config/jwt-auth.mts';
import type { KeycloakClaims } from '../../src/config/jwt-auth.mts';

describe('JWT Auth - Keycloak Claims', () => {
    describe('hasAdminRole', () => {
        it('erkennt Admin-Rolle korrekt', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
                realm_access: { roles: ['admin', 'user'] },
            };
            expect(hasAdminRole(claims)).toBe(true);
        });

        it('gibt false zurück ohne Admin-Rolle', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
                realm_access: { roles: ['user'] },
            };
            expect(hasAdminRole(claims)).toBe(false);
        });

        it('behandelt fehlende realm_access korrekt', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
            };
            expect(hasAdminRole(claims)).toBe(false);
        });

        it('behandelt undefined roles korrekt', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
                realm_access: {},
            };
            expect(hasAdminRole(claims)).toBe(false);
        });
    });

    describe('hasUserRole', () => {
        it('akzeptiert user-Rolle', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
                realm_access: { roles: ['user'] },
            };
            expect(hasUserRole(claims)).toBe(true);
        });

        it('akzeptiert auch admin-Rolle (admin kann alles)', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
                realm_access: { roles: ['admin'] },
            };
            expect(hasUserRole(claims)).toBe(true);
        });

        it('gibt false zurück ohne Rollen', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
                realm_access: { roles: [] },
            };
            expect(hasUserRole(claims)).toBe(false);
        });
    });
});
