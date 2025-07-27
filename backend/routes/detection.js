const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Detection = require('../models/Detection');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/detection/upload
// @desc    Upload file for detection
// @access  Private
router.post('/upload', auth, upload.single('file'), handleMulterError, [
  body('detectionType')
    .isIn(['face', 'body', 'both'])
    .withMessage('Detection type must be face, body, or both')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded'
      });
    }

    const { detectionType } = req.body;
    
    // Determine file type
    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

    // Create detection record
    const detection = new Detection({
      user: req.user._id,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileType,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      detectionType,
      status: 'processing'
    });

    await detection.save();

    // Send file to AI service for processing
    try {
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(req.file.path);
      const blob = new Blob([fileBuffer], { type: req.file.mimetype });
      
      formData.append('file', blob, req.file.originalname);
      formData.append('detection_type', detectionType);
      formData.append('detection_id', detection._id.toString());

      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/api/detect`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000 // 5 minutes timeout
        }
      );

      // Update detection with results
      detection.results = aiResponse.data.results;
      detection.status = 'completed';
      await detection.save();

      // Update user detection count
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { detectionCount: 1 }
      });

      res.json({
        message: 'Detection completed successfully',
        detection: {
          id: detection._id,
          originalFileName: detection.originalFileName,
          detectionType: detection.detectionType,
          results: detection.results,
          status: detection.status,
          createdAt: detection.createdAt
        }
      });

    } catch (aiError) {
      console.error('AI service error:', aiError);
      
      // Update detection status to failed
      detection.status = 'failed';
      detection.errorMessage = aiError.message || 'AI processing failed';
      await detection.save();

      res.status(500).json({
        message: 'AI processing failed',
        detection: {
          id: detection._id,
          status: detection.status,
          errorMessage: detection.errorMessage
        }
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Server error during upload'
    });
  }
});

// @route   POST /api/detection/realtime
// @desc    Process realtime detection data
// @access  Private
router.get('/realtime-test', (req, res) => {
  console.log('🔥 BACKEND TEST ENDPOINT HIT 🔥');
  res.json({ message: 'Backend is working' });
});

router.post('/realtime', auth, async (req, res) => {
  try {
    console.log('�🔥🔥 BACKEND REALTIME ENDPOINT HIT 🔥🔥🔥');
    console.log('�📸 Realtime detection request received');
    const { imageData, detectionType } = req.body;

    if (!imageData || !detectionType) {
      console.log('❌ Missing imageData or detectionType');
      return res.status(400).json({
        message: 'Image data and detection type are required'
      });
    }

    console.log(`🔍 Detection type: ${detectionType}`);
    console.log(`📊 Image data length: ${imageData.length}`);
    console.log(`📊 Image data format: ${imageData.substring(0, 50)}...`);
    console.log(`📊 Image data starts with data URL: ${imageData.startsWith('data:image')}`);

    // Send to AI service for processing
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
    console.log(`🤖 Calling AI service at: ${aiServiceUrl}/api/detect-realtime`);
    
    const aiResponse = await axios.post(
      `${aiServiceUrl}/api/detect-realtime`,
      {
        image_data: imageData,
        detection_type: detectionType
      },
      {
        timeout: 30000 // 30 seconds timeout
      }
    );

    console.log('✅ AI service response received:', aiResponse.data);

    res.json({
      message: 'BACKEND PROCESSED - Realtime detection completed',
      backend_processed: true,
      backend_timestamp: new Date().toISOString(),
      results: aiResponse.data.results,
      ...aiResponse.data
    });

  } catch (error) {
    console.error('❌ Realtime detection error:', error.message);
    if (error.response) {
      console.error('AI service error response:', error.response.data);
    }
    res.status(500).json({
      message: 'Realtime detection failed',
      error: error.message
    });
  }
});

// @route   GET /api/detection/history
// @desc    Get user's detection history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    
    // Optional filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.detectionType) {
      filter.detectionType = req.query.detectionType;
    }
    if (req.query.fileType) {
      filter.fileType = req.query.fileType;
    }

    const detections = await Detection.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-filePath'); // Don't expose file paths

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
    console.error('History error:', error);
    res.status(500).json({
      message: 'Server error retrieving history'
    });
  }
});

// @route   GET /api/detection/:id
// @desc    Get specific detection
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      user: req.user._id
    }).select('-filePath');

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

// @route   DELETE /api/detection/:id
// @desc    Delete detection
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!detection) {
      return res.status(404).json({
        message: 'Detection not found'
      });
    }

    // Delete file from storage
    if (fs.existsSync(detection.filePath)) {
      fs.unlinkSync(detection.filePath);
    }

    // Delete detection record
    await Detection.findByIdAndDelete(req.params.id);

    // Update user detection count
    await User.findByIdAndUpdate(req.user._id, {
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

// @route   GET /api/detection/stats/summary
// @desc    Get user's detection statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Detection.aggregate([
      { $match: { user: userId } },
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
          faceDetections: {
            $sum: { $cond: [{ $in: ['$detectionType', ['face', 'both']] }, 1, 0] }
          },
          bodyDetections: {
            $sum: { $cond: [{ $in: ['$detectionType', ['body', 'both']] }, 1, 0] }
          },
          totalFacesDetected: { $sum: { $size: { $ifNull: ['$results.faces', []] } } },
          totalBodyPartsDetected: { $sum: { $size: { $ifNull: ['$results.bodyParts', []] } } }
        }
      }
    ]);

    const summary = stats[0] || {
      totalDetections: 0,
      completedDetections: 0,
      failedDetections: 0,
      faceDetections: 0,
      bodyDetections: 0,
      totalFacesDetected: 0,
      totalBodyPartsDetected: 0
    };

    res.json({ stats: summary });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      message: 'Server error retrieving statistics'
    });
  }
});

module.exports = router;
