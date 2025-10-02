const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendBulkEmail } = require('../utils/sendEmail');

const router = express.Router();

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.checkAdminStatus()) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users for email list
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, 'name email createdAt').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send bulk email to all users
router.post('/send-bulk', [
  auth,
  adminAuth,
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('recipients').isArray().withMessage('Recipients must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subject, message, recipients } = req.body;

    // If recipients is 'all', get all users
    let emailList = [];
    if (recipients.includes('all')) {
      const allUsers = await User.find({}, 'name email');
      emailList = allUsers.map(user => ({
        name: user.name,
        email: user.email
      }));
    } else {
      // Get specific users
      const selectedUsers = await User.find({
        _id: { $in: recipients }
      }, 'name email');
      emailList = selectedUsers.map(user => ({
        name: user.name,
        email: user.email
      }));
    }

    if (emailList.length === 0) {
      return res.status(400).json({ message: 'No recipients found' });
    }

    // Send bulk email
    const result = await sendBulkEmail(emailList, subject, message);

    res.json({
      message: `Email sent to ${result.successful} recipients`,
      successful: result.successful,
      failed: result.failed,
      total: emailList.length
    });

  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ message: 'Failed to send emails' });
  }
});

// Send test email
router.post('/send-test', [
  auth,
  adminAuth,
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subject, message } = req.body;
    const admin = await User.findById(req.user.userId);

    // Send test email to admin
    const result = await sendBulkEmail([{
      name: admin.name,
      email: admin.email
    }], `[TEST] ${subject}`, message);

    res.json({
      message: 'Test email sent successfully',
      result
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ message: 'Failed to send test email' });
  }
});

module.exports = router;
