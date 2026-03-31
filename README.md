# CalmCare — Mental Wellness & Therapy Booking (QE Capstone)

Full-stack **web** application with **STLC** documentation and **Playwright** UI automation (Chrome only). No performance/security/API-only tests per project constraints.

## Tech stack
- **Frontend:** React 18, Vite, JavaScript, React Router, Context API  
- **Backend:** Node.js, Express, JWT, `express-validator`, MySQL2  
- **Database:** MySQL (`database/schema.sql`, seed via `npm run seed`)  
- **Automation:** Playwright (JavaScript), Page Object Model under `e2e/`

## Repository layout

```
mental-wellness-qe-capstone/
├── client/                 # React + Vite SPA
│   ├── src/
│   │   ├── api/            # fetch client
│   │   ├── context/        # AuthContext
│   │   └── pages/          # Screens (data-testid for automation)
│   └── vite.config.js      # proxy /api -> :4000
├── server/                 # Express API (MVC-style: routes/controllers/services)
│   ├── scripts/seed.js     # Creates DB, applies schema, demo data
│   └── src/
├── database/
│   ├── schema.sql
│   ├── seed.sql            # optional stub (seed uses Node)
│   └── validation_queries.sql
├── docs/
│   ├── API.md              # REST documentation
│   └── qe/                 # STLC: strategy, plan, 120 test cases, reports, etc.
├── e2e/                    # Playwright framework + tests
└── scripts/
    └── generate-test-case-doc.js   # Regenerates docs/qe/04-test-cases-by-module.md
```

## Prerequisites
- Node.js 18+  
- MySQL 8+ (or compatible)  
- Chrome/Chromium (for Playwright; run `npx playwright install chromium` in `e2e/` if needed)

## Setup

### 1. Database
Create a database user and empty schema (or let the seed script create the DB):

```sql
CREATE DATABASE wellness_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend
```powershell
cd server
copy .env.example .env
# Edit .env: DB_* and JWT_SECRET
npm install
npm run seed
npm run dev
```
API: `http://localhost:4000` — health: `GET /api/health`

### 3. Frontend
```powershell
cd client
npm install
npm run dev
```
App: `http://localhost:5173`

### Demo accounts (after seed)
Password for all: **`DemoPass123!`**
- `patient1@example.com`, `patient2@example.com`  
- `therapist1@example.com`, `therapist2@example.com`, `therapist3@example.com`  
- `inactive@example.com` (deactivated — login should fail)

## Quality engineering artifacts
| Artifact | Path |
|----------|------|
| Test strategy | `docs/qe/01-test-strategy.md` |
| Test plan | `docs/qe/02-test-plan.md` |
| Scenarios | `docs/qe/03-test-scenarios.md` |
| **Test cases (15+ × 8 modules = 120)** | `docs/qe/04-test-cases-by-module.md` |
| Test data | `docs/qe/05-test-data-sheet.md` |
| Execution report | `docs/qe/06-test-execution-report.md` |
| Defect report | `docs/qe/07-defect-report.md` |
| Defect lifecycle | `docs/qe/08-defect-lifecycle-tracker.md` |
| Summary / metrics | `docs/qe/09-test-summary-report.md` |
| Automation architecture | `docs/qe/10-automation-architecture.txt` |
| Decision tables | `docs/qe/appendix-decision-tables.md` |

Regenerate test case document:
```powershell
node scripts/generate-test-case-doc.js
```

## SQL validation
Run statements in `database/validation_queries.sql` in MySQL Workbench or CLI after tests to cross-check bookings, payments, and reviews.

## Playwright (UI automation)
Playwright runs **120 automated tests** (15 per module): **8 files** under `e2e/tests/` (`m1-` … `m8-`). Titles match **TC-IDs** in `docs/qe/04-test-cases-by-module.md`. Details: **`e2e/tests/README.md`** (some cases `skip` when only manual/SQL applies).

```powershell
# Terminal 1: API + client running as above
cd e2e
npm install
npx playwright install chromium
$env:BASE_URL="http://localhost:5173"
npm test
npm run report
```
Reports: `e2e/playwright-report/`. Screenshots on failure are enabled in config; extra helper: `e2e/utils/screenshotHelper.js`.

## Features implemented (8 modules)
1. Register / login (patient & therapist)  
2. Browse therapists (cards)  
3. Therapist profile + public reviews  
4. Search & filter (issue, rate, rating, availability date, text)  
5. Book session (slots, notes, validations)  
6. Appointments (cancel, reschedule, therapist confirm/complete)  
7. Simulated payment  
8. Ratings & reviews after completion  

## License / use
Educational capstone project — replace `JWT_SECRET` and DB credentials before any public deployment.
