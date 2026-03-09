import User from "../models/User.js";
import Property from "../models/Property.js";
import { generateToken } from "../utils/jwt.js";
import nodemailer from "nodemailer";

// // ─── Email transporter ───────────────────────────────────────────────────────
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// ─── Generate 6-digit OTP ────────────────────────────────────────────────────
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─── Send verification email ─────────────────────────────────────────────────
const sendVerificationEmail = async (email, name, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"RentalMS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Verify Your Email — RentalMS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-bottom: 8px;">Hi ${name} 👋</h2>
        <p style="color: #64748b; margin-bottom: 24px;">Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
        <div style="background: #fff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #2563eb;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, accessCode, ...roleSpecificData } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User with this email already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Validate access code for tenants
    if (role === 'tenant') {
      if (!accessCode) {
        return res.status(400).json({ status: 'error', message: 'Access code is required for tenant registration' });
      }

      const property = await Property.findOne({ accessCode: accessCode.toUpperCase() });
      if (!property) {
        return res.status(400).json({ status: 'error', message: 'Invalid or already used access code' });
      }

      const user = await User.create({
        name, email, password, phone, role,
        propertyId: property._id,
        propertyName: property.name,
        propertyAddress: property.address,
        emailOTP: otp,
        emailOTPExpires: otpExpires
      });

      const Tenant = (await import('../models/Tenant.js')).default;
      let tenantRecord = await Tenant.findOne({ email });
      if (!tenantRecord) {
        tenantRecord = await Tenant.create({
          userId: user._id, name, email, phone,
          propertyId: property._id, propertyName: property.name,
          landlordId: property.landlordId,
          leaseStart: new Date(),
          leaseEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          monthlyRent: property.rent, securityDeposit: 0,
          status: 'Active', notes: 'Auto-created from tenant registration'
        });
      } else {
        tenantRecord.userId = user._id;
        await tenantRecord.save();
      }

      property.tenantEmail = email;
      property.status = 'Occupied';
      property.tenantsCount = (property.tenantsCount || 0) + 1;
      await property.save();

      // Send OTP email
      try { await sendVerificationEmail(user.email, user.name, otp); } catch (e) { console.error('Email error FULL:', e.message, e.code, e.response); }

      const token = generateToken(user._id);
      return res.status(201).json({ status: 'success', data: { user: user.getPublicProfile(), token } });
    }

    // Landlord or agent
    const user = await User.create({
      name, email, password, phone, role,
      emailOTP: otp,
      emailOTPExpires: otpExpires,
      ...roleSpecificData
    });

    // Send OTP email
    try { await sendVerificationEmail(user.email, user.name, otp); } catch (e) { console.error('Email error FULL:', e.message, e.code, e.response); }

    const token = generateToken(user._id);
    res.status(201).json({ status: 'success', data: { user: user.getPublicProfile(), token } });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Error registering user' });
  }
};

// @desc    Verify email OTP
// @route   POST /api/auth/verify-email
// @access  Private
export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id).select('+emailOTP +emailOTPExpires');

    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ status: 'error', message: 'Email already verified' });
    if (!user.emailOTP || !user.emailOTPExpires) return res.status(400).json({ status: 'error', message: 'No OTP found. Please request a new one.' });
    if (new Date() > user.emailOTPExpires) return res.status(400).json({ status: 'error', message: 'OTP has expired. Please request a new one.' });
    if (user.emailOTP !== otp) return res.status(400).json({ status: 'error', message: 'Invalid OTP' });

    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error verifying email' });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Private
export const resendOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ status: 'error', message: 'Email already verified' });

    const otp = generateOTP();
    user.emailOTP = otp;
    user.emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try { await sendVerificationEmail(user.email, user.name, otp); } catch (e) { console.error('Email error FULL:', e.message, e.code, e.response); }
    res.status(200).json({ status: 'success', message: 'New OTP sent to your email!' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error sending OTP' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: 'error', message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ status: 'error', message: 'Invalid email or password' });

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) return res.status(401).json({ status: 'error', message: 'Invalid email or password' });

    if (!user.isActive) return res.status(401).json({ status: 'error', message: 'Your account has been deactivated. Please contact support.' });

    // If email not verified, send a fresh OTP
    if (!user.isEmailVerified) {
      const otp = generateOTP();
      user.emailOTP = otp;
      user.emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      try { await sendVerificationEmail(user.email, user.name, otp); } catch (e) { console.error('Email error FULL:', e.message, e.code, e.response); }
    }

    const token = generateToken(user._id);
    res.status(200).json({ status: 'success', data: { user: user.getPublicProfile(), token } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Error logging in' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ status: 'success', data: { user: user.getPublicProfile() } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching user data' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.commissionRate !== undefined) user.commissionRate = req.body.commissionRate;

    if (req.body.bankDetails !== undefined) {
      user.bankDetails = {
        bankName: req.body.bankDetails.bankName || '',
        accountName: req.body.bankDetails.accountName || '',
        accountNumber: req.body.bankDetails.accountNumber || '',
        routingNumber: req.body.bankDetails.routingNumber || '',
        paymentNote: req.body.bankDetails.paymentNote || ''
      };
    }

    await user.save();
    res.status(200).json({ status: 'success', data: { user: user.getPublicProfile() } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ status: 'error', message: 'Error updating profile' });
  }
};

// @desc    Update bank details
// @route   PUT /api/auth/bank-details
// @access  Private
export const updateBankDetails = async (req, res) => {
  try {
    const { bankName, accountName, accountNumber, routingNumber, paymentNote } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    user.bankDetails = {
      bankName: bankName || user.bankDetails?.bankName,
      accountName: accountName || user.bankDetails?.accountName,
      accountNumber: accountNumber || user.bankDetails?.accountNumber,
      routingNumber: routingNumber || user.bankDetails?.routingNumber,
      paymentNote: paymentNote || user.bankDetails?.paymentNote
    };

    await user.save();
    res.status(200).json({ status: 'success', data: { user: user.getPublicProfile() } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error updating bank details' });
  }
};

// @desc    Get landlord bank details (for tenants)
// @route   GET /api/auth/landlord-bank-details
// @access  Private (Tenant only)
export const getLandlordBankDetails = async (req, res) => {
  try {
    if (req.user.role !== 'tenant') return res.status(403).json({ status: 'error', message: 'Only tenants can access landlord bank details' });

    const Tenant = (await import('../models/Tenant.js')).default;
    const tenantRecord = await Tenant.findOne({ userId: req.user.id });
    if (!tenantRecord) return res.status(404).json({ status: 'error', message: 'Tenant record not found' });

    const landlord = await User.findById(tenantRecord.landlordId).select('name email bankDetails');
    if (!landlord) return res.status(404).json({ status: 'error', message: 'Landlord not found' });

    res.status(200).json({ status: 'success', data: { landlord: { name: landlord.name, email: landlord.email, bankDetails: landlord.bankDetails } } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching landlord details' });
  }
};

// @desc    Get agent bank details (for landlords)
// @route   GET /api/auth/agent-bank-details/:agentId
// @access  Private (Landlord only)
export const getAgentBankDetails = async (req, res) => {
  try {
    if (req.user.role !== 'landlord') return res.status(403).json({ status: 'error', message: 'Only landlords can access agent bank details' });

    const agent = await User.findById(req.params.agentId).select('name email bankDetails commissionRate');
    if (!agent || agent.role !== 'agent') return res.status(404).json({ status: 'error', message: 'Agent not found' });

    if (agent.landlordId && agent.landlordId.toString() !== req.user.id) return res.status(403).json({ status: 'error', message: 'Not authorized to view this agent' });

    res.status(200).json({ status: 'success', data: { agent: { name: agent.name, email: agent.email, bankDetails: agent.bankDetails, commissionRate: agent.commissionRate } } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching agent details' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ status: 'error', message: 'Please provide current and new password' });

    const user = await User.findById(req.user.id).select('+password');
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) return res.status(401).json({ status: 'error', message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error changing password' });
  }
};

// @desc    Change email (requires re-verification)
// @route   PUT /api/auth/change-email
// @access  Private
export const changeEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: 'error', message: 'Please provide new email' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    // Check if email already taken
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ status: 'error', message: 'Email already in use' });

    const otp = generateOTP();
    user.email = email;
    user.isEmailVerified = false;
    user.emailOTP = otp;
    user.emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try { await sendVerificationEmail(email, user.name, otp); } catch (e) { console.error('Email error:', e.message); }

    res.status(200).json({ status: 'success', message: 'Email updated. Please verify your new email.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error changing email' });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/auth/notification-preferences
// @access  Private
export const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...req.body
    };

    await user.save();
    res.status(200).json({ status: 'success', data: { notificationPreferences: user.notificationPreferences } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error updating preferences' });
  }
};