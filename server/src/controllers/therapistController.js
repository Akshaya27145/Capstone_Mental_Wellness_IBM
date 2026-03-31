import * as therapistService from '../services/therapistService.js';

export async function list(req, res) {
  try {
    const therapists = await therapistService.listTherapists(req.query);
    res.json({ therapists });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list therapists' });
  }
}

export async function getById(req, res) {
  try {
    const raw = String(req.params.id ?? '');
    const id = Number(raw);
    if (!raw || !Number.isInteger(id) || id < 1) {
      return res.status(404).json({ error: 'Therapist not found' });
    }
    const profile = await therapistService.getTherapistProfile(id);
    if (!profile) return res.status(404).json({ error: 'Therapist not found' });
    res.json({ therapist: profile });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load therapist' });
  }
}

export async function slots(req, res) {
  try {
    const raw = String(req.params.id ?? '');
    const pid = Number(raw);
    if (!raw || !Number.isInteger(pid) || pid < 1) {
      return res.status(404).json({ error: 'Therapist not found' });
    }
    const from = req.query.from || new Date().toISOString().slice(0, 10);
    const to = req.query.to || from;
    const list = await therapistService.listSlots(pid, from, to);
    res.json({ slots: list });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load slots' });
  }
}

export async function addSlot(req, res) {
  try {
    const r = await therapistService.addAvailabilitySlot(req.user.id, req.body);
    if (r.error) return res.status(400).json({ error: r.error });
    res.status(201).json({ slotId: r.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add slot' });
  }
}

export async function updateProfile(req, res) {
  try {
    const r = await therapistService.updateTherapistProfile(req.user.id, req.body);
    if (r.error) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Update failed' });
  }
}

export async function updateIssueTypes(req, res) {
  try {
    const r = await therapistService.setIssueTypes(req.user.id, req.body.issueTypes || []);
    if (r.error) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Update failed' });
  }
}

export async function myProfile(req, res) {
  try {
    const profile = await therapistService.getTherapistProfileForUser(req.user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ therapist: profile });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load profile' });
  }
}
