import process from 'node:process';

export const env = {
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    logLevel: process.env['LOG_LEVEL'] ?? 'info',
    port: process.env['PORT'],
    // OIDC/Keycloak Configuration
    keycloak: {
        issuer: process.env['KEYCLOAK_ISSUER'] ?? 'http://localhost:8080/realms/gebrauchtwagen',
        audience: process.env['KEYCLOAK_AUDIENCE'] ?? 'gebrauchtwagen-app',
        jwksUrl: process.env['KEYCLOAK_JWKS_URL'] ?? 'http://localhost:8080/realms/gebrauchtwagen/protocol/openid-connect/certs',
    },
};
