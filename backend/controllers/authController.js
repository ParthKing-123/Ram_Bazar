import Staff from '../models/Staff.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth staff & get token
// @route   POST /api/auth/staff/login
// @access  Public
export const authStaff = async (req, res) => {
  try {
    const { username, password } = req.body;
    const staff = await Staff.findOne({ username });

    if (staff && (await staff.matchPassword(password))) {
      res.json({
        _id: staff._id,
        username: staff.username,
        role: staff.role,
        token: generateToken(staff._id, staff.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed default staff
// @route   POST /api/auth/staff/seed
// @access  Public
export const seedStaff = async (req, res) => {
  try {
    const defaultStaff = [
      { username: 'admin', password: 'admin123', role: 'Admin' },
      { username: 'rider', password: 'rider123', role: 'Rider' }
    ];

    for (let s of defaultStaff) {
      const exists = await Staff.findOne({ username: s.username });
      if (!exists) {
        await Staff.create(s);
      }
    }
    
    res.status(201).json({ message: 'Staff seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
