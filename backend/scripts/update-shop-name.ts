/**
 * Script to update shop name in MongoDB
 * 
 * This script updates the shop name in the settings collection.
 * Run this script if you want to change the shop name directly in MongoDB.
 * 
 * Usage:
 *   npm run update-shop-name
 *   or
 *   ts-node scripts/update-shop-name.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from '../src/models/Settings.js';

// Load environment variables
dotenv.config();

const updateShopName = async (newShopName: string = 'My Restaurant') => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amirtham-cooldrinks';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Find existing settings
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create new settings with the new shop name
      settings = new Settings({
        shopName: newShopName,
        upiId: '',
        soundNotifications: true,
        autoSaveOrders: false,
      });
      await settings.save();
      console.log(`✅ Created new settings with shop name: "${newShopName}"`);
    } else {
      // Update existing settings
      const oldShopName = settings.shopName || 'Not set';
      settings.shopName = newShopName;
      await settings.save();
      console.log(`✅ Updated shop name from "${oldShopName}" to "${newShopName}"`);
    }

    console.log('\n📋 Current Settings:');
    console.log(`   Shop Name: ${settings.shopName}`);
    console.log(`   UPI ID: ${settings.upiId || 'Not set'}`);
    console.log(`   Sound Notifications: ${settings.soundNotifications}`);
    console.log(`   Auto Save Orders: ${settings.autoSaveOrders}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error updating shop name:', error);
    process.exit(1);
  }
};

// Get shop name from command line argument or use default
const newShopName = process.argv[2] || 'My Restaurant';

console.log(`\n🎯 Updating shop name to: "${newShopName}"\n`);
updateShopName(newShopName);

