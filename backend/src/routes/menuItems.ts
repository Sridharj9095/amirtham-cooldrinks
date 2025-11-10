import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// Get all menu items
router.get('/', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const items = await MenuItem.find().sort({ createdAt: -1 });
      // Convert to frontend format (add id field from _id)
      const formattedItems = items.map(item => ({
        id: (item._id as mongoose.Types.ObjectId).toString(),
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        image: item.image,
      }));
      res.json(formattedItems);
    } else {
      res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items', details: error.message });
  }
});

// Get single menu item by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const item = await MenuItem.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      // Convert to frontend format
      res.json({
        id: (item._id as mongoose.Types.ObjectId).toString(),
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        image: item.image,
      });
    } else {
      res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
  } catch (error: any) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item', details: error.message });
  }
});

// Create new menu item
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category, description, price, image } = req.body;

    // Validate required fields
    if (!name || !category || price === undefined || !image) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'name, category, price, and image are required'
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    if (mongoose.connection.readyState === 1) {
      const menuItem = new MenuItem({
        name: name.trim(),
        category: category.trim(),
        description: description?.trim(),
        price,
        image,
      });

      const savedItem = await menuItem.save();
      console.log('Menu item saved to MongoDB:', savedItem.name);

      // Convert to frontend format
      res.status(201).json({
        id: (savedItem._id as mongoose.Types.ObjectId).toString(),
        name: savedItem.name,
        category: savedItem.category,
        description: savedItem.description,
        price: savedItem.price,
        image: savedItem.image,
      });
    } else {
      res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create menu item', details: error.message });
  }
});

// Update menu item
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, category, description, price, image } = req.body;

    if (mongoose.connection.readyState === 1) {
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name.trim();
      if (category !== undefined) updateData.category = category.trim();
      if (description !== undefined) updateData.description = description?.trim();
      if (price !== undefined) {
        if (typeof price !== 'number' || price < 0) {
          return res.status(400).json({ error: 'Price must be a positive number' });
        }
        updateData.price = price;
      }
      if (image !== undefined) updateData.image = image;

      const item = await MenuItem.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      console.log('Menu item updated in MongoDB:', item.name);

      // Convert to frontend format
      res.json({
        id: (item._id as mongoose.Types.ObjectId).toString(),
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        image: item.image,
      });
    } else {
      res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.message });
    }
    
    res.status(500).json({ error: 'Failed to update menu item', details: error.message });
  }
});

// Delete menu item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const item = await MenuItem.findByIdAndDelete(req.params.id);
      
      if (!item) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      console.log('Menu item deleted from MongoDB:', item.name);
      res.json({ message: 'Menu item deleted successfully' });
    } else {
      res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item', details: error.message });
  }
});

export default router;

