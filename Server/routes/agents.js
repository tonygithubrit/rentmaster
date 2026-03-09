import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentProperties,
  getAgentCommissions
} from '../controllers/agentController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get ALL registered agents (for property assignment dropdown)
router.get('/registered', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    
    // Get all users with role='agent'
    const registeredAgents = await User.find({ 
      role: 'agent',
      isActive: true
    }).select('name email phone commissionRate').sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      count: registeredAgents.length,
      data: { agents: registeredAgents }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching registered agents'
    });
  }
});

// Get all agents & Create agent
router.route('/')
  .get(getAgents)
  .post(authorize('landlord'), createAgent);

// Single agent operations
router.route('/:id')
  .get(getAgent)
  .put(updateAgent)
  .delete(authorize('landlord'), deleteAgent);

// Agent's properties
router.get('/:id/properties', getAgentProperties);

// Agent's commissions
router.get('/:id/commissions', getAgentCommissions);

export default router;