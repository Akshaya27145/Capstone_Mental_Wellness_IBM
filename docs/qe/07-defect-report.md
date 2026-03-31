# Defect Report (Sample — Linked to Test Cases)

| Defect ID | Title | Related TC | Severity | Priority | Status | Steps to reproduce | Expected | Actual |
|-----------|-------|------------|----------|----------|--------|-------------------|----------|--------|
| DEF-001 | Register: API error details not mapped to fields | TC-M1-003 | S3 | P2 | Open | Submit duplicate email | Field-level message | Generic banner only |
| DEF-002 | Browse: empty state missing icon/heading | TC-M2-007 | S4 | P3 | Open | Filter no results | Clear empty state | Plain text only |
| DEF-003 | Booking E2E flaky when zero slots | TC-M5-001 | S3 | P2 | Mitigated | Run tests without seed | Stable test | Conditional skip |
| DEF-004 | Profile long bio scroll on IE11 | TC-M3-011 | S4 | P4 | Won't fix | N/A (Chrome-only scope) | — | — |
| DEF-005 | Pay button briefly enabled during loading | TC-M7-012 | S3 | P2 | Open | Slow 3G + rapid click | Disabled until load | Flash enabled |
| DEF-006 | Review duplicate message unclear | TC-M8-002 | S3 | P3 | Open | Submit twice | “Already reviewed” | Raw API error |
| DEF-007 | Reschedule panel stays open after error | TC-M6-004 | S3 | P3 | Open | Bad slot + confirm | Panel closes | Panel remains |
| DEF-008 | Filter min>max returns empty without hint | TC-M4-012 | S4 | P3 | Open | min 200 max 50 | Inline hint | Silent empty |
| DEF-009 | Session room no appointment ownership check | TC-M6-013 | S2 | P1 | Fixed | Open /session/999 as other user | Redirect away if not in user’s list | Was open mock; now gated in UI |
| DEF-010 | Therapist list order differs from spec | TC-M2-006 | S4 | P4 | Deferred | Compare two therapists | Documented sort | Accept current |

**Severity:** S1 critical / S2 high / S3 medium / S4 low.  
**Priority:** P1 fix now … P4 backlog.
