import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Settings from '../models/Settings.js';

const router = express.Router();

// Get settings (creates default if doesn't exist)
router.get('/', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Try to find existing settings
      let settings = await Settings.findOne();
      
      // If no settings exist, create default settings
      if (!settings) {
        settings = new Settings({
          upiId: '',
          soundNotifications: true,
          autoSaveOrders: false,
        });
        await settings.save();
      }
      
      res.json({
        upiId: settings.upiId || '',
        soundNotifications: settings.soundNotifications ?? true,
        autoSaveOrders: settings.autoSaveOrders ?? false,
      });
    } else {
      // Fallback to empty settings if MongoDB not connected
      res.json({
        upiId: '',
        soundNotifications: true,
        autoSaveOrders: false,
      });
    }
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings', details: error.message });
  }
});

// Update settings
router.put('/', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const { upiId, soundNotifications, autoSaveOrders } = req.body;
      
      // Find existing settings or create new one
      let settings = await Settings.findOne();
      
      if (!settings) {
        settings = new Settings({
          upiId: upiId || '',
          soundNotifications: soundNotifications ?? true,
          autoSaveOrders: autoSaveOrders ?? false,
        });
      } else {
        // Update only provided fields
        if (upiId !== undefined) {
          settings.upiId = upiId.trim();
        }
        if (soundNotifications !== undefined) {
          settings.soundNotifications = soundNotifications;
        }
        if (autoSaveOrders !== undefined) {
          settings.autoSaveOrders = autoSaveOrders;
        }
      }
      
      await settings.save();
      
      res.json({
        upiId: settings.upiId || '',
        soundNotifications: settings.soundNotifications ?? true,
        autoSaveOrders: settings.autoSaveOrders ?? false,
      });
    } else {
      res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
  } catch (error: any) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings', details: error.message });
  }
});

// Update UPI ID specifically
router.put('/upi-id', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const { upiId } = req.body;
      
      if (typeof upiId !== 'string') {
        return res.status(400).json({ error: 'UPI ID must be a string' });
      }
      
      // Find existing settings or create new one
      let settings = await Settings.findOne();
      
      if (!settings) {
        settings = new Settings({
          upiId: upiId.trim(),
          soundNotifications: true,
          autoSaveOrders: false,
        });
      } else {
        settings.upiId = upiId.trim();
      }
      
      await settings.save();
      
      res.json({
        upiId: settings.upiId || '',
        message: 'UPI ID updated successfully',
      });
    } else {
      res.status(503).json({ error: 'Database not connected. Please check MongoDB connection.' });
    }
  } catch (error: any) {
    console.error('Error updating UPI ID:', error);
    res.status(500).json({ error: 'Failed to update UPI ID', details: error.message });
  }
});

export default router;

