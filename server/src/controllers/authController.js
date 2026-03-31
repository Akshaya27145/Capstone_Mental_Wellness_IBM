import * as authService from '../services/authService.js';

export async function register(req, res) {
  try {
    const { email, password, role, fullName, phone } = req.body;
    const user = await authService.registerUser({ email, password, role, fullName, phone });
    res.status(201).json({ user });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    if (result.error) return res.status(401).json({ error: result.error });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function me(req, res) {
  try {
    const row = await authService.getUserById(req.user.id);
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json({
      user: {
        id: row.id,
        email: row.email,
        role: row.role,
        fullName: row.full_name,
        phone: row.phone,
        isActive: Boolean(row.is_active)
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load profile' });
  }
}
