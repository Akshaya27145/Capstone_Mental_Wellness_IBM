# Test Plan — CalmCare

## 1. Document Control
- **Product:** CalmCare — Mental Wellness & Therapy Session Booking
- **Version:** 1.0 (capstone)
- **Related:** Test Strategy `01-test-strategy.md`

## 2. Features / Modules Under Test
1. Registration & Login (patient/therapist)
2. Browse therapists (listing)
3. Therapist profile & public reviews list
4. Search & filter (issue, rate, rating, availability date, text search)
5. Book therapy session (slot selection, notes)
6. Manage appointments (reschedule, cancel; therapist confirm/complete)
7. Payment simulation
8. Ratings & reviews (post-completion)

## 3. Test Deliverables
- Test scenarios (`03-test-scenarios.md`)
- Test cases — minimum **15 per module** (`04-test-cases-by-module.md`)
- Test data sheet (`05-test-data-sheet.md`)
- Execution report (`06-test-execution-report.md`)
- Defect report & lifecycle (`07-defect-report.md`, `08-defect-lifecycle-tracker.md`)
- Test summary (`09-test-summary-report.md`)
- Automation architecture (`10-automation-architecture.txt`)

## 4. Environments
| Env | Frontend | API | DB |
|-----|----------|-----|-----|
| Local | http://localhost:5173 | http://localhost:4000 | MySQL `wellness_booking` |

## 5. Schedule (suggested)
| Phase | Activity |
|-------|----------|
| Planning | Strategy + plan sign-off |
| Design | Scenarios, cases, data |
| Execution | Manual cycles + SQL checks |
| Automation | Playwright POM suite |
| Closure | Summary + metrics |

## 6. Suspension / Resumption
- Suspend if DB unavailable or blocking defect on login/booking.
- Resume when fix verified in smoke pack.

## 7. Communication
- Defects logged with ID, severity, priority, reproduction steps.
- Daily status: pass/fail counts, blockers.
