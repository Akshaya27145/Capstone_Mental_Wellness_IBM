import { useEffect, useState } from 'react';
import { appointmentApi, therapistSelfApi } from '../api/client.js';

export default function TherapistDashboard() {
  const [profile, setProfile] = useState(null);
  const [appts, setAppts] = useState([]);
  const [slotDate, setSlotDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function refresh() {
    const [p, a] = await Promise.all([therapistSelfApi.myProfile(), appointmentApi.list()]);
    setProfile(p.therapist);
    setAppts(a.appointments || []);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);

  async function addSlot(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await therapistSelfApi.addSlot({ slotDate, startTime, endTime });
      setMsg('Slot added');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirm(id) {
    setError('');
    try {
      await appointmentApi.confirm(id);
      setMsg('Confirmed');
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function complete(id) {
    setError('');
    try {
      await appointmentApi.complete(id);
      setMsg('Marked complete');
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section data-testid="therapist-dashboard">
      <h2>Therapist dashboard</h2>
      {profile && (
        <p className="muted">
          {profile.fullName} — {profile.specialization}
        </p>
      )}
      {error && <div className="alert error">{error}</div>}
      {msg && <div className="alert success">{msg}</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Add availability</h3>
        <form onSubmit={addSlot} data-testid="form-add-slot">
          <div className="form-row">
            <label>Date</label>
            <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} required data-testid="input-slot-date" />
          </div>
          <div className="grid cols-2">
            <div className="form-row">
              <label>Start</label>
              <input value={startTime} onChange={(e) => setStartTime(e.target.value)} data-testid="input-slot-start" />
            </div>
            <div className="form-row">
              <label>End</label>
              <input value={endTime} onChange={(e) => setEndTime(e.target.value)} data-testid="input-slot-end" />
            </div>
          </div>
          <button type="submit" className="btn" data-testid="btn-add-slot">
            Add slot
          </button>
        </form>
      </div>

      <h3>Upcoming for you</h3>
      <div data-testid="therapist-appointment-list">
        {appts.map((a) => (
          <div key={a.id} className="card" style={{ marginBottom: '0.65rem' }}>
            <p>
              <strong>{a.patient_name}</strong> · {String(a.scheduled_start).replace('T', ' ').slice(0, 16)}
            </p>
            <p className="muted">{a.status_label}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {a.status_code === 'PENDING' && (
                <button type="button" className="btn secondary" onClick={() => confirm(a.id)} data-testid={`btn-confirm-${a.id}`}>
                  Confirm
                </button>
              )}
              {a.status_code === 'CONFIRMED' && (
                <button type="button" className="btn" onClick={() => complete(a.id)} data-testid={`btn-complete-${a.id}`}>
                  Mark completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
