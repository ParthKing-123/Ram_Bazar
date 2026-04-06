import Customer from '../models/Customer.js';
import bcryptjs from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

// @desc    Check if phone/email are available (NO account creation)
// @route   POST /api/customers/check
// @access  Public
export const checkCustomer = async (req, res) => {
  try {
    const { phone, email } = req.body;

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Email must end with @gmail.com' });
    }

    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ message: 'This phone number is already registered. Please login instead.' });
    }
    const existingEmail = await Customer.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'This email address is already registered. Please login instead.' });
    }

    res.status(200).json({ available: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Public
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, password } = req.body;

    // ── Server-side validation ──────────────────────────────
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Email must be a valid Gmail address ending with @gmail.com' });
    }
    // ────────────────────────────────────────────────────────

    // ── Duplicate check — no multiple registrations per phone ──
    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ message: 'This phone number is already registered. Please login instead.' });
    }

    const existingEmail = await Customer.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'This email address is already registered. Please login instead.' });
    }
    // ────────────────────────────────────────────────────────

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const customer = new Customer({
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

    res.status(200).json({
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      token: generateToken(customer._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
