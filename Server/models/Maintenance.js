import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
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
  
  // Reporter info (tenant or landlord)
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reporterName: {
    type: String,
    required: true
  },
  reporterRole: {
    type: String,
    enum: ['landlord', 'tenant', 'agent'],
    required: true
  },
  
  // Issue details
  issue: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Structural', 'Other'],
    default: 'Other'
  },
  
  // Priority and Status
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Open'
  },
  
  // Assignment
  assignedTo: {
    name: String,
    phone: String,
    company: String
  },
  
  // Cost tracking
  estimatedCost: {
    type: Number,
    min: 0
  },
  actualCost: {
    type: Number,
    min: 0
  },
  
  // Dates
  scheduledDate: Date,
  completedDate: Date,
  
  // Images
  images: [{
    url: String,
    filename: String,
    uploadedAt: Date
  }],
  
  // Notes/Updates
  notes: String,
  updates: [{
    message: String,
    updatedBy: String,
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
maintenanceSchema.index({ landlordId: 1, status: 1 });
maintenanceSchema.index({ propertyId: 1 });
maintenanceSchema.index({ reportedBy: 1 });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

export default Maintenance;
