import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (form.password.length < 8) {
      setFieldErrors({ password: 'Minimum 8 characters' });
      return;
    }
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone || undefined,
        role: form.role
      });
      nav(form.role === 'therapist' ? '/therapist/dashboard' : '/therapists');
    } catch (err) {
      if (err.details?.length) {
        const fe = {};
        err.details.forEach((d) => {
          fe[d.path] = d.msg;
        });
        setFieldErrors(fe);
      }
      setError(err.message || 'Registration failed');
    }
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2>Create your account</h2>
      <form onSubmit={onSubmit} data-testid="form-register" noValidate>
        <div className="form-row">
          <label>Full name</label>
          <input
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            required
            minLength={2}
            data-testid="input-register-name"
          />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
            data-testid="input-register-email"
          />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            data-testid="input-register-password"
          />
          {fieldErrors.password && (
            <span className="alert error" data-testid="register-password-error">
              {fieldErrors.password}
            </span>
          )}
        </div>
        <div className="form-row">
          <label>Phone (optional)</label>
          <input value={form.phone} onChange={(e) => update('phone', e.target.value)} data-testid="input-register-phone" />
        </div>
        <div className="form-row">
          <label>I am a</label>
          <select value={form.role} onChange={(e) => update('role', e.target.value)} data-testid="select-register-role">
            <option value="patient">Patient</option>
            <option value="therapist">Therapist</option>
          </select>
        </div>
        {error && (
          <div className="alert error" data-testid="register-error">
            {error}
          </div>
        )}
        <button type="submit" className="btn" data-testid="btn-register-submit">
          Register
        </button>
      </form>
      <p className="muted" style={{ marginTop: '1rem' }}>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
