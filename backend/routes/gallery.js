const express = require('express');
const { body, validationResult } = require('express-validator');
const Gallery = require('../models/Gallery');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/gallery
// @desc    Get all gallery images
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const images = await Gallery.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Gallery.countDocuments(query);

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

// @route   GET /api/gallery/admin
// @desc    Get all gallery images for admin
// @access  Private (Admin)
router.get('/admin', [auth, adminAuth], async (req, res) => {
  try {
    const { category, search, status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const images = await Gallery.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Gallery.countDocuments(query);

    // Get statistics
    const stats = await Gallery.aggregate([
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          activeImages: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalSize: { $sum: '$fileSize' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    const categoryStats = await Gallery.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      images,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      stats: stats[0] || { totalImages: 0, activeImages: 0, totalSize: 0, categories: [] },
      categoryStats
    });
  } catch (error) {
    console.error('Get admin gallery images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gallery/:id
// @desc    Get single gallery image
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    console.error('Get gallery image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/gallery
// @desc    Create new gallery image
// @access  Private (Admin)
router.post('/', [auth, adminAuth], [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('imageUrl').notEmpty().withMessage('Image URL is required'),
  body('category').isIn(['Nature', 'Animals', 'Products', 'Events', 'Other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const image = new Gallery(req.body);
    await image.save();

    res.status(201).json(image);
  } catch (error) {
    console.error('Create gallery image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery image
// @access  Private (Admin)
router.put('/:id', [auth, adminAuth], [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('category').optional().isIn(['Nature', 'Animals', 'Products', 'Events', 'Other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(image);
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
    const image = await Gallery.findByIdAndDelete(req.params.id);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/gallery/bulk-update
// @desc    Bulk update gallery images
// @access  Private (Admin)
router.put('/bulk-update', [auth, adminAuth], async (req, res) => {
  try {
    const { imageIds, action, data } = req.body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ message: 'Image IDs are required' });
    }

    if (imageIds.length > 20) {
      return res.status(400).json({ message: 'Maximum 20 images can be updated at once' });
    }

    let updateData = {};
    
    switch (action) {
      case 'category':
        updateData.category = data.category;
        break;
      case 'status':
        updateData.isActive = data.status === 'active';
        break;
      case 'tags':
        if (data.action === 'add') {
          updateData.$addToSet = { tags: { $each: data.tags } };
        } else if (data.action === 'remove') {
          updateData.$pull = { tags: { $in: data.tags } };
        }
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await Gallery.updateMany(
      { _id: { $in: imageIds } },
      updateData
    );

    res.json({ 
      message: `${result.modifiedCount} images updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update gallery images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/gallery/bulk-delete
// @desc    Bulk delete gallery images
// @access  Private (Admin)
router.delete('/bulk-delete', [auth, adminAuth], async (req, res) => {
  try {
    const { imageIds } = req.body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ message: 'Image IDs are required' });
    }

    if (imageIds.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 images can be deleted at once' });
    }

    const result = await Gallery.deleteMany({ _id: { $in: imageIds } });

    res.json({ 
      message: `${result.deletedCount} images deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete gallery images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;