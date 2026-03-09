import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Tenant info
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenantName: {
    type: String,
    required: true
  },
  
  // Property info
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  propertyName: {
    type: String,
    required: true
  },
  
  // Landlord info
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Check', 'Bank Transfer', 'Credit Card', 'PayPal', 'Other'],
    required: true
  },
  
  // Payment type
  paymentType: {
    type: String,
    enum: ['Rent', 'Security Deposit', 'Late Fee', 'Maintenance', 'Commission', 'Other'],
    default: 'Rent'
  },
  
  // Reference
  referenceNumber: {
    type: String
  },
  
  // For which month/period
  paymentPeriod: {
    month: Number, // 1-12
    year: Number
  },
  
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed'],
    default: 'Completed'
  },
  
  notes: {
    type: String
  },
  
  // Receipt
  receiptUrl: {
    type: String
  },
  
  // Logged by (could be landlord or system)
  loggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ landlordId: 1, paymentDate: -1 });
paymentSchema.index({ tenantId: 1, paymentDate: -1 });
paymentSchema.index({ propertyId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;