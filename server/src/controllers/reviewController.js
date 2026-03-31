import * as reviewService from '../services/reviewService.js';

export async function create(req, res) {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Only patients can review' });
    const r = await reviewService.addReview(req.user.id, Number(req.params.id), req.body);
    if (r.error) {
      const code = r.error === 'Forbidden' ? 403 : r.error === 'Appointment not found' ? 404 : 400;
      return res.status(code).json({ error: r.error });
    }
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Review failed' });
  }
}

export async function listForTherapist(req, res) {
  try {
    const reviews = await reviewService.listReviewsForTherapist(Number(req.params.id));
    res.json({ reviews });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
}
