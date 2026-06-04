import { describe, expect, test } from 'vitest';
import { hasAdminRole, hasUserRole } from '../src/config/jwt-auth.mts';
import type { KeycloakClaims } from '../src/config/jwt-auth.mts';

describe('JWT Auth - Keycloak Claims', () => {
    describe('hasAdminRole', () => {
        test('erkennt Admin-Rolle korrekt', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
                realm_access: { roles: ['admin', 'user'] },
            };
            expect(hasAdminRole(claims)).toBe(true);
        });

        test('gibt false zurück ohne Admin-Rolle', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
                realm_access: { roles: ['user'] },
            };
            expect(hasAdminRole(claims)).toBe(false);
        });

        test('behandelt fehlende realm_access korrekt', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
            };
            expect(hasAdminRole(claims)).toBe(false);
        });

        test('behandelt undefined roles korrekt', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
                realm_access: {},
            };
            expect(hasAdminRole(claims)).toBe(false);
        });
    });

    describe('hasUserRole', () => {
        test('akzeptiert user-Rolle', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
                realm_access: { roles: ['user'] },
            };
            expect(hasUserRole(claims)).toBe(true);
        });

        test('akzeptiert auch admin-Rolle (admin kann alles)', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
                realm_access: { roles: ['admin'] },
            };
            expect(hasUserRole(claims)).toBe(true);
        });

        test('gibt false zurück ohne Rollen', () => {
            const claims: KeycloakClaims = {
                sub: 'test-user',
                realm_access: { roles: [] },
            };
            expect(hasUserRole(claims)).toBe(false);
        });
    });
});
