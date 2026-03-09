import Payment from '../models/Payment.js';
import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';

/**
 * @desc    Get all payments (role-filtered)
 * @route   GET /api/payments
 * @access  Private
 */
export const getPayments = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    let query = {};

    // Role-based filtering
    if (userRole === 'landlord') {
      // Landlords see only payments for THEIR properties
      query.landlordId = userId;
    } else if (userRole === 'agent') {
      // Agents see ALL payments system-wide
      query = {};
    } else if (userRole === 'tenant') {
      // Tenants see only their own payments
      query.tenantId = userId;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by payment type if provided
    if (req.query.paymentType) {
      query.paymentType = req.query.paymentType;
    }

    // Filter by date range if provided
    if (req.query.startDate || req.query.endDate) {
      query.paymentDate = {};
      if (req.query.startDate) {
        query.paymentDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.paymentDate.$lte = new Date(req.query.endDate);
      }
    }

    const payments = await Payment.find(query)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'name address')
      .populate('landlordId', 'name email')
      .sort({ paymentDate: -1 });

    res.status(200).json({
      status: 'success',
      count: payments.length,
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single payment
 * @route   GET /api/payments/:id
 * @access  Private
 */
export const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'name address')
      .populate('landlordId', 'name email');

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    // Authorization check
    const userRole = req.user.role;
    const userId = req.user._id.toString();
    
    if (userRole === 'landlord' && payment.landlordId._id.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this payment'
      });
    }

    if (userRole === 'tenant' && payment.tenantId._id.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new payment
 * @route   POST /api/payments
 * @access  Private (Landlord only)
 */
export const createPayment = async (req, res, next) => {
  try {
    // Only landlords and agents can log payments
    // Landlords: Can log rent payments
    // Agents: Can log commission payments
    if (req.user.role !== 'landlord' && req.user.role !== 'agent') {
      return res.status(403).json({
        status: 'error',
        message: 'Only landlords and agents can log payments'
      });
    }

    const {
      tenantId,
      propertyId,
      amount,
      paymentDate,
      paymentMethod,
      paymentType,
      referenceNumber,
      paymentPeriod,
      status,
      notes
    } = req.body;

    // Validate required fields
    if (!tenantId || !propertyId || !amount || !paymentDate || !paymentMethod) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide tenant, property, amount, date, and payment method'
      });
    }

    // Agent-specific validation
    if (req.user.role === 'agent') {
      // Agents can ONLY log commission payments
      if (paymentType !== 'Commission') {
        return res.status(403).json({
          status: 'error',
          message: 'Agents can only log commission payments'
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

      // Verify this agent is assigned to the property
      if (!property.agentId || property.agentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only log commissions for properties assigned to you'
        });
      }

      // Create commission payment
      const payment = await Payment.create({
        tenantId, // Agent is the recipient (stored in tenantId field)
        tenantName: req.user.name,
        propertyId,
        propertyName: property.name,
        landlordId: property.landlordId,
        amount,
        paymentDate,
        paymentMethod,
        paymentType: 'Commission',
        referenceNumber,
        paymentPeriod,
        status: status || 'Completed',
        notes,
        loggedBy: req.user._id
      });

      return res.status(201).json({
        status: 'success',
        data: { payment }
      });
    }

    // Landlord logic (original code)
    // Get tenant details
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }

    // Verify tenant belongs to this landlord
    if (tenant.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to log payment for this tenant'
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

    // Verify property belongs to this landlord
    if (property.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to log payment for this property'
      });
    }

    // Create payment
    const payment = await Payment.create({
      tenantId: tenant.userId || tenantId,
      tenantName: tenant.name,
      propertyId,
      propertyName: property.name,
      landlordId: req.user._id,
      amount,
      paymentDate,
      paymentMethod,
      paymentType: paymentType || 'Rent',
      referenceNumber,
      paymentPeriod,
      status: status || 'Completed',
      notes,
      loggedBy: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update payment
 * @route   PUT /api/payments/:id
 * @access  Private (Landlord only)
 */
export const updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    // Only landlord who created it can update
    if (req.user.role !== 'landlord' || payment.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this payment'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'amount', 'paymentDate', 'paymentMethod', 'paymentType',
      'referenceNumber', 'paymentPeriod', 'status', 'notes'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        payment[field] = req.body[field];
      }
    });

    await payment.save();

    res.status(200).json({
      status: 'success',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete payment
 * @route   DELETE /api/payments/:id
 * @access  Private (Landlord only)
 */
export const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    // Only landlord who created it can delete
    if (req.user.role !== 'landlord' || payment.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this payment'
      });
    }

    await payment.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment statistics
 * @route   GET /api/payments/stats
 * @access  Private (Landlord only)
 */
export const getPaymentStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        status: 'error',
        message: 'Only landlords can view payment statistics'
      });
    }

    const landlordId = req.user._id;

    // Total revenue
    const totalRevenue = await Payment.aggregate([
      { $match: { landlordId: landlordId, status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Revenue this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueThisMonth = await Payment.aggregate([
      {
        $match: {
          landlordId: landlordId,
          status: 'Completed',
          paymentDate: { $gte: firstDayOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Pending payments
    const pendingPayments = await Payment.countDocuments({
      landlordId: landlordId,
      status: 'Pending'
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        revenueThisMonth: revenueThisMonth[0]?.total || 0,
        pendingPayments
      }
    });
  } catch (error) {
    next(error);
  }
};