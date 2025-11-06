import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { Settings } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { upiId } = req.body;

    if (typeof upiId !== 'string') {
      return res.status(400).json({ error: 'UPI ID must be a string' });
    }

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

    return res.json({
      upiId: settings.upiId || '',
      message: 'UPI ID updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating UPI ID:', error);
    return res.status(500).json({ error: 'Failed to update UPI ID', details: error.message });
  }
}

