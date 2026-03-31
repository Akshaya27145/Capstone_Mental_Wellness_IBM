import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { therapistApi } from '../api/client.js';

const ISSUES = ['anxiety', 'depression', 'trauma', 'relationships', 'family'];

export default function BrowseTherapists() {
  const [therapists, setTherapists] = useState([]);
  const [filters, setFilters] = useState({
    issueType: '',
    minRate: '',
    maxRate: '',
    minRating: '',
    availableDate: '',
    search: ''
  });
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null));
      const r = await therapistApi.list(params);
      setTherapists(r.therapists || []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFilterSubmit(e) {
    e.preventDefault();
    load();
  }

  return (
    <section>
      <h2>Therapists</h2>
      <p className="muted">Filter by issue focus, rate, rating, and who has open slots on a date.</p>

      <form className="card" onSubmit={onFilterSubmit} data-testid="form-therapist-filters" style={{ marginBottom: '1.25rem' }}>
        <div className="grid cols-3">
          <div className="form-row">
            <label>Issue type</label>
            <select
              value={filters.issueType}
              onChange={(e) => setFilters((f) => ({ ...f, issueType: e.target.value }))}
              data-testid="filter-issue"
            >
              <option value="">Any</option>
              {ISSUES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Min rate</label>
            <input
              type="number"
              value={filters.minRate}
              onChange={(e) => setFilters((f) => ({ ...f, minRate: e.target.value }))}
              data-testid="filter-min-rate"
            />
          </div>
          <div className="form-row">
            <label>Max rate</label>
            <input
              type="number"
              value={filters.maxRate}
              onChange={(e) => setFilters((f) => ({ ...f, maxRate: e.target.value }))}
              data-testid="filter-max-rate"
            />
          </div>
          <div className="form-row">
            <label>Min rating</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={filters.minRating}
              onChange={(e) => setFilters((f) => ({ ...f, minRating: e.target.value }))}
              data-testid="filter-min-rating"
            />
          </div>
          <div className="form-row">
            <label>Available on (YYYY-MM-DD)</label>
            <input
              placeholder="2026-03-25"
              value={filters.availableDate}
              onChange={(e) => setFilters((f) => ({ ...f, availableDate: e.target.value }))}
              data-testid="filter-available-date"
            />
          </div>
          <div className="form-row">
            <label>Search</label>
            <input
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              data-testid="filter-search"
            />
          </div>
        </div>
        <button type="submit" className="btn" data-testid="btn-apply-filters">
          Apply filters
        </button>
      </form>

      {error && <div className="alert error">{error}</div>}

      <div className="grid cols-2" data-testid="therapist-list">
        {therapists.map((t) => (
          <article key={t.id} className="card therapist-card" data-testid={`therapist-card-${t.id}`}>
            <h3>{t.fullName}</h3>
            <p className="muted">{t.specialization}</p>
            <p>
              <strong>${t.hourlyRate}</strong>/hr · ⭐{' '}
              <span data-testid="therapist-card-rating">{Number(t.ratingAverage || 0).toFixed(2)}</span> ({t.totalReviews}{' '}
              reviews)
            </p>
            <p className="muted">{t.yearsExperience} yrs experience</p>
            <div>
              {t.issueTypes?.map((it) => (
                <span key={it} className="pill">
                  {it}
                </span>
              ))}
            </div>
            <Link to={`/therapists/${t.id}`} data-testid={`link-profile-${t.id}`}>
              View profile
            </Link>
          </article>
        ))}
      </div>
      {!therapists.length && !error && <p className="muted">No therapists match your filters.</p>}
    </section>
  );
}
