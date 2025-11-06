/**
 * Test MongoDB Connection Script
 * 
 * This script helps verify your MongoDB Atlas connection is working correctly.
 * 
 * Usage:
 *   npx tsx scripts/test-connection.ts
 * 
 * Or add to package.json:
 *   "test:connection": "tsx scripts/test-connection.ts"
 * 
 * Make sure your .env file is configured before running this script.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import MenuItem from '../src/models/MenuItem.js';
import Order from '../src/models/Order.js';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  console.log('🔍 Testing MongoDB Atlas Connection...\n');

  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI not found in .env file');
    console.log('\n📝 Please create a .env file in the backend directory with:');
    console.log('   MONGODB_URI=your_connection_string_here\n');
    process.exit(1);
  }

  console.log('📋 Configuration:');
  console.log(`   URI: ${process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')}`); // Hide password
  console.log(`   Port: ${process.env.PORT || 5001}\n`);

  try {
    // Attempt to connect
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas!\n');

    // Test MenuItem model
    console.log('📦 Testing MenuItem model...');
    const menuItemCount = await MenuItem.countDocuments();
    console.log(`   ✅ MenuItem model works! (${menuItemCount} items in database)\n`);

    // Test Order model
    console.log('📦 Testing Order model...');
    const orderCount = await Order.countDocuments();
    console.log(`   ✅ Order model works! (${orderCount} orders in database)\n`);

    // Test creating a sample menu item (optional)
    console.log('🧪 Testing create operation...');
    const testItem = new MenuItem({
      name: 'Test Item - ' + Date.now(),
      category: 'Test',
      price: 99.99,
      image: 'https://via.placeholder.com/300',
    });
    await testItem.save();
    console.log('   ✅ Create operation successful!');
    
    // Clean up test item
    await MenuItem.deleteOne({ _id: testItem._id });
    console.log('   🧹 Test item cleaned up\n');

    // Database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Database Collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    console.log('');

    console.log('🎉 All tests passed! Your MongoDB Atlas setup is working correctly.\n');
    console.log('💡 Next steps:');
    console.log('   1. Start your backend server: npm run dev');
    console.log('   2. Start your frontend: cd ../frontend && npm run dev');
    console.log('   3. Test adding menu items through the UI\n');

  } catch (error) {
    console.error('\n❌ Connection failed!\n');
    console.error('Error details:');
    console.error(error.message);
    console.error('\n🔧 Troubleshooting:');
    
    if (error.message.includes('authentication')) {
      console.error('   - Check your username and password in .env');
      console.error('   - Verify database user exists in MongoDB Atlas');
    } else if (error.message.includes('IP')) {
      console.error('   - Add your IP to MongoDB Atlas Network Access');
      console.error('   - Or allow access from anywhere (0.0.0.0/0) for development');
    } else if (error.message.includes('timeout')) {
      console.error('   - Check your internet connection');
      console.error('   - Verify cluster name in connection string');
      console.error('   - Check if firewall is blocking connection');
    } else {
      console.error('   - Verify connection string format in .env');
      console.error('   - Check MongoDB Atlas cluster status');
      console.error('   - Review MongoDB Atlas dashboard for errors');
    }
    
    console.error('\n📖 See SETUP_GUIDE.md for detailed instructions\n');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
  }
};

// Run the test
testConnection();

