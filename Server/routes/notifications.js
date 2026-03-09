import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  notifyPaymentMade,
  getNotifications,
  confirmRentPayment,
  confirmCommissionPayment,
  agentConfirmCommission,
  markAsRead,
  getUnreadCount
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Tenant notifies payment made
router.post('/payment-made', authorize('tenant'), notifyPaymentMade);

// Landlord confirms rent payment
router.post('/:id/confirm-rent', authorize('landlord'), confirmRentPayment);

// Landlord confirms commission payment sent
router.post('/:id/confirm-commission', authorize('landlord'), confirmCommissionPayment);

// Agent confirms commission received
router.post('/:id/agent-confirm', authorize('agent'), agentConfirmCommission);

// Mark as read
router.put('/:id/read', markAsRead);

export default router;