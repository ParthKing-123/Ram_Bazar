import Customer from '../models/Customer.js';
import bcryptjs from 'bcryptjs';

// @desc    Create new customer
// @route   POST /api/customers
// @access  Public
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, password } = req.body;

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Check if customer already exists for this email or phone
    let customer = await Customer.findOne({ $or: [{ email }, { phone }] });

    if (customer) {
      // Update details if they already exist
      customer.name = name;
      customer.phone = phone;
      customer.email = email;
      customer.address = address;
      if (password) {
        customer.password = hashedPassword;
      }
      await customer.save();
      return res.status(200).json(customer);
    }

    customer = new Customer({
      name,
      phone,
      email,
      address,
      password: hashedPassword
    });

    const createdCustomer = await customer.save();
    res.status(201).json(createdCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Login customer
// @route   POST /api/customers/login
// @access  Public
export const loginCustomer = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const customer = await Customer.findOne({ phone });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found. Please sign up.' });
    }

    const isMatch = await bcryptjs.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
