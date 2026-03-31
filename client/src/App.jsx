import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BrowseTherapists from './pages/BrowseTherapists.jsx';
import TherapistProfile from './pages/TherapistProfile.jsx';
import BookSession from './pages/BookSession.jsx';
import Appointments from './pages/Appointments.jsx';
import TherapistDashboard from './pages/TherapistDashboard.jsx';
import SessionRoom from './pages/SessionRoom.jsx';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="layout muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="topbar">
        <Link to="/" className="brand" data-testid="nav-brand">
          CalmCare
        </Link>
        <nav className="nav">
          <Link to="/therapists">Therapists</Link>
          {user && (
            <>
              <Link to="/appointments" data-testid="nav-appointments">
                Appointments
              </Link>
              {user.role === 'therapist' && (
                <Link to="/therapist/dashboard" data-testid="nav-therapist-dashboard">
                  Dashboard
                </Link>
              )}
            </>
          )}
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">
                <button type="button" className="btn secondary">
                  Register
                </button>
              </Link>
            </>
          )}
          {user && (
            <button type="button" className="btn ghost" onClick={logout} data-testid="btn-logout">
              Log out ({user.fullName})
            </button>
          )}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/therapists" element={<BrowseTherapists />} />
        <Route path="/therapists/:id" element={<TherapistProfile />} />
        <Route
          path="/therapists/:id/book"
          element={
            <PrivateRoute roles={['patient']}>
              <BookSession />
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <PrivateRoute>
              <Appointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/therapist/dashboard"
          element={
            <PrivateRoute roles={['therapist']}>
              <TherapistDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/session/:appointmentId"
          element={
            <PrivateRoute>
              <SessionRoom />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
