# REST API Reference — CalmCare Backend

Base URL: `http://localhost:4000/api`  
Auth: `Authorization: Bearer <JWT>` where required.

## Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Body: `email`, `password` (min 8), `role` (`patient` \| `therapist`), `fullName`, `phone?` |
| POST | `/auth/login` | Body: `email`, `password` → `{ token, user }` |
| GET | `/auth/me` | Current user profile |

## Therapists (public + therapist self-service)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/therapists` | — | Query: `issueType`, `minRate`, `maxRate`, `minRating`, `availableDate` (YYYY-MM-DD), `search` |
| GET | `/therapists/:id` | — | Profile card data |
| GET | `/therapists/:id/slots` | — | Query: `from`, `to` (dates) |
| GET | `/therapists/:id/reviews` | — | Public reviews |
| GET | `/therapists/me/profile` | Therapist | Own profile |
| POST | `/therapists/me/slots` | Therapist | Body: `slotDate`, `startTime`, `endTime` (HH:mm) |
| PATCH | `/therapists/me/profile` | Therapist | `specialization`, `bio`, `yearsExperience`, `hourlyRate` |
| PUT | `/therapists/me/issue-types` | Therapist | Body: `{ issueTypes: string[] }` |

## Appointments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/appointments` | Patient | Body: `therapistProfileId`, `slotId`, `patientNotes?` |
| GET | `/appointments` | Patient/Therapist | Role-scoped list |
| PATCH | `/appointments/:id/cancel` | Patient/Therapist | Owner rules; status must be PENDING or CONFIRMED |
| PATCH | `/appointments/:id/reschedule` | Patient/Therapist | Body: `newSlotId`; same therapist; overlap checks |
| PATCH | `/appointments/:id/confirm` | Therapist | PENDING → CONFIRMED |
| PATCH | `/appointments/:id/complete` | Therapist | CONFIRMED → COMPLETED |

## Payments (simulated)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/appointments/:id/pay` | Patient | Body: `method?` (`card_simulated` \| `wallet_simulated`) |
| POST | `/appointments/:id/pay-fail` | Patient | Marks payment failed (test hook) |

## Reviews

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/appointments/:id/reviews` | Patient | Body: `rating` (1–5), `comment?` — only if appointment COMPLETED |

## Error shape

```json
{ "error": "message", "details": [ { "path": "field", "msg": "...", "location": "body" } ] }
```

HTTP codes: `400` validation/business rule, `401` auth, `403` role, `404` missing, `409` duplicate email, `500` server.
