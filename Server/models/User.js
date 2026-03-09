import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Don't return password by default
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number']
  },
  role: {
    type: String,
    enum: ['landlord', 'tenant', 'agent'],
    required: true
  },
  
  // Landlord-specific fields
  companyName: {
    type: String,
    trim: true
  },
  propertyCount: {
    type: String
  },
  
  // Tenant-specific fields
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  propertyName: String,
  propertyAddress: String,
  
  // Agent-specific fields
  licenseNumber: {
    type: String,
    trim: true
  },
  agencyName: {
    type: String,
    trim: true
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Reference to the landlord who created this agent
  },
  
  // Payment/Bank Details (for all users)
  bankDetails: {
    bankName: {
      type: String,
      trim: true
    },
    accountName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    routingNumber: {
      type: String,
      trim: true
    },
    paymentNote: {
      type: String,
      trim: true
    }
  },
  
  // Agent commission rate
  commissionRate: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },

  // Email verification
isEmailVerified: {
  type: Boolean,
  default: false
},
emailOTP: {
  type: String,
  select: false
},
emailOTPExpires: {
  type: Date,
  select: false
},

notificationPreferences: {
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  pushNotifications: { type: Boolean, default: true },
  paymentReminders: { type: Boolean, default: true },
  maintenanceUpdates: { type: Boolean, default: true }
},
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving - FIXED VERSION
userSchema.pre('save', async function() {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;