const mongoose = require('mongoose');

// Book Schema
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    availability: { type: Boolean, default: true }
});

// Export the Book model
module.exports = mongoose.model('Book', bookSchema);
