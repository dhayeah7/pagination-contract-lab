# Pagination Contract Lab

A small, runnable backend and QA demonstration: an Express/TypeScript API,
strict Zod query validation, 23 deterministic synthetic products, Jest/Supertest
coverage, and a Postman v2.1 collection organized around six boundary scenarios.
No database, Docker, credentials, external runtime service, or environment setup.

## 1. Install

Requirements: Node.js **20 or later**, npm, and Postman desktop (or the Postman
web app with Desktop Agent). Commands work from the project root on macOS,
Windows, and Linux.

```sh
npm ci
```

The lockfile pins dependency versions. Initial installation needs access to npm;
running the API and tests afterward does not require external network access.
No `.env` file is used or needed. The lab always uses local port 3000.

## 2. Start the development server

```sh
npm run dev
```

Keep that terminal open. The server listens on `127.0.0.1:3000` and is available
at `http://localhost:3000`. Stop it with Ctrl+C.

Optional health check from a second terminal:

```sh
node -e "fetch('http://localhost:3000/health').then(r => r.json()).then(console.log)"
```

Expected health JSON: `{"status":"ok"}`. Health is not one of the six pagination
tests. If port 3000 is in use, stop the other local process before starting.

To compile and run the built JavaScript instead, stop the development server:

```sh
npm run build
npm start
```

`npm start` requires the build and serves the same API.

## 3. Run automated checks

No separately running server is required:

```sh
npm test
npm run typecheck
npm run build
```

Optional coverage report:

```sh
npm test -- --coverage
```

Jest/Supertest tests use the Express app directly. They cover defaults, real
slices, stable ordering, final and out-of-range pages, invalid inputs, limit
boundaries, query strictness, dataset integrity, empty datasets, and error JSON.

Postman asset tests also check the collection against the **official v2.1 JSON
schema**, vendored in `tests/fixtures/` for offline repeatability, plus script
syntax and URL consistency. These checks are **not a claim that the collection
has been executed in Postman**. The shipped collection has no saved responses.

The scoped `js-yaml` override upgrades Jest's NYC configuration loader away from
its vulnerable legacy `argparse`/`sprintf-js` dependency chain. It does not affect
the API's runtime dependencies.

## 4. Import into Postman

1. In Postman choose **Import**, then **Files**.
2. Select both:
   - `postman/pagination-contract-lab.postman_collection.json`
   - `postman/local.postman_environment.json`
3. Import them. Select the **Pagination Contract Lab — Local development**
   environment and verify enabled `baseUrl = http://localhost:3000`.
4. For the web app, select the **Desktop Agent**, not a cloud agent. Cloud agents
   cannot reach your localhost. No Postman or Notion credentials are required by
   the project.

The environment is only for local development. The collection also defines a
local `baseUrl` fallback. Do not replace it with a remote service for this lab.

## 5. Run the collection locally

With `npm run dev` running:

1. Open **Pagination Contract Lab**.
2. Choose **Run collection** (or its **Run** action).
3. Select all six folders and every request, including supplementary requests.
4. Use **one iteration**, with no data file. Run the collection.
5. Inspect the status, response body, and **Test Results** for each request.
   For a single independent check, open any request and choose **Send** instead.

Optional CLI execution of the same collection and scripts with Newman:

```sh
npm exec --yes --package=newman@6.2.1 -- newman run postman/pagination-contract-lab.postman_collection.json --environment postman/local.postman_environment.json
```

This downloads the optional runner on first use; it is not a project dependency
and is not needed by `npm test`. Keep the local API running for this command.
Newman execution is distinct from using the Postman desktop UI.

| Primary scenario | Request query | Expected outcome |
| --- | --- | --- |
| T1 Default pagination | None | 200, 10 products, page 1, 3 pages |
| T2 Full page boundary | `page=1&limit=10` | 200, 10 unique ordered products |
| T3 Partial final page | `page=3&limit=10` | 200, 3 products, no next page |
| T4 Beyond last page | `page=99&limit=10` | 200, empty data, previous page true |
| T5 Invalid inputs | `page=0&limit=-1` | 400, documented error |
| T6 Maximum size | `page=1&limit=20` | 200, 20 products, 2 pages |

There are **six primary requests and eight supplementary requests**, 14 total.
T5's seven supplementary requests isolate negative page, zero limit,
fractional/nonnumeric page and limit, and unknown parameters. T6a separately
checks `limit=21` returns 400. Mark T5/T6 Pass only if their supplementary checks
also pass. All requests are independent; scripts make no hidden requests.

For full formulas, fields, exact errors, and the safe-integer page bound, see
[the API contract](docs/API_CONTRACT.md). These are this project's explicit
contract choices, not rules every paginated API must follow.

## 6. Capture real responses and execution evidence

Do this **after** sending requests to the running API:

1. Open each request and choose **Send**. Inspect its response and test results.
2. In the response pane choose **Save Response → Save as example** (some Postman
   versions show **Save as example** directly). Use names such as
   `T3 actual response - <execution timestamp>`. Save failed responses too.
3. Repeat for supplementary requests. Runner responses are not automatically
   saved as examples; send individual requests if necessary.
4. Capture Runner results or screenshots showing request names, assertion results,
   and execution time. If your Postman version offers **Export results**, save
   those actual results too.
5. From the collection's menu choose **Export → Collection v2.1**. Save a **new**
   file such as `postman/local-results/actual-run.postman_collection.json`,
   preserving the original example-free collection. Create `local-results` in
   the save dialog if needed; that directory is ignored by Git.
6. Save request/response details separately if useful, using **Save Response →
   Save to a file**. Keep synthetic lab evidence free of unrelated local data.

Documentation examples describe expected output; they are not captured evidence.

## 7. Transfer findings into Notion manually

No Notion API, integration, or credentials are part of this project.

1. Copy [TEST_RESULTS_TEMPLATE.md](docs/TEST_RESULTS_TEMPLATE.md) to a results
   document. Enter observed results and evidence references; use only **Pass**,
   **Fail**, or **Unspecified**.
2. Copy [NOTION_REPORT_TEMPLATE.md](docs/NOTION_REPORT_TEMPLATE.md) into a Notion
   page, or import that Markdown file into Notion.
3. Fill environment details, link/reference the contract, transfer all six
   scenario results, and attach actual screenshots or the exported collection.
4. Document violations, missing tests, caveats, and follow-ups.
5. Select **Ready**, **Ready with caveats**, or **Blocked** only from the observed
   evidence. Passing Jest checks alone does not establish Postman or integration
   readiness. The templates intentionally leave this decision unselected.

Actual implementation-time checks are recorded separately in
[VERIFICATION.md](docs/VERIFICATION.md). The blank results/report templates are
preserved for your own Postman execution.

## Project map

```text
src/
  app.ts                   Express app without listening
  server.ts                Local HTTP entry point
  routes/products.ts       GET /api/products
  data/products.ts         23 synthetic products
  schemas/pagination.ts    Strict query parsing
  utils/pagination.ts      Real slicing and metadata
  middleware/errorHandler.ts
tests/
  products.test.ts         HTTP, dataset, and error checks
  pagination.test.ts       Pure helper and empty-data checks
  postman.test.ts          Offline schema and asset checks
  fixtures/                Official Postman v2.1 schema
postman/                   Importable collection and local environment
docs/
  API_CONTRACT.md
  TEST_PLAN.md
  TEST_RESULTS_TEMPLATE.md
  NOTION_REPORT_TEMPLATE.md
```

The app validates once at the HTTP boundary, then passes typed values to a pure
pagination helper. Tests import the app rather than starting `server.ts`. This
keeps runtime behavior and test behavior aligned without a database or service.

## Short screen-recording walkthrough

1. Show the contract formulas and six-scenario test plan.
2. Start the API and display `/health`.
3. Run `npm test` and `npm run build`.
4. In Postman run all 14 requests; show the final page, beyond-last page, and both
   sides of the maximum-limit boundary.
5. Save one real response example, then show how evidence feeds the blank
   Notion report and readiness assessment.
