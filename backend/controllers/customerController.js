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
    // Only validate/check email if it was provided as a string
    if (email && typeof email === 'string' && email.trim() !== '') {
      const normalizedEmail = email.toLowerCase().trim();
      if (!normalizedEmail.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Email must end with @gmail.com' });
      }
      const existingEmail = await Customer.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(409).json({ message: 'This email address is already registered. Please login instead.' });
      }
    }

    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ message: 'This phone number is already registered. Please login instead.' });
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
    // Email is optional — only validate if provided
    if (email && typeof email === 'string' && email.trim() !== '') {
      const normalizedEmail = email.toLowerCase().trim();
      if (!normalizedEmail.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Email must be a valid Gmail address ending with @gmail.com' });
      }
      const existingEmail = await Customer.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(409).json({ message: 'This email address is already registered. Please login instead.' });
      }
    }
    // ────────────────────────────────────────────────────────

    // ── Duplicate check — no multiple registrations per phone ──
    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ message: 'This phone number is already registered. Please login instead.' });
    }
    // ────────────────────────────────────────────────────────

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const customer = new Customer({
      name,
      phone,
      email: (email && email.trim() !== '') ? email.toLowerCase().trim() : null,
      address,
      password: hashedPassword
    });

    const createdCustomer = await customer.save();
    console.log(`[Registration] SUCCESS for phone ${phone}`);

    res.status(201).json({
      _id: createdCustomer._id,
      name: createdCustomer.name,
      phone: createdCustomer.phone,
      email: createdCustomer.email,
      address: createdCustomer.address,
      token: generateToken(createdCustomer._id),
    });
  } catch (error) {
    console.error(`[Registration Error] phone ${req.body.phone}:`, error.message);
    res.status(500).json({ message: error.message });
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

// @desc    Update customer profile (name, email, address)
// @route   PUT /api/customers/:id
// @access  Private (customer)
export const updateCustomer = async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    // Validate email if provided
    if (email && typeof email === 'string' && email.trim() !== '') {
      const normalizedEmail = email.toLowerCase().trim();
      if (!normalizedEmail.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Email must be a valid Gmail address.' });
      }

      // Check if new email conflicts with another account
      const existingEmail = await Customer.findOne({ email: normalizedEmail, _id: { $ne: customer._id } });
      if (existingEmail) {
        return res.status(409).json({ message: 'This email is already used by another account.' });
      }
      customer.email = normalizedEmail;
    } else if (email === '' || email === null) {
      // Clear email if explicitly provided as empty or null
      customer.email = undefined;
    }

    if (name)    customer.name    = name;
    if (address) customer.address = address;

    const updated = await customer.save();

    res.status(200).json({
      _id:     updated._id,
      name:    updated.name,
      phone:   updated.phone,
      email:   updated.email,
      address: updated.address,
      // Always return current token so frontend can keep it in store
      token:   req.headers.authorization?.startsWith('Bearer ') 
               ? req.headers.authorization.split(' ')[1] 
               : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
