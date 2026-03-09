import Payment from '../models/Payment.js';
import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import Maintenance from '../models/Maintenance.js';
import Agent from '../models/Agent.js';

// ========== LANDLORD DASHBOARD ==========
export const getLandlordStats = async (req, res) => {
  try {
    const landlordId = req.user._id;

    // ✅ Total Revenue — Rent + Security Deposit (exclude Commission)
    const revenueResult = await Payment.aggregate([
      { $match: { landlordId, status: 'Completed', paymentType: { $in: ['Rent', 'Security Deposit'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Properties
    const properties = await Property.find({ landlordId, isArchived: { $ne: true } });
    const totalProperties = properties.length;
    const occupiedProperties = properties.filter(p => p.status === 'Occupied').length;
    const occupancyRate = totalProperties > 0
      ? Math.round((occupiedProperties / totalProperties) * 100)
      : 0;

    // Active Tenants
    const activeLeases = await Tenant.countDocuments({ landlordId, status: 'Active' });

    // ✅ Pending Maintenance — correct statuses are 'Open' and 'In Progress'
    const pendingMaintenance = await Maintenance.countDocuments({
      landlordId,
      status: { $in: ['Open', 'In Progress'] }
    });

    // ✅ Monthly Income Chart — Rent + Security Deposit
    const now = new Date();
    const monthlyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = date.toLocaleString('default', { month: 'short' });

      const result = await Payment.aggregate([
        {
          $match: {
            landlordId,
            status: 'Completed',
            paymentType: { $in: ['Rent', 'Security Deposit'] },
            paymentDate: { $gte: date, $lte: endDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      monthlyData.push({ name: monthName, income: result[0]?.total || 0 });
    }

    // Recent Activity
    const recentPayments = await Payment.find({ landlordId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('tenantName amount paymentType status createdAt');

    const recentMaintenance = await Maintenance.find({ landlordId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('issue status createdAt propertyName');

    const activity = [
      ...recentPayments.map(p => ({
        text: `${p.paymentType} payment of $${p.amount.toLocaleString()} from ${p.tenantName}`,
        date: p.createdAt,
        status: p.status === 'Completed' ? 'success' : 'warning'
      })),
      ...recentMaintenance.map(m => ({
        text: `Maintenance request: ${m.issue} at ${m.propertyName}`,
        date: m.createdAt,
        status: m.status === 'Open' ? 'warning' : m.status === 'Completed' ? 'success' : 'info'
      }))
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(item => ({ ...item, date: timeAgo(item.date) }));

    res.json({
      status: 'success',
      data: {
        totalRevenue,
        occupancyRate,
        activeLeases,
        pendingMaintenance,
        monthlyData,
        recentActivity: activity
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ========== TENANT DASHBOARD ==========
export const getTenantStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const tenant = await Tenant.findOne({ userId, status: 'Active' });
    if (!tenant) {
      return res.json({ status: 'success', data: { tenant: null } });
    }

    let daysUntilExpiry = null;
    if (tenant.leaseEnd) {
      const diff = new Date(tenant.leaseEnd) - new Date();
      daysUntilExpiry = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    const now = new Date();
    const nextDueDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const myRequests = await Maintenance.find({ reportedBy: { $in: [userId, tenant._id] }, reporterRole: 'tenant' })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('issue status createdAt category propertyName');

    // ✅ Match by userId OR tenant._id (manual logs may use tenant doc _id)
const tenantIdMatch = { $in: [userId, tenant._id] };

const lastPayment = await Payment.findOne({
  tenantId: tenantIdMatch,
  paymentType: 'Rent',
  status: 'Completed'
}).sort({ createdAt: -1 });

const depositPayment = await Payment.findOne({
  tenantId: tenantIdMatch,
  paymentType: 'Security Deposit',
  status: 'Completed'
}).sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: {
        propertyName: tenant.propertyName,
        rentAmount: tenant.monthlyRent,
        // ✅ Use confirmed payment amount if exists, else fall back to tenant record
        securityDeposit: depositPayment?.amount || tenant.securityDeposit || 0,
        nextDueDate: nextDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        daysUntilExpiry,
        myRequests: myRequests.map(r => ({
          title: r.issue,
          status: r.status,
          date: r.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          location: r.category || ''
        })),
        lastPaymentDate: lastPayment?.paymentDate
          ? new Date(lastPayment.paymentDate).toLocaleDateString()
          : null
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ========== AGENT DASHBOARD ==========
export const getAgentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const agent = await Agent.findOne({ userId });
    if (!agent) {
      return res.json({ status: 'success', data: { agent: null } });
    }

    const managedProperties = await Property.find({
      agentId: userId,
      isArchived: { $ne: true }
    });
    const totalListings = managedProperties.length;
    const propertyIds = managedProperties.map(p => p._id);

    const activeTenants = await Tenant.countDocuments({
      propertyId: { $in: propertyIds },
      status: 'Active'
    });

    const commissionMatch = {
      paymentType: 'Commission',
      status: 'Completed',
      $or: [
        { propertyId: { $in: propertyIds } },
        { loggedBy: userId }
      ]
    };

    const commissionResult = await Payment.aggregate([
      { $match: commissionMatch },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCommissions = commissionResult[0]?.total || 0;

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthResult = await Payment.aggregate([
      { $match: { ...commissionMatch, paymentDate: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const thisMonthCommissions = thisMonthResult[0]?.total || 0;

    const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
    const lastMonthResult = await Payment.aggregate([
      { $match: { ...commissionMatch, paymentDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const lastMonthCommissions = lastMonthResult[0]?.total || 0;

    const commissionChange = lastMonthCommissions > 0
      ? Math.round(((thisMonthCommissions - lastMonthCommissions) / lastMonthCommissions) * 100)
      : 0;

    const now = new Date();
    const monthlyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const result = await Payment.aggregate([
        { $match: { ...commissionMatch, paymentDate: { $gte: date, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      monthlyData.push({
        name: date.toLocaleString('default', { month: 'short' }),
        commissions: result[0]?.total || 0
      });
    }

    res.json({
      status: 'success',
      data: {
        totalListings,
        activeTenants,
        totalCommissions,
        thisMonthCommissions,
        commissionChange,
        lastMonthCommissions,
        monthlyData
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ========== HELPER ==========
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 172800) return '1 day ago';
  return `${Math.floor(seconds / 86400)} days ago`;
}