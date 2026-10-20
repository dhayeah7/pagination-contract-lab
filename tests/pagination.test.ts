import { paginate } from '../src/utils/pagination';

describe('paginate', () => {
  test('handles an empty dataset with zero totalPages', () => {
    expect(paginate([], { page: 1, limit: 10 })).toEqual({
      data: [],
      pagination: {
        page: 1, limit: 10, totalItems: 0, totalPages: 0,
        hasNextPage: false, hasPreviousPage: false,
      },
    });
  });

  test('keeps the previous-page formula for an empty dataset at page > 1', () => {
    expect(paginate([], { page: 2, limit: 10 }).pagination).toEqual({
      page: 2, limit: 10, totalItems: 0, totalPages: 0,
      hasNextPage: false, hasPreviousPage: true,
    });
  });

  test('does not invent another page at an exact multiple of the limit', () => {
    expect(paginate([1, 2, 3, 4], { page: 2, limit: 2 })).toEqual({
      data: [3, 4],
      pagination: {
        page: 2, limit: 2, totalItems: 4, totalPages: 2,
        hasNextPage: false, hasPreviousPage: true,
      },
    });
  });

  test('returns a new slice without mutating or reordering the input', () => {
    const input = Object.freeze([3, 1, 4, 2]);
    const result = paginate(input, { page: 1, limit: 2 });
    expect(result.data).toEqual([3, 1]);
    result.data.pop();
    expect(input).toEqual([3, 1, 4, 2]);
  });

  test('metadata and slices remain consistent across dataset sizes and valid parameters', () => {
    for (const size of [0, 1, 10, 20, 23, 40]) {
      const items = Array.from({ length: size }, (_, index) => index);
      for (const limit of [1, 7, 10, 20]) {
        const totalPages = Math.ceil(size / limit);
        for (const page of [1, 2, Math.max(1, totalPages), totalPages + 1, 99]) {
          const result = paginate(items, { page, limit });
          expect(result.data).toEqual(items.slice((page - 1) * limit, page * limit));
          expect(result.pagination).toEqual({
            page, limit, totalItems: size, totalPages,
            hasNextPage: page < totalPages, hasPreviousPage: page > 1,
          });
          expect(result.data.length).toBeLessThanOrEqual(limit);
        }
      }
    }
  });
});
