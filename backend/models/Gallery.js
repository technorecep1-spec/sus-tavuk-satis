const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Gallery title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Nature', 'Animals', 'Products', 'Events', 'Other'],
      message: 'Category must be Nature, Animals, Products, Events, or Other'
    }
  },
  tags: {
    type: [String],
    default: []
  },
  altText: {
    type: String,
    maxlength: [200, 'Alt text cannot exceed 200 characters'],
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  dimensions: {
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
gallerySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Gallery', gallerySchema);
