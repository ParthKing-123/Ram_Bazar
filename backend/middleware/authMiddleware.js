import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import Staff from '../models/Staff.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_123');
      
      if (decoded.role) {
        req.user = await Staff.findById(decoded.id).select('-password');
      } else {
        req.user = await Customer.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const adminGuard = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an Admin' });
  }
};

export const riderGuard = (req, res, next) => {
  if (req.user && (req.user.role === 'Rider' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a Rider' });
  }
};
