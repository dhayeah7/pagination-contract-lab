# Pagination Contract Lab: API contract

Version: 1.0. This document defines this project's choices, not universal API rules.

## Local endpoints

- Base URL: `http://localhost:3000`. The server binds only to `127.0.0.1:3000`.
- `GET /api/products`: paginated synthetic products; JSON responses.
- `GET /health`: HTTP 200 with `{"status":"ok"}`. This is separate from the six
  pagination scenarios.
- No authentication, database, external API, filtering, or sorting.

## Product data and order

The dataset contains exactly 23 entirely synthetic products in
`src/data/products.ts`. IDs are unique, from `prod-001` through `prod-023`, and
responses preserve that fixed ascending ID order. Repeated requests return the
same order. In-stock and out-of-stock products both count toward pagination.

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | Stable synthetic product ID |
| `name` | string | Nonempty synthetic product name |
| `category` | string | Nonempty category |
| `price` | integer | Positive amount in INR units, not paise |
| `inStock` | boolean | Synthetic stock availability |

The API does not mutate this dataset.

## Query parameters

| Parameter | Default | Accepted range | Meaning |
| --- | --- | --- | --- |
| `page` | `1` | `1`–`9007199254740991` inclusive | One-based page number |
| `limit` | `10` | `1`–`20` inclusive | Maximum products per page |

Each parameter defaults independently **only when omitted**. Values must be
single query strings containing ASCII decimal digits (`0`–`9`) only and must
evaluate to an integer in the accepted range. Leading zeros are accepted
(`page=01` becomes numeric `1`).

Reject with HTTP 400:

- Zero, negative, fractional, nonnumeric, blank, signed, whitespace-padded, or
  exponent-form values, including `page=1.0` and `limit=1e1`.
- `limit` above 20; it is rejected, not silently capped.
- Page values beyond JavaScript's maximum safe integer. This explicit
  representability boundary prevents ambiguous numeric page metadata.
- Repeated keys such as `page=1&page=2`, including repeated identical values.
- Unknown keys. Names are case-sensitive: `Page` is not `page`.
  Nested or bracket-style keys such as `page[nested]` are unsupported.

There are no supported query parameters other than `page` and `limit`.

## Pagination formulas

For validated numeric `page` and `limit`:

```text
offset          = (page - 1) * limit
data            = products.slice(offset, offset + limit)
totalItems      = products.length
totalPages      = Math.ceil(totalItems / limit)
hasNextPage     = page < totalPages
hasPreviousPage = page > 1
```

All metadata comes from the actual dataset and requested/defaulted parameters.
Navigation flags describe these formulas, not whether the current page has data.

A valid page beyond the final page returns HTTP 200 and `data: []`. The requested
page is retained, not clamped. For `page=99&limit=10`:

```json
{
  "data": [],
  "pagination": {
    "page": 99,
    "limit": 10,
    "totalItems": 23,
    "totalPages": 3,
    "hasNextPage": false,
    "hasPreviousPage": true
  }
}
```

For an empty dataset, `totalItems=0`, `totalPages=0`, `data=[]`, and
`hasNextPage=false`. `hasPreviousPage` is still `page > 1`: false on page 1 and
true on page 2. Empty-dataset behavior is unit-tested; this API's fixed dataset
is not empty, and no public endpoint empties it.

## Successful response

HTTP 200. The envelope contains exactly `data` and `pagination`.
`data` is an array of product objects, possibly empty. Pagination numeric fields
are integers; navigation fields are booleans.

**Documentation example, not a captured response:** `GET /api/products?page=3&limit=10`.

```json
{
  "data": [
    {
      "id": "prod-021",
      "name": "Ceramic Planter",
      "category": "Garden",
      "price": 459,
      "inStock": false
    },
    {
      "id": "prod-022",
      "name": "Indoor Watering Can",
      "category": "Garden",
      "price": 579,
      "inStock": true
    },
    {
      "id": "prod-023",
      "name": "Microfiber Cleaning Cloth Set",
      "category": "Home",
      "price": 299,
      "inStock": true
    }
  ],
  "pagination": {
    "page": 3,
    "limit": 10,
    "totalItems": 23,
    "totalPages": 3,
    "hasNextPage": false,
    "hasPreviousPage": true
  }
}
```

## Errors and HTTP status codes

Every application error uses this consistent shape:

```json
{
  "error": {
    "code": "INVALID_QUERY_PARAMETER",
    "message": "The limit must be an integer between 1 and 20."
  }
}
```

The example is an expected contract example, not execution evidence.

| Status | Code | When |
| --- | --- | --- |
| 200 | Not applicable | Valid request, including pages beyond the end |
| 400 | `INVALID_QUERY_PARAMETER` | Query validation failed |
| 404 | `NOT_FOUND` | Unsupported endpoint or HTTP method |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected internal exception |

Exact validation messages:

- Invalid page: `The page must be an integer between 1 and 9007199254740991.`
- Invalid limit: `The limit must be an integer between 1 and 20.`
- Unknown keys: `Unknown query parameters are not allowed.`

Only one validation message is returned. Page failures take priority over limit
failures; unknown-key failures follow recognized-field failures. Thus
`page=0&limit=-1` returns the page message, not a list of both errors.

404 message: `The requested endpoint does not exist.`
500 message: `An unexpected error occurred.` Internal exception details and
stack traces are never included in the response.

Express also accepts `HEAD` on GET routes with no response body. Other unsupported
methods return the documented 404. Error shape applies to requests reaching the
Express app, not HTTP parsing failures rejected by Node before routing.
