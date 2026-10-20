import type { PaginationQuery } from '../schemas/pagination';

export interface PaginationMetadata extends PaginationQuery {
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMetadata;
}

/** Parameters have already been validated at the HTTP boundary. */
export function paginate<T>(
  items: readonly T[],
  { page, limit }: PaginationQuery,
): PaginatedResult<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);
  const offset = (page - 1) * limit;

  return {
    data: items.slice(offset, offset + limit),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      // This remains true beyond the last page, as specified by this contract.
      hasPreviousPage: page > 1,
    },
  };
}
