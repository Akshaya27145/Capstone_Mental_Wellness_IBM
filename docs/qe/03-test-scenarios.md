# High-Level Test Scenarios (by module)

## M1 — Registration & Login
- New patient registers and accesses browse.
- New therapist registers and accesses dashboard.
- Duplicate email rejected.
- Weak password rejected (boundary 7 vs 8 chars).
- Inactive user cannot log in.
- JWT persists session; logout clears token.
- Therapist cannot use patient-only booking UI (role guard).

## M2 — Browse therapists
- Default list shows all active therapists with cards.
- Empty state when filters exclude all.
- Card shows rate, rating, experience, issue pills.

## M3 — Therapist profile
- Profile loads by ID; invalid ID shows error.
- Reviews section lists public reviews.
- Patient sees “Book”; guest sees login prompt.

## M4 — Search & filter
- Filter by issue type (equivalence: each supported type).
- Min/max rate boundaries (0, rate at cap).
- Min rating (0, 5, fractional).
- Available date shows only therapists with open slot.
- Search by name/specialization substring.

## M5 — Book session
- Book open slot → appointment PENDING, slot marked booked.
- Cannot book same slot twice (UI error after concurrent attempt).
- Cannot book slot belonging to another therapist ID (tamper).
- Patient overlap same datetime blocked.
- Booking without slot selection shows validation.

## M6 — Manage appointments
- Patient cancels PENDING/CONFIRMED; slot freed.
- Cannot cancel COMPLETED.
- Reschedule to valid same-therapist slot succeeds.
- Reschedule to booked slot fails.
- Therapist confirms then completes; invalid transitions rejected.

## M7 — Payment simulation
- Patient pays CONFIRMED appointment once → completed payment row.
- Repeat pay rejected.
- Wrong patient forbidden.
- Pay-fail path marks failed (test hook).

## M8 — Ratings & reviews
- Completed session: patient submits rating 1–5 + optional comment.
- Duplicate review on same appointment rejected.
- Non-completed session review rejected.
- Therapist aggregate rating updated (DB cross-check).

---

**Traceability:** Each scenario expands to detailed test cases in `04-test-cases-by-module.md` (≥15 per module).
