import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import mongoose from 'mongoose';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const { items, total, paymentMethod, couponCode } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    let finalTotal = total;
    let discountApplied = 0;

    // Validate and Apply Coupon
    if (couponCode) {
      const couponIndex = customer.coupons.findIndex(c => c.code === couponCode);
      if (couponIndex !== -1) {
        const coupon = customer.coupons[couponIndex];
        // Check expiration
        if (new Date() > new Date(coupon.expiresAt)) {
          return res.status(400).json({ message: 'Coupon expired' });
        }
        
        if (coupon.isFreeProduct) {
          // Find highest priced item up to 200
          let highestEligible = 0;
          items.forEach(item => {
            if (item.price <= 200 && item.price > highestEligible) {
              highestEligible = item.price;
            }
          });
          discountApplied = highestEligible; // Max 200 discount for a single product
        } else {
          discountApplied = coupon.discount;
        }

        finalTotal -= discountApplied;
        if (finalTotal < 0) finalTotal = 0;
        
        // Remove used coupon
        customer.coupons.splice(couponIndex, 1);
      } else {
        return res.status(400).json({ message: 'Invalid or expired coupon' });
      }
    }

    // Use authenticated user's ID from JWT
    const order = new Order({
      customer: req.user._id,
      items,
      total: finalTotal,
      couponCode: couponCode || null,
      discount: discountApplied,
      paymentMethod: paymentMethod || 'Offline',
      status: 'Pending'
    });

    const createdOrder = await order.save();

    // Rewards Logic
    customer.totalOrders += 1;
    
    // First Order Reward
    if (!customer.firstOrderPointsAwarded) {
      customer.points += 50;
      customer.firstOrderPointsAwarded = true;
    }

    // 10th Order Free Product Reward
    if (customer.totalOrders === 10) {
      customer.coupons.push({
        code: 'FREE-PRD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discount: 200, // Capped at 200
        isFreeProduct: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days expiry
      });
    }

    await customer.save(); // This will also trigger the point->coupon conversion hook if points >= 500

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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);

    if (order) {
      if (req.body.status === 'Confirmed' && order.status !== 'Confirmed') {
          for (const item of order.items) {
              const product = await Product.findById(item.product).session(session);
              if (product) {
                  let updated = false;
                  if (item.unit && product.variants && product.variants.length > 0) {
                      const variant = product.variants.find(v => v.unit === item.unit);
                      if (variant) {
                          if (variant.stock < item.quantity) {
                              throw new Error(`Insufficient stock for ${product.name} (${item.unit})`);
                          }
                          variant.stock = variant.stock - item.quantity;
                          updated = true;
                      }
                  }
                  
                  if (!updated) {
                      if (product.stock < item.quantity) {
                          throw new Error(`Insufficient stock for ${product.name}`);
                      }
                      product.stock = product.stock - item.quantity;
                  }
                  await product.save({ session });
              } else {
                  throw new Error(`Product not found for item ${item.name}`);
              }
          }
      }

      order.status = req.body.status || order.status;
      if (req.body.paymentMethod) {
        order.paymentMethod = req.body.paymentMethod;
      }
      const updatedOrder = await order.save({ session });

      await session.commitTransaction();
      session.endSession();
      res.json(updatedOrder);
    } else {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
     await session.abortTransaction();
     session.endSession();
     res.status(400).json({ message: error.message });
  }
};

// @desc    Rate and feedback for a delivered order
// @route   PUT /api/orders/:id/rate
// @access  Public
export const rateOrder = async (req, res) => {
  try {
    const { deliveryRating, deliveryFeedback } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.status !== 'Delivered') {
        return res.status(400).json({ message: 'Order must be delivered to be rated' });
      }

      order.deliveryRating = deliveryRating;
      order.deliveryFeedback = deliveryFeedback;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
