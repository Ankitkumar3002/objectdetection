const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Detection = require('../models/Detection');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all user routes
router.use(auth);

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get user's detection statistics
    const detectionStats = await Detection.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalDetections: { $sum: 1 },
          completedDetections: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedDetections: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          totalFacesDetected: { $sum: { $size: { $ifNull: ['$results.faces', []] } } },
          totalBodyPartsDetected: { $sum: { $size: { $ifNull: ['$results.bodyParts', []] } } }
        }
      }
    ]);

    const stats = detectionStats[0] || {
      totalDetections: 0,
      completedDetections: 0,
      failedDetections: 0,
      totalFacesDetected: 0,
      totalBodyPartsDetected: 0
    };

    res.json({
      user: {
        ...user.toObject(),
        detectionStats: stats
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Server error retrieving profile'
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: 'Email already in use'
        });
      }
      user.email = email;
    }

    if (name) user.name = name;
    
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toObject()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Server error updating profile'
    });
  }
});

// @route   PUT /api/user/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', [
  body('currentPassword')
    .exists()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Server error changing password'
    });
  }
});

// @route   GET /api/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user._id;

    // Recent detections (last 5)
    const recentDetections = await Detection.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('originalFileName detectionType status results.totalDetections createdAt');

    // Detection statistics
    const detectionStats = await Detection.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalDetections: { $sum: 1 },
          completedDetections: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          failedDetections: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          faceDetections: { $sum: { $cond: [{ $in: ['$detectionType', ['face', 'both']] }, 1, 0] } },
          bodyDetections: { $sum: { $cond: [{ $in: ['$detectionType', ['body', 'both']] }, 1, 0] } }
        }
      }
    ]);

    // Activity over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyActivity = await Detection.aggregate([
      { 
        $match: { 
          user: userId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const stats = detectionStats[0] || {
      totalDetections: 0,
      completedDetections: 0,
      failedDetections: 0,
      faceDetections: 0,
      bodyDetections: 0
    };

    res.json({
      recentDetections,
      stats,
      weeklyActivity
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      message: 'Server error retrieving dashboard data'
    });
  }
});

// @route   DELETE /api/user/account
// @desc    Delete user account
// @access  Private
router.delete('/account', [
  body('password')
    .exists()
    .withMessage('Password is required for account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { password } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Incorrect password'
      });
    }

    // Delete user's detections and files
    const detections = await Detection.find({ user: user._id });
    const fs = require('fs');
    
    for (const detection of detections) {
      if (fs.existsSync(detection.filePath)) {
        fs.unlinkSync(detection.filePath);
      }
    }

    await Detection.deleteMany({ user: user._id });
    
    // Delete user account
    await User.findByIdAndDelete(user._id);

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      message: 'Server error deleting account'
    });
  }
});

module.exports = router;
