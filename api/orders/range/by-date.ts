import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../_lib/db';
import { Order } from '../../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before or equal to end date' });
    }

    const result = await Order.deleteMany({
      date: {
        $gte: start,
        $lte: end,
      },
    });

    return res.json({
      message: 'Orders deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('Error deleting orders by date range:', error);
    return res.status(500).json({ error: 'Failed to delete orders', details: error.message });
  }
}

