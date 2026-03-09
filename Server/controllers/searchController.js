import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import Maintenance from '../models/Maintenance.js';
import Payment from '../models/Payment.js';

// @desc    Global search across all collections
// @route   GET /api/search?q=query
// @access  Private
export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ status: 'error', message: 'Search query must be at least 2 characters' });
    }

    const query = q.trim();
    const regex = new RegExp(query, 'i');
    const userId = req.user.id;
    const userRole = req.user.role;
    const numericValue = parseFloat(query);
    const isNumeric = !isNaN(numericValue);

    let properties = [], tenants = [], maintenance = [], payments = [];

    if (userRole === 'landlord' || userRole === 'agent') {

      // Build property query
      const propertyOr = [
        { name: regex },
        { address: regex },
        { type: regex },
        { status: regex },
        { city: regex }
      ];
      // If numeric, also search rent
      if (isNumeric) {
        propertyOr.push({ rent: numericValue });
        propertyOr.push({ rent: { $gte: numericValue * 0.9, $lte: numericValue * 1.1 } }); // ±10% range
      }

      properties = await Property.find({
        landlordId: userId,
        $or: propertyOr
      }).select('name address type status rent city').limit(5);

      // Search tenants
      const tenantOr = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { propertyName: regex },
        { status: regex }
      ];
      if (isNumeric) {
        tenantOr.push({ monthlyRent: numericValue });
        tenantOr.push({ securityDeposit: numericValue });
      }

      tenants = await Tenant.find({
        landlordId: userId,
        $or: tenantOr
      }).select('name email phone propertyName status monthlyRent').limit(5);

      // Search maintenance
      maintenance = await Maintenance.find({
        landlordId: userId,
        $or: [
          { title: regex },
          { description: regex },
          { propertyName: regex },
          { status: regex },
          { priority: regex }
        ]
      }).select('title description propertyName status priority createdAt').limit(5);

      // Search payments
      const paymentOr = [
        { tenantName: regex },
        { propertyName: regex },
        { status: regex },
        { type: regex }
      ];
      if (isNumeric) {
        paymentOr.push({ amount: numericValue });
        paymentOr.push({ amount: { $gte: numericValue * 0.9, $lte: numericValue * 1.1 } });
        paymentOr.push({ commissionAmount: numericValue });
      }

      payments = await Payment.find({
        landlordId: userId,
        $or: paymentOr
      }).select('tenantName propertyName amount status type commissionAmount createdAt').limit(5);

    } else if (userRole === 'tenant') {
      tenants = await Tenant.find({
        userId,
        $or: [{ name: regex }, { propertyName: regex }]
      }).select('name email propertyName status monthlyRent').limit(5);

      maintenance = await Maintenance.find({
        tenantId: userId,
        $or: [{ title: regex }, { description: regex }, { status: regex }]
      }).select('title description propertyName status priority createdAt').limit(5);

      const paymentOr = [
        { propertyName: regex },
        { status: regex },
        { type: regex }
      ];
      if (isNumeric) {
        paymentOr.push({ amount: numericValue });
      }

      payments = await Payment.find({
        tenantId: userId,
        $or: paymentOr
      }).select('tenantName propertyName amount status type createdAt').limit(5);
    }

    const total = properties.length + tenants.length + maintenance.length + payments.length;

    res.status(200).json({
      status: 'success',
      data: { query, total, properties, tenants, maintenance, payments }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ status: 'error', message: 'Search failed' });
  }
};