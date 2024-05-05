const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Signup failed:', error);
    res.status(500).json({ message: 'Signup failed' });
  }
};
