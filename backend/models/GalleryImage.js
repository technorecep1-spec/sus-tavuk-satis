const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  caption: {
    type: String,
    maxlength: [200, 'Caption cannot exceed 200 characters'],
    trim: true
  },
  category: {
    type: String,
    enum: {
      values: ['Chicks', 'Hens', 'Roosters', 'Varieties', 'Farm', 'Equipment'],
      message: 'Category must be one of: Chicks, Hens, Roosters, Varieties, Farm, Equipment'
    },
    default: 'Varieties'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
