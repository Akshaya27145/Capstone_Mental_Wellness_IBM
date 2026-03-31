import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/** mysql2 returns DATE as JS Date — never use String(date).slice(0,10) (breaks MySQL DATETIME). */
function toSqlDate(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function toSqlTime(value) {
  if (value == null) return '00:00:00';
  if (typeof value === 'string') {
    return value.length >= 8 ? value.slice(0, 8) : `${value}:00`.slice(0, 8);
  }
  const s = String(value);
  return s.length >= 8 ? s.slice(0, 8) : s;
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const dbName = process.env.DB_NAME || 'wellness_booking';
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${dbName}\``);

  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await conn.query(schema);

  const password = 'DemoPass123!';
  const hash = await bcrypt.hash(password, 10);

  await conn.query('DELETE FROM reviews');
  await conn.query('DELETE FROM payments');
  await conn.query('DELETE FROM appointments');
  await conn.query('DELETE FROM availability_slots');
  await conn.query('DELETE FROM therapist_issue_types');
  await conn.query('DELETE FROM therapist_profiles');
  await conn.query(`DELETE FROM users WHERE email LIKE '%@example.com'`);

  await conn.query(
    `INSERT INTO users (email, password_hash, role, full_name, phone, is_active) VALUES
     (?, ?, 'patient', 'Alex Rivera', '+1-555-0101', 1),
     (?, ?, 'patient', 'Jordan Lee', '+1-555-0102', 1),
     (?, ?, 'therapist', 'Dr. Sam Morgan', '+1-555-0201', 1),
     (?, ?, 'therapist', 'Dr. Riley Chen', '+1-555-0202', 1),
     (?, ?, 'therapist', 'Dr. Morgan Patel', '+1-555-0203', 1),
     (?, ?, 'patient', 'Inactive User', NULL, 0)`,
    [
      'patient1@example.com',
      hash,
      'patient2@example.com',
      hash,
      'therapist1@example.com',
      hash,
      'therapist2@example.com',
      hash,
      'therapist3@example.com',
      hash,
      'inactive@example.com',
      hash
    ]
  );

  const [[p1]] = await conn.query(`SELECT id FROM users WHERE email = 'patient1@example.com'`);
  const [[p2]] = await conn.query(`SELECT id FROM users WHERE email = 'patient2@example.com'`);
  const [[t1]] = await conn.query(`SELECT id FROM users WHERE email = 'therapist1@example.com'`);
  const [[t2]] = await conn.query(`SELECT id FROM users WHERE email = 'therapist2@example.com'`);
  const [[t3]] = await conn.query(`SELECT id FROM users WHERE email = 'therapist3@example.com'`);

  await conn.query(
    `INSERT INTO therapist_profiles (user_id, specialization, bio, years_experience, hourly_rate, rating_average, total_reviews) VALUES
     (?, 'Clinical Psychology', 'CBT-focused therapist with trauma-informed care.', 12, 120.00, 4.70, 24),
     (?, 'Licensed Counselor', 'Anxiety, depression, and workplace stress.', 7, 95.50, 4.50, 18),
     (?, 'Marriage & Family Therapy', 'Couples and family systems.', 15, 140.00, 4.85, 31)`,
    [t1.id, t2.id, t3.id]
  );

  const [[tp1]] = await conn.query(`SELECT id FROM therapist_profiles WHERE user_id = ?`, [t1.id]);
  const [[tp2]] = await conn.query(`SELECT id FROM therapist_profiles WHERE user_id = ?`, [t2.id]);
  const [[tp3]] = await conn.query(`SELECT id FROM therapist_profiles WHERE user_id = ?`, [t3.id]);

  await conn.query(
    `INSERT INTO therapist_issue_types (therapist_profile_id, issue_type) VALUES
     (?, 'anxiety'), (?, 'trauma'),
     (?, 'depression'), (?, 'anxiety'),
     (?, 'relationships'), (?, 'family')`,
    [tp1.id, tp1.id, tp2.id, tp2.id, tp3.id, tp3.id]
  );

  const d1 = new Date();
  d1.setDate(d1.getDate() + 1);
  const d2 = new Date();
  d2.setDate(d2.getDate() + 2);
  const d3 = new Date();
  d3.setDate(d3.getDate() + 3);
  const d4 = new Date();
  d4.setDate(d4.getDate() + 4);
  const d5 = new Date();
  d5.setDate(d5.getDate() + 5);
  const d6 = new Date();
  d6.setDate(d6.getDate() + 6);
  const d7 = new Date();
  d7.setDate(d7.getDate() + 7);
  const f = (d) => d.toISOString().slice(0, 10);

  await conn.query(
    `INSERT INTO availability_slots (therapist_profile_id, slot_date, start_time, end_time, is_booked) VALUES
     (?, ?, '09:00:00', '10:00:00', 0),
     (?, ?, '10:00:00', '11:00:00', 0),
     (?, ?, '14:00:00', '15:00:00', 0),
     (?, ?, '11:00:00', '12:00:00', 0),
     (?, ?, '09:00:00', '10:00:00', 0),
     (?, ?, '16:00:00', '17:00:00', 0),
     (?, ?, '10:00:00', '11:00:00', 0),
     (?, ?, '10:00:00', '11:00:00', 0),
     (?, ?, '09:00:00', '10:00:00', 0),
     (?, ?, '12:00:00', '13:00:00', 0),
     (?, ?, '15:00:00', '16:00:00', 0)`,
    [
      tp1.id,
      f(d1),
      tp1.id,
      f(d1),
      tp1.id,
      f(d2),
      tp2.id,
      f(d1),
      tp2.id,
      f(d3),
      tp3.id,
      f(d1),
      tp2.id,
      f(d4),
      tp3.id,
      f(d5),
      tp3.id,
      f(d2),
      tp1.id,
      f(d3),
      tp1.id,
      f(d6)
    ]
  );

  const [[slotBooked]] = await conn.query(
    `SELECT id FROM availability_slots WHERE therapist_profile_id = ? AND slot_date = ? LIMIT 1`,
    [tp1.id, f(d1)]
  );

  const [[pendingStatus]] = await conn.query(`SELECT id FROM session_status WHERE code = 'PENDING'`);
  const [[confirmedStatus]] = await conn.query(`SELECT id FROM session_status WHERE code = 'CONFIRMED'`);
  const [[completedStatus]] = await conn.query(`SELECT id FROM session_status WHERE code = 'COMPLETED'`);

  await conn.query(
    `INSERT INTO appointments (patient_id, therapist_profile_id, slot_id, session_status_id, scheduled_start, scheduled_end, patient_notes)
     VALUES (?, ?, ?, ?, ?, ?, 'Seed demo appointment')`,
    [
      p2.id,
      tp1.id,
      slotBooked.id,
      pendingStatus.id,
      `${f(d1)} 09:00:00`,
      `${f(d1)} 10:00:00`
    ]
  );
  await conn.query(`UPDATE availability_slots SET is_booked = 1 WHERE id = ?`, [slotBooked.id]);

  const [[slotForComplete]] = await conn.query(
    `SELECT id, slot_date, start_time, end_time FROM availability_slots
     WHERE therapist_profile_id = ? AND is_booked = 0
     ORDER BY slot_date, start_time LIMIT 1`,
    [tp2.id]
  );

  if (slotForComplete) {
    const sd = toSqlDate(slotForComplete.slot_date);
    const st = toSqlTime(slotForComplete.start_time);
    const et = toSqlTime(slotForComplete.end_time);
    await conn.query(
      `INSERT INTO appointments (patient_id, therapist_profile_id, slot_id, session_status_id, scheduled_start, scheduled_end)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [p1.id, tp2.id, slotForComplete.id, completedStatus.id, `${sd} ${st}`, `${sd} ${et}`]
    );
    await conn.query(`UPDATE availability_slots SET is_booked = 1 WHERE id = ?`, [slotForComplete.id]);
    await conn.query(
      `INSERT INTO payments (appointment_id, amount, currency, status, method, transaction_ref, paid_at)
       SELECT id, 95.50, 'USD', 'completed', 'card_simulated', 'SEED-1', NOW() FROM appointments ORDER BY id DESC LIMIT 1`
    );
    await conn.query(
      `INSERT INTO reviews (appointment_id, patient_id, therapist_profile_id, rating, comment)
       SELECT id, patient_id, therapist_profile_id, 5, 'Great session' FROM appointments ORDER BY id DESC LIMIT 1`
    );
    await conn.query(
      `UPDATE therapist_profiles tp
       SET total_reviews = (SELECT COUNT(*) FROM reviews r WHERE r.therapist_profile_id = tp.id),
           rating_average = COALESCE((SELECT AVG(rating) FROM reviews r WHERE r.therapist_profile_id = tp.id), 0)
       WHERE tp.id IN (?,?,?)`,
      [tp1.id, tp2.id, tp3.id]
    );
  }

  const [[slotP1Unreviewed]] = await conn.query(
    `SELECT id, slot_date, start_time, end_time FROM availability_slots
     WHERE therapist_profile_id = ? AND is_booked = 0 ORDER BY slot_date, start_time LIMIT 1`,
    [tp1.id]
  );
  if (slotP1Unreviewed) {
    const sd = toSqlDate(slotP1Unreviewed.slot_date);
    const st = toSqlTime(slotP1Unreviewed.start_time);
    const et = toSqlTime(slotP1Unreviewed.end_time);
    await conn.query(
      `INSERT INTO appointments (patient_id, therapist_profile_id, slot_id, session_status_id, scheduled_start, scheduled_end, patient_notes)
       VALUES (?, ?, ?, ?, ?, ?, 'Seed completed — no review yet')`,
      [p1.id, tp1.id, slotP1Unreviewed.id, completedStatus.id, `${sd} ${st}`, `${sd} ${et}`]
    );
    await conn.query(`UPDATE availability_slots SET is_booked = 1 WHERE id = ?`, [slotP1Unreviewed.id]);
  }

  await conn.query(
    `INSERT INTO availability_slots (therapist_profile_id, slot_date, start_time, end_time, is_booked)
     VALUES (?, ?, '18:00:00', '19:00:00', 0)`,
    [tp2.id, toSqlDate(d7)]
  );

  const [[slotP1Pay]] = await conn.query(
    `SELECT id, slot_date, start_time, end_time FROM availability_slots
     WHERE therapist_profile_id = ? AND slot_date = ? AND start_time = '18:00:00' AND is_booked = 0`,
    [tp2.id, toSqlDate(d7)]
  );
  if (slotP1Pay) {
    const sd = toSqlDate(slotP1Pay.slot_date);
    const st = toSqlTime(slotP1Pay.start_time);
    const et = toSqlTime(slotP1Pay.end_time);
    await conn.query(
      `INSERT INTO appointments (patient_id, therapist_profile_id, slot_id, session_status_id, scheduled_start, scheduled_end, patient_notes)
       VALUES (?, ?, ?, ?, ?, ?, 'Seed CONFIRMED — pay in E2E')`,
      [p1.id, tp2.id, slotP1Pay.id, confirmedStatus.id, `${sd} ${st}`, `${sd} ${et}`]
    );
    await conn.query(`UPDATE availability_slots SET is_booked = 1 WHERE id = ?`, [slotP1Pay.id]);
  }

  const [[slotP1PendingOlder]] = await conn.query(
    `SELECT id, slot_date, start_time, end_time FROM availability_slots
     WHERE therapist_profile_id = ? AND slot_date = ? AND is_booked = 0`,
    [tp2.id, f(d4)]
  );
  if (slotP1PendingOlder) {
    const sd = toSqlDate(slotP1PendingOlder.slot_date);
    const st = toSqlTime(slotP1PendingOlder.start_time);
    const et = toSqlTime(slotP1PendingOlder.end_time);
    await conn.query(
      `INSERT INTO appointments (patient_id, therapist_profile_id, slot_id, session_status_id, scheduled_start, scheduled_end, patient_notes)
       VALUES (?, ?, ?, ?, ?, ?, 'Seed PENDING (older) for E2E')`,
      [p1.id, tp2.id, slotP1PendingOlder.id, pendingStatus.id, `${sd} ${st}`, `${sd} ${et}`]
    );
    await conn.query(`UPDATE availability_slots SET is_booked = 1 WHERE id = ?`, [slotP1PendingOlder.id]);
  }

  const [[slotP1PendingNewer]] = await conn.query(
    `SELECT id, slot_date, start_time, end_time FROM availability_slots
     WHERE therapist_profile_id = ? AND slot_date = ? AND is_booked = 0`,
    [tp3.id, f(d5)]
  );
  if (slotP1PendingNewer) {
    const sd = toSqlDate(slotP1PendingNewer.slot_date);
    const st = toSqlTime(slotP1PendingNewer.start_time);
    const et = toSqlTime(slotP1PendingNewer.end_time);
    await conn.query(
      `INSERT INTO appointments (patient_id, therapist_profile_id, slot_id, session_status_id, scheduled_start, scheduled_end, patient_notes)
       VALUES (?, ?, ?, ?, ?, ?, 'Seed PENDING (newest) for E2E cancel')`,
      [p1.id, tp3.id, slotP1PendingNewer.id, pendingStatus.id, `${sd} ${st}`, `${sd} ${et}`]
    );
    await conn.query(`UPDATE availability_slots SET is_booked = 1 WHERE id = ?`, [slotP1PendingNewer.id]);
  }

  const [[slotP1Completed2]] = await conn.query(
    `SELECT id, slot_date, start_time, end_time FROM availability_slots
     WHERE therapist_profile_id = ? AND slot_date = ? AND start_time = '09:00:00' AND is_booked = 0`,
    [tp3.id, f(d2)]
  );
  if (slotP1Completed2) {
    const sd = toSqlDate(slotP1Completed2.slot_date);
    const st = toSqlTime(slotP1Completed2.start_time);
    const et = toSqlTime(slotP1Completed2.end_time);
    await conn.query(
      `INSERT INTO appointments (patient_id, therapist_profile_id, slot_id, session_status_id, scheduled_start, scheduled_end, patient_notes)
       VALUES (?, ?, ?, ?, ?, ?, 'Seed COMPLETED — second reviewable row')`,
      [p1.id, tp3.id, slotP1Completed2.id, completedStatus.id, `${sd} ${st}`, `${sd} ${et}`]
    );
    await conn.query(`UPDATE availability_slots SET is_booked = 1 WHERE id = ?`, [slotP1Completed2.id]);
  }

  const [[slotP1Completed3]] = await conn.query(
    `SELECT id, slot_date, start_time, end_time FROM availability_slots
     WHERE therapist_profile_id = ? AND slot_date = ? AND start_time = '15:00:00' AND is_booked = 0`,
    [tp1.id, f(d6)]
  );
  if (slotP1Completed3) {
    const sd = toSqlDate(slotP1Completed3.slot_date);
    const st = toSqlTime(slotP1Completed3.start_time);
    const et = toSqlTime(slotP1Completed3.end_time);
    await conn.query(
      `INSERT INTO appointments (patient_id, therapist_profile_id, slot_id, session_status_id, scheduled_start, scheduled_end, patient_notes)
       VALUES (?, ?, ?, ?, ?, ?, 'Seed COMPLETED — third reviewable row')`,
      [p1.id, tp1.id, slotP1Completed3.id, completedStatus.id, `${sd} ${st}`, `${sd} ${et}`]
    );
    await conn.query(`UPDATE availability_slots SET is_booked = 1 WHERE id = ?`, [slotP1Completed3.id]);
  }

  await conn.query(
    `UPDATE therapist_profiles tp
     SET total_reviews = (SELECT COUNT(*) FROM reviews r WHERE r.therapist_profile_id = tp.id),
         rating_average = COALESCE((SELECT AVG(rating) FROM reviews r WHERE r.therapist_profile_id = tp.id), 0)
     WHERE tp.id IN (?,?,?)`,
    [tp1.id, tp2.id, tp3.id]
  );

  console.log('Seed complete. Demo password for all seeded users:', password);
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
