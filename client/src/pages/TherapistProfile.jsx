import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { therapistApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function TherapistProfile() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [therapist, setTherapist] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError('');
      try {
        const [t, rv] = await Promise.all([therapistApi.get(id), therapistApi.reviews(id)]);
        if (!cancelled) {
          setTherapist(t.therapist);
          setReviews(rv.reviews || []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) return <div className="alert error">{error}</div>;
  if (!therapist) return <p className="muted">Loading profile…</p>;

  return (
    <section data-testid="therapist-profile">
      <div className="card">
        <h2>{therapist.fullName}</h2>
        <p className="muted">{therapist.specialization}</p>
        <p>
          <strong>${therapist.hourlyRate}</strong>/hr · ⭐ {Number(therapist.ratingAverage).toFixed(2)} (
          {therapist.totalReviews} reviews)
        </p>
        <p className="muted">{therapist.yearsExperience} years experience</p>
        <p>{therapist.bio || 'This therapist has not added a bio yet.'}</p>
        <div style={{ marginTop: '0.75rem' }}>
          {therapist.issueTypes?.map((it) => (
            <span key={it} className="pill">
              {it}
            </span>
          ))}
        </div>
        {!loading && user?.role === 'patient' && (
          <div style={{ marginTop: '1rem' }}>
            <Link to={`/therapists/${id}/book`}>
              <button type="button" className="btn" data-testid="btn-book-session">
                Book a session
              </button>
            </Link>
          </div>
        )}
        {!loading && !user && (
          <p className="muted" style={{ marginTop: '1rem' }}>
            <Link to="/login">Log in as a patient</Link> to book.
          </p>
        )}
      </div>

      <h3 style={{ marginTop: '1.5rem' }}>Reviews</h3>
      <div data-testid="therapist-reviews-list">
        {reviews.length === 0 && <p className="muted">No public reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="card" style={{ marginBottom: '0.75rem' }} data-testid={`review-${r.id}`}>
            <strong>⭐ {r.rating}</strong> <span className="muted">— {r.patient_name}</span>
            <p>{r.comment || <em className="muted">No comment</em>}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
