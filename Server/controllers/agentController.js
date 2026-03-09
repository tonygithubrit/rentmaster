import Agent from '../models/Agent.js';
import User from '../models/User.js';
import Property from '../models/Property.js';

/**
 * @desc    Get all agents (role-filtered)
 * @route   GET /api/agents
 * @access  Private
 */
export const getAgents = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    let query = {};

    // Role-based filtering
    if (userRole === 'landlord') {
      // Landlords see only THEIR agents
      query.landlordId = userId;
    } else if (userRole === 'agent') {
      // Agents see all agents (for collaboration)
      query = {};
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view agents'
      });
    }

    const agents = await Agent.find(query)
      .populate('userId', 'name email phone')
      .populate('landlordId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: agents.length,
      data: { agents }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single agent
 * @route   GET /api/agents/:id
 * @access  Private
 */
export const getAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('landlordId', 'name email phone');

    if (!agent) {
      return res.status(404).json({
        status: 'error',
        message: 'Agent not found'
      });
    }

    // Authorization check
    const userRole = req.user.role;
    const userId = req.user._id.toString();
    
    if (userRole === 'landlord' && agent.landlordId._id.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this agent'
      });
    }

    if (userRole === 'agent' && agent.userId && agent.userId.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this agent'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { agent }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new agent
 * @route   POST /api/agents
 * @access  Private (Landlord only)
 */
export const createAgent = async (req, res, next) => {
  try {
    // Only landlords can create agents
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        status: 'error',
        message: 'Only landlords can add agents'
      });
    }

    const {
      name,
      email,
      phone,
      bankName,
      accountName,
      accountNumber,
      routingNumber,
      commissionRate,
      paymentNote
    } = req.body;

    // Validate required fields (only basic info required)
    if (!name || !email || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, and phone'
      });
    }

    // Check if agent user exists
    let agentUser = await User.findOne({ email, role: 'agent' });
    
    // If agent user doesn't exist, we'll store the userId as null for now
    // They can register later using their email
    const userId = agentUser ? agentUser._id : null;

    // Check if agent record already exists for this landlord
    const existingAgent = await Agent.findOne({ 
      email, 
      landlordId: req.user._id 
    });

    if (existingAgent) {
      return res.status(400).json({
        status: 'error',
        message: 'You already have an agent with this email'
      });
    }

    // Create agent record
    const agent = await Agent.create({
      userId,
      name,
      email,
      phone,
      bankName: bankName || '',
      accountName: accountName || '',
      accountNumber: accountNumber || '',
      routingNumber: routingNumber || '',
      commissionRate: commissionRate || 5,
      paymentNote: paymentNote || '',
      landlordId: req.user._id,
      isActive: true
    });

    res.status(201).json({
      status: 'success',
      data: { agent }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update agent
 * @route   PUT /api/agents/:id
 * @access  Private (Landlord only)
 */
export const updateAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        status: 'error',
        message: 'Agent not found'
      });
    }

    // Authorization check
    if (req.user.role === 'landlord' && agent.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this agent'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'phone', 'bankName', 'accountName', 'accountNumber', 
      'routingNumber', 'commissionRate', 'paymentNote'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        agent[field] = req.body[field];
      }
    });

    await agent.save();

    res.status(200).json({
      status: 'success',
      data: { agent }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete agent
 * @route   DELETE /api/agents/:id
 * @access  Private (Landlord only)
 */
export const deleteAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        status: 'error',
        message: 'Agent not found'
      });
    }

    // Only landlord who created it can delete
    if (req.user.role !== 'landlord' || agent.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this agent'
      });
    }

    // Check if agent is assigned to any properties
    const assignedProperties = await Property.countDocuments({ 
      agentId: agent._id,
      landlordId: req.user._id
    });

    if (assignedProperties > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete agent. They are assigned to ${assignedProperties} propert${assignedProperties > 1 ? 'ies' : 'y'}. Please unassign them first.`
      });
    }

    await agent.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get agent's assigned properties
 * @route   GET /api/agents/:id/properties
 * @access  Private
 */
export const getAgentProperties = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        status: 'error',
        message: 'Agent not found'
      });
    }

    // Get properties assigned to this agent
    const properties = await Property.find({ agentId: agent._id })
      .populate('landlordId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: properties.length,
      data: { properties }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get agent commission stats
 * @route   GET /api/agents/:id/commissions
 * @access  Private
 */
export const getAgentCommissions = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        status: 'error',
        message: 'Agent not found'
      });
    }

    // Authorization check
    const userRole = req.user.role;
    const isLandlord = userRole === 'landlord' && agent.landlordId.toString() === req.user._id.toString();
    const isAgent = userRole === 'agent' && agent.userId && agent.userId.toString() === req.user._id.toString();

    if (!isLandlord && !isAgent) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view commission data'
      });
    }

    // Import Payment model
    const Payment = (await import('../models/Payment.js')).default;

    // Get commission payments for this agent
    // Note: Agent is stored as tenantId in payments (since Payment model uses tenantId for recipient)
    const commissions = await Payment.find({
      tenantId: agent.userId || agent._id,
      paymentType: 'Commission'
    }).populate('propertyId', 'name address')
      .populate('landlordId', 'name email')
      .sort({ paymentDate: -1 });

    // Calculate totals
    const totalEarned = commissions
      .filter(c => c.status === 'Completed')
      .reduce((sum, c) => sum + c.amount, 0);

    const pendingAmount = commissions
      .filter(c => c.status === 'Pending')
      .reduce((sum, c) => sum + c.amount, 0);

    res.status(200).json({
      status: 'success',
      data: {
        totalEarned,
        pendingAmount,
        commissionCount: commissions.length,
        commissions
      }
    });
  } catch (error) {
    next(error);
  }
};