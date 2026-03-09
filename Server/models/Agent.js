import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  // Personal Info
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  
  // Bank/Payment Info (optional - can be added later)
  bankName: {
    type: String,
    required: false
  },
  accountName: {
    type: String,
    required: false
  },
  accountNumber: {
    type: String,
    required: false
  },
  routingNumber: {
    type: String,
    required: false
  },
  
  // Commission
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 5
  },
  
  paymentNote: {
    type: String
  },
  
  // Link to landlord who created this agent
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Agent user account (if they registered as an agent user)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
agentSchema.index({ landlordId: 1 });
agentSchema.index({ email: 1 });

const Agent = mongoose.model('Agent', agentSchema);

export default Agent;