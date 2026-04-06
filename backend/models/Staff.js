import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const staffSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Rider'],
    required: true
  }
}, { timestamps: true });

// Hash password before saving
staffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

staffSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

const Staff = mongoose.model('Staff', staffSchema);
export default Staff;
