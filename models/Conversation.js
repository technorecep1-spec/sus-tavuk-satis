// models/Conversation.js
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    user: { // Müşteri
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: { // Konuşmanın konusu
        type: String,
        required: true
    },
    messages: [{ // Konuşma içindeki mesajlar dizisi
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true }); // Konuşmanın ne zaman güncellendiğini de takip eder

module.exports = mongoose.model('Conversation', ConversationSchema);