import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentApi, therapistApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Appointments() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [rescheduleFor, setRescheduleFor] = useState(null);
  const [resSlots, setResSlots] = useState([]);
  const [pickedSlot, setPickedSlot] = useState('');

  async function load() {
    setError('');
    try {
      const r = await appointmentApi.list();
      setItems(r.appointments || []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openReschedule(row) {
    setRescheduleFor(row);
    setPickedSlot('');
    const tid = row.therapist_profile_id;
    const from = new Date().toISOString().slice(0, 10);
    const to = new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10);
    const s = await therapistApi.slots(tid, from, to);
    setResSlots((s.slots || []).filter((x) => !x.isBooked));
  }

  async function doCancel(id) {
    setMsg('');
    try {
      await appointmentApi.cancel(id);
      setMsg('Appointment cancelled');
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function doPay(id) {
    setMsg('');
    try {
      await appointmentApi.pay(id, 'card_simulated');
      setMsg('Payment completed (simulated)');
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function doReschedule() {
    if (!rescheduleFor) return;
    if (!pickedSlot) {
      setError('Please select a time slot');
      return;
    }
    setError('');
    try {
      await appointmentApi.reschedule(rescheduleFor.id, Number(pickedSlot));
      setRescheduleFor(null);
      setMsg('Rescheduled');
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function submitReview(apptId) {
    const rating = Number(document.getElementById(`rating-${apptId}`).value);
    const comment = document.getElementById(`comment-${apptId}`).value;
    setError('');
    try {
      await appointmentApi.review(apptId, { rating, comment });
      setMsg('Thank you for your review');
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section data-testid="appointments-page">
      <h2>Your appointments</h2>
      {error && (
        <div className="alert error" data-testid="appointments-error">
          {error}
        </div>
      )}
      {msg && (
        <div className="alert success" data-testid="appointments-msg">
          {msg}
        </div>
      )}
      <div data-testid="appointment-list">
        {items.map((a) => (
          <div key={a.id} className="card" style={{ marginBottom: '0.85rem' }} data-testid={`appointment-row-${a.id}`}>
            <p>
              <strong>
                {user.role === 'patient' ? a.therapist_name : a.patient_name}
              </strong>{' '}
              · {String(a.scheduled_start).replace('T', ' ').slice(0, 16)}
            </p>
            <p className="muted">
              Status: {a.status_label} · Payment: {a.payment_status || 'none'}
            </p>
            {user.role === 'patient' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['PENDING', 'CONFIRMED'].includes(a.status_code) && (
                  <>
                    <button type="button" className="btn secondary" onClick={() => openReschedule(a)} data-testid={`btn-reschedule-${a.id}`}>
                      Reschedule
                    </button>
                    <button type="button" className="btn ghost" onClick={() => doCancel(a.id)} data-testid={`btn-cancel-${a.id}`}>
                      Cancel
                    </button>
                  </>
                )}
                {a.status_code === 'CONFIRMED' && a.payment_status !== 'completed' && (
                  <button type="button" className="btn" onClick={() => doPay(a.id)} data-testid={`btn-pay-${a.id}`}>
                    Pay now (simulated)
                  </button>
                )}
                {a.status_code === 'CONFIRMED' && (
                  <Link to={`/session/${a.id}`}>
                    <button type="button" className="btn secondary" data-testid={`btn-open-session-${a.id}`}>
                      Open session room
                    </button>
                  </Link>
                )}
                {a.status_code === 'COMPLETED' && Number(a.has_review) !== 1 && (
                  <div style={{ marginTop: '0.5rem', width: '100%' }}>
                    <label className="muted">Rate session</label>
                    <div className="form-row" style={{ flexDirection: 'row', gap: '0.5rem', alignItems: 'center' }}>
                      <select id={`rating-${a.id}`} defaultValue="5" data-testid={`select-review-rating-${a.id}`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <input id={`comment-${a.id}`} placeholder="Comment" data-testid={`input-review-comment-${a.id}`} />
                      <button type="button" className="btn secondary" onClick={() => submitReview(a.id)} data-testid={`btn-submit-review-${a.id}`}>
                        Submit review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {rescheduleFor && (
        <div className="card" style={{ marginTop: '1rem' }} data-testid="reschedule-panel">
          <h3>Pick a new slot</h3>
          <select value={pickedSlot} onChange={(e) => setPickedSlot(e.target.value)} data-testid="select-reschedule-slot">
            <option value="">Select…</option>
            {resSlots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.slotDate} {s.startTime}-{s.endTime}
              </option>
            ))}
          </select>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn" onClick={doReschedule} data-testid="btn-confirm-reschedule">
              Confirm reschedule
            </button>
            <button type="button" className="btn ghost" onClick={() => setRescheduleFor(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
