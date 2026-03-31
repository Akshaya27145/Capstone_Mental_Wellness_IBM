# Playwright tests — **120 automated tests** (15 × 8 modules)

Each file `m1-` … `m8-*.spec.js` defines **exactly 15** `test(...)` cases, titled with the same **TC-IDs** as the manual spec in **`docs/qe/04-test-cases-by-module.md`**.

| File | Module | Tests |
|------|--------|------:|
| `m1-registration-login.spec.js` | M1 | 15 |
| `m2-browse-therapists.spec.js` | M2 | 15 |
| `m3-therapist-profile.spec.js` | M3 | 15 |
| `m4-search-filter.spec.js` | M4 | 15 |
| `m5-book-session.spec.js` | M5 | 15 |
| `m6-appointments-management.spec.js` | M6 | 15 |
| `m7-payment-simulation.spec.js` | M7 | 15 |
| `m8-ratings-reviews.spec.js` | M8 | 15 |
| **Total** | | **120** |

## Executed vs skipped

- **`test.skip(...)`** is used where the step is **not realistically doable from the UI alone** (DB-only, API tampering, two-browser race, etc.). Those cases still appear in the Playwright report as **skipped** with a reason, so the **count stays 120**.
- **`test.skip(true, '…')` data-dependent**: re-seed MySQL (`npm run seed`) if many tests skip for “no slot” / “no row”.

## Serial suites

- **M5** and **M8** use `test.describe.configure({ mode: 'serial' })` so bookings/reviews do not fight over the same rows when workers run file tests in parallel.

## Run

From `e2e/` with app + API up:

```bash
npx playwright test
```

VS Code **Testing** sidebar lists all **120** tests by module file.
