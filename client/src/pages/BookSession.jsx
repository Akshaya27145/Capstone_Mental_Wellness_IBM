import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { appointmentApi, therapistApi } from '../api/client.js';

export default function BookSession() {
  const { id } = useParams();
  const nav = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const from = new Date().toISOString().slice(0, 10);
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + 21);
  const to = toDate.toISOString().slice(0, 10);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [t, s] = await Promise.all([therapistApi.get(id), therapistApi.slots(id, from, to)]);
        if (!c) {
          setTherapist(t.therapist);
          setSlots((s.slots || []).filter((x) => !x.isBooked));
        }
      } catch (e) {
        if (!c) setError(e.message);
      }
    })();
    return () => {
      c = true;
    };
  }, [id, from, to]);

  async function book() {
    setError('');
    setSuccess('');
    if (!selected) {
      setError('Select a time slot');
      return;
    }
    try {
      await appointmentApi.book({
        therapistProfileId: Number(id),
        slotId: selected,
        patientNotes: notes || undefined
      });
      setSuccess('Booked successfully');
      setTimeout(() => nav('/appointments'), 2500);
    } catch (e) {
      setError(e.message);
    }
  }

  if (!therapist && !error) return <p className="muted">Loading…</p>;

  return (
    <section data-testid="book-session">
      <Link to={`/therapists/${id}`}>← Back to profile</Link>
      <h2 style={{ marginTop: '1rem' }}>Book with {therapist?.fullName}</h2>
      {error && (
        <div className="alert error" data-testid="book-error">
          {error}
        </div>
      )}
      {success && (
        <div className="alert success" data-testid="book-success">
          {success}
        </div>
      )}
      <div className="form-row">
        <label>Notes for therapist (optional)</label>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-book-notes" />
      </div>
      <h3>Available slots</h3>
      <div className="grid cols-2" data-testid="book-slot-list">
        {slots.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`slot-btn ${selected === s.id ? 'selected' : ''}`}
            onClick={() => setSelected(s.id)}
            data-testid={`slot-${s.id}`}
          >
            {s.slotDate} · {s.startTime} – {s.endTime}
          </button>
        ))}
      </div>
      {!slots.length && <p className="muted">No open slots in the next few weeks.</p>}
      <button type="button" className="btn" style={{ marginTop: '1rem' }} onClick={book} data-testid="btn-confirm-booking">
        Confirm booking
      </button>
    </section>
  );
}
