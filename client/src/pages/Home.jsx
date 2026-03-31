import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  return (
    <section>
      <h1>Find calm, book care</h1>
      <p className="muted" style={{ maxWidth: 520 }}>
        CalmCare connects patients with licensed therapists. Browse profiles, filter by focus area and availability, book
        sessions, and manage your wellness journey in one place.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
        <Link to="/therapists">
          <button type="button" className="btn" data-testid="home-browse">
            Browse therapists
          </button>
        </Link>
        {!user && (
          <Link to="/register">
            <button type="button" className="btn secondary">
              Create account
            </button>
          </Link>
        )}
      </div>
      <div className="mock-session" style={{ marginTop: '2rem' }} data-testid="session-ui-mock">
        <h3 style={{ marginTop: 0, color: '#fff' }}>Session preview</h3>
        <p style={{ opacity: 0.85, marginBottom: 0 }}>
          When it is time for your appointment, open your session room for a focused, distraction-free space (UI mock — no
          video backend).
        </p>
      </div>
    </section>
  );
}
