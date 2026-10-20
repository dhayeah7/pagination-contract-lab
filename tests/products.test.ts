import express from 'express';
import request from 'supertest';
import { app } from '../src/app';
import { products } from '../src/data/products';
import { errorHandler } from '../src/middleware/errorHandler';
import { LIMIT_ERROR, PAGE_ERROR, UNKNOWN_QUERY_ERROR } from '../src/schemas/pagination';

describe('GET /api/products', () => {
  test('defaults to the full first page', async () => {
    const response = await request(app).get('/api/products').expect(200).expect('Content-Type', /json/);

    expect(response.body).toEqual({
      data: products.slice(0, 10),
      pagination: {
        page: 1, limit: 10, totalItems: 23, totalPages: 3,
        hasNextPage: true, hasPreviousPage: false,
      },
    });
  });

  test('accepts explicit page and limit, with unique IDs on the full first page', async () => {
    const response = await request(app).get('/api/products?page=1&limit=10').expect(200);

    expect(response.body.data).toEqual(products.slice(0, 10));
    expect(new Set(response.body.data.map((product: { id: string }) => product.id)).size).toBe(10);
    expect(response.body.pagination).toEqual({
      page: 1, limit: 10, totalItems: 23, totalPages: 3,
      hasNextPage: true, hasPreviousPage: false,
    });
  });

  test('uses the offset formula and returns the same order across repeated requests', async () => {
    const first = await request(app).get('/api/products?page=2&limit=7').expect(200);
    const second = await request(app).get('/api/products?page=2&limit=7').expect(200);

    expect(first.body.data).toEqual(products.slice(7, 14));
    expect(first.body.pagination).toEqual({
      page: 2, limit: 7, totalItems: 23, totalPages: 4,
      hasNextPage: true, hasPreviousPage: true,
    });
    expect(second.body).toEqual(first.body);
  });

  test('returns the partial final page', async () => {
    const response = await request(app).get('/api/products?page=3&limit=10').expect(200);

    expect(response.body).toEqual({
      data: products.slice(20, 23),
      pagination: {
        page: 3, limit: 10, totalItems: 23, totalPages: 3,
        hasNextPage: false, hasPreviousPage: true,
      },
    });
  });

  test('returns an empty page without clamping the requested page', async () => {
    const response = await request(app).get('/api/products?page=99&limit=10').expect(200);

    expect(response.body).toEqual({
      data: [],
      pagination: {
        page: 99, limit: 10, totalItems: 23, totalPages: 3,
        hasNextPage: false, hasPreviousPage: true,
      },
    });
  });

  test.each([
    ['?limit=3', 1, 3],
    ['?page=2', 2, 10],
    ['?page=01&limit=02', 1, 2],
  ])('applies independent defaults and numeric normalization for %s', async (query, page, limit) => {
    const response = await request(app).get(`/api/products${query}`).expect(200);
    expect(response.body.pagination).toMatchObject({ page, limit });
    expect(response.body.data).toEqual(products.slice((page - 1) * limit, page * limit));
  });

  test('accepts the maximum page size and recomputes totalPages', async () => {
    const response = await request(app).get('/api/products?page=1&limit=20').expect(200);

    expect(response.body).toEqual({
      data: products.slice(0, 20),
      pagination: {
        page: 1, limit: 20, totalItems: 23, totalPages: 2,
        hasNextPage: true, hasPreviousPage: false,
      },
    });
  });

  test('the smallest page size exposes every item once with consistent metadata', async () => {
    const seenIds: string[] = [];

    for (let page = 1; page <= 24; page += 1) {
      const response = await request(app).get(`/api/products?page=${page}&limit=1`).expect(200);
      expect(response.body.data).toEqual(products.slice(page - 1, page));
      expect(response.body.pagination).toEqual({
        page, limit: 1, totalItems: 23, totalPages: 23,
        hasNextPage: page < 23, hasPreviousPage: page > 1,
      });
      seenIds.push(...response.body.data.map((product: { id: string }) => product.id));
    }

    expect(seenIds).toEqual(products.map((product) => product.id));
    expect(new Set(seenIds).size).toBe(23);
  });

  test.each(['0', '-1', '1.5', 'abc', '', '1e2', '1.0', '+1', ' 1 ', 'Infinity', 'NaN', '9007199254740992'])(
    'rejects invalid page %j with the consistent error shape',
    async (page) => {
      const response = await request(app).get('/api/products').query({ page }).expect(400);
      expect(response.body).toEqual({
        error: { code: 'INVALID_QUERY_PARAMETER', message: PAGE_ERROR },
      });
    },
  );

  test.each(['0', '-1', '2.5', 'abc', '', '21', '1e1', '2.0', '+2', ' 2 ', 'Infinity', 'NaN'])(
    'rejects invalid limit %j with the consistent error shape',
    async (limit) => {
      const response = await request(app).get('/api/products').query({ limit }).expect(400);
      expect(response.body).toEqual({
        error: { code: 'INVALID_QUERY_PARAMETER', message: LIMIT_ERROR },
      });
    },
  );

  test('rejects both-invalid input without claiming to return all validation errors', async () => {
    const response = await request(app).get('/api/products?page=0&limit=-1').expect(400);
    expect(response.body).toEqual({
      error: { code: 'INVALID_QUERY_PARAMETER', message: PAGE_ERROR },
    });
  });

  test.each(['?sort=name', '?page=1&limit=10&extra=true', '?Page=1', '?page[nested]=1'])(
    'rejects unknown or nested query parameters: %s',
    async (query) => {
      const response = await request(app).get(`/api/products${query}`).expect(400);
      expect(response.body).toEqual({
        error: { code: 'INVALID_QUERY_PARAMETER', message: UNKNOWN_QUERY_ERROR },
      });
    },
  );

  test.each(['?page=1&page=2', '?limit=10&limit=20'])('rejects duplicate parameters: %s', async (query) => {
    const response = await request(app).get(`/api/products${query}`).expect(400);
    expect(response.body).toEqual({
      error: {
        code: 'INVALID_QUERY_PARAMETER',
        message: query.startsWith('?page') ? PAGE_ERROR : LIMIT_ERROR,
      },
    });
  });

  test('accepts the largest safe page without offset wraparound', async () => {
    const response = await request(app)
      .get(`/api/products?page=${Number.MAX_SAFE_INTEGER}&limit=20`)
      .expect(200);
    expect(response.body).toEqual({
      data: [],
      pagination: {
        page: Number.MAX_SAFE_INTEGER, limit: 20, totalItems: 23, totalPages: 2,
        hasNextPage: false, hasPreviousPage: true,
      },
    });
  });
});

describe('synthetic dataset', () => {
  test('contains 23 deterministic products with unique sequential IDs and valid fields', () => {
    expect(products).toHaveLength(23);
    expect(new Set(products.map((product) => product.id)).size).toBe(23);
    expect(new Set(products.map((product) => product.category)).size).toBeGreaterThan(1);
    expect(new Set(products.map((product) => product.inStock))).toEqual(new Set([true, false]));
    products.forEach((product, index) => {
      expect(product.id).toBe(`prod-${String(index + 1).padStart(3, '0')}`);
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.category.length).toBeGreaterThan(0);
      expect(Number.isInteger(product.price)).toBe(true);
      expect(product.price).toBeGreaterThan(0);
      expect(typeof product.inStock).toBe('boolean');
    });
  });
});

describe('HTTP infrastructure', () => {
  test('has a separate health endpoint', async () => {
    const response = await request(app).get('/health').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('returns a JSON error for unknown endpoints', async () => {
    const response = await request(app).get('/missing').expect(404);
    expect(response.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'The requested endpoint does not exist.' },
    });
  });

  test('does not expose internal error details', async () => {
    const failingApp = express();
    failingApp.get('/fail', () => { throw new Error('private implementation detail'); });
    failingApp.use(errorHandler);

    const response = await request(failingApp).get('/fail').expect(500);
    expect(response.body).toEqual({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' },
    });
  });
});
