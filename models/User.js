// models/User.js - E-POSTA DOĞRULAMA EKLENMİŞ TAM SÜRÜM

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },

    // --- YENİ EKLENEN E-POSTA DOĞRULAMA ALANLARI ---
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    verificationTokenExpire: {
        type: Date
    }
    // ---------------------------------------------
});

module.exports = mongoose.model('User', UserSchema);