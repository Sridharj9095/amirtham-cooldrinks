import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { Settings } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      let settings = await Settings.findOne();

      if (!settings) {
        settings = new Settings({
          upiId: '',
          soundNotifications: true,
          autoSaveOrders: false,
        });
        await settings.save();
      }

      return res.json({
        upiId: settings.upiId || '',
        soundNotifications: settings.soundNotifications ?? true,
        autoSaveOrders: settings.autoSaveOrders ?? false,
      });
    }

    if (req.method === 'PUT') {
      const { upiId, soundNotifications, autoSaveOrders } = req.body;

      let settings = await Settings.findOne();

      if (!settings) {
        settings = new Settings({
          upiId: upiId || '',
          soundNotifications: soundNotifications ?? true,
          autoSaveOrders: autoSaveOrders ?? false,
        });
      } else {
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

      return res.json({
        upiId: settings.upiId || '',
        soundNotifications: settings.soundNotifications ?? true,
        autoSaveOrders: settings.autoSaveOrders ?? false,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in settings API:', error);
    return res.status(500).json({ error: 'Failed to process request', details: error.message });
  }
}

