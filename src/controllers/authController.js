const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = [
  // Validation rules
  check('firstname').notEmpty().withMessage('First name is required'),
  check('lastname').notEmpty().withMessage('Last name is required'),
  check('email').isEmail().withMessage('Invalid email format'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  
  // Signup logic
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { firstname, lastname, email, password } = req.body;
      
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
      });

      const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(201).json({ message: 'User created successfully', token });
    } catch (error) {
      console.error('Signup failed:', error);
      res.status(500).json({ message: 'Signup failed' });
    }
  }
];

exports.login = [
  // Validation rules
  check('email').isEmail().withMessage('Invalid email format'),
  check('password').notEmpty().withMessage('Password is required'),

  // Login logic
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Login failed:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  }
];
