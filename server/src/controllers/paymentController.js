import * as paymentService from '../services/paymentService.js';

export async function pay(req, res) {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Only patients can pay' });
    const r = await paymentService.simulatePayment(req.user.id, Number(req.params.id), req.body || {});
    if (r.error) {
      const code = r.error === 'Forbidden' ? 403 : r.error === 'Appointment not found' ? 404 : 400;
      return res.status(code).json({ error: r.error });
    }
    res.json(r);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Payment failed' });
  }
}

export async function payFail(req, res) {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Only patients can pay' });
    const r = await paymentService.simulatePaymentFailure(req.user.id, Number(req.params.id));
    if (r.error) {
      const code = r.error === 'Forbidden' ? 403 : 404;
      return res.status(code).json({ error: r.error });
    }
    res.json(r);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Payment update failed' });
  }
}
