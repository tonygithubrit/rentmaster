import Maintenance from '../models/Maintenance.js';
import Notification from '../models/Notification.js';
import Property from '../models/Property.js';

/**
 * @desc    Get all maintenance requests (role-filtered)
 * @route   GET /api/maintenance
 * @access  Private
 */
export const getMaintenanceRequests = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    let query = {};

    // Role-based filtering
    if (userRole === 'landlord') {
      // Landlords see only THEIR property maintenance
      query.landlordId = userId;
    } else if (userRole === 'agent') {
      // Agents see only maintenance for their assigned properties
      const assignedProperties = await Property.find({ agentId: userId }).select('_id');
      query.propertyId = { $in: assignedProperties.map(p => p._id) };
    } else if (userRole === 'tenant') {
      // Tenants see only their own requests
      query.reportedBy = userId;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by priority if provided
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    const maintenanceRequests = await Maintenance.find(query)
      .populate('propertyId', 'name address city state')
      .populate('landlordId', 'name email phone')
      .populate('reportedBy', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: maintenanceRequests.length,
      data: { maintenanceRequests }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single maintenance request
 * @route   GET /api/maintenance/:id
 * @access  Private
 */
export const getMaintenanceRequest = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('propertyId', 'name address city state')
      .populate('landlordId', 'name email phone')
      .populate('reportedBy', 'name email phone');

    if (!maintenance) {
      return res.status(404).json({
        status: 'error',
        message: 'Maintenance request not found'
      });
    }

    // Authorization check
    const userRole = req.user.role;
    const userId = req.user._id.toString();
    
    if (userRole === 'landlord' && maintenance.landlordId._id.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this maintenance request'
      });
    }

    if (userRole === 'tenant' && maintenance.reportedBy._id.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this maintenance request'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { maintenance }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new maintenance request
 * @route   POST /api/maintenance
 * @access  Private
 */
export const createMaintenanceRequest = async (req, res, next) => {
  try {
    const {
      propertyId,
      issue,
      description,
      category,
      priority
    } = req.body;

    // Validate required fields
    if (!propertyId || !issue) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide property and issue description'
      });
    }

    // Get property details
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Authorization check - ensure user has access to this property
    const userRole = req.user.role;
    if (userRole === 'tenant' && property._id.toString() !== req.user.propertyId?.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to create maintenance request for this property'
      });
    }

    if (userRole === 'landlord' && property.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to create maintenance request for this property'
      });
    }

    // Create maintenance request
    const maintenance = await Maintenance.create({
  propertyId,
  propertyName: property.name,
  landlordId: property.landlordId,
  reportedBy: req.user._id,
  reporterName: req.user.name,
  reporterRole: req.user.role,
  issue,
  description,
  category: category || 'Other',
  priority: priority || 'Medium',
  status: 'Open'
});

// 🔔 Notify landlord of new maintenance request
await Notification.create({
  recipientId: property.landlordId,
  recipientRole: 'landlord',
  type: 'maintenance_request',
  title: `🔧 New Maintenance Request`,
  message: `${req.user.name} reported: "${issue}" at ${property.name}. Priority: ${priority || 'Medium'}.`,
  status: 'pending'
});

// 🔔 Also notify property manager if assigned
if (property.agentId) {
  await Notification.create({
    recipientId: property.agentId,
    recipientRole: 'agent',
    type: 'maintenance_request',
    title: `🔧 New Maintenance Request`,
    message: `${req.user.name} reported: "${issue}" at ${property.name}. Priority: ${priority || 'Medium'}.`,
    status: 'pending'
  });
}

    res.status(201).json({
      status: 'success',
      data: { maintenance }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update maintenance request
 * @route   PUT /api/maintenance/:id
 * @access  Private (Landlord only for most fields)
 */
export const updateMaintenanceRequest = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        status: 'error',
        message: 'Maintenance request not found'
      });
    }

    // Authorization check
    const userRole = req.user.role;
    if (userRole === 'landlord' && maintenance.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this maintenance request'
      });
    }

    // Tenants can only update their own requests and only certain fields
    if (userRole === 'tenant') {
      if (maintenance.reportedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this maintenance request'
        });
      }
      
      // Tenants can only update description and notes
      const allowedUpdates = ['description', 'notes'];
      Object.keys(req.body).forEach(key => {
        if (!allowedUpdates.includes(key)) {
          delete req.body[key];
        }
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'issue', 'description', 'category', 'priority', 'status',
      'assignedTo', 'estimatedCost', 'actualCost', 'scheduledDate',
      'completedDate', 'notes'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        maintenance[field] = req.body[field];
      }
    });

    // If status is changed to Completed, set completedDate
    if (req.body.status === 'Completed' && !maintenance.completedDate) {
      maintenance.completedDate = new Date();
    }

    // Add update note
    if (req.body.updateMessage) {
      maintenance.updates.push({
        message: req.body.updateMessage,
        updatedBy: req.user.name,
        updatedAt: new Date()
      });
    }

    await maintenance.save();

    res.status(200).json({
      status: 'success',
      data: { maintenance }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete maintenance request
 * @route   DELETE /api/maintenance/:id
 * @access  Private (Landlord only)
 */
export const deleteMaintenanceRequest = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        status: 'error',
        message: 'Maintenance request not found'
      });
    }

    // Only landlords can delete
    if (req.user.role !== 'landlord' || maintenance.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this maintenance request'
      });
    }

    await maintenance.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Maintenance request deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update maintenance status
 * @route   PUT /api/maintenance/:id/status
 * @access  Private (Landlord only)
 */
export const updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { status, updateMessage } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status is required'
      });
    }

    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        status: 'error',
        message: 'Maintenance request not found'
      });
    }

    // Authorization check
    if (req.user.role === 'landlord' && maintenance.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this maintenance request'
      });
    }

    maintenance.status = status;

    // If status is Completed, set completedDate
    if (status === 'Completed' && !maintenance.completedDate) {
      maintenance.completedDate = new Date();
    }

    // Add update note
    if (updateMessage) {
      maintenance.updates.push({
        message: updateMessage,
        updatedBy: req.user.name,
        updatedAt: new Date()
      });
    }

    await maintenance.save();

    res.status(200).json({
      status: 'success',
      data: { maintenance }
    });
  } catch (error) {
    next(error);
  }
};