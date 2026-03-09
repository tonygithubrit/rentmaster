import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a property name'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Please provide a city'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'Please provide a state'],
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please provide a property type'],
    enum: ['Apartment', 'House', 'Duplex', 'Shop', 'Flat', 'Studio']
  },
  rent: {
    type: Number,
    required: [true, 'Please provide monthly rent'],
    min: 0
  },
  bedrooms: {
    type: Number,
    min: 0
  },
  bathrooms: {
    type: Number,
    min: 0
  },
  sqft: {
    type: Number,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  
  // Owner/Manager info
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  landlordName: {
    type: String,
    required: true
  },
  
  // Agent assignment
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Access code for tenant registration
  accessCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  accessCodeUsed: {
    type: Boolean,
    default: false
  },
  
  // Tenant info
  tenantEmail: {
    type: String
  },
  
  // Property status
  status: {
    type: String,
    enum: ['Vacant', 'Occupied', 'Maintenance', 'Archived'],
    default: 'Vacant'
  },
  tenantsCount: {
    type: Number,
    default: 0
  },
  
  // Archive information
  archiveReason: String,
  archiveNotes: String,
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Images/Documents
  images: [{
    url: String,
    filename: String,
    uploadedAt: Date
  }]
}, {
  timestamps: true
});

// Index for faster queries
propertySchema.index({ landlordId: 1, status: 1 });
propertySchema.index({ accessCode: 1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;