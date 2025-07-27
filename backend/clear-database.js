const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-detection')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return clearDatabase();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function clearDatabase() {
  try {
    const User = require('./models/User');
    const Detection = require('./models/Detection');
    
    // Clear all users
    const userResult = await User.deleteMany({});
    console.log(`🗑️  Deleted ${userResult.deletedCount} users`);
    
    // Clear all detections
    const detectionResult = await Detection.deleteMany({});
    console.log(`🗑️  Deleted ${detectionResult.deletedCount} detections`);
    
    console.log('\n✅ Database completely cleared!');
    console.log('🎯 You can now register with any email address.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}
