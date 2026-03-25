import mongoose from 'mongoose';

const eventProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  unit: { type: String, default: '1 Piece' },
  stock: { type: Number, default: 100 },
  quantity: { type: Number, default: 1 },
});

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  products: [eventProductSchema]
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;
