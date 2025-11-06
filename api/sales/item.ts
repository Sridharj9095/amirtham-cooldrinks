import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { Order } from '../_lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { year, month } = req.query;

    let startDate: Date;
    let endDate: Date;

    if (year && month) {
      startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      endDate = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const orders = await Order.find({
      date: { $gte: startDate, $lte: endDate },
      status: 'completed',
    });

    const itemSales: { [key: string]: { totalSales: number; quantitySold: number } } = {};

    orders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = { totalSales: 0, quantitySold: 0 };
        }
        itemSales[item.name].totalSales += item.price * item.quantity;
        itemSales[item.name].quantitySold += item.quantity;
      });
    });

    const itemData = Object.entries(itemSales).map(([itemName, data]) => ({
      itemName,
      totalSales: data.totalSales,
      quantitySold: data.quantitySold,
    }));

    return res.json(itemData);
  } catch (error: any) {
    console.error('Error fetching item sales:', error);
    return res.status(500).json({ error: 'Failed to fetch item sales', details: error.message });
  }
}

