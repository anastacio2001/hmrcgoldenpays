import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Temporary in-memory user (replace with database)
const ADMIN_USER = {
  id: '1',
  email: 'admin@goldenpays.uk',
  // Password: GoldenPays2026!
  passwordHash: '$2a$10$L0TdJJgH7U2d2HC7jWrKm.Wu7soBI.gmQH36JMn7APmSipmuuwew6',
  role: 'admin',
  name: 'Administrator'
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    // Validate request
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: error.details[0].message 
      });
    }

    const { email, password } = value;

    // Check if user exists
    if (email !== ADMIN_USER.email) {
      return res.status(401).json({ 
        error: 'Authentication Failed',
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, ADMIN_USER.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Authentication Failed',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: ADMIN_USER.id, 
        email: ADMIN_USER.email, 
        role: ADMIN_USER.role 
      },
      process.env.JWT_SECRET || 'default-secret-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Return user data and token
    res.status(200).json({
      success: true,
      token,
      user: {
        id: ADMIN_USER.id,
        email: ADMIN_USER.email,
        name: ADMIN_USER.name,
        role: ADMIN_USER.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'An error occurred during authentication'
    });
  }
});

// Middleware to verify JWT
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ 
      error: 'Access Denied',
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-in-production');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: 'Invalid Token',
      message: 'Your session has expired. Please login again.'
    });
  }
};

// GET /api/auth/verify - Verify current token
router.get('/verify', verifyToken, (req, res) => {
  res.status(200).json({ 
    valid: true,
    user: req.user 
  });
});

export default router;
