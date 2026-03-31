import jwt from 'jsonwebtoken';

export function signToken(userId, role) {
  return jwt.sign(
    { role },
    process.env.JWT_SECRET || 'dev_secret',
    { subject: String(userId), expiresIn: '7d' }
  );
}
