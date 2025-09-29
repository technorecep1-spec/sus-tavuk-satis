const mongoose = require('mongoose');

const GalleryImageSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: [true, 'Lütfen bir resim URL\'si girin.']
    },
    title: {
        type: String,
        required: [true, 'Lütfen bir başlık girin.'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: 'Silver Wyandotte'
    },
    category: {
        type: String,
        enum: ['tavuk', 'horoz', 'civciv', 'ciftlik'],
        default: 'tavuk'
    },
    tags: [{
        type: String,
        trim: true
    }],
    isFeatured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GalleryImage', GalleryImageSchema);