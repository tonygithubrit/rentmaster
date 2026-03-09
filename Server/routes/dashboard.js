import express from 'express';
import { getLandlordStats, getTenantStats, getAgentStats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/landlord', protect, authorize('landlord'), getLandlordStats);
router.get('/tenant', protect, authorize('tenant'), getTenantStats);
router.get('/agent', protect, authorize('agent'), getAgentStats);

export default router;