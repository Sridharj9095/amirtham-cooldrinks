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

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;

    const dailyTransactions: { [key: string]: { totalAmount: number; orderCount: number } } = {};

    orders.forEach(order => {
      const orderDate = order.date instanceof Date ? order.date : new Date(order.date);
      const dateStr = orderDate.toISOString().split('T')[0];
      if (!dailyTransactions[dateStr]) {
        dailyTransactions[dateStr] = { totalAmount: 0, orderCount: 0 };
      }
      dailyTransactions[dateStr].totalAmount += order.totalAmount;
      dailyTransactions[dateStr].orderCount += 1;
    });

    const dailyData = Object.entries(dailyTransactions).map(([date, data]) => ({
      date,
      totalAmount: data.totalAmount,
      orderCount: data.orderCount,
    }));

    return res.json({
      month: month || new Date().getMonth() + 1,
      year: year || new Date().getFullYear(),
      totalSales,
      orderCount,
      dailyTransactions: dailyData,
      orders: orders,
    });
  } catch (error: any) {
    console.error('Error fetching monthly sales:', error);
    return res.status(500).json({ error: 'Failed to fetch monthly sales', details: error.message });
  }
}

