import Property from '../models/Property.js';

// Helper to generate access code
const generateAccessCode = () => {
  const prefix = 'RENT';
  const random1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const random2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${random1}-${random2}`;
};

// @desc    Get all properties (filtered by role)
// @route   GET /api/properties
// @access  Private
export const getProperties = async (req, res) => {
  try {
    let query = {};

    // AGENTS see ALL properties (system-wide)
    if (req.user.role === 'agent') {
      query = {}; // No filter - get all properties
    } 
    // LANDLORDS see only their properties
    else if (req.user.role === 'landlord') {
      query = { landlordId: req.user.id };
    }
    // TENANTS see only their property
    else if (req.user.role === 'tenant') {
      query = { _id: req.user.propertyId };
    }

    // Apply filters if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    const properties = await Property.find(query)
      .populate('landlordId', 'name email phone')
      .populate('agentId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: properties.length,
      data: {
        properties
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching properties'
    });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Private
export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('landlordId', 'name email phone')
      .populate('agentId', 'name email phone');

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Check authorization
    // Agents can view all properties
    // Landlords can only view their properties
    // Tenants can only view their property
    if (req.user.role === 'landlord' && property.landlordId._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this property'
      });
    }

    if (req.user.role === 'tenant' && property._id.toString() !== req.user.propertyId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this property'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        property
      }
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching property'
    });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Landlord only)
export const createProperty = async (req, res) => {
  try {
    // Generate unique access code
    let accessCode;
    let isUnique = false;
    
    while (!isUnique) {
      accessCode = generateAccessCode();
      const existing = await Property.findOne({ accessCode });
      if (!existing) isUnique = true;
    }

    // Create property with landlord info
    const propertyData = {
      ...req.body,
      landlordId: req.user.id,
      landlordName: req.user.name,
      accessCode,
      accessCodeUsed: false,
      status: 'Vacant',
      tenantsCount: 0
    };

    const property = await Property.create(propertyData);

    // Auto-add agent to landlord's contacts if assigned and not already added
    if (req.body.agentId) {
      const Agent = (await import('../models/Agent.js')).default;
      const User = (await import('../models/User.js')).default;
      
      // Check if agent is already in landlord's contacts
      const existingAgentContact = await Agent.findOne({
        userId: req.body.agentId,
        landlordId: req.user.id
      });

      if (!existingAgentContact) {
        // Get agent user details
        const agentUser = await User.findById(req.body.agentId).select('name email phone');
        
        if (agentUser) {
          // Auto-add to landlord's agent contacts
          await Agent.create({
            userId: agentUser._id,
            name: agentUser.name,
            email: agentUser.email,
            phone: agentUser.phone,
            bankName: agentUser.bankDetails?.bankName || '',
            accountName: agentUser.bankDetails?.accountName || '',
            accountNumber: agentUser.bankDetails?.accountNumber || '',
            routingNumber: agentUser.bankDetails?.routingNumber || '',
            commissionRate: agentUser.commissionRate || 5,
            paymentNote: agentUser.bankDetails?.paymentNote || '',
            landlordId: req.user.id,
            isActive: true
          });
          console.log('✅ Auto-added agent to landlord contacts');
        }
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        property,
        accessCode // Return access code to show to landlord
      }
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error creating property'
    });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Landlord only - own properties)
export const updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Check if user owns this property
    if (property.landlordId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this property'
      });
    }

    // Don't allow updating landlordId or accessCode through this route
    delete req.body.landlordId;
    delete req.body.accessCode;
    delete req.body.accessCodeUsed;

    // Auto-add agent to landlord's contacts if assigned and not already added
    if (req.body.agentId) {
      const Agent = (await import('../models/Agent.js')).default;
      const User = (await import('../models/User.js')).default;
      
      // Check if agent is already in landlord's contacts
      const existingAgentContact = await Agent.findOne({
        userId: req.body.agentId,
        landlordId: req.user.id
      });

      if (!existingAgentContact) {
        // Get agent user details
        const agentUser = await User.findById(req.body.agentId).select('name email phone bankDetails commissionRate');
        
        if (agentUser) {
          // Auto-add to landlord's agent contacts
          await Agent.create({
            userId: agentUser._id,
            name: agentUser.name,
            email: agentUser.email,
            phone: agentUser.phone,
            bankName: agentUser.bankDetails?.bankName || '',
            accountName: agentUser.bankDetails?.accountName || '',
            accountNumber: agentUser.bankDetails?.accountNumber || '',
            routingNumber: agentUser.bankDetails?.routingNumber || '',
            commissionRate: agentUser.commissionRate || 5,
            paymentNote: agentUser.bankDetails?.paymentNote || '',
            landlordId: req.user.id,
            isActive: true
          });
          console.log('✅ Auto-added agent to landlord contacts');
        }
      }
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        property
      }
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating property'
    });
  }
};

// @desc    Archive property
// @route   PUT /api/properties/:id/archive
// @access  Private (Landlord only - own properties)
export const archiveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Check if user owns this property
    if (property.landlordId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to archive this property'
      });
    }

    property.status = 'Archived';
    property.archiveReason = req.body.reason;
    property.archiveNotes = req.body.notes;
    property.archivedAt = new Date();
    property.archivedBy = req.user.id;

    await property.save();

    res.status(200).json({
      status: 'success',
      data: {
        property
      }
    });
  } catch (error) {
    console.error('Archive property error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error archiving property'
    });
  }
};

// @desc    Restore archived property
// @route   PUT /api/properties/:id/restore
// @access  Private (Landlord only - own properties)
export const restoreProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Check if user owns this property
    if (property.landlordId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to restore this property'
      });
    }

    property.status = 'Vacant';
    property.archiveReason = undefined;
    property.archiveNotes = undefined;
    property.archivedAt = undefined;
    property.archivedBy = undefined;

    await property.save();

    res.status(200).json({
      status: 'success',
      data: {
        property
      }
    });
  } catch (error) {
    console.error('Restore property error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error restoring property'
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Landlord only - own properties)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Check if user owns this property
    if (property.landlordId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this property'
      });
    }

    await property.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting property'
    });
  }
};

// @desc    Validate access code
// @route   POST /api/properties/validate-access-code
// @access  Public
export const validateAccessCode = async (req, res) => {
  try {
    const { accessCode } = req.body;

    if (!accessCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Access code is required'
      });
    }

    const property = await Property.findOne({ 
      accessCode: accessCode.toUpperCase()
    });

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid or already used access code'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        valid: true,
        property: {
          id: property._id,
          name: property.name,
          address: property.address
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error validating access code'
    });
  }
};