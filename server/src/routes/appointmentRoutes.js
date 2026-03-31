import { Router } from 'express';
import { body, param } from 'express-validator';
import * as appointmentController from '../controllers/appointmentController.js';
import * as paymentController from '../controllers/paymentController.js';
import * as reviewController from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';
import { handleValidation } from '../middleware/handleValidation.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  [
    body('therapistProfileId').isInt(),
    body('slotId').isInt(),
    body('patientNotes').optional().trim().isLength({ max: 500 })
  ],
  handleValidation,
  appointmentController.book
);

router.get('/', requireAuth, appointmentController.listMine);

router.patch(
  '/:id/cancel',
  requireAuth,
  [param('id').isInt()],
  handleValidation,
  appointmentController.cancel
);

router.patch(
  '/:id/reschedule',
  requireAuth,
  [param('id').isInt(), body('newSlotId').isInt()],
  handleValidation,
  appointmentController.reschedule
);

router.patch(
  '/:id/confirm',
  requireAuth,
  [param('id').isInt()],
  handleValidation,
  appointmentController.confirm
);

router.patch(
  '/:id/complete',
  requireAuth,
  [param('id').isInt()],
  handleValidation,
  appointmentController.complete
);

router.post(
  '/:id/pay',
  requireAuth,
  [param('id').isInt(), body('method').optional().isIn(['card_simulated', 'wallet_simulated'])],
  handleValidation,
  paymentController.pay
);

router.post('/:id/pay-fail', requireAuth, [param('id').isInt()], handleValidation, paymentController.payFail);

router.post(
  '/:id/reviews',
  requireAuth,
  [
    param('id').isInt(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim().isLength({ max: 2000 })
  ],
  handleValidation,
  reviewController.create
);

export default router;
