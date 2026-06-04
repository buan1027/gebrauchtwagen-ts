import {
    createProblemDetails,
    forbidden,
    unauthorized,
} from '../problem-details.mts';
import { requireAdminAuthorization as authorizeAdminToken } from '../config/jwt-auth.mts';
import { statuscode } from './statuscode.mts';

const bearerScheme = new Set(['bearer']);
const adminTokens = new Set(['admin-token']);

export const acceptsJsonOrHtml = (
    acceptHeader: string | undefined,
): boolean => {
    const accept = acceptHeader?.toLowerCase() ?? '*/*';

    return accept === '*/*' || /json|html/u.test(accept);
};

export const createNotAcceptableResponse = (): Response =>
    new Response(undefined, { status: statuscode.notAcceptable });

export const createEtag = (version: number): string => `W/"${version}"`;

export const parseEtagVersion = (
    etag: string | undefined,
): number | undefined => {
    const match = /^W?\/?"(?<version>\d+)"$/u.exec(etag ?? '');
    const version = match?.groups?.['version'];

    return version === undefined ? undefined : Number.parseInt(version, 10);
};

const parseAuthorization = (
    authorizationHeader: string | undefined,
): string | undefined => {
    if (authorizationHeader === undefined) {
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

export const requireAdminAuthorizationAsync = async (
    authorizationHeader: string | undefined,
): Promise<Response | undefined> => {
    const result = await authorizeAdminToken(authorizationHeader);

    if (result.status === 'authorized') {
        return undefined;
    }

    if (result.status === 'missing') {
        return createProblemDetails(
            unauthorized,
            'Bearer-Token fehlt oder ist ungueltig',
        );
    }

    if (result.status === 'forbidden') {
        return createProblemDetails(
            forbidden,
            'Admin-Rolle erforderlich',
        );
    }

    return createProblemDetails(
        unauthorized,
        'Token ist ungueltig oder abgelaufen',
    );
};

export const requireAdminAuthorization = (
    authorizationHeader: string | undefined,
): Response | undefined => {
    const token = parseAuthorization(authorizationHeader);
    const hasToken = typeof token === 'string';

    if (!hasToken) {
        return createProblemDetails(
            unauthorized,
            'Bearer-Token fehlt oder ist ungueltig',
        );
    }

    if (!adminTokens.has(token)) {
        return createProblemDetails(forbidden, 'Admin-Rolle erforderlich');
    }

    return undefined;
};
