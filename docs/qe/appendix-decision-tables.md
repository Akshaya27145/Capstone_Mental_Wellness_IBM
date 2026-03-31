# Appendix — Decision Tables (Sample)

## DT-1 — Book session (patient)
| Conditions | R1 | R2 | R3 | R4 |
|------------|----|----|----|----|
| Logged in as patient | Y | Y | N | Y |
| Slot free | Y | N | Y | Y |
| Slot belongs to selected therapist | Y | Y | — | N |
| No overlapping patient appointment | Y | Y | — | Y |
| **Action: allow book** | **Y** | **N** | **N** | **N** |

## DT-2 — Cancel appointment
| Conditions | R1 | R2 | R3 |
|------------|----|----|----|
| Actor owns appt (patient) or therapist calendar | Y | Y | N |
| Status in {PENDING, CONFIRMED} | Y | N | Y |
| **Cancel permitted** | **Y** | **N** | **N** |

## DT-3 — Submit review
| Conditions | R1 | R2 | R3 |
|------------|----|----|----|
| Appointment COMPLETED | Y | N | Y |
| Same patient as appointment | Y | Y | N |
| No existing review row | Y | Y | Y |
| **Review permitted** | **Y** | **N** | **N** |

These tables align with backend services and test cases TC-M5-*, TC-M6-*, TC-M8-*.
