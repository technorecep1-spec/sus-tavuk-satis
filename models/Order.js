// models/Order.js - GÜNCELLENECEK SON HALİ

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            // ÖNEMLİ NOT: Ref adının 'Product' olduğundan emin ol, eğer Urun ise 'Urun' yapmalısın.
            ref: 'Product', 
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        }
    }],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Beklemede', 'Onaylandı', 'Hazırlanıyor', 'Kargoda', 'Teslim Edildi', 'Reddedildi'],
        default: 'Beklemede'
    },
    rejectionReason: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);