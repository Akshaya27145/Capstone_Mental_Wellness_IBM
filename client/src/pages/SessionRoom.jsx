import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { appointmentApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function SessionRoom() {
  const { appointmentId } = useParams();
  const { user, loading } = useAuth();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    if (!user || loading) return;
    let cancel = false;
    (async () => {
      try {
        const r = await appointmentApi.list();
        const rows = r.appointments || [];
        const id = Number(appointmentId);
        const ok = rows.some((a) => Number(a.id) === id && (user.role === 'patient' || user.role === 'therapist'));
        if (!cancel) setAllowed(ok);
      } catch {
        if (!cancel) setAllowed(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [user, loading, appointmentId]);

  if (loading) return <p className="muted">Checking session…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowed === null) return <p className="muted">Checking session…</p>;
  if (!allowed) return <Navigate to="/appointments" replace />;

  return (
    <section className="mock-session" data-testid="session-room">
      <h2 style={{ color: '#fff', marginTop: 0 }}>Session room</h2>
      <p style={{ opacity: 0.9 }}>Appointment #{appointmentId}</p>
      <p style={{ opacity: 0.8, maxWidth: 480 }}>
        This is a UI mock for a therapy session space. In production, this would embed secure video or audio per compliance
        requirements.
      </p>
    </section>
  );
}
