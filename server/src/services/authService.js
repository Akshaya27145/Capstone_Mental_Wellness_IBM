import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { signToken } from '../utils/tokens.js';

export async function registerUser({ email, password, role, fullName, phone }) {
  const hash = await bcrypt.hash(password, 10);
  const [r] = await pool.query(
    `INSERT INTO users (email, password_hash, role, full_name, phone) VALUES (:email, :hash, :role, :fullName, :phone)`,
    { email: email.toLowerCase(), hash, role, fullName, phone: phone || null }
  );
  const userId = r.insertId;
  if (role === 'therapist') {
    await pool.query(
      `INSERT INTO therapist_profiles (user_id, specialization, bio, years_experience, hourly_rate)
       VALUES (:uid, :spec, :bio, :years, :rate)`,
      {
        uid: userId,
        spec: 'General',
        bio: '',
        years: 1,
        rate: 100.0
      }
    );
  }
  return { id: userId, email: email.toLowerCase(), role, fullName };
}

export async function loginUser(email, password) {
  const [rows] = await pool.query(
    `SELECT id, email, password_hash, role, full_name, is_active FROM users WHERE email = :email LIMIT 1`,
    { email: email.toLowerCase() }
  );
  const user = rows[0];
  if (!user) return { error: 'Invalid credentials' };
  if (!user.is_active) return { error: 'Account is deactivated' };
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return { error: 'Invalid credentials' };
  const token = signToken(user.id, user.role);
  return {
    token,
    user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name }
  };
}

export async function getUserById(id) {
  const [rows] = await pool.query(
    `SELECT id, email, role, full_name, phone, is_active, created_at FROM users WHERE id = :id`,
    { id }
  );
  return rows[0] || null;
}
