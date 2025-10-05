const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendBulkEmail } = require('../utils/sendEmail');

// Try to load SMS functionality, but don't fail if it's not available
let sendBulkSms = null;
try {
  const smsModule = require('../utils/sendSms');
  sendBulkSms = smsModule.sendBulkSms;
  console.log('✅ SMS module loaded successfully');
} catch (error) {
  console.log('⚠️ SMS module not available:', error.message);
}

const router = express.Router();

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    // req.user is already populated by auth middleware
    if (!req.user || !req.user.checkAdminStatus()) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users for email/SMS list
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, 'name email phone createdAt').sort({ createdAt: -1 });
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

    // Send bulk email with timeout
    console.log(`Admin ${req.user.email} sending bulk email to ${emailList.length} recipients`);
    
    const result = await Promise.race([
      sendBulkEmail(emailList, subject, message),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Bulk email operation timeout')), 120000) // 2 minutes timeout - increased for cloud platforms
      )
    ]);

    console.log(`Bulk email result: ${result.successful} successful, ${result.failed} failed`);

    res.json({
      message: `Email sent to ${result.successful} recipients`,
      successful: result.successful,
      failed: result.failed,
      total: emailList.length,
      details: result.results
    });

  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ message: 'Failed to send emails' });
  }
});

// Send bulk SMS to users
router.post('/send-bulk-sms', [
  auth,
  adminAuth,
  body('message').notEmpty().withMessage('Message is required'),
  body('recipients').isArray().withMessage('Recipients must be an array')
], async (req, res) => {
  try {
    // Check if SMS functionality is available
    if (!sendBulkSms) {
      return res.status(503).json({ 
        message: 'SMS functionality is not available. Please contact administrator.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message, recipients } = req.body;

    // If recipients is 'all', get all users with phone numbers
    let smsList = [];
    if (recipients.includes('all')) {
      const allUsers = await User.find({ phone: { $exists: true, $ne: null, $ne: '' } }, 'name phone');
      smsList = allUsers.map(user => ({
        name: user.name,
        phone: user.phone
      }));
    } else {
      // Get specific users with phone numbers
      const selectedUsers = await User.find({
        _id: { $in: recipients },
        phone: { $exists: true, $ne: null, $ne: '' }
      }, 'name phone');
      smsList = selectedUsers.map(user => ({
        name: user.name,
        phone: user.phone
      }));
    }

    if (smsList.length === 0) {
      return res.status(400).json({ message: 'No recipients with phone numbers found' });
    }

    // Send bulk SMS with timeout
    console.log(`Admin ${req.user.email} sending bulk SMS to ${smsList.length} recipients`);
    
    const result = await Promise.race([
      sendBulkSms(smsList, message),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Bulk SMS operation timeout')), 120000) // 2 minutes timeout
      )
    ]);

    console.log(`Bulk SMS result: ${result.successful} successful, ${result.failed} failed`);

    res.json({
      message: `SMS sent to ${result.successful} recipients`,
      successful: result.successful,
      failed: result.failed,
      total: smsList.length,
      details: result.results
    });

  } catch (error) {
    console.error('Bulk SMS error:', error);
    res.status(500).json({ message: 'Failed to send SMS messages' });
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
    const admin = req.user; // Already populated by auth middleware

    // Send test email to admin
    console.log(`Admin ${admin.email} sending test email`);
    
    const result = await Promise.race([
      sendBulkEmail([{
        name: admin.name,
        email: admin.email
      }], `[TEST] ${subject}`, message),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test email timeout')), 60000) // 60 seconds timeout - increased for cloud platforms
      )
    ]);

    console.log('Test email result:', result);

    res.json({
      message: 'Test email sent successfully',
      result
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ message: 'Failed to send test email' });
  }
});

// Delete user
router.delete('/users/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting other admins
    if (user.checkAdminStatus()) {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
