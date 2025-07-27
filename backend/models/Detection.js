const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  detectionType: {
    type: String,
    enum: ['face', 'body', 'both'],
    required: true
  },
  results: {
    faces: [{
      boundingBox: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true }
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        required: true
      },
      landmarks: [{
        x: Number,
        y: Number,
        name: String
      }],
      emotions: {
        happy: { type: Number, default: 0 },
        sad: { type: Number, default: 0 },
        angry: { type: Number, default: 0 },
        surprised: { type: Number, default: 0 },
        neutral: { type: Number, default: 0 },
        fear: { type: Number, default: 0 },
        disgust: { type: Number, default: 0 }
      },
      age: {
        type: Number,
        min: 0,
        max: 120
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'unknown']
      }
    }],
    bodyParts: [{
      name: {
        type: String,
        required: true
      },
      keypoints: [{
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        confidence: { type: Number, required: true },
        name: String
      }],
      boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        required: true
      }
    }],
    processingTime: {
      type: Number, // in milliseconds
      required: true
    },
    totalDetections: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  errorMessage: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for performance
detectionSchema.index({ user: 1, createdAt: -1 });
detectionSchema.index({ status: 1 });
detectionSchema.index({ detectionType: 1 });
detectionSchema.index({ isPublic: 1 });

// Virtual for total detection count
detectionSchema.virtual('totalDetectionCount').get(function() {
  return (this.results.faces?.length || 0) + (this.results.bodyParts?.length || 0);
});

// Pre-save middleware to update total detections
detectionSchema.pre('save', function(next) {
  if (this.results) {
    this.results.totalDetections = (this.results.faces?.length || 0) + (this.results.bodyParts?.length || 0);
  }
  next();
});

module.exports = mongoose.model('Detection', detectionSchema);
