import pool from '../config/db.js';

export async function simulatePayment(patientId, appointmentId, { method = 'card_simulated' }) {
  const [rows] = await pool.query(
    `
    SELECT a.id, a.patient_id, a.therapist_profile_id, tp.hourly_rate, pay.id AS payment_id, pay.status AS pay_status
    FROM appointments a
    JOIN therapist_profiles tp ON tp.id = a.therapist_profile_id
    LEFT JOIN payments pay ON pay.appointment_id = a.id
    WHERE a.id = :aid
    `,
    { aid: appointmentId }
  );
  const row = rows[0];
  if (!row) return { error: 'Appointment not found' };
  if (Number(row.patient_id) !== Number(patientId)) return { error: 'Forbidden' };

  if (row.payment_id && row.pay_status === 'completed') {
    return { error: 'Payment already completed' };
  }

  const amount = Number(row.hourly_rate);
  const ref = `SIM-${Date.now()}-${appointmentId}`;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    if (row.payment_id) {
      await conn.query(
        `
        UPDATE payments SET status = 'completed', paid_at = NOW(), transaction_ref = :ref, method = :m
        WHERE id = :pid
        `,
        { ref, m: method, pid: row.payment_id }
      );
    } else {
      await conn.query(
        `
        INSERT INTO payments (appointment_id, amount, currency, status, method, transaction_ref, paid_at)
        VALUES (:aid, :amt, 'USD', 'completed', :m, :ref, NOW())
        `,
        { aid: appointmentId, amt: amount, m: method, ref }
      );
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') return { error: 'Payment row exists' };
    throw e;
  } finally {
    conn.release();
  }
  return { ok: true, amount, transactionRef: ref };
}

export async function simulatePaymentFailure(patientId, appointmentId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.patient_id, pay.id AS payment_id FROM appointments a
     LEFT JOIN payments pay ON pay.appointment_id = a.id WHERE a.id = :aid`,
    { aid: appointmentId }
  );
  const row = rows[0];
  if (!row) return { error: 'Appointment not found' };
  if (Number(row.patient_id) !== Number(patientId)) return { error: 'Forbidden' };
  if (row.payment_id) {
    await pool.query(`UPDATE payments SET status = 'failed' WHERE id = :id`, { id: row.payment_id });
  } else {
    await pool.query(
      `INSERT INTO payments (appointment_id, amount, currency, status, method)
       SELECT a.id, tp.hourly_rate, 'USD', 'failed', 'card_simulated'
       FROM appointments a JOIN therapist_profiles tp ON tp.id = a.therapist_profile_id WHERE a.id = :aid`,
      { aid: appointmentId }
    );
  }
  return { ok: true };
}
