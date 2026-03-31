import pool from '../config/db.js';
import { mysqlDateToYmd } from '../utils/mysqlDates.js';

function numField(v) {
  if (v == null || v === '') return 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function mapTherapistRow(row) {
  return {
    id: row.profile_id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    specialization: row.specialization,
    bio: row.bio,
    yearsExperience: row.years_experience,
    hourlyRate: numField(row.hourly_rate),
    ratingAverage: numField(row.rating_average),
    totalReviews: row.total_reviews,
    issueTypes: row.issue_types ? String(row.issue_types).split(',').filter(Boolean) : []
  };
}

export async function listTherapists(filters) {
  const {
    issueType,
    minRate,
    maxRate,
    minRating,
    availableDate,
    search
  } = filters;

  let sql = `
    SELECT tp.id AS profile_id, tp.user_id, u.full_name, u.email,
           tp.specialization, tp.bio, tp.years_experience, tp.hourly_rate,
           tp.rating_average, tp.total_reviews,
           GROUP_CONCAT(DISTINCT tit.issue_type ORDER BY tit.issue_type) AS issue_types
    FROM therapist_profiles tp
    JOIN users u ON u.id = tp.user_id AND u.is_active = 1
    LEFT JOIN therapist_issue_types tit ON tit.therapist_profile_id = tp.id
    WHERE 1=1
  `;
  const params = {};

  if (issueType) {
    sql += ` AND EXISTS (
      SELECT 1 FROM therapist_issue_types t2
      WHERE t2.therapist_profile_id = tp.id AND LOWER(t2.issue_type) = LOWER(:issueType)
    )`;
    params.issueType = issueType;
  }
  if (minRate != null && minRate !== '') {
    sql += ' AND tp.hourly_rate >= :minRate';
    params.minRate = Number(minRate);
  }
  if (maxRate != null && maxRate !== '') {
    sql += ' AND tp.hourly_rate <= :maxRate';
    params.maxRate = Number(maxRate);
  }
  if (minRating != null && minRating !== '') {
    sql += ' AND tp.rating_average >= :minRating';
    params.minRating = Number(minRating);
  }
  if (availableDate) {
    sql += ` AND EXISTS (
      SELECT 1 FROM availability_slots av
      WHERE av.therapist_profile_id = tp.id AND av.slot_date = :availDate AND av.is_booked = 0
    )`;
    params.availDate = availableDate;
  }
  if (search) {
    const sub = String(search).toLowerCase();
    sql += ` AND (
      LOCATE(:searchSub, LOWER(COALESCE(u.full_name, ''))) > 0
      OR LOCATE(:searchSub, LOWER(COALESCE(tp.specialization, ''))) > 0
      OR LOCATE(:searchSub, LOWER(COALESCE(tp.bio, ''))) > 0
    )`;
    params.searchSub = sub;
  }

  sql += ' GROUP BY tp.id, tp.user_id, u.full_name, u.email, tp.specialization, tp.bio, tp.years_experience, tp.hourly_rate, tp.rating_average, tp.total_reviews';
  sql += ' ORDER BY tp.rating_average DESC, tp.hourly_rate ASC';

  const [rows] = await pool.query(sql, params);
  return rows.map(mapTherapistRow);
}

export async function getTherapistProfile(profileId) {
  const [rows] = await pool.query(
    `
    SELECT tp.id AS profile_id, tp.user_id, u.full_name, u.email,
           tp.specialization, tp.bio, tp.years_experience, tp.hourly_rate,
           tp.rating_average, tp.total_reviews,
           GROUP_CONCAT(DISTINCT tit.issue_type ORDER BY tit.issue_type) AS issue_types
    FROM therapist_profiles tp
    JOIN users u ON u.id = tp.user_id
    LEFT JOIN therapist_issue_types tit ON tit.therapist_profile_id = tp.id
    WHERE tp.id = :id
    GROUP BY tp.id, tp.user_id, u.full_name, u.email, tp.specialization, tp.bio, tp.years_experience, tp.hourly_rate, tp.rating_average, tp.total_reviews
    `,
    { id: profileId }
  );
  if (!rows[0]) return null;
  return mapTherapistRow(rows[0]);
}

export async function getTherapistProfileForUser(userId) {
  const [rows] = await pool.query(
    `SELECT id FROM therapist_profiles WHERE user_id = :uid`,
    { uid: userId }
  );
  if (!rows[0]) return null;
  return getTherapistProfile(rows[0].id);
}

export async function listSlots(profileId, fromDate, toDate) {
  const [rows] = await pool.query(
    `
    SELECT id, slot_date AS slotDate, start_time AS startTime, end_time AS endTime, is_booked AS isBooked
    FROM availability_slots
    WHERE therapist_profile_id = :pid
      AND slot_date >= :fromD
      AND slot_date <= :toD
    ORDER BY slot_date, start_time
    `,
    { pid: profileId, fromD: fromDate, toD: toDate }
  );
  return rows.map((r) => ({
    id: r.id,
    slotDate: mysqlDateToYmd(r.slotDate),
    startTime: formatTime(r.startTime),
    endTime: formatTime(r.endTime),
    isBooked: Boolean(r.isBooked)
  }));
}

function formatTime(t) {
  if (!t) return null;
  const s = String(t);
  return s.length >= 8 ? s.slice(0, 8) : s;
}

export async function addAvailabilitySlot(therapistUserId, { slotDate, startTime, endTime }) {
  const [tp] = await pool.query(
    `SELECT id FROM therapist_profiles WHERE user_id = :uid`,
    { uid: therapistUserId }
  );
  if (!tp[0]) return { error: 'Therapist profile not found' };

  const [overlap] = await pool.query(
    `
    SELECT id FROM availability_slots
    WHERE therapist_profile_id = :pid AND slot_date = :d
      AND NOT (end_time <= :st OR start_time >= :et)
    `,
    { pid: tp[0].id, d: slotDate, st: startTime, et: endTime }
  );
  if (overlap.length) return { error: 'Overlapping slot exists for this date' };

  const [ins] = await pool.query(
    `
    INSERT INTO availability_slots (therapist_profile_id, slot_date, start_time, end_time)
    VALUES (:pid, :d, :st, :et)
    `,
    { pid: tp[0].id, d: slotDate, st: startTime, et: endTime }
  );
  return { id: ins.insertId };
}

export async function updateTherapistProfile(therapistUserId, body) {
  const allowed = ['specialization', 'bio', 'years_experience', 'hourly_rate'];
  const updates = [];
  const params = { uid: therapistUserId };
  if (body.specialization != null) {
    updates.push('specialization = :spec');
    params.spec = body.specialization;
  }
  if (body.bio != null) {
    updates.push('bio = :bio');
    params.bio = body.bio;
  }
  if (body.yearsExperience != null) {
    updates.push('years_experience = :years');
    params.years = body.yearsExperience;
  }
  if (body.hourlyRate != null) {
    updates.push('hourly_rate = :rate');
    params.rate = body.hourlyRate;
  }
  if (!updates.length) return { error: 'No valid fields' };

  const [r] = await pool.query(
    `UPDATE therapist_profiles SET ${updates.join(', ')} WHERE user_id = :uid`,
    params
  );
  if (r.affectedRows === 0) return { error: 'Profile not found' };
  return { ok: true };
}

export async function setIssueTypes(therapistUserId, issueTypes) {
  const [tp] = await pool.query(`SELECT id FROM therapist_profiles WHERE user_id = :uid`, { uid: therapistUserId });
  if (!tp[0]) return { error: 'Profile not found' };
  const pid = tp[0].id;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM therapist_issue_types WHERE therapist_profile_id = :pid`, { pid });
    for (const it of issueTypes) {
      await conn.query(
        `INSERT INTO therapist_issue_types (therapist_profile_id, issue_type) VALUES (:pid, :it)`,
        { pid, it: String(it).toLowerCase().slice(0, 80) }
      );
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  return { ok: true };
}
