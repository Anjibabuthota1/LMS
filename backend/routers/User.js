const express = require('express');
const bcrypt = require('bcryptjs'); // Use bcryptjs instead of bcrypt
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

// Secret for JWT (You should store this in environment variables)
const JWT_SECRET = 'XYZ';

// Sign-up route
router.post('/signup', async (req, res) => {
    const { username, email, password,role } = req.body;
    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role:role || "user"
        });

        await newUser.save();
        res.status(201).json({ message: 'User signed up successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        // Send the token and user role in the response
        res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role ,// Include the user role in the response
            id:user._id
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to fetch available books
const Book = require('../models/Book'); 
router.get('/available-books', async (req, res) => {
    try {
        // Fetch books with availability set to true
        const availableBooks = await Book.find({ availability: true });

        if (availableBooks.length === 0) {
            return res.status(404).json({ message: 'No available books at the moment' });
        }

        res.status(200).json({ availableBooks });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Route to borrow a book
router.post('/:userId/borrow', async (req, res) => {
    const { userId } = req.params;
    const { title } = req.body;

    try {
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Add the book to the borrowing history
        user.borrowingHistory.push({
            title,
            userId,
            borrowDate: new Date().toISOString(),
            returned: false,
        });

        await user.save();

        res.status(200).json({ message: 'Book borrowed successfully', borrowingHistory: user.borrowingHistory });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to fetch borrowing history
router.get('/:userId/history', async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ borrowingHistory: user.borrowingHistory });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
