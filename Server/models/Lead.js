import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  // Contact info
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
  
  // Interest
  interestedProperty: {
    type: String,
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  
  // Source and tracking
  source: {
    type: String,
    enum: ['Zillow', 'Trulia', 'Realtor.com', 'Facebook', 'Instagram', 'Direct', 'Referral', 'Other'],
    default: 'Direct'
  },
  
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Touring', 'Application', 'Approved', 'Declined', 'Lost'],
    default: 'New'
  },
  
  temperature: {
    type: String,
    enum: ['Hot', 'Warm', 'Cold'],
    default: 'Warm'
  },
  
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  
  // Budget and preferences
  budgetMin: Number,
  budgetMax: Number,
  moveInDate: Date,
  notes: String,
  
  // Owner info
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Agent assignment (if applicable)
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Activity tracking
  lastContact: {
    type: Date,
    default: Date.now
  },
  nextFollowUp: Date,
  
  // Communication history
  communications: [{
    type: {
      type: String,
      enum: ['Call', 'Email', 'SMS', 'Meeting', 'Note']
    },
    message: String,
    date: {
      type: Date,
      default: Date.now
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
leadSchema.index({ landlordId: 1, status: 1 });
leadSchema.index({ agentId: 1 });
leadSchema.index({ email: 1 });

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
