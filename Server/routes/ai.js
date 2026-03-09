import express from 'express';
import { generateLease, getMarketInsights, askAI } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/lease', protect, generateLease);
router.post('/market', protect, getMarketInsights);
router.post('/ask', protect, askAI);

export default router;