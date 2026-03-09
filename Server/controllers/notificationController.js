import Notification from '../models/Notification.js';
import Payment from '../models/Payment.js';
import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import Agent from '../models/Agent.js';
import User from '../models/User.js';

/**
 * @desc    Tenant initiates payment notification
 * @route   POST /api/notifications/payment-made
 * @access  Private (Tenant only)
 */
export const notifyPaymentMade = async (req, res, next) => {
  try {
    if (req.user.role !== 'tenant') {
      return res.status(403).json({
        status: 'error',
        message: 'Only tenants can notify about payments'
      });
    }

const {
  amount,
  paymentDate,
  paymentMethod,
  referenceNumber,
  paymentPeriod,
  notes,
  paymentType,
  receiptImage
} = req.body;

    // Get tenant's property and landlord info
    const tenant = await Tenant.findOne({ userId: req.user._id })
      .populate('propertyId')
      .populate('landlordId');

    if (!tenant) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant record not found'
      });
    }

    const property = tenant.propertyId;
    const landlordId = tenant.landlordId;

    // Create notification for landlord
    const isDeposit = paymentType === 'Security Deposit';
const notification = await Notification.create({
  recipientId: landlordId,
  recipientRole: 'landlord',
  type: isDeposit ? 'security_deposit_pending' : 'rent_payment_pending',
  title: isDeposit ? '🔒 Security Deposit Notification' : '💰 New Rent Payment Notification',
  message: `${tenant.name} has made a ${isDeposit ? 'security deposit' : 'rent payment'} of $${amount.toLocaleString()} for ${property.name}. Please confirm once you receive the payment.`,
      paymentData: {
        amount,
        paymentType: isDeposit ? 'Security Deposit' : 'Rent',
        propertyId: property._id,
        propertyName: property.name,
        tenantId: req.user._id,
        tenantName: tenant.name,
        landlordId: landlordId._id,
        paymentDate: paymentDate || new Date(),
        paymentMethod,
        referenceNumber,
        paymentPeriod,
        notes,
        receiptImage: receiptImage || null
      },
      status: 'pending'
    });

    res.status(201).json({
      status: 'success',
      message: 'Payment notification sent to landlord',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res, next) => {
  try {
    const query = {
      recipientId: req.user._id,
      recipientRole: req.user.role
    };

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const notifications = await Notification.find(query)
      .populate('paymentData.propertyId', 'name address')
      .populate('paymentData.tenantId', 'name email')
      .populate('paymentData.agentId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      status: 'success',
      count: notifications.length,
      data: { notifications }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Landlord confirms rent payment
 * @route   POST /api/notifications/:id/confirm-rent
 * @access  Private (Landlord only)
 */
export const confirmRentPayment = async (req, res, next) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        status: 'error',
        message: 'Only landlords can confirm rent payments'
      });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    if (notification.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to confirm this payment'
      });
    }

    if (notification.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Payment already processed'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      tenantId: notification.paymentData.tenantId,
      tenantName: notification.paymentData.tenantName,
      propertyId: notification.paymentData.propertyId,
      propertyName: notification.paymentData.propertyName,
      landlordId: req.user._id,
      amount: notification.paymentData.amount,
      paymentDate: notification.paymentData.paymentDate,
      paymentMethod: notification.paymentData.paymentMethod,
      paymentType: notification.paymentData.paymentType || 'Rent',
      referenceNumber: notification.paymentData.referenceNumber,
      paymentPeriod: notification.paymentData.paymentPeriod,
      status: 'Completed',
      notes: notification.paymentData.notes,
      loggedBy: req.user._id
    });

    // Update notification
    notification.status = 'confirmed';
    notification.confirmedAt = new Date();
    notification.confirmedBy = req.user._id;
    notification.paymentId = payment._id;
    await notification.save();

   // Only calculate commission for Rent payments, not Security Deposit
const isDeposit = notification.paymentData.paymentType === 'Security Deposit';
const property = await Property.findById(notification.paymentData.propertyId).populate('agentId');

if (!isDeposit && property && property.agentId) {
      // Get agent details
      const agent = await Agent.findOne({ userId: property.agentId._id });
      
      if (agent) {
        // Calculate commission
        const commissionAmount = (notification.paymentData.amount * agent.commissionRate) / 100;

        // Create commission notification for LANDLORD (to pay)
        await Notification.create({
          recipientId: req.user._id,
          recipientRole: 'landlord',
          type: 'commission_payment_pending',
          title: '💼 Commission Payment Due',
          message: `Please pay commission of $${commissionAmount.toLocaleString()} to ${agent.name} for ${property.name}.`,
          paymentData: {
            amount: commissionAmount,
            propertyId: property._id,
            propertyName: property.name,
            tenantId: notification.paymentData.tenantId,
            tenantName: notification.paymentData.tenantName,
            agentId: property.agentId._id,
            agentName: agent.name,
            landlordId: req.user._id,
            paymentDate: new Date(),
            paymentMethod: 'Bank Transfer',
            referenceNumber: `COMM-${payment._id.toString().slice(-8).toUpperCase()}`,
            paymentPeriod: notification.paymentData.paymentPeriod,
          },
          status: 'pending'
        });

        // Create commission notification for AGENT (to track)
        await Notification.create({
          recipientId: property.agentId._id,
          recipientRole: 'agent',
          type: 'commission_payment_pending',
          title: '💼 Commission Payment Due',
          message: `Your commission of $${commissionAmount.toLocaleString()} for ${property.name} is ready. Waiting for landlord to process payment.`,
          paymentData: {
            amount: commissionAmount,
            propertyId: property._id,
            propertyName: property.name,
            tenantId: notification.paymentData.tenantId,
            tenantName: notification.paymentData.tenantName,
            agentId: property.agentId._id,
            agentName: agent.name,
            landlordId: req.user._id,
            paymentDate: new Date(),
            paymentMethod: 'Bank Transfer',
            referenceNumber: `COMM-${payment._id.toString().slice(-8).toUpperCase()}`,
            paymentPeriod: notification.paymentData.paymentPeriod
          },
          status: 'pending'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment confirmed successfully',
      data: { 
        payment,
        agentNotificationCreated: !!(property && property.agentId)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Landlord confirms commission payment to agent
 * @route   POST /api/notifications/:id/confirm-commission
 * @access  Private (Landlord only)
 */
export const confirmCommissionPayment = async (req, res, next) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({
        status: 'error',
        message: 'Only landlords can confirm commission payments'
      });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    if (notification.paymentData.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to confirm this commission'
      });
    }

    if (notification.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Commission already processed'
      });
    }

    // Update landlord's notification
    notification.status = 'confirmed';
    notification.confirmedAt = new Date();
    notification.confirmedBy = req.user._id;
    await notification.save();

    // Also update the agent's notification to 'confirmed' so they can confirm receipt
    await Notification.findOneAndUpdate(
      {
        'paymentData.agentId': notification.paymentData.agentId,
        'paymentData.referenceNumber': notification.paymentData.referenceNumber,
        recipientRole: 'agent',
        type: 'commission_payment_pending'
      },
      {
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmedBy: req.user._id
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Commission payment confirmed. Agent can now confirm receipt.',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Agent confirms commission received
 * @route   POST /api/notifications/:id/agent-confirm
 * @access  Private (Agent only)
 */
export const agentConfirmCommission = async (req, res, next) => {
  try {
    if (req.user.role !== 'agent') {
      return res.status(403).json({
        status: 'error',
        message: 'Only agents can confirm commission receipt'
      });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    if (notification.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to confirm this commission'
      });
    }

    if (notification.status !== 'confirmed') {
      return res.status(400).json({
        status: 'error',
        message: 'Commission not yet paid by landlord'
      });
    }

    if (notification.paymentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Commission already recorded'
      });
    }

    // Create commission payment record
    const payment = await Payment.create({
      tenantId: notification.paymentData.agentId, // Agent is the recipient
      tenantName: notification.paymentData.agentName,
      propertyId: notification.paymentData.propertyId,
      propertyName: notification.paymentData.propertyName,
      landlordId: notification.paymentData.landlordId,
      amount: notification.paymentData.amount,
      paymentDate: notification.paymentData.paymentDate,
      paymentMethod: notification.paymentData.paymentMethod,
      paymentType: 'Commission',
      referenceNumber: notification.paymentData.referenceNumber,
      paymentPeriod: notification.paymentData.paymentPeriod,
      status: 'Completed',
      notes: `Commission payment for ${notification.paymentData.propertyName}`,
      loggedBy: req.user._id
    });

    // Link payment to notification
    notification.paymentId = payment._id;
    await notification.save();

    res.status(200).json({
      status: 'success',
      message: 'Commission receipt confirmed',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    if (notification.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
      status: 'pending'
    });

    res.status(200).json({
      status: 'success',
      data: { count }
    });
  } catch (error) {
    next(error);
  }
};