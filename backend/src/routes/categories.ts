import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// Get all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
      const formattedCategories = categories.map(cat => ({
        id: (cat._id as mongoose.Types.ObjectId).toString(),
        name: cat.name,
        displayOrder: cat.displayOrder || 0,
      }));
      res.json(formattedCategories);
    } else {
      res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories', details: error.message });
  }
});

// Get single category by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({
        id: (category._id as mongoose.Types.ObjectId).toString(),
        name: category.name,
        displayOrder: category.displayOrder || 0,
      });
    } else {
      res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
  } catch (error: any) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category', details: error.message });
  }
});

// Create new category
router.post('/', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const { name, displayOrder } = req.body;
      
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required and must be a non-empty string' });
      }

      // Check if category already exists
      const existingCategory = await Category.findOne({ name: name.trim() });
      if (existingCategory) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }

      const category = new Category({
        name: name.trim(),
        displayOrder: displayOrder || 0,
      });
      
      const savedCategory = await category.save();
      res.status(201).json({
        id: (savedCategory._id as mongoose.Types.ObjectId).toString(),
        name: savedCategory.name,
        displayOrder: savedCategory.displayOrder || 0,
      });
    } else {
      res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Category with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category', details: error.message });
    }
  }
});

// Update category
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const { name, displayOrder } = req.body;
      
      if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
        return res.status(400).json({ error: 'Category name must be a non-empty string' });
      }

      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Check if new name conflicts with existing category
      if (name && name.trim() !== category.name) {
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
          return res.status(400).json({ error: 'Category with this name already exists' });
        }
      }

      if (name !== undefined) {
        category.name = name.trim();
      }
      if (displayOrder !== undefined) {
        category.displayOrder = displayOrder;
      }

      const updatedCategory = await category.save();
      res.json({
        id: (updatedCategory._id as mongoose.Types.ObjectId).toString(),
        name: updatedCategory.name,
        displayOrder: updatedCategory.displayOrder || 0,
      });
    } else {
      res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
  } catch (error: any) {
    console.error('Error updating category:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Category with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update category', details: error.message });
    }
  }
});

// Delete category
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Check if any menu items are using this category
      const itemsWithCategory = await MenuItem.countDocuments({ category: category.name });
      if (itemsWithCategory > 0) {
        return res.status(400).json({ 
          error: `Cannot delete category. ${itemsWithCategory} menu item(s) are using this category. Please reassign or delete those items first.` 
        });
      }

      await Category.findByIdAndDelete(req.params.id);
      res.json({ message: 'Category deleted successfully' });
    } else {
      res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category', details: error.message });
  }
});

export default router;

