// models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    isim: {
        type: String,
        required: true
    },
    aciklama: {
        type: String,
        required: true
    },
    fiyat: {
        type: String,
        required: true
    },
    resim: {
        type: String,
        required: true
    },
    stok: {
        type: Number,
        required: true,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Product', ProductSchema);