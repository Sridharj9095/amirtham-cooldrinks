import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { Order } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === 'POST') {
      // Create new order
      const { orderNumber, items, totalAmount } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items array is required and cannot be empty' });
      }

      if (!totalAmount || typeof totalAmount !== 'number') {
        return res.status(400).json({ error: 'Total amount is required and must be a number' });
      }

      const finalOrderNumber = orderNumber || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const order = new Order({
        orderNumber: finalOrderNumber,
        items,
        totalAmount,
        date: new Date(),
        status: 'completed',
      });

      const savedOrder = await order.save();
      return res.status(201).json(savedOrder);
    }

    if (req.method === 'GET') {
      // Get all orders
      const orders = await Order.find().sort({ date: -1 });
      return res.json(orders);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in orders API:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.message });
    }
    return res.status(500).json({ error: 'Failed to process request', details: error.message });
  }
}

