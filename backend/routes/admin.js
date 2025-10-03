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

// @route   GET /api/admin/users/:userId
// @desc    Get single user details
// @access  Private (Admin)
router.get('/users/:userId', [auth, adminAuth], async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's orders
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('items.product', 'name price');

    res.json({
      user,
      recentOrders: orders
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:userId
// @desc    Update user details
// @access  Private (Admin)
router.put('/users/:userId', [auth, adminAuth], async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, status, adminNotes } = req.body;
    
    // Prevent admin from editing themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot edit your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent editing other admins
    if (user.checkAdminStatus()) {
      return res.status(400).json({ message: 'Cannot edit admin users' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name || user.name,
        email: email || user.email,
        status: status || user.status,
        adminNotes: adminNotes !== undefined ? adminNotes : user.adminNotes
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users/:userId/reset-password
// @desc    Reset user password
// @access  Private (Admin)
router.post('/users/:userId/reset-password', [auth, adminAuth], async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    // Prevent admin from resetting their own password
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot reset your own password' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent resetting admin passwords
    if (user.checkAdminStatus()) {
      return res.status(400).json({ message: 'Cannot reset admin passwords' });
    }

    // Generate new password if not provided
    const password = newPassword || Math.random().toString(36).slice(-8);
    
    user.password = password;
    await user.save();

    // Send email with new password
    const { sendBulkEmail } = require('../utils/sendEmail');
    await sendBulkEmail([{
      name: user.name,
      email: user.email
    }], 'Şifre Sıfırlama', `
      <h2>Şifreniz Sıfırlandı</h2>
      <p>Merhaba ${user.name},</p>
      <p>Hesabınızın şifresi yönetici tarafından sıfırlanmıştır.</p>
      <p><strong>Yeni Şifreniz:</strong> ${password}</p>
      <p>Güvenliğiniz için lütfen giriş yaptıktan sonra şifrenizi değiştirin.</p>
      <p>İyi günler,<br>Yönetici</p>
    `);

    res.json({
      message: 'Password reset successfully',
      newPassword: password
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
