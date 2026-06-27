import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  address: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  referralCode: { 
    type: String, 
    unique: true 
  },
  points: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  signupPointsAwarded: { type: Boolean, default: false },
  profilePointsAwarded: { type: Boolean, default: false },
  firstOrderPointsAwarded: { type: Boolean, default: false },
  coupons: [{
    code: String,
    discount: Number,
    isFreeProduct: { type: Boolean, default: false },
    expiresAt: Date
  }]
}, { timestamps: true });

customerSchema.pre('save', function(next) {
  if (this.isModified('points')) {
    while (this.points >= 500) {
      this.points -= 500;
      this.coupons.push({
        code: 'RWD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discount: 50,
        isFreeProduct: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiry
      });
    }
  }
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
