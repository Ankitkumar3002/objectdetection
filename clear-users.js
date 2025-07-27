const path = require('path');
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-detection')
  .then(() => {
    console.log('Connected to MongoDB');
    return clearUsers();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function clearUsers() {
  try {
    const User = require('./models/User');
    
    // Show existing users
    const existingUsers = await User.find({}, 'name email role createdAt');
    console.log('\n📋 Existing users in database:');
    if (existingUsers.length === 0) {
      console.log('✅ No users found in database - you can register with any email!');
      process.exit(0);
    }
    
    existingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - Created: ${user.createdAt.toLocaleDateString()}`);
    });
    
    console.log(`\n💡 Found ${existingUsers.length} existing user(s).`);
    console.log('🔄 To clear the database and allow registration with any email, uncomment the delete line in the script.');
    
    // UNCOMMENT THE NEXT 3 LINES TO ACTUALLY DELETE USERS:
    // const result = await User.deleteMany({});
    // console.log(`\n🗑️  Deleted ${result.deletedCount} users from database`);
    // console.log('✅ Database cleared! You can now register with any email.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking users:', error);
    process.exit(1);
  }
}
