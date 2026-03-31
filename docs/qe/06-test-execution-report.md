# Test Execution Report — Cycle 1 (Sample)

**Build / commit:** capstone v1.0  
**Environment:** Local (Windows 10, Chrome, Node LTS, MySQL 8)  
**Executed by:** QA Team  
**Date:** 2026-03-22  

## Summary
| Module | Total | Pass | Fail | Blocked | Notes |
|--------|-------|------|------|---------|-------|
| M1 | 15 | 13 | 2 | 0 | See defects |
| M2 | 15 | 15 | 0 | 0 | |
| M3 | 15 | 14 | 1 | 0 | |
| M4 | 15 | 14 | 1 | 0 | |
| M5 | 15 | 12 | 3 | 0 | Race + overlap |
| M6 | 15 | 15 | 0 | 0 | |
| M7 | 15 | 14 | 1 | 0 | |
| M8 | 15 | 13 | 2 | 0 | |
| **Total** | **120** | **110** | **10** | **0** | |

## Pass rate
- **91.7%** executed pass (110/120)

## Blockers
- None for environment; DEF-003 required workaround for flaky slot in automation.

## Notes
- SQL validation queries executed against seeded DB — no orphan slot/appointment pairs.
- Playwright suite: 6 specs (see `e2e/tests/`); booking spec may skip if no free slots.
