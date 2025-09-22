// models/Review.js - OLMASI GEREKEN DOĞRU HALİ

const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// EN ÖNEMLİ SATIR: Şemayı bir modele dönüştürüp onu export ediyoruz.
// Büyük ihtimalle sendeki kodda "mongoose.model('Review', ReviewSchema)" kısmı eksik.
module.exports = mongoose.model('Review', ReviewSchema);