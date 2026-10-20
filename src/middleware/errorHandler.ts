import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { UNKNOWN_QUERY_ERROR } from '../schemas/pagination';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ZodError) {
    const issue = error.issues[0];
    const message = issue?.code === 'unrecognized_keys'
      ? UNKNOWN_QUERY_ERROR
      : issue?.message ?? 'Invalid query parameters.';

    response.status(400).json({
      error: { code: 'INVALID_QUERY_PARAMETER', message },
    });
    return;
  }

  // Never expose stack traces or arbitrary exception messages to clients.
  response.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' },
  });
};
