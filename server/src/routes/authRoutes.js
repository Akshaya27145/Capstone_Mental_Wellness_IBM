import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { handleValidation } from '../middleware/handleValidation.js';

const router = Router();

const registerRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
  body('role').isIn(['patient', 'therapist']),
  body('fullName').trim().isLength({ min: 2, max: 200 }),
  body('phone').optional().trim().isLength({ max: 40 })
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

router.post('/register', registerRules, handleValidation, authController.register);
router.post('/login', loginRules, handleValidation, authController.login);
router.get('/me', requireAuth, authController.me);

export default router;
