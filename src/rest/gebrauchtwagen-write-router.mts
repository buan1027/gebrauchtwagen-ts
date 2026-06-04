import { Hono, type Context } from 'hono';
import { ZodError } from 'zod';
import {
    createProblemDetails,
    notFound,
    preconditionFailed,
    preconditionRequired,
} from '../problem-details.mts';
import type {
    GebrauchtwagenReadService,
    GebrauchtwagenWriteService,
} from '../service/gebrauchtwagen-service.mts';
import { createLocation } from './create-base-url.mts';
import {
    createEtag,
    parseEtagVersion,
    requireAdminAuthorizationAsync,
} from './rest-headers.mts';
import { statuscode } from './statuscode.mts';
import {
    createInvalidIdResponse,
    createValidationErrorResponse,
    isPositiveId,
    parseGebrauchtwagenBody,
} from './gebrauchtwagen-validation.mts';

const createPostHandler =
    (service: GebrauchtwagenWriteService) => async (context: Context) => {
        const authError = await requireAdminAuthorizationAsync(
            context.req.header('authorization'),
        );
        if (authError !== undefined) {
            return authError;
        }

        try {
            const payload = await parseGebrauchtwagenBody(context.req.raw);
            const created = await service.create(payload);

            context.header(
                'Location',
                createLocation(context.req.raw, created.id),
            );
            return context.body(null, statuscode.created); // eslint-disable-line unicorn/no-null
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                return createValidationErrorResponse(err);
            }

            throw err;
        }
    };

const createPutHandler =
    (
        readService: GebrauchtwagenReadService,
        writeService: GebrauchtwagenWriteService,
    ) =>
    async (context: Context) => {
        const authError = await requireAdminAuthorizationAsync(
            context.req.header('authorization'),
        );
        if (authError !== undefined) {
            return authError;
        }

        const id = Number(context.req.param('id'));
        if (!isPositiveId(id)) {
            return createInvalidIdResponse();
        }

        const item = await readService.findById(id);
        if (item === undefined) {
            return createProblemDetails(
                notFound,
                `Kein Gebrauchtwagen mit id=${id} gefunden`,
            );
        }

        const version = parseEtagVersion(context.req.header('If-Match'));
        if (version === undefined) {
            return createProblemDetails(
                preconditionRequired,
                'Header "If-Match" fehlt oder ist ungueltig',
            );
        }

        if (version !== item.version) {
            return createProblemDetails(
                preconditionFailed,
                `Version ${version} ist nicht mehr aktuell`,
            );
        }

        try {
            const payload = await parseGebrauchtwagenBody(context.req.raw);
            const updated = await writeService.update(id, payload);
            context.header('ETag', createEtag(updated?.version ?? version + 1));
            return context.body(null, statuscode.noContent); // eslint-disable-line unicorn/no-null
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                return createValidationErrorResponse(err);
            }

            throw err;
        }
    };

const createDeleteHandler =
    (service: GebrauchtwagenWriteService) => async (context: Context) => {
        const authError = await requireAdminAuthorizationAsync(
            context.req.header('authorization'),
        );
        if (authError !== undefined) {
            return authError;
        }

        const id = Number(context.req.param('id'));
        if (!isPositiveId(id)) {
            return createInvalidIdResponse();
        }

        const deleted = await service.delete(id);
        if (!deleted) {
            return createProblemDetails(
                notFound,
                `Kein Gebrauchtwagen mit id=${id} gefunden`,
            );
        }

        return context.body(null, statuscode.noContent); // eslint-disable-line unicorn/no-null
    };

export const createGebrauchtwagenWriteRouter = (
    readService: GebrauchtwagenReadService,
    writeService: GebrauchtwagenWriteService,
): Hono => {
    const router = new Hono();

    router.post('/', createPostHandler(writeService));
    router.put('/:id', createPutHandler(readService, writeService));
    router.delete('/:id', createDeleteHandler(writeService));

    return router;
};
