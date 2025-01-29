const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    borrowingHistory: [
        {
            title: { type: String },
            borrowDate: { type: String },
            id:{type:String},
            returned: { type: Boolean, default: false }
        }
    ]
});

// Export the User model
module.exports = mongoose.model('User', userSchema);
