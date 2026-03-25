import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const { customerId, items, total, paymentMethod } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      customer: customerId,
      items,
      total,
      paymentMethod: paymentMethod || 'COD',
      status: paymentMethod === 'UPI' ? 'Confirmed' : 'Pending'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('customer', 'name phone email address');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in customer orders
// @route   GET /api/orders/customer/:id
// @access  Public
export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Admin
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // If changing to confirmed, update stock
      if (req.body.status === 'Confirmed' && order.status !== 'Confirmed') {
          for (const item of order.items) {
              const product = await Product.findById(item.product);
              if (product) {
                  product.stock = product.stock - item.quantity;
                  await product.save();
              }
          }
      }

      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
     res.status(400).json({ message: error.message });
  }
};
