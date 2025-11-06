import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { fileStorage } from '../utils/fileStorage.js';

const router = express.Router();

// Get monthly sales data
router.get('/monthly', async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;
    
    let startDate: Date;
    let endDate: Date;
    
    if (year && month) {
      startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      endDate = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);
    } else {
      // Current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
    
    let orders: any[];
    
    if (mongoose.connection.readyState === 1) {
      orders = await Order.find({
        date: { $gte: startDate, $lte: endDate },
        status: 'completed',
      });
    } else {
      // Use file storage
      const allOrders = await fileStorage.getOrders();
      orders = allOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate && order.status === 'completed';
      });
    }
    
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;
    
    // Group by day
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
    
    res.json({
      month: month || new Date().getMonth() + 1,
      year: year || new Date().getFullYear(),
      totalSales,
      orderCount,
      dailyTransactions: dailyData,
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly sales' });
  }
});

// Get category-wise sales
router.get('/category', async (req: Request, res: Response) => {
  try {
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
    
    // Note: Category information would need to be stored in order items
    // For now, we'll return a placeholder structure
    res.json({
      categories: [],
      message: 'Category data requires menu item categories to be stored in orders',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category sales' });
  }
});

// Get item-wise sales
router.get('/item', async (req: Request, res: Response) => {
  try {
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
    
    let orders: any[];
    
    if (mongoose.connection.readyState === 1) {
      orders = await Order.find({
        date: { $gte: startDate, $lte: endDate },
        status: 'completed',
      });
    } else {
      // Use file storage
      const allOrders = await fileStorage.getOrders();
      orders = allOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate && order.status === 'completed';
      });
    }
    
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
    
    res.json(itemData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item sales' });
  }
});

export default router;

