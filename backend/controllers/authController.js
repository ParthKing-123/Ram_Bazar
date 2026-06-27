import Staff from '../models/Staff.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth staff & get token
// @route   POST /api/auth/staff/login
// @access  Public
export const authStaff = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[Auth attempt] Staff: ${username}`);
    const staff = await Staff.findOne({ username });

    if (!staff) {
      console.log(`[Auth failed] Staff user not found: ${username}`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await staff.matchPassword(password);
    console.log(`[Auth trace] User found. Password match: ${isMatch}`);

    if (isMatch) {
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
    console.error(`[Auth Error] ${req.body?.username || 'unknown'}:`, error.message);
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
