import * as appointmentService from '../services/appointmentService.js';

export async function book(req, res) {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can book' });
    }
    const r = await appointmentService.bookAppointment(req.user.id, req.body);
    if (r.error) return res.status(400).json({ error: r.error });
    res.status(201).json({ appointmentId: r.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Booking failed' });
  }
}

export async function listMine(req, res) {
  try {
    const appointments = await appointmentService.listAppointmentsForUser(req.user.id, req.user.role);
    res.json({ appointments });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list appointments' });
  }
}

export async function cancel(req, res) {
  try {
    const r = await appointmentService.cancelAppointment(req.user.id, req.user.role, Number(req.params.id));
    if (r.error) {
      const code = r.error === 'Forbidden' ? 403 : r.error === 'Appointment not found' ? 404 : 400;
      return res.status(code).json({ error: r.error });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Cancel failed' });
  }
}

export async function reschedule(req, res) {
  try {
    const r = await appointmentService.rescheduleAppointment(
      req.user.id,
      req.user.role,
      Number(req.params.id),
      Number(req.body.newSlotId)
    );
    if (r.error) {
      const code = r.error === 'Forbidden' ? 403 : r.error === 'Appointment not found' ? 404 : 400;
      return res.status(code).json({ error: r.error });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Reschedule failed' });
  }
}

export async function confirm(req, res) {
  try {
    const r = await appointmentService.confirmAppointment(req.user.id, Number(req.params.id));
    if (r.error) {
      const code = r.error === 'Forbidden' ? 403 : 400;
      return res.status(code).json({ error: r.error });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Confirm failed' });
  }
}

export async function complete(req, res) {
  try {
    const r = await appointmentService.completeAppointment(req.user.id, Number(req.params.id));
    if (r.error) {
      const code = r.error === 'Forbidden' ? 403 : 400;
      return res.status(code).json({ error: r.error });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Complete failed' });
  }
}
