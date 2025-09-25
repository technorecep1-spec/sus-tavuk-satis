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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GalleryImage', GalleryImageSchema);