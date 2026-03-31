import pool from '../config/db.js';

async function getStatusId(code) {
  const [rows] = await pool.query(`SELECT id FROM session_status WHERE code = :c`, { c: code });
  return rows[0]?.id;
}

export async function addReview(patientId, appointmentId, { rating, comment }) {
  const completedId = await getStatusId('COMPLETED');
  const [rows] = await pool.query(
    `
    SELECT a.id, a.patient_id, a.therapist_profile_id, a.session_status_id
    FROM appointments a WHERE a.id = :aid
    `,
    { aid: appointmentId }
  );
  const appt = rows[0];
  if (!appt) return { error: 'Appointment not found' };
  if (Number(appt.patient_id) !== Number(patientId)) return { error: 'Forbidden' };
  if (Number(appt.session_status_id) !== Number(completedId)) {
    return { error: 'Reviews allowed only for completed sessions' };
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `
      INSERT INTO reviews (appointment_id, patient_id, therapist_profile_id, rating, comment)
      VALUES (:aid, :pid, :tpid, :r, :c)
      `,
      { aid: appointmentId, pid: patientId, tpid: appt.therapist_profile_id, r: rating, c: comment || null }
    );
    await conn.query(
      `
      UPDATE therapist_profiles tp
      SET total_reviews = total_reviews + 1,
          rating_average = (COALESCE(tp.rating_average, 0) * tp.total_reviews + :r) / (tp.total_reviews + 1)
      WHERE id = :tpid
      `,
      { r: rating, tpid: appt.therapist_profile_id }
    );
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') return { error: 'Review already exists for this appointment' };
    throw e;
  } finally {
    conn.release();
  }
  return { ok: true };
}

export async function listReviewsForTherapist(profileId) {
  const [rows] = await pool.query(
    `
    SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS patient_name
    FROM reviews r
    JOIN users u ON u.id = r.patient_id
    WHERE r.therapist_profile_id = :pid
    ORDER BY r.created_at DESC
    `,
    { pid: profileId }
  );
  return rows;
}
