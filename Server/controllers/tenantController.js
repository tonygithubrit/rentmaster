import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import User from '../models/User.js';

/**
 * @desc    Get all tenants (role-filtered)
 * @route   GET /api/tenants
 * @access  Private
 */
export const getTenants = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    let query = {};

      // Role-based filtering
    if (userRole === 'landlord') {
      // Landlords see only THEIR tenants
      query.landlordId = userId;
    } else if (userRole === 'agent') {
      // Agents should use /my-tenants instead
      return res.status(403).json({ status: 'error', message: 'Use /my-tenants endpoint' });
    } else if (userRole === 'tenant') {
      // Tenants see only their own record
      query.userId = userId;
    }

    const tenants = await Tenant.find(query)
      .populate('propertyId', 'name address city state')
      .populate('landlordId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: tenants.length,
      data: { tenants }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single tenant
 * @route   GET /api/tenants/:id
 * @access  Private
 */
export const getTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('propertyId', 'name address city state rent')
      .populate('landlordId', 'name email phone');

    if (!tenant) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }

    // Authorization check
    const userRole = req.user.role;
    const userId = req.user._id.toString();
    
    if (userRole === 'landlord' && tenant.landlordId._id.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this tenant'
      });
    }

    if (userRole === 'tenant' && tenant.userId.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this tenant'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { tenant }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new tenant
 * @route   POST /api/tenants
 * @access  Private (Landlord only)
 */
export const createTenant = async (req, res, next) => {
  try {
    // Only landlords can create tenants
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        status: 'error',
        message: 'Only landlords can add tenants'
      });
    }

    const {
      name,
      email,
      phone,
      propertyId,
      leaseStart,
      leaseEnd,
      monthlyRent,
      securityDeposit,
      emergencyContact,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !propertyId || !leaseStart || !leaseEnd || !monthlyRent) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }

    // Check if property exists and belongs to this landlord
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    if (property.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to add tenant to this property'
      });
    }

    // Check if tenant user exists
    let tenantUser = await User.findOne({ email, role: 'tenant' });
    
    // If tenant user doesn't exist, we'll store the userId as null for now
    // They can register later using the access code
    const userId = tenantUser ? tenantUser._id : null;

    // Create tenant
    const tenant = await Tenant.create({
      userId,
      name,
      email,
      phone,
      propertyId,
      propertyName: property.name,
      landlordId: req.user._id,
      leaseStart,
      leaseEnd,
      monthlyRent,
      securityDeposit: securityDeposit || 0,
      emergencyContact,
      notes,
      status: 'Active'
    });

    // Update property status to Occupied
    property.status = 'Occupied';
    property.tenantsCount = (property.tenantsCount || 0) + 1;
    property.tenantEmail = email;
    await property.save();

    res.status(201).json({
      status: 'success',
      data: { tenant }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update tenant
 * @route   PUT /api/tenants/:id
 * @access  Private (Landlord only)
 */
export const updateTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }

    // Authorization check
    if (req.user.role === 'landlord' && tenant.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this tenant'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'phone', 'leaseStart', 'leaseEnd', 'monthlyRent',
      'securityDeposit', 'status', 'emergencyContact', 'notes'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        tenant[field] = req.body[field];
      }
    });

    await tenant.save();

    res.status(200).json({
      status: 'success',
      data: { tenant }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete tenant
 * @route   DELETE /api/tenants/:id
 * @access  Private (Landlord only)
 */
export const deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }

    // Authorization check
    if (req.user.role === 'landlord' && tenant.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this tenant'
      });
    }

    // Update property status
    const property = await Property.findById(tenant.propertyId);
    if (property) {
      property.tenantsCount = Math.max(0, (property.tenantsCount || 1) - 1);
      if (property.tenantsCount === 0) {
        property.status = 'Vacant';
        property.tenantEmail = '';
      }
      await property.save();
    }

    await tenant.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark tenant as past tenant (lease ended)
 * @route   PUT /api/tenants/:id/mark-past
 * @access  Private (Landlord only)
 */
export const markAsPastTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }

    // Authorization check
    if (req.user.role === 'landlord' && tenant.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this tenant'
      });
    }

    tenant.status = 'Past';
    await tenant.save();

    // Update property status
    const property = await Property.findById(tenant.propertyId);
    if (property) {
      property.tenantsCount = Math.max(0, (property.tenantsCount || 1) - 1);
      if (property.tenantsCount === 0) {
        property.status = 'Vacant';
        property.tenantEmail = '';
      }
      await property.save();
    }

    res.status(200).json({
      status: 'success',
      data: { tenant }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tenants assigned to property manager's properties
 * @route   GET /api/tenants/my-tenants
 * @access  Private (Agent only)
 */
export const getMyTenants = async (req, res, next) => {
  try {
    // Get all properties assigned to this property manager
    const assignedProperties = await Property.find({ agentId: req.user._id }).select('_id');
    const propertyIds = assignedProperties.map(p => p._id);

    // Get tenants in those properties only
    const tenants = await Tenant.find({ propertyId: { $in: propertyIds } })
      .populate('propertyId', 'name address city state')
      .populate('landlordId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: tenants.length,
      data: { tenants }
    });
  } catch (error) {
    next(error);
  }
};