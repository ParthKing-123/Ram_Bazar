import jwt from 'jsonwebtoken';

const generateToken = (id, role = null) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret_key_123', {
    expiresIn: '30d',
  });
};

export default generateToken;
