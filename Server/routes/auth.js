import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  updateBankDetails,
  getLandlordBankDetails,
  getAgentBankDetails,
  verifyEmail,
  resendOTP,
  changeEmail,
  updateNotificationPreferences
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";
const router = express.Router();


// Public routes
router.post('/register', register);
router.post('/login', login);

// Email verification routes (protected)
router.post('/verify-email', protect, verifyEmail);
router.post('/resend-otp', protect, resendOTP);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/bank-details', protect, updateBankDetails);
router.put('/change-email', protect, changeEmail);
router.put('/notification-preferences', protect, updateNotificationPreferences);

// Tenant gets landlord bank details
router.get('/landlord-bank-details', protect, authorize('tenant'), getLandlordBankDetails);

// Landlord gets agent bank details
router.get('/agent-bank-details/:agentId', protect, authorize('landlord'), getAgentBankDetails);

// router.get('/test-email', async (req, res) => {
//   try {
//     const nodemailer = await import('nodemailer');
//     const transporter = nodemailer.default.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });
//     await transporter.verify();
//     res.json({ status: 'success', message: 'Gmail connected!', user: process.env.EMAIL_USER, passLength: process.env.EMAIL_PASS?.length });
//   } catch (error) {
//     res.json({ status: 'error', message: error.message, code: error.code, user: process.env.EMAIL_USER, passLength: process.env.EMAIL_PASS?.length });
//   }
// });

export default router;