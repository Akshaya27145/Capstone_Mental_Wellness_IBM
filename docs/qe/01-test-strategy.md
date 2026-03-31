# Test Strategy Document — CalmCare (Mental Wellness Booking)

## 1. Introduction
This strategy defines how quality is assured for the CalmCare web application (React/Vite, Express, MySQL) and its delivery lifecycle. **Out of scope:** performance testing, security testing, and direct API automation (UI-only automation per project constraints).

## 2. Objectives
- Validate end-to-end patient and therapist journeys.
- Verify business rules: booking integrity, overlap prevention, payment simulation, review eligibility.
- Provide traceability from requirements to tests and defects.
- Establish repeatable regression via Playwright (Chrome).

## 3. Scope
**In scope:** registration/login, therapist discovery, profile, search/filter, booking, appointment management, simulated payment, ratings/reviews, therapist dashboard, session UI mock.  
**Out of scope:** load/stress, penetration/auth bypass, non-Chrome browsers, native mobile.

## 4. Test Levels
| Level | Focus | Owner / Tool |
|-------|--------|----------------|
| Unit | Pure functions, validators (where extracted) | Developer / future Jest |
| Integration | DB + service layers with API | Manual + SQL scripts |
| System | Full stack via UI | Manual + Playwright |
| Regression | Critical paths after changes | Playwright + targeted manual |

## 5. Test Types
- **Functional / UI:** Primary coverage via STLC test cases and Playwright.
- **Database:** Validation queries (`database/validation_queries.sql`) for joins, constraints, aggregates.
- **Negative / edge:** Invalid inputs, inactive users, double booking, wrong role, bad slot ownership.

## 6. Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Race on concurrent booking | Double book | DB unique on `appointments.slot_id`, transactional locks in service |
| JWT misconfiguration | Auth bypass in prod | Env-based secret, manual negative tests |
| Date/time drift in CI | Flaky E2E | Relative dates in seed, skip when no slots |
| Incomplete test data | False negatives | `npm run seed` documented in README |

## 7. Entry / Exit Criteria
- **Entry:** Build runs locally; DB migrated/seeded; app URLs documented.
- **Exit (release candidate):** All P0/P1 defects closed or waived; critical Playwright suite green; manual execution log for regression pack signed off.

## 8. Roles
- QA: test design, execution, defect logging, automation maintenance.
- Dev: fixes, API contract stability, test IDs in UI.

## 9. Tools
- MySQL client / Workbench for SQL validation.
- Playwright (JavaScript) HTML report under `e2e/playwright-report/`.

## 10. References
- Test Plan: `02-test-plan.md`
- API: `../API.md`
