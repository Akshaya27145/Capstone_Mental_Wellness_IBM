# Test Summary Report — CalmCare v1.0

## Scope
Full STLC coverage for 8 application modules; UI automation (Playwright, Chrome); database validation scripts.

## Metrics
| Metric | Value |
|--------|-------|
| Total test cases designed | 120 |
| Executed (manual sample cycle) | 120 |
| Passed | 110 |
| Failed | 10 |
| **Pass %** | **91.7%** |
| Defects logged | 10 |
| Defect density (defects / 100 TCs) | **8.3** |
| Automation specs | 4 files, 6+ scenarios |

## Quality assessment
- **Functional core (auth, browse, book, appointments):** stable after seed.
- **Risks:** session room lacks strict authorization (DEF-009); some UX edge messages rough.

## Recommendations
1. Fix P1/P2 defects before pilot.
2. Add Playwright test for payment + review when deterministic seed slot available.
3. Keep SQL validation pack in CI as optional job.

## Artifacts
- Strategy, plan, scenarios, cases, data sheet, execution, defects, automation under `docs/qe/` and `e2e/`.

## Sign-off (template)
| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Product | | | |
