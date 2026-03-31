# Test Data Sheet — Valid / Invalid Sets

## M1 Registration & Login
| Dataset | Email | Password | Role | Name | Phone | Expected |
|---------|-------|----------|------|------|-------|----------|
| V1 valid patient | unique@mail.com | Pass1234! | patient | Alex | +15550001 | Success |
| V2 valid therapist | unique2@mail.com | Pass1234! | therapist | Dr. X | — | Success |
| I1 dup email | patient1@example.com | Pass1234! | patient | A | — | Duplicate |
| I2 weak pwd | u@mail.com | 1234567 | patient | A | — | Min length |
| I3 bad email | not-email | Pass1234! | patient | A | — | Invalid email |
| I4 inactive | inactive@example.com | DemoPass123! | patient | — | — | Deactivated |

## M2–M3 Browse / Profile
| Dataset | Therapist profile id | Note |
|---------|---------------------|------|
| V1 | 1 (after seed) | Populated card |
| I1 | 999999 | Not found |

## M4 Filters
| Dataset | issueType | minRate | maxRate | minRating | availableDate | search |
|---------|-----------|---------|---------|-----------|---------------|--------|
| V1 | anxiety | — | — | — | — | — |
| V2 | — | 90 | 130 | 4.5 | YYYY-MM-DD (slot exists) | — |
| I1 | — | 500 | 50 | — | — | — (inverted range) |
| I2 | — | — | — | — | 99-99-99 | — |

## M5 Booking
| Dataset | therapistProfileId | slotId | patientNotes |
|---------|-------------------|--------|--------------|
| V1 | matches slot owner | free id | "Focus: sleep" |
| I1 | wrong therapist | valid slot | — | Ownership error |
| I2 | correct | booked id | — | Already booked |

## M6 Appointments
| Dataset | Action | status precondition |
|---------|--------|---------------------|
| V1 cancel | cancel | PENDING |
| I1 cancel | cancel | COMPLETED |
| V2 reschedule | new free slot | PENDING |

## M7 Payment
| Dataset | appointment status | actor |
|---------|-------------------|-------|
| V1 | CONFIRMED | owning patient |
| I1 | COMPLETED pay row | repeat pay |
| I2 | CONFIRMED | other patient JWT |

## M8 Reviews
| Dataset | rating | comment | appointment status |
|---------|--------|---------|-------------------|
| V1 | 5 | "Great" | COMPLETED |
| I1 | 0 | — | COMPLETED |
| I2 | 5 | — | PENDING |
| I3 | 6 | — | COMPLETED |
