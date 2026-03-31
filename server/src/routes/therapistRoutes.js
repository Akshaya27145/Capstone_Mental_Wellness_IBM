import { Router } from 'express';
import { body, query } from 'express-validator';
import * as therapistController from '../controllers/therapistController.js';
import * as reviewController from '../controllers/reviewController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { handleValidation } from '../middleware/handleValidation.js';

const router = Router();

router.get(
  '/',
  [
    query('issueType').optional().isString(),
    query('minRate').optional().isFloat({ min: 0 }),
    query('maxRate').optional().isFloat({ min: 0 }),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
    query('availableDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    query('search').optional().isString()
  ],
  handleValidation,
  therapistController.list
);

router.get('/me/profile', requireAuth, requireRole('therapist'), therapistController.myProfile);

router.get('/:id/reviews', (req, res, next) => {
  const raw = String(req.params.id ?? '');
  const id = Number(raw);
  if (!raw || !Number.isInteger(id) || id < 1) {
    return res.status(404).json({ error: 'Therapist not found' });
  }
  next();
}, reviewController.listForTherapist);
router.get('/:id', therapistController.getById);
router.get(
  '/:id/slots',
  [
    query('from').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    query('to').optional().matches(/^\d{4}-\d{2}-\d{2}$/)
  ],
  handleValidation,
  therapistController.slots
);

router.post(
  '/me/slots',
  requireAuth,
  requireRole('therapist'),
  [
    body('slotDate').matches(/^\d{4}-\d{2}-\d{2}$/),
    body('startTime').matches(/^\d{2}:\d{2}(:\d{2})?$/),
    body('endTime').matches(/^\d{2}:\d{2}(:\d{2})?$/)
  ],
  handleValidation,
  therapistController.addSlot
);

router.patch(
  '/me/profile',
  requireAuth,
  requireRole('therapist'),
  [
    body('specialization').optional().trim().isLength({ min: 2, max: 200 }),
    body('bio').optional().trim().isLength({ max: 5000 }),
    body('yearsExperience').optional().isInt({ min: 0, max: 60 }),
    body('hourlyRate').optional().isFloat({ gt: 0, lt: 10000 })
  ],
  handleValidation,
  therapistController.updateProfile
);

router.put(
  '/me/issue-types',
  requireAuth,
  requireRole('therapist'),
  [body('issueTypes').isArray({ min: 1 }), body('issueTypes.*').isString().trim().isLength({ min: 2, max: 80 })],
  handleValidation,
  therapistController.updateIssueTypes
);

export default router;
