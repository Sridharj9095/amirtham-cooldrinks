/**
 * Migration Script: Import initialMenuData to MongoDB
 * 
 * This script imports all menu items from initialMenuData.ts into MongoDB Atlas.
 * 
 * Usage:
 *   npx tsx scripts/migrate-menu-items.ts
 * 
 * Make sure your .env file is configured and MongoDB is connected.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import MenuItem from '../src/models/MenuItem.js';

// Load environment variables
dotenv.config();

// Import menu items data (same structure as frontend)
const initialMenuItems = [
  // Fresh Juices
  {
    name: 'Orange Juice',
    category: 'Fresh Juices',
    description: 'Fresh and tangy orange juice',
    price: 50,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  {
    name: 'Mango Juice',
    category: 'Fresh Juices',
    description: 'Sweet and delicious mango juice',
    price: 60,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  {
    name: 'Watermelon Juice',
    category: 'Fresh Juices',
    description: 'Refreshing watermelon juice',
    price: 55,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  {
    name: 'Mosambi Juice',
    category: 'Fresh Juices',
    description: 'Sweet lime juice',
    price: 50,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  {
    name: 'Pineapple Juice',
    category: 'Fresh Juices',
    description: 'Tropical pineapple juice',
    price: 55,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  {
    name: 'Pomegranate Juice',
    category: 'Fresh Juices',
    description: 'Healthy pomegranate juice',
    price: 70,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  {
    name: 'Apple Juice',
    category: 'Fresh Juices',
    description: 'Crisp apple juice',
    price: 55,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  {
    name: 'Mixed Fruit Juice',
    category: 'Fresh Juices',
    description: 'Assorted fruit juice',
    price: 65,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  {
    name: 'Guava Juice',
    category: 'Fresh Juices',
    description: 'Tropical guava juice',
    price: 50,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  {
    name: 'Papaya Juice',
    category: 'Fresh Juices',
    description: 'Healthy papaya juice',
    price: 50,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
  },
  // Milkshakes
  {
    name: 'Mango Milkshake',
    category: 'Milkshakes',
    description: 'Creamy mango milkshake',
    price: 80,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
  },
  {
    name: 'Chocolate Milkshake',
    category: 'Milkshakes',
    description: 'Rich chocolate milkshake',
    price: 85,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
  },
  {
    name: 'Strawberry Milkshake',
    category: 'Milkshakes',
    description: 'Sweet strawberry milkshake',
    price: 85,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
  },
  {
    name: 'Vanilla Milkshake',
    category: 'Milkshakes',
    description: 'Classic vanilla milkshake',
    price: 75,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
  },
  {
    name: 'Banana Milkshake',
    category: 'Milkshakes',
    description: 'Creamy banana milkshake',
    price: 75,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
  },
  {
    name: 'Butterscotch Milkshake',
    category: 'Milkshakes',
    description: 'Delicious butterscotch milkshake',
    price: 90,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
  },
  {
    name: 'Pineapple Milkshake',
    category: 'Milkshakes',
    description: 'Tropical pineapple milkshake',
    price: 80,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
  },
  {
    name: 'Rose Milkshake',
    category: 'Milkshakes',
    description: 'Fragrant rose milkshake',
    price: 85,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
  },
  {
    name: 'Badam Milkshake',
    category: 'Milkshakes',
    description: 'Almond milkshake',
    price: 95,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
  },
  {
    name: 'Kesar Milkshake',
    category: 'Milkshakes',
    description: 'Saffron milkshake',
    price: 100,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
  },
];

const migrateMenuItems = async () => {
  console.log('🚀 Starting menu items migration to MongoDB...\n');

  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI not found in .env file');
    console.log('\n📝 Please configure your .env file first.\n');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas!\n');

    // Check existing items
    const existingCount = await MenuItem.countDocuments();
    console.log(`📊 Current menu items in database: ${existingCount}\n`);

    if (existingCount > 0) {
      console.log('⚠️  Warning: Database already has menu items.');
      console.log('   This script will add new items but skip duplicates (by name).\n');
    }

    // Import items
    let added = 0;
    let skipped = 0;
    let errors = 0;

    console.log('📦 Importing menu items...\n');

    for (const item of initialMenuItems) {
      try {
        // Check if item with same name already exists
        const existing = await MenuItem.findOne({ name: item.name });
        
        if (existing) {
          console.log(`⏭️  Skipped: "${item.name}" (already exists)`);
          skipped++;
        } else {
          const menuItem = new MenuItem(item);
          await menuItem.save();
          console.log(`✅ Added: "${item.name}" (${item.category}) - ₹${item.price}`);
          added++;
        }
      } catch (error: any) {
        console.error(`❌ Error adding "${item.name}":`, error.message);
        errors++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Added: ${added} items`);
    console.log(`⏭️  Skipped: ${skipped} items (duplicates)`);
    console.log(`❌ Errors: ${errors} items`);
    console.log(`📦 Total processed: ${initialMenuItems.length} items`);
    console.log('='.repeat(50) + '\n');

    // Final count
    const finalCount = await MenuItem.countDocuments();
    console.log(`📊 Total menu items in database: ${finalCount}\n`);

    if (added > 0) {
      console.log('🎉 Migration completed successfully!\n');
      console.log('💡 Next steps:');
      console.log('   1. Check MongoDB Atlas → Collections → menuitems');
      console.log('   2. Test your frontend - menu items should appear');
      console.log('   3. You can now add/edit/delete items through the UI\n');
    } else if (skipped === initialMenuItems.length) {
      console.log('ℹ️  All items already exist in database. No new items added.\n');
    }

  } catch (error: any) {
    console.error('\n❌ Migration failed!\n');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   - Check MongoDB connection');
    console.error('   - Verify .env file is configured correctly');
    console.error('   - Ensure MongoDB Atlas is accessible\n');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
  }
};

// Run migration
migrateMenuItems();

