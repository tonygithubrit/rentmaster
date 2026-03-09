import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Who should see this notification
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientRole: {
    type: String,
    enum: ['landlord', 'tenant', 'agent'],
    required: true
  },
  
  // Notification details
 type: {
  type: String,
  enum: ['rent_payment_pending', 'commission_payment_pending', 'security_deposit_pending', 'maintenance_request'],
  required: true
},
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // Related payment data
 paymentData: {
    amount: Number,
    paymentType: {
      type: String,
      enum: ['Rent', 'Security Deposit', 'Commission'],
      default: 'Rent'
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    propertyName: String,
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tenantName: String,
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    agentName: String,
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentDate: Date,
    paymentMethod: String,
    referenceNumber: String,
    paymentPeriod: {
      month: Number,
      year: Number
    },
    receiptImage: {
    data: String,       // base64 string
    mimeType: String,   // e.g. 'image/png', 'application/pdf'
    fileName: String
    }
  },
  
  // Notification status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  // When confirmed
  confirmedAt: Date,
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Linked payment ID (once created)
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ recipientId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;