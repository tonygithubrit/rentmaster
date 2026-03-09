import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentStats
} from '../controllers/paymentController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get payment statistics (landlord only)
router.get('/stats', authorize('landlord'), getPaymentStats);

// Get all payments & Create payment
router.route('/')
  .get(getPayments)
  .post(authorize('landlord', 'agent'), createPayment); // Allow both landlord and agent

// Single payment operations
router.route('/:id')
  .get(getPayment)
  .put(authorize('landlord'), updatePayment)
  .delete(authorize('landlord'), deletePayment);

export default router;