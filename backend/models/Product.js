import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Grocery', 'Provision', 'Household', 'Loose Grocery', 'Travel Accessories'],
    default: 'Grocery',
    required: true
  },
  variants: [{
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
  }],
  unit: {
    type: String,
    enum: ['1 kg', '500 g', '250 g', '1 L', '500 ml', '1 Dozen', '1 Piece', '1 Pack'],
    default: '1 Piece'
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
