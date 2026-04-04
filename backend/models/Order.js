import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      image: { type: String },
      unit: { type: String },
    }
  ],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Out for Delivery', 'Rejected', 'Delivered'],
    default: 'Pending',
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'COD'],
    default: 'COD'
  },
  deliveryRating: {
    type: Number,
    min: 1,
    max: 5
  },
  deliveryFeedback: {
    type: String
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
