# Pagination contract test plan

## Objective and prerequisites

Validate observable pagination behavior against [API_CONTRACT.md](API_CONTRACT.md).
This is contract verification, not a load test or production certification.

1. Install Node.js 20 or later and run `npm ci`.
2. Run `npm run dev` and keep the terminal open.
3. Import the collection and local environment from `postman/` into Postman.
4. Select **Pagination Contract Lab — Local development**. Confirm `baseUrl`
   equals `http://localhost:3000`. Use the Postman desktop app or Desktop Agent.
5. Run all six folders, including all supplementary requests, for one iteration.

## Six primary scenarios

All paths below are relative to `{{baseUrl}}`. Method: GET.
Every success also requires valid product fields, unique IDs within the page,
and stable deterministic order. Every error requires JSON with only
`error.code` and a nonempty `error.message`.

| ID | Purpose and input | Expected result and verification criteria |
| --- | --- | --- |
| T1 | Defaults: `/api/products` | HTTP 200; 10 products, `prod-001`–`prod-010`; page 1, limit 10, totalItems 23, totalPages 3; next true, previous false |
| T2 | Full page: `/api/products?page=1&limit=10` | HTTP 200; exactly 10 unique products in ID order; page 1, limit 10, totalItems 23, totalPages 3; next true, previous false |
| T3 | Partial final page: `/api/products?page=3&limit=10` | HTTP 200; exactly `prod-021`, `prod-022`, `prod-023`; page 3, limit 10, totalItems 23, totalPages 3; next false, previous true |
| T4 | Beyond last: `/api/products?page=99&limit=10` | HTTP 200, `data=[]`; page 99 retained, limit 10, totalItems 23, totalPages 3; next false, previous true |
| T5 | Invalid input: `/api/products?page=0&limit=-1` | HTTP 400, `INVALID_QUERY_PARAMETER`, exact page error; run T5a–T5g to isolate further invalid inputs |
| T6 | Maximum size: `/api/products?page=1&limit=20` | HTTP 200, 20 products `prod-001`–`prod-020`; page 1, limit 20, totalItems 23, totalPages 2; next true, previous false. T6a must reject 21 |

Navigation names in the table abbreviate `hasNextPage` and `hasPreviousPage`.
The primary invalid request proves rejection, not independent enforcement of both
fields, because the API reports only the first validation error.

## Supplementary requests

These requests live inside the relevant primary scenario's folder. They are
separate URLs, not hidden asynchronous requests or stateful scripts.

| ID | Query string | Required result |
| --- | --- | --- |
| T5a | `page=-1&limit=10` | 400, page error |
| T5b | `page=1&limit=0` | 400, limit error |
| T5c | `page=1.5&limit=10` | 400, page error |
| T5d | `page=1&limit=2.5` | 400, limit error |
| T5e | `page=abc&limit=10` | 400, page error |
| T5f | `page=1&limit=abc` | 400, limit error |
| T5g | `page=1&limit=10&sort=name` | 400, unknown-parameters error |
| T6a | `page=1&limit=21` | 400, limit error; no clamping |

All errors must use code `INVALID_QUERY_PARAMETER` and the exact message defined
in the contract. A T5 scenario Pass requires the primary request and all seven
supplementary requests to pass. T6 Pass requires both requests to pass.

## Automated coverage

`npm test` runs Jest and Supertest directly against `src/app.ts` without a
separately running server or external network access. Supertest manages transient
local listeners internally.

- Endpoint cases cover the six scenarios, independent defaults, a nondefault
  slice, repeated ordering, all 23 products with limit 1, isolated invalid
  page/limit inputs, unknown keys, duplicates, and the safe-integer page boundary.
- Dataset checks cover count, unique sequential IDs, multiple categories,
  positive integer prices, and mixed boolean stock statuses.
- Helper tests cover empty datasets, exact multiples, immutability, and metadata
  consistency across several dataset sizes and requested pages.
- Infrastructure checks cover `/health`, JSON 404 errors, and safe 500 errors.
- Offline Postman asset checks validate against the vendored official v2.1
  schema, six primary folders, supplementary requests, local environment, URL
  consistency, absence of saved examples, and JavaScript script syntax.

Asset validation and Jest tests are **not Postman execution**. Record those
results separately from the actual Postman run.

## Evidence and completion rules

1. Record date/time, OS, Node/npm/Postman versions, base URL, and source revision
   or local snapshot reference.
2. Run the collection. Inspect every request's status, response, and test results.
3. Capture failed assertions and full request/response context for defects.
4. Save actual responses as examples on the imported requests; export that
   evidence-bearing collection under a new filename after execution.
5. Copy [TEST_RESULTS_TEMPLATE.md](TEST_RESULTS_TEMPLATE.md) and enter actual
   results. Do not overwrite the blank template with invented findings.
6. Copy [NOTION_REPORT_TEMPLATE.md](NOTION_REPORT_TEMPLATE.md) into Notion and
   make an evidence-based readiness decision.

Allowed scenario statuses:

- **Pass**: every required assertion, including associated supplementary checks,
  was executed and matched the contract.
- **Fail**: an executed check contradicts the contract.
- **Unspecified**: not run, incomplete, or lacking sufficient evidence.

Do not choose Ready merely because source code or Jest tests look correct.
Readiness requires observed results for the intended integration. Incomplete
testing must be called out explicitly.
