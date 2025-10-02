const express = require('express');
const { body, validationResult } = require('express-validator');
const BlogPost = require('../models/BlogPost');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/blog
// @desc    Get all blog posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, tag } = req.query;
    
    let query = { isPublished: true };
    
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const posts = await BlogPost.find(query)
      .populate('author', 'name')
      .select('-content')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BlogPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blog/:slug
// @desc    Get single blog post by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug })
      .populate('author', 'name');

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/blog
// @desc    Create new blog post
// @access  Private (Admin)
router.post('/', [auth, adminAuth], [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('excerpt').optional().trim().isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('featuredImage').optional().isURL().withMessage('Featured image must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const blogPost = new BlogPost({
      ...req.body,
      author: req.user._id
    });

    await blogPost.save();
    await blogPost.populate('author', 'name');

    res.status(201).json(blogPost);
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/blog/:id
// @desc    Update blog post
// @access  Private (Admin)
router.put('/:id', [auth, adminAuth], [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  body('excerpt').optional().trim().isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('featuredImage').optional().isURL().withMessage('Featured image must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const blogPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name');

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(blogPost);
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/blog/:id
// @desc    Delete blog post
// @access  Private (Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const blogPost = await BlogPost.findByIdAndDelete(req.params.id);

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blog/tags/all
// @desc    Get all unique tags
// @access  Public
router.get('/tags/all', async (req, res) => {
  try {
    const tags = await BlogPost.distinct('tags', { isPublished: true });
    res.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
