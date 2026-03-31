import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      nav('/therapists');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h2>Welcome back</h2>
      <form onSubmit={onSubmit} data-testid="form-login">
        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="input-login-email"
          />
        </div>
        <div className="form-row">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="input-login-password"
          />
        </div>
        {error && (
          <div className="alert error" data-testid="login-error">
            {error}
          </div>
        )}
        <button type="submit" className="btn" data-testid="btn-login-submit">
          Sign in
        </button>
      </form>
      <p className="muted" style={{ marginTop: '1rem' }}>
        New here? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
