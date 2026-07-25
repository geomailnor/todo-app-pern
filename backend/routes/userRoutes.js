import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getProfile, updateProfile, changePassword, deleteProfile } from '../controllers/userController.js';

const router = express.Router();

// Всички заявки изискват валиден JWT токен
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.delete('/me', authenticate, deleteProfile);

export default router;