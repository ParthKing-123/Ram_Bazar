import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from './models/Customer.js';
import Order from './models/Order.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    return cleanup();
  })
  .then(() => {
    console.log('✅ Cleanup complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });

async function cleanup() {
  const customerResult = await Customer.deleteMany({});
  console.log(`🗑️  Deleted ${customerResult.deletedCount} customer(s)`);

  const orderResult = await Order.deleteMany({});
  console.log(`🗑️  Deleted ${orderResult.deletedCount} order(s)`);
}
