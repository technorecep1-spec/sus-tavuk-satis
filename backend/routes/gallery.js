const express = require('express');
const { body, validationResult } = require('express-validator');
const GalleryImage = require('../models/GalleryImage');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/gallery
// @desc    Get all gallery images
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    const images = await GalleryImage.find(query)
      .sort({ uploadedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GalleryImage.countDocuments(query);

    res.json({
      images,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get gallery images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gallery/featured
// @desc    Get featured gallery images
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const images = await GalleryImage.find({ isFeatured: true })
      .sort({ uploadedAt: -1 })
      .limit(6);

    res.json(images);
  } catch (error) {
    console.error('Get featured images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/gallery
// @desc    Add new gallery image
// @access  Private (Admin)
router.post('/', [auth, adminAuth], [
  body('imageUrl').isURL().withMessage('Image URL must be valid'),
  body('caption').optional().trim().isLength({ max: 200 }).withMessage('Caption cannot exceed 200 characters'),
  body('category').optional().isIn(['Chicks', 'Hens', 'Roosters', 'Varieties', 'Farm', 'Equipment']).withMessage('Invalid category'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const galleryImage = new GalleryImage(req.body);
    await galleryImage.save();

    res.status(201).json(galleryImage);
  } catch (error) {
    console.error('Add gallery image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery image
// @access  Private (Admin)
router.put('/:id', [auth, adminAuth], [
  body('caption').optional().trim().isLength({ max: 200 }).withMessage('Caption cannot exceed 200 characters'),
  body('category').optional().isIn(['Chicks', 'Hens', 'Roosters', 'Varieties', 'Farm', 'Equipment']).withMessage('Invalid category'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const galleryImage = await GalleryImage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!galleryImage) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }

    res.json(galleryImage);
  } catch (error) {
    console.error('Update gallery image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery image
// @access  Private (Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const galleryImage = await GalleryImage.findByIdAndDelete(req.params.id);

    if (!galleryImage) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }

    res.json({ message: 'Gallery image deleted successfully' });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
