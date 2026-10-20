# Postman test results template

Copy this template for an actual execution. Actual Result and Evidence / Notes
are intentionally blank. No Postman execution is asserted by this file.

- Execution date/time:
- Tester:
- OS / Node / npm / Postman versions:
- Base URL:
- API revision or source snapshot:
- Collection and environment versions:
- Evidence location:

Allowed Status values: **Pass**, **Fail**, **Unspecified**.
Unspecified means not run, incomplete, or insufficient evidence. T5 includes
T5a–T5g; T6 includes T6a. See [TEST_PLAN.md](TEST_PLAN.md).

| Test ID | Scenario | Request | Expected Result | Actual Result | Status | Evidence / Notes |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | Default pagination | `GET /api/products` | 200; 10 products; page 1, limit 10, totalItems 23, totalPages 3; next true, previous false | | Unspecified | |
| T2 | Full page boundary | `GET /api/products?page=1&limit=10` | 200; 10 unique ordered products; page 1, limit 10, totalItems 23, totalPages 3; next true, previous false | | Unspecified | |
| T3 | Partial final page | `GET /api/products?page=3&limit=10` | 200; 3 products; page 3, limit 10, totalItems 23, totalPages 3; next false, previous true | | Unspecified | |
| T4 | Beyond last page | `GET /api/products?page=99&limit=10` | 200; empty data; page 99, limit 10, totalItems 23, totalPages 3; next false, previous true | | Unspecified | |
| T5 | Invalid pagination inputs | `GET /api/products?page=0&limit=-1` plus T5a–T5g | 400; INVALID_QUERY_PARAMETER; exact documented messages for primary and supplementary inputs | | Unspecified | |
| T6 | Maximum page-size enforcement | `GET /api/products?page=1&limit=20` plus T6a with `limit=21` | 20: 200, 20 products, 2 pages, next true, previous false; 21: 400 with documented error | | Unspecified | |

## Supplementary observations

Record individual supplementary request outcomes and evidence here before
assigning the parent scenario's status.

## Summary

- Executed scenarios:
- Passed / failed / unspecified:
- Contract violations:
- Missing evidence or unresolved questions:
