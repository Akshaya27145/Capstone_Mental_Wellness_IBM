-- ============================================================
-- DB validation queries for QE (CRUD, joins, UI vs DB checks)
-- ============================================================

-- 1) Users: list patients vs therapists
SELECT id, email, role, full_name, is_active FROM users ORDER BY role, id;

-- 2) Therapist profile completeness (FK integrity)
SELECT u.email, tp.specialization, tp.hourly_rate, tp.rating_average
FROM therapist_profiles tp
JOIN users u ON u.id = tp.user_id
WHERE u.role = 'therapist';

-- 3) Issue types per therapist (search/filter validation)
SELECT u.full_name AS therapist, tit.issue_type
FROM therapist_issue_types tit
JOIN therapist_profiles tp ON tp.id = tit.therapist_profile_id
JOIN users u ON u.id = tp.user_id
ORDER BY u.full_name, tit.issue_type;

-- 4) Available slots (not booked) — booking UI alignment
SELECT tp.id AS therapist_profile_id, u.full_name, av.slot_date, av.start_time, av.end_time, av.is_booked
FROM availability_slots av
JOIN therapist_profiles tp ON tp.id = av.therapist_profile_id
JOIN users u ON u.id = tp.user_id
WHERE av.is_booked = 0
ORDER BY av.slot_date, av.start_time;

-- 5) Appointments with status (lifecycle)
SELECT a.id, p.full_name AS patient, u.full_name AS therapist, ss.code AS status,
       a.scheduled_start, a.scheduled_end
FROM appointments a
JOIN users p ON p.id = a.patient_id
JOIN therapist_profiles tp ON tp.id = a.therapist_profile_id
JOIN users u ON u.id = tp.user_id
JOIN session_status ss ON ss.id = a.session_status_id
ORDER BY a.scheduled_start DESC;

-- 6) Double-booking prevention: each slot at most one appointment
SELECT av.id AS slot_id, COUNT(a.id) AS appointment_count
FROM availability_slots av
LEFT JOIN appointments a ON a.slot_id = av.id
GROUP BY av.id
HAVING COUNT(a.id) > 1;
-- Expected: empty result set

-- 7) Booked slots must have is_booked = 1
SELECT av.id, av.is_booked, a.id AS appointment_id
FROM availability_slots av
JOIN appointments a ON a.slot_id = av.id
WHERE av.is_booked <> 1;
-- Expected: empty

-- 8) Payments per appointment (simulation)
SELECT a.id AS appointment_id, pay.amount, pay.status, pay.method, pay.paid_at
FROM payments pay
JOIN appointments a ON a.id = pay.appointment_id;

-- 9) Reviews: rating bounds 1–5 and one review per appointment
SELECT r.id, r.rating, r.appointment_id
FROM reviews r
WHERE r.rating NOT BETWEEN 1 AND 5;

SELECT appointment_id, COUNT(*) c FROM reviews GROUP BY appointment_id HAVING c > 1;

-- 10) Completed session + review aggregate check (manual vs UI)
SELECT tp.id, tp.rating_average, tp.total_reviews,
       ROUND(AVG(r.rating), 2) AS computed_avg,
       COUNT(r.id) AS computed_count
FROM therapist_profiles tp
LEFT JOIN reviews r ON r.therapist_profile_id = tp.id
GROUP BY tp.id, tp.rating_average, tp.total_reviews;

-- 11) CRUD: insert patient (run in transaction in test env)
-- START TRANSACTION;
-- INSERT INTO users (email,password_hash,role,full_name) VALUES (...);
-- ROLLBACK;

-- 12) Overlap detection: same therapist overlapping windows (should be none if app prevents)
SELECT a1.id AS appt1, a2.id AS appt2, a1.therapist_profile_id,
       a1.scheduled_start, a1.scheduled_end, a2.scheduled_start, a2.scheduled_end
FROM appointments a1
JOIN appointments a2 ON a1.therapist_profile_id = a2.therapist_profile_id AND a1.id < a2.id
JOIN session_status s1 ON s1.id = a1.session_status_id
JOIN session_status s2 ON s2.id = a2.session_status_id
WHERE s1.code NOT IN ('CANCELLED') AND s2.code NOT IN ('CANCELLED')
  AND a1.scheduled_start < a2.scheduled_end AND a2.scheduled_start < a1.scheduled_end;

-- 13) Orphan check: appointments pointing to wrong patient role
SELECT a.id FROM appointments a
JOIN users p ON p.id = a.patient_id
WHERE p.role <> 'patient';
