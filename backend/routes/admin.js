const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const BlogPost = require('../models/BlogPost');
const GalleryImage = require('../models/GalleryImage');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/dashboard', [auth, adminAuth], async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalBlogPosts,
      totalGalleryImages,
      recentOrders,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      BlogPost.countDocuments(),
      GalleryImage.countDocuments(),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find()
        .select('name email createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Calculate revenue
    const orders = await Order.find({ status: { $in: ['Completed', 'Shipped'] } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Calculate orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalBlogPosts,
        totalGalleryImages,
        totalRevenue
      },
      ordersByStatus,
      recentOrders,
      recentUsers
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products (including inactive)
// @access  Private (Admin)
router.get('/products', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/blog
// @desc    Get all blog posts (including unpublished)
// @access  Private (Admin)
router.get('/blog', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await BlogPost.find(query)
      .populate('author', 'name')
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

// @route   GET /api/admin/gallery
// @desc    Get all gallery images
// @access  Private (Admin)
router.get('/gallery', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    
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

module.exports = router;
