# Test Cases by Module

**Requirement:** ≥15 test cases per module (8 modules). **Techniques:** EP = Equivalence Partitioning, BVA = Boundary Value Analysis, DT = Decision Table.


## Module M1

### TC-M1-001 — Valid patient registration
- **Preconditions:** DB up; email unused
- **Steps:** Open /register → fill all required → submit
- **Test data:** Name "Alex Q", valid email, pwd "Pass1234!", role patient
- **Expected result:** User created; auto-login; lands on /therapists
- **Technique / type:** EP valid class

### TC-M1-002 — Valid therapist registration
- **Preconditions:** Email unused
- **Steps:** Register as therapist
- **Test data:** Same as M1-001 with role therapist
- **Expected result:** Profile row exists; can open /therapist/dashboard
- **Technique / type:** EP

### TC-M1-003 — Reject duplicate email
- **Preconditions:** Email exists (seed patient1)
- **Steps:** Register with same email
- **Test data:** patient1@example.com
- **Expected result:** 409 / UI error duplicate
- **Technique / type:** Negative

### TC-M1-004 — Password boundary min-1
- **Preconditions:** —
- **Steps:** Password 7 chars
- **Test data:** Pass123
- **Expected result:** Validation error min 8
- **Technique / type:** BVA

### TC-M1-005 — Password boundary min
- **Preconditions:** —
- **Steps:** Password exactly 8
- **Test data:** Pass1234
- **Expected result:** Accept
- **Technique / type:** BVA

### TC-M1-006 — Invalid email format
- **Preconditions:** —
- **Steps:** Malformed email
- **Test data:** not-an-email
- **Expected result:** 400 validation
- **Technique / type:** Negative

### TC-M1-007 — Login valid patient
- **Preconditions:** Seed patient1
- **Steps:** Login form submit
- **Test data:** patient1@example.com / DemoPass123!
- **Expected result:** JWT returned; browse loads
- **Technique / type:** Positive

### TC-M1-008 — Login wrong password
- **Preconditions:** User exists
- **Steps:** Wrong password
- **Test data:** patient1@example.com / wrong
- **Expected result:** 401 invalid credentials
- **Technique / type:** Negative

### TC-M1-009 — Login unknown user
- **Preconditions:** —
- **Steps:** Random email
- **Test data:** nope@example.com / x
- **Expected result:** 401
- **Technique / type:** Negative

### TC-M1-010 — Inactive account login
- **Preconditions:** inactive@example.com seeded
- **Steps:** Login
- **Test data:** inactive@example.com / DemoPass123!
- **Expected result:** Account deactivated message
- **Technique / type:** Negative

### TC-M1-011 — Logout clears session
- **Preconditions:** Logged in
- **Steps:** Logout → hit /appointments
- **Test data:** —
- **Expected result:** Redirect login
- **Technique / type:** Alternate

### TC-M1-012 — Therapist blocked from patient book URL
- **Preconditions:** Therapist logged in
- **Steps:** Navigate /therapists/1/book
- **Test data:** —
- **Expected result:** Redirect home or forbidden UX
- **Technique / type:** Role DT

### TC-M1-013 — Optional phone omitted
- **Preconditions:** —
- **Steps:** Register without phone
- **Test data:** Empty phone
- **Expected result:** Success
- **Technique / type:** EP optional

### TC-M1-014 — Name too short
- **Preconditions:** —
- **Steps:** Name 1 char
- **Test data:** A
- **Expected result:** Validation error
- **Technique / type:** BVA

### TC-M1-015 — JWT missing on protected route
- **Preconditions:** No token
- **Steps:** GET /appointments
- **Test data:** —
- **Expected result:** 401 from API if called directly; UI redirects
- **Technique / type:** Negative


## Module M2

### TC-M2-001 — Default list non-empty after seed
- **Preconditions:** Seed run
- **Steps:** Open /therapists
- **Test data:** —
- **Expected result:** ≥1 card
- **Technique / type:** Positive

### TC-M2-002 — Card fields present
- **Preconditions:** List visible
- **Steps:** Inspect first card
- **Test data:** —
- **Expected result:** Name, spec, rate, rating, experience
- **Technique / type:** UI

### TC-M2-003 — Navigate to profile
- **Preconditions:** List visible
- **Steps:** Click View profile
- **Test data:** —
- **Expected result:** Profile route loads
- **Technique / type:** Positive

### TC-M2-004 — Issue pills render
- **Preconditions:** —
- **Steps:** Open card
- **Test data:** —
- **Expected result:** Pills match API issue types
- **Technique / type:** UI vs API

### TC-M2-005 — API returns only active therapists
- **Preconditions:** Deactivate user in DB
- **Steps:** Refresh list
- **Test data:** —
- **Expected result:** Inactive therapist hidden
- **Technique / type:** DB+UI

### TC-M2-006 — Sort/rating order
- **Preconditions:** Multiple therapists
- **Steps:** Observe order
- **Test data:** —
- **Expected result:** Higher rating tends first (service rule)
- **Technique / type:** System

### TC-M2-007 — Empty list graceful
- **Preconditions:** Filter impossible combo
- **Steps:** Apply filters
- **Test data:** minRate > maxRate high
- **Expected result:** Message no match
- **Technique / type:** Edge

### TC-M2-008 — Network error handling
- **Preconditions:** Stop API
- **Steps:** Load page
- **Test data:** —
- **Expected result:** User-visible error
- **Technique / type:** Negative

### TC-M2-009 — Responsive layout
- **Preconditions:** Narrow viewport
- **Steps:** Resize
- **Test data:** —
- **Expected result:** Cards stack; no horizontal overflow
- **Technique / type:** UI

### TC-M2-010 — Keyboard focus order
- **Preconditions:** Tab through filters
- **Steps:** —
- **Test data:** Logical focus
- **Expected result:** A11y smoke
- **Technique / type:** EP

### TC-M2-011 — Deep link /therapists
- **Preconditions:** Logged out
- **Steps:** Open URL
- **Test data:** —
- **Expected result:** List still public
- **Technique / type:** Positive

### TC-M2-012 — Concurrent refresh
- **Preconditions:** —
- **Steps:** Double-click Apply
- **Test data:** —
- **Expected result:** No duplicate crash
- **Technique / type:** Edge

### TC-M2-013 — Special characters in search
- **Preconditions:** —
- **Steps:** Search "%_"
- **Test data:** SQL-ish chars
- **Expected result:** Handled safely (no 500)
- **Technique / type:** Security smoke per scope

### TC-M2-014 — Large search string
- **Preconditions:** —
- **Steps:** 200 char search
- **Test data:** Long string
- **Expected result:** Trim or validate
- **Technique / type:** Boundary

### TC-M2-015 — Therapist with zero reviews
- **Preconditions:** DB insert therapist no reviews
- **Steps:** Open card
- **Test data:** —
- **Expected result:** 0 reviews displayed
- **Technique / type:** EP


## Module M3

### TC-M3-001 — Load valid profile
- **Preconditions:** Known id
- **Steps:** GET profile page
- **Test data:** id=1
- **Expected result:** Bio, rate, rating visible
- **Technique / type:** Positive

### TC-M3-002 — Invalid id
- **Preconditions:** —
- **Steps:** id=99999
- **Test data:** —
- **Expected result:** 404 or error message
- **Technique / type:** Negative

### TC-M3-003 — Reviews list empty
- **Preconditions:** Therapist no reviews
- **Steps:** Open reviews
- **Test data:** —
- **Expected result:** Empty state text
- **Technique / type:** EP

### TC-M3-004 — Reviews list with rows
- **Preconditions:** Seed review
- **Steps:** Open
- **Test data:** —
- **Expected result:** Stars + patient name
- **Technique / type:** Positive

### TC-M3-005 — Book CTA patient
- **Preconditions:** Patient login
- **Steps:** Open profile
- **Test data:** —
- **Expected result:** Book button visible
- **Technique / type:** DT role

### TC-M3-006 — Book hidden guest
- **Preconditions:** Logged out
- **Steps:** Open profile
- **Test data:** —
- **Expected result:** Login prompt; no book
- **Technique / type:** DT

### TC-M3-007 — Back navigation
- **Preconditions:** From book flow
- **Steps:** Browser back
- **Test data:** —
- **Expected result:** Profile state consistent
- **Technique / type:** Alternate

### TC-M3-008 — Malformed id in URL
- **Preconditions:** —
- **Steps:** /therapists/abc
- **Test data:** —
- **Expected result:** Error
- **Technique / type:** Negative

### TC-M3-009 — Profile matches DB specialization
- **Preconditions:** Compare SQL
- **Steps:** Visual check
- **Test data:** —
- **Expected result:** Match
- **Technique / type:** DB

### TC-M3-010 — Hourly rate format
- **Preconditions:** —
- **Steps:** View
- **Test data:** —
- **Expected result:** Currency style $
- **Technique / type:** UI

### TC-M3-011 — Long bio display
- **Preconditions:** DB bio 4000 chars
- **Steps:** Load
- **Test data:** —
- **Expected result:** Wrapped / scroll
- **Technique / type:** Boundary

### TC-M3-012 —  XSS-safe rendering
- **Preconditions:** Bio with <script>
- **Steps:** Stored via API
- **Test data:** Escaped in UI
- **Expected result:** UI smoke
- **Technique / type:** EP

### TC-M3-013 — Parallel load profile+reviews
- **Preconditions:** Throttling
- **Steps:** Slow 3G sim
- **Test data:** —
- **Expected result:** Eventually consistent
- **Technique / type:** Edge

### TC-M3-014 — Therapist views own public profile
- **Preconditions:** Therapist login
- **Steps:** Open /therapists/:selfId
- **Test data:** —
- **Expected result:** Public view OK
- **Technique / type:** Alternate

### TC-M3-015 — Stale link after therapist deleted
- **Preconditions:** Rare
- **Steps:** Delete user DB
- **Test data:** Hit old URL
- **Expected result:** 404
- **Technique / type:** Negative


## Module M4

### TC-M4-001 — Filter anxiety
- **Preconditions:** Seed
- **Steps:** Issue=anxiety Apply
- **Test data:** —
- **Expected result:** Only matching therapists
- **Technique / type:** EP

### TC-M4-002 — Filter depression
- **Preconditions:** —
- **Steps:** depression
- **Test data:** —
- **Expected result:** Subset correct
- **Technique / type:** EP

### TC-M4-003 — Min rate boundary 0
- **Preconditions:** —
- **Steps:** minRate=0
- **Test data:** —
- **Expected result:** All within range
- **Technique / type:** BVA

### TC-M4-004 — Max rate excludes expensive
- **Preconditions:** —
- **Steps:** maxRate=100
- **Test data:** —
- **Expected result:** No therapist >100
- **Technique / type:** BVA

### TC-M4-005 — Min rating 4.5
- **Preconditions:** —
- **Steps:** minRating=4.5
- **Test data:** —
- **Expected result:** All ≥4.5
- **Technique / type:** BVA

### TC-M4-006 — Available date filter
- **Preconditions:** Known slot date
- **Steps:** availableDate
- **Test data:** —
- **Expected result:** Therapists with free slot that day
- **Technique / type:** Decision

### TC-M4-007 — Combined filters
- **Preconditions:** —
- **Steps:** issue+rate+rating
- **Test data:** —
- **Expected result:** AND semantics
- **Technique / type:** DT

### TC-M4-008 — Search name partial
- **Preconditions:** —
- **Steps:** search=Morgan
- **Test data:** —
- **Expected result:** Matching names
- **Technique / type:** EP

### TC-M4-009 — No results message
- **Preconditions:** minRate=9999
- **Steps:** Apply
- **Test data:** —
- **Expected result:** Empty state
- **Technique / type:** Negative

### TC-M4-010 — Invalid date format
- **Preconditions:** —
- **Steps:** availableDate bad
- **Test data:** 99-99-99
- **Expected result:** Validation / ignore
- **Technique / type:** Negative

### TC-M4-011 — Reset filters
- **Preconditions:** —
- **Steps:** Clear fields re-apply
- **Test data:** —
- **Expected result:** Full list
- **Technique / type:** Alternate

### TC-M4-012 — minRate > maxRate
- **Preconditions:** —
- **Steps:** min=200 max=50
- **Test data:** —
- **Expected result:** Empty or validation
- **Technique / type:** Edge

### TC-M4-013 — Decimal rating filter
- **Preconditions:** —
- **Steps:** 4.7
- **Test data:** —
- **Expected result:** Correct rounding
- **Technique / type:** BVA

### TC-M4-014 — Case insensitive issue
- **Preconditions:** —
- **Steps:** ANXIETY vs anxiety
- **Test data:** —
- **Expected result:** Same results
- **Technique / type:** EP

### TC-M4-015 — SQL injection in search
- **Preconditions:** —
- **Steps:** ' OR 1=1 --
- **Test data:** —
- **Expected result:** Treated as literal; no leak
- **Technique / type:** Negative


## Module M5

### TC-M5-001 — Book first open slot
- **Preconditions:** Patient; free slot
- **Steps:** Select slot → confirm
- **Test data:** Valid ids
- **Expected result:** Success; appointments list
- **Technique / type:** Positive

### TC-M5-002 — No slot selected
- **Preconditions:** —
- **Steps:** Confirm without pick
- **Test data:** —
- **Expected result:** UI error
- **Technique / type:** Negative

### TC-M5-003 — Double book same slot
- **Preconditions:** Two patients
- **Steps:** Both book same slot quickly
- **Test data:** —
- **Expected result:** One fails server-side
- **Technique / type:** Race

### TC-M5-004 — Wrong therapistProfileId for slot
- **Preconditions:** Tamper body
- **Steps:** API direct wrong id
- **Test data:** Mismatch
- **Expected result:** Slot does not belong error
- **Technique / type:** Negative

### TC-M5-005 — Patient overlap
- **Preconditions:** Existing appt same time
- **Steps:** Book another
- **Test data:** —
- **Expected result:** Overlap error
- **Technique / type:** Negative

### TC-M5-006 — Notes max length
- **Preconditions:** —
- **Steps:** 501 chars notes
- **Test data:** —
- **Expected result:** Validation
- **Technique / type:** BVA

### TC-M5-007 — Guest cannot book
- **Preconditions:** Logged out
- **Steps:** Hit book URL
- **Test data:** —
- **Expected result:** Redirect login
- **Technique / type:** Negative

### TC-M5-008 — Therapist cannot POST book
- **Preconditions:** Therapist JWT
- **Steps:** API
- **Test data:** —
- **Expected result:** 403
- **Technique / type:** Role

### TC-M5-009 — Slot already booked flag
- **Preconditions:** After book
- **Steps:** DB availability_slots
- **Test data:** —
- **Expected result:** is_booked=1
- **Technique / type:** DB

### TC-M5-010 — Appointment status PENDING
- **Preconditions:** After book
- **Steps:** Query row
- **Test data:** —
- **Expected result:** PENDING
- **Technique / type:** DB

### TC-M5-011 — Past date slot (if created)
- **Preconditions:** Manual slot yesterday
- **Steps:** Book
- **Test data:** —
- **Expected result:** Business rule reject or allow per product
- **Technique / type:** Edge

### TC-M5-012 — Zero duration slot
- **Preconditions:** DB invalid
- **Steps:** —
- **Test data:** App prevents / DB constraint
- **Expected result:** Edge
- **Technique / type:** EP

### TC-M5-013 — Notes optional empty
- **Preconditions:** —
- **Steps:** Leave blank
- **Test data:** —
- **Expected result:** Success
- **Technique / type:** EP

### TC-M5-014 — Unicode notes
- **Preconditions:** —
- **Steps:** Notes with emoji
- **Test data:** —
- **Expected result:** Stored correctly
- **Technique / type:** EP

### TC-M5-015 — Refresh after book
- **Preconditions:** —
- **Steps:** F5 on book page
- **Test data:** —
- **Expected result:** No duplicate submit warning UX
- **Technique / type:** Alternate


## Module M6

### TC-M6-001 — Patient cancel PENDING
- **Preconditions:** Own appt
- **Steps:** Cancel
- **Test data:** —
- **Expected result:** Slot freed; status CANCELLED
- **Technique / type:** Positive

### TC-M6-002 — Cancel COMPLETED rejected
- **Preconditions:** Completed appt
- **Steps:** Cancel
- **Test data:** —
- **Expected result:** Error
- **Technique / type:** Negative

### TC-M6-003 — Reschedule valid slot
- **Preconditions:** PENDING
- **Steps:** Pick new free slot
- **Test data:** newSlotId
- **Expected result:** Success; old slot free
- **Technique / type:** Positive

### TC-M6-004 — Reschedule to taken slot
- **Preconditions:** —
- **Steps:** Booked slot id
- **Test data:** —
- **Expected result:** Error
- **Technique / type:** Negative

### TC-M6-005 — Reschedule other therapist slot
- **Preconditions:** —
- **Steps:** Wrong therapist slot
- **Test data:** —
- **Expected result:** Error
- **Technique / type:** Negative

### TC-M6-006 — Therapist confirm
- **Preconditions:** PENDING appt
- **Steps:** Confirm
- **Test data:** —
- **Expected result:** CONFIRMED
- **Technique / type:** Positive

### TC-M6-007 — Confirm twice
- **Preconditions:** Already CONFIRMED
- **Steps:** Confirm
- **Test data:** —
- **Expected result:** Error
- **Technique / type:** Negative

### TC-M6-008 — Complete flow
- **Preconditions:** CONFIRMED
- **Steps:** Complete
- **Test data:** —
- **Expected result:** COMPLETED
- **Technique / type:** Positive

### TC-M6-009 — Complete from PENDING
- **Preconditions:** —
- **Steps:** Complete
- **Test data:** —
- **Expected result:** Rejected
- **Technique / type:** Negative

### TC-M6-010 — Other patient cannot cancel
- **Preconditions:** Patient B
- **Steps:** Cancel A appt
- **Test data:** —
- **Expected result:** 403
- **Technique / type:** Negative

### TC-M6-011 — Therapist cancel own calendar
- **Preconditions:** Therapist
- **Steps:** Cancel patient appt
- **Test data:** —
- **Expected result:** Allowed; slot free
- **Technique / type:** Positive

### TC-M6-012 — List shows payment column
- **Preconditions:** Patient
- **Steps:** Open appointments
- **Test data:** —
- **Expected result:** Status shown
- **Technique / type:** UI

### TC-M6-013 — Open session room link
- **Preconditions:** CONFIRMED
- **Steps:** Click open session
- **Test data:** —
- **Expected result:** Mock room visible
- **Technique / type:** UI

### TC-M6-014 — Reschedule overlap patient
- **Preconditions:** Two appts adjacent
- **Steps:** Move into conflict
- **Test data:** —
- **Expected result:** Rejected
- **Technique / type:** Negative

### TC-M6-015 — Appointment ordering
- **Preconditions:** Multiple rows
- **Steps:** View list
- **Test data:** —
- **Expected result:** Descending by start time
- **Technique / type:** System


## Module M7

### TC-M7-001 — Pay confirmed appointment
- **Preconditions:** Patient owner
- **Steps:** Pay
- **Test data:** card_simulated
- **Expected result:** completed; paid_at set
- **Technique / type:** Positive

### TC-M7-002 — Double pay blocked
- **Preconditions:** Already paid
- **Steps:** Pay again
- **Test data:** —
- **Expected result:** Error
- **Technique / type:** Negative

### TC-M7-003 — Pay PENDING rejected
- **Preconditions:** Not confirmed
- **Steps:** Pay
- **Test data:** —
- **Expected result:** Business / UI gate
- **Technique / type:** Negative

### TC-M7-004 — Wrong patient
- **Preconditions:** Patient B
- **Steps:** Pay A
- **Test data:** —
- **Expected result:** 403
- **Technique / type:** Negative

### TC-M7-005 — Wallet method
- **Preconditions:** —
- **Steps:** wallet_simulated
- **Test data:** —
- **Expected result:** Row stores method
- **Technique / type:** Alternate

### TC-M7-006 — Amount matches hourly rate
- **Preconditions:** —
- **Steps:** Compare payment amount
- **Test data:** —
- **Expected result:** Matches therapist rate
- **Technique / type:** DB

### TC-M7-007 — Transaction ref unique pattern
- **Preconditions:** —
- **Steps:** Pay
- **Test data:** —
- **Expected result:** SIM- prefix
- **Technique / type:** UI/API

### TC-M7-008 — Pay-fail hook
- **Preconditions:** —
- **Steps:** POST pay-fail
- **Test data:** —
- **Expected result:** status failed
- **Technique / type:** Negative path

### TC-M7-009 — Currency USD default
- **Preconditions:** —
- **Steps:** Inspect row
- **Test data:** —
- **Expected result:** USD
- **Technique / type:** DB

### TC-M7-010 — Therapist cannot pay
- **Preconditions:** Therapist JWT
- **Steps:** Pay endpoint
- **Test data:** —
- **Expected result:** 403
- **Technique / type:** Role

### TC-M7-011 — Missing appointment
- **Preconditions:** —
- **Steps:** id=0
- **Test data:** —
- **Expected result:** 404
- **Technique / type:** Negative

### TC-M7-012 — UI Pay button only when CONFIRMED
- **Preconditions:** Mixed statuses
- **Steps:** Observe
- **Test data:** —
- **Expected result:** Correct enablement
- **Technique / type:** DT

### TC-M7-013 — Refresh after pay
- **Preconditions:** —
- **Steps:** Reload
- **Test data:** —
- **Expected result:** Still completed
- **Technique / type:** Regression

### TC-M7-014 — Concurrent double pay
- **Preconditions:** Scripts
- **Steps:** Two parallel pays
- **Test data:** —
- **Expected result:** One wins; one error
- **Technique / type:** Race

### TC-M7-015 — Payment row 1:1 appointment
- **Preconditions:** DB
- **Steps:** Query
- **Test data:** —
- **Expected result:** Unique appointment_id
- **Technique / type:** DB


## Module M8

### TC-M8-001 — Review completed session
- **Preconditions:** Patient; COMPLETED
- **Steps:** Submit 5 stars
- **Test data:** comment text
- **Expected result:** 201; row in reviews
- **Technique / type:** Positive

### TC-M8-002 — Duplicate review
- **Preconditions:** Already reviewed
- **Steps:** Submit again
- **Test data:** —
- **Expected result:** Duplicate error
- **Technique / type:** Negative

### TC-M8-003 — Review PENDING appt
- **Preconditions:** —
- **Steps:** POST review
- **Test data:** —
- **Expected result:** Rejected
- **Technique / type:** Negative

### TC-M8-004 — Rating boundary 0
- **Preconditions:** —
- **Steps:** rating=0
- **Test data:** —
- **Expected result:** 400
- **Technique / type:** BVA

### TC-M8-005 — Rating boundary 1
- **Preconditions:** —
- **Steps:** rating=1
- **Test data:** —
- **Expected result:** OK
- **Technique / type:** BVA

### TC-M8-006 — Rating boundary 5
- **Preconditions:** —
- **Steps:** rating=5
- **Test data:** —
- **Expected result:** OK
- **Technique / type:** BVA

### TC-M8-007 — Rating boundary 6 invalid
- **Preconditions:** —
- **Steps:** rating=6
- **Test data:** —
- **Expected result:** 400
- **Technique / type:** BVA

### TC-M8-008 — Therapist cannot review
- **Preconditions:** Therapist JWT
- **Steps:** POST
- **Test data:** —
- **Expected result:** 403
- **Technique / type:** Role

### TC-M8-009 — Comment optional empty
- **Preconditions:** —
- **Steps:** No comment
- **Test data:** —
- **Expected result:** OK
- **Technique / type:** EP

### TC-M8-010 — Comment max 2000
- **Preconditions:** —
- **Steps:** 2001 chars
- **Test data:** —
- **Expected result:** Validation
- **Technique / type:** BVA

### TC-M8-011 — Profile aggregates updated
- **Preconditions:** After review
- **Steps:** SQL avg
- **Test data:** —
- **Expected result:** Matches therapist_profiles
- **Technique / type:** DB

### TC-M8-012 — Public list shows new review
- **Preconditions:** —
- **Steps:** Open /therapists/:id/reviews
- **Test data:** —
- **Expected result:** Visible
- **Technique / type:** UI

### TC-M8-013 — Wrong patient review
- **Preconditions:** Patient B
- **Steps:** Review A appt
- **Test data:** —
- **Expected result:** 403
- **Technique / type:** Negative

### TC-M8-014 — Emoji / unicode comment
- **Preconditions:** —
- **Steps:** Unicode
- **Test data:** —
- **Expected result:** Stored
- **Technique / type:** EP

### TC-M8-015 — Review removed when appointment deleted
- **Preconditions:** CASCADE
- **Steps:** Delete appt DB
- **Test data:** —
- **Expected result:** Review row gone
- **Technique / type:** DB

