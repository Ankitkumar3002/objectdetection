const express = require('express');
const User = require('../models/User');
const Detection = require('../models/Detection');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(auth);
router.use(adminAuth);

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    
    // Search filter
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Role filter
    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Active status filter
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Server error retrieving users'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get specific user details
// @access  Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
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
          }
        }
      }
    ]);

    const stats = detectionStats[0] || {
      totalDetections: 0,
      completedDetections: 0,
      failedDetections: 0
    };

    res.json({
      user: {
        ...user.toObject(),
        detectionStats: stats
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error retrieving user'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin only)
// @access  Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === user._id.toString() && isActive === false) {
      return res.status(400).json({
        message: 'You cannot deactivate your own account'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: user.toObject()
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Server error updating user'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only)
// @access  Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot delete your own account'
      });
    }

    // Delete user's detections
    await Detection.deleteMany({ user: user._id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Server error deleting user'
    });
  }
});

// @route   GET /api/admin/detections
// @desc    Get all detections with pagination
// @access  Admin
router.get('/detections', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    
    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Detection type filter
    if (req.query.detectionType) {
      filter.detectionType = req.query.detectionType;
    }

    // User filter
    if (req.query.userId) {
      filter.user = req.query.userId;
    }

    const detections = await Detection.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-filePath');

    const total = await Detection.countDocuments(filter);

    res.json({
      detections,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get detections error:', error);
    res.status(500).json({
      message: 'Server error retrieving detections'
    });
  }
});

// @route   GET /api/admin/detections/:id
// @desc    Get specific detection details
// @access  Admin
router.get('/detections/:id', async (req, res) => {
  try {
    const detection = await Detection.findById(req.params.id)
      .populate('user', 'name email')
      .select('-filePath');

    if (!detection) {
      return res.status(404).json({
        message: 'Detection not found'
      });
    }

    res.json({ detection });

  } catch (error) {
    console.error('Get detection error:', error);
    res.status(500).json({
      message: 'Server error retrieving detection'
    });
  }
});

// @route   DELETE /api/admin/detections/:id
// @desc    Delete detection (admin only)
// @access  Admin
router.delete('/detections/:id', async (req, res) => {
  try {
    const detection = await Detection.findById(req.params.id);
    
    if (!detection) {
      return res.status(404).json({
        message: 'Detection not found'
      });
    }

    // Delete file from storage if exists
    const fs = require('fs');
    if (fs.existsSync(detection.filePath)) {
      fs.unlinkSync(detection.filePath);
    }

    // Delete detection
    await Detection.findByIdAndDelete(req.params.id);

    // Update user detection count
    await User.findByIdAndUpdate(detection.user, {
      $inc: { detectionCount: -1 }
    });

    res.json({
      message: 'Detection deleted successfully'
    });

  } catch (error) {
    console.error('Delete detection error:', error);
    res.status(500).json({
      message: 'Server error deleting detection'
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } }
        }
      }
    ]);

    // Detection statistics
    const detectionStats = await Detection.aggregate([
      {
        $group: {
          _id: null,
          totalDetections: { $sum: 1 },
          completedDetections: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          failedDetections: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          processingDetections: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } }
        }
      }
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await Detection.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const systemStats = {
      users: userStats[0] || { totalUsers: 0, activeUsers: 0, adminUsers: 0 },
      detections: detectionStats[0] || { 
        totalDetections: 0, 
        completedDetections: 0, 
        failedDetections: 0, 
        processingDetections: 0 
      },
      recentActivity
    };

    res.json({ stats: systemStats });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Server error retrieving statistics'
    });
  }
});

module.exports = router;
