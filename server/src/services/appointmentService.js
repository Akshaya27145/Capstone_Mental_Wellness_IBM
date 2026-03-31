import pool from '../config/db.js';
import { mysqlDateToYmd, mysqlTimeToHms } from '../utils/mysqlDates.js';

async function getStatusId(code) {
  const [rows] = await pool.query(`SELECT id FROM session_status WHERE code = :c`, { c: code });
  return rows[0]?.id;
}

function combineDateTime(dateVal, timeVal) {
  const dateStr = mysqlDateToYmd(dateVal);
  const timeStr = mysqlTimeToHms(timeVal);
  return `${dateStr} ${timeStr.length === 5 ? `${timeStr}:00` : timeStr}`;
}

export async function bookAppointment(patientId, { therapistProfileId, slotId, patientNotes }) {
  const statusPending = await getStatusId('PENDING');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [slots] = await conn.query(
      `SELECT id, therapist_profile_id, slot_date, start_time, end_time, is_booked
       FROM availability_slots WHERE id = :sid FOR UPDATE`,
      { sid: slotId }
    );
    const slot = slots[0];
    if (!slot) {
      await conn.rollback();
      return { error: 'Slot not found' };
    }
    if (Number(slot.therapist_profile_id) !== Number(therapistProfileId)) {
      await conn.rollback();
      return { error: 'Slot does not belong to this therapist' };
    }
    if (slot.is_booked) {
      await conn.rollback();
      return { error: 'Slot is already booked' };
    }

    const scheduledStart = combineDateTime(slot.slot_date, slot.start_time);
    const scheduledEnd = combineDateTime(slot.slot_date, slot.end_time);

    const [overlap] = await conn.query(
      `
      SELECT a.id FROM appointments a
      JOIN session_status ss ON ss.id = a.session_status_id
      WHERE a.patient_id = :pid AND ss.code NOT IN ('CANCELLED')
        AND a.scheduled_start < :end AND a.scheduled_end > :start
      FOR UPDATE
      `,
      { pid: patientId, start: scheduledStart, end: scheduledEnd }
    );
    if (overlap.length) {
      await conn.rollback();
      return { error: 'Patient has overlapping appointment' };
    }

    const [tOverlap] = await conn.query(
      `
      SELECT a.id FROM appointments a
      JOIN session_status ss ON ss.id = a.session_status_id
      WHERE a.therapist_profile_id = :tpid AND ss.code NOT IN ('CANCELLED')
        AND a.scheduled_start < :end AND a.scheduled_end > :start
      FOR UPDATE
      `,
      { tpid: therapistProfileId, start: scheduledStart, end: scheduledEnd }
    );
    if (tOverlap.length) {
      await conn.rollback();
      return { error: 'Therapist has overlapping appointment' };
    }

    const [ins] = await conn.query(
      `
      INSERT INTO appointments (patient_id, therapist_profile_id, slot_id, session_status_id, patient_notes, scheduled_start, scheduled_end)
      VALUES (:pid, :tpid, :sid, :st, :notes, :sstart, :send)
      `,
      {
        pid: patientId,
        tpid: therapistProfileId,
        sid: slotId,
        st: statusPending,
        notes: patientNotes || null,
        sstart: scheduledStart,
        send: scheduledEnd
      }
    );

    await conn.query(`UPDATE availability_slots SET is_booked = 1 WHERE id = :sid`, { sid: slotId });

    await conn.commit();
    return { id: ins.insertId };
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') return { error: 'Slot already reserved' };
    throw e;
  } finally {
    conn.release();
  }
}

export async function listAppointmentsForUser(userId, role) {
  if (role === 'patient') {
    const [rows] = await pool.query(
      `
      SELECT a.id, a.scheduled_start, a.scheduled_end, a.patient_notes, ss.code AS status_code, ss.label AS status_label,
             tp.id AS therapist_profile_id, u.full_name AS therapist_name, tp.hourly_rate,
             pay.status AS payment_status, pay.amount AS payment_amount,
             (SELECT COUNT(*) FROM reviews r WHERE r.appointment_id = a.id) > 0 AS has_review
      FROM appointments a
      JOIN session_status ss ON ss.id = a.session_status_id
      JOIN therapist_profiles tp ON tp.id = a.therapist_profile_id
      JOIN users u ON u.id = tp.user_id
      LEFT JOIN payments pay ON pay.appointment_id = a.id
      WHERE a.patient_id = :uid
      ORDER BY a.scheduled_start DESC
      `,
      { uid: userId }
    );
    return rows.map((r) => ({ ...r, has_review: Number(r.has_review) === 1 }));
  }
  const [tp] = await pool.query(`SELECT id FROM therapist_profiles WHERE user_id = :uid`, { uid: userId });
  if (!tp[0]) return [];
  const [rows] = await pool.query(
    `
    SELECT a.id, a.scheduled_start, a.scheduled_end, a.therapist_notes, ss.code AS status_code, ss.label AS status_label,
           p.full_name AS patient_name, a.patient_id,
           pay.status AS payment_status, pay.amount AS payment_amount
    FROM appointments a
    JOIN session_status ss ON ss.id = a.session_status_id
    JOIN users p ON p.id = a.patient_id
    LEFT JOIN payments pay ON pay.appointment_id = a.id
    WHERE a.therapist_profile_id = :tpid
    ORDER BY a.scheduled_start DESC
    `,
    { tpid: tp[0].id }
  );
  return rows;
}

export async function getAppointmentById(appointmentId) {
  const [rows] = await pool.query(
    `
    SELECT a.*, ss.code AS status_code
    FROM appointments a
    JOIN session_status ss ON ss.id = a.session_status_id
    WHERE a.id = :id
    `,
    { id: appointmentId }
  );
  return rows[0] || null;
}

export async function cancelAppointment(userId, role, appointmentId) {
  const appt = await getAppointmentById(appointmentId);
  if (!appt) return { error: 'Appointment not found' };
  const cancelledId = await getStatusId('CANCELLED');
  const confirmedId = await getStatusId('CONFIRMED');
  const pendingId = await getStatusId('PENDING');

  if (role === 'patient' && Number(appt.patient_id) !== Number(userId)) {
    return { error: 'Forbidden' };
  }
  if (role === 'therapist') {
    const [tp] = await pool.query(`SELECT id FROM therapist_profiles WHERE user_id = :uid`, { uid: userId });
    if (!tp[0] || Number(tp[0].id) !== Number(appt.therapist_profile_id)) return { error: 'Forbidden' };
  }

  if (![pendingId, confirmedId].includes(appt.session_status_id)) {
    return { error: 'Appointment cannot be cancelled in current status' };
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`UPDATE appointments SET session_status_id = :sid WHERE id = :id`, {
      sid: cancelledId,
      id: appointmentId
    });
    await conn.query(`UPDATE availability_slots SET is_booked = 0 WHERE id = :slot`, { slot: appt.slot_id });
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  return { ok: true };
}

export async function rescheduleAppointment(userId, role, appointmentId, newSlotId) {
  const appt = await getAppointmentById(appointmentId);
  if (!appt) return { error: 'Appointment not found' };
  if (role === 'patient' && Number(appt.patient_id) !== Number(userId)) return { error: 'Forbidden' };
  if (role === 'therapist') {
    const [tp] = await pool.query(`SELECT id FROM therapist_profiles WHERE user_id = :uid`, { uid: userId });
    if (!tp[0] || Number(tp[0].id) !== Number(appt.therapist_profile_id)) return { error: 'Forbidden' };
  }

  const pendingId = await getStatusId('PENDING');
  const confirmedId = await getStatusId('CONFIRMED');
  if (![pendingId, confirmedId].includes(appt.session_status_id)) {
    return { error: 'Cannot reschedule in current status' };
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [newSlots] = await conn.query(
      `SELECT * FROM availability_slots WHERE id = :sid FOR UPDATE`,
      { sid: newSlotId }
    );
    const ns = newSlots[0];
    if (!ns) {
      await conn.rollback();
      return { error: 'New slot not found' };
    }
    if (Number(ns.therapist_profile_id) !== Number(appt.therapist_profile_id)) {
      await conn.rollback();
      return { error: 'New slot must belong to same therapist' };
    }
    if (ns.is_booked) {
      await conn.rollback();
      return { error: 'New slot is not available' };
    }

    const newStart = combineDateTime(ns.slot_date, ns.start_time);
    const newEnd = combineDateTime(ns.slot_date, ns.end_time);

    const [pOverlap] = await conn.query(
      `
      SELECT a.id FROM appointments a
      JOIN session_status ss ON ss.id = a.session_status_id
      WHERE a.patient_id = :pid AND a.id <> :aid AND ss.code NOT IN ('CANCELLED')
        AND a.scheduled_start < :end AND a.scheduled_end > :start
      FOR UPDATE
      `,
      { pid: appt.patient_id, aid: appointmentId, start: newStart, end: newEnd }
    );
    if (pOverlap.length) {
      await conn.rollback();
      return { error: 'Patient overlap with another appointment' };
    }

    const [tOverlap] = await conn.query(
      `
      SELECT a.id FROM appointments a
      JOIN session_status ss ON ss.id = a.session_status_id
      WHERE a.therapist_profile_id = :tpid AND a.id <> :aid AND ss.code NOT IN ('CANCELLED')
        AND a.scheduled_start < :end AND a.scheduled_end > :start
      FOR UPDATE
      `,
      { tpid: appt.therapist_profile_id, aid: appointmentId, start: newStart, end: newEnd }
    );
    if (tOverlap.length) {
      await conn.rollback();
      return { error: 'Therapist overlap with another appointment' };
    }

    await conn.query(`UPDATE availability_slots SET is_booked = 0 WHERE id = :old`, { old: appt.slot_id });
    await conn.query(
      `
      UPDATE appointments SET slot_id = :nsid, scheduled_start = :sstart, scheduled_end = :send,
        session_status_id = :pending
      WHERE id = :aid
      `,
      {
        nsid: newSlotId,
        sstart: newStart,
        send: newEnd,
        pending: pendingId,
        aid: appointmentId
      }
    );
    await conn.query(`UPDATE availability_slots SET is_booked = 1 WHERE id = :nsid`, { nsid: newSlotId });

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') return { error: 'Slot conflict' };
    throw e;
  } finally {
    conn.release();
  }
  return { ok: true };
}

export async function confirmAppointment(therapistUserId, appointmentId) {
  const [tp] = await pool.query(`SELECT id FROM therapist_profiles WHERE user_id = :uid`, { uid: therapistUserId });
  if (!tp[0]) return { error: 'Forbidden' };
  const appt = await getAppointmentById(appointmentId);
  if (!appt || Number(appt.therapist_profile_id) !== Number(tp[0].id)) return { error: 'Forbidden' };
  const pendingId = await getStatusId('PENDING');
  const confirmedId = await getStatusId('CONFIRMED');
  if (appt.session_status_id !== pendingId) return { error: 'Only pending appointments can be confirmed' };
  await pool.query(`UPDATE appointments SET session_status_id = :sid WHERE id = :id`, {
    sid: confirmedId,
    id: appointmentId
  });
  return { ok: true };
}

export async function completeAppointment(therapistUserId, appointmentId) {
  const [tp] = await pool.query(`SELECT id FROM therapist_profiles WHERE user_id = :uid`, { uid: therapistUserId });
  if (!tp[0]) return { error: 'Forbidden' };
  const appt = await getAppointmentById(appointmentId);
  if (!appt || Number(appt.therapist_profile_id) !== Number(tp[0].id)) return { error: 'Forbidden' };
  const confirmedId = await getStatusId('CONFIRMED');
  const completedId = await getStatusId('COMPLETED');
  if (appt.session_status_id !== confirmedId) return { error: 'Only confirmed sessions can be completed' };
  await pool.query(`UPDATE appointments SET session_status_id = :sid WHERE id = :id`, {
    sid: completedId,
    id: appointmentId
  });
  return { ok: true };
}
