import { z } from 'zod';

export const MAX_LIMIT = 20;
export const PAGE_ERROR = `The page must be an integer between 1 and ${Number.MAX_SAFE_INTEGER}.`;
export const LIMIT_ERROR = `The limit must be an integer between 1 and ${MAX_LIMIT}.`;
export const UNKNOWN_QUERY_ERROR = 'Unknown query parameters are not allowed.';

function queryInteger(maximum: number, message: string) {
  // Reject blanks, fractions, signs, arrays, and exponent notation before conversion.
  return z.string({ error: message })
    .regex(/^[0-9]+$/, { error: message })
    .transform(Number)
    .pipe(z.number().int({ error: message }).min(1, { error: message }).max(maximum, { error: message }));
}

export const paginationSchema = z.strictObject({
  page: queryInteger(Number.MAX_SAFE_INTEGER, PAGE_ERROR).default(1),
  limit: queryInteger(MAX_LIMIT, LIMIT_ERROR).default(10),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
