import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { MenuItem } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
    const { id } = req.query;

    if (req.method === 'GET') {
      const item = await MenuItem.findById(id);
      if (!item) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      return res.json({
        id: item._id.toString(),
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        image: item.image,
      });
    }

    if (req.method === 'PUT') {
      const { name, category, description, price, image } = req.body;
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

      const item = await MenuItem.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!item) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      return res.json({
        id: item._id.toString(),
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        image: item.image,
      });
    }

    if (req.method === 'DELETE') {
      const item = await MenuItem.findByIdAndDelete(id);
      if (!item) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      return res.json({ message: 'Menu item deleted successfully' });
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

