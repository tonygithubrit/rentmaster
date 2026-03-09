import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Optional - tenant can be added before they register
  },
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
  
  // Property information
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  propertyName: {
    type: String,
    required: true
  },
  
  // Landlord info (for multi-tenant support)
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Lease details
  leaseStart: {
    type: Date,
    required: true
  },
  leaseEnd: {
    type: Date,
    required: true
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  securityDeposit: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Past', 'Pending'],
    default: 'Active'
  },
  
  // Emergency contact
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Documents
 documents: [{
  name: String,
  documentType: { type: String, enum: ['Lease Agreement', 'Property Image', 'ID Document', 'Other'], default: 'Other' },
  url: String,
  filename: String,
  fileSize: Number,
  mimeType: String,
  uploadedAt: { type: Date, default: Date.now }
}],
  
  // Notes
  notes: String
}, {
  timestamps: true
});

// Index for faster queries
tenantSchema.index({ landlordId: 1, status: 1 });
tenantSchema.index({ propertyId: 1 });
tenantSchema.index({ email: 1 });

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;