import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { MenuItem } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const items = await MenuItem.find().sort({ createdAt: -1 });
      const formattedItems = items.map(item => ({
        id: item._id.toString(),
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        image: item.image,
      }));
      return res.json(formattedItems);
    }

    if (req.method === 'POST') {
      const { name, category, description, price, image } = req.body;

      if (!name || !category || price === undefined || !image) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'name, category, price, and image are required',
        });
      }

      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }

      const menuItem = new MenuItem({
        name: name.trim(),
        category: category.trim(),
        description: description?.trim(),
        price,
        image,
      });

      const savedItem = await menuItem.save();
      return res.status(201).json({
        id: savedItem._id.toString(),
        name: savedItem.name,
        category: savedItem.category,
        description: savedItem.description,
        price: savedItem.price,
        image: savedItem.image,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in menu-items API:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.message });
    }
    return res.status(500).json({ error: 'Failed to process request', details: error.message });
  }
}

