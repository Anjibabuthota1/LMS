const express = require('express');
const router = express.Router();
const Book = require('../models/Book');  // Assuming Book model is in models/Book.js

// Route to add a new book
router.post('/add', async (req, res) => {
  const { title, author, availability } = req.body;
  try {
    const newBook = new Book({ title, author, availability });
    await newBook.save();
    res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (err) {
    res.status(500).json({ error: 'Error adding book: ' + err.message });
  }
});

const User = require('../models/User'); // Assuming User model is in models/User.js
// Route to get all borrowed books
router.get('/borrowed', async (req, res) => {
  try {
    const users = await User.find();
    let borrowedBooks = [];

    // Loop through users and check their borrowing history
    users.forEach(user => {
      const notReturnedBooks = user.borrowingHistory.filter(book => !book.returned);
      
      // Add the userId and username to each borrowed book record
      notReturnedBooks.forEach(book => {
        borrowedBooks.push({
          userId: user._id,  // Include userId
          username: user.username,  // Include username
          title: book.title,
          borrowDate: book.borrowDate,
          returned: book.returned
        });
      });
    });

    res.status(200).json({ borrowedBooks });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching borrowed books: ' + err.message });
  }
});

  

// Route to mark a book as returned
router.put('/:userId/return/:bookTitle', async (req, res) => {
    const { userId, bookTitle } = req.params;
    
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Find the borrowing history entry and mark it as returned
      const borrowedBook = user.borrowingHistory.find(book => book.title === bookTitle && !book.returned);
      if (!borrowedBook) {
        return res.status(404).json({ error: 'Book not found in borrowing history or already returned' });
      }
  
      borrowedBook.returned = true;
  
      // Save the updated user
      await user.save();
      res.status(200).json({ message: 'Book marked as returned', borrowingHistory: user.borrowingHistory });
    } catch (err) {
      res.status(500).json({ error: 'Error marking book as returned: ' + err.message });
    }
});
  
module.exports = router;
