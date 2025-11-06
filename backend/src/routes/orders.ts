import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { fileStorage } from '../utils/fileStorage.js';

const router = express.Router();

// Create new order
router.post('/', async (req: Request, res: Response) => {
  try {
    const { orderNumber, items, totalAmount } = req.body;
    
    console.log('Received order request:', { orderNumber, itemsCount: items?.length, totalAmount });
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }
    
    if (!totalAmount || typeof totalAmount !== 'number') {
      return res.status(400).json({ error: 'Total amount is required and must be a number' });
    }
    
    // Use provided orderNumber or generate a new one
    const finalOrderNumber = orderNumber || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Try MongoDB first, fallback to file storage
    if (mongoose.connection.readyState === 1) {
      // MongoDB is connected - use it
      const order = new Order({
        orderNumber: finalOrderNumber,
        items,
        totalAmount,
        date: new Date(),
        status: 'completed',
      });
      
      const savedOrder = await order.save();
      console.log('Order saved to MongoDB:', savedOrder.orderNumber);
      res.status(201).json(savedOrder);
    } else {
      // MongoDB not available - use file storage
      console.log('MongoDB not available, saving to file storage');
      const orderData = {
        orderNumber: finalOrderNumber,
        items,
        totalAmount,
        date: new Date().toISOString(),
        status: 'completed',
      };
      
      const savedOrder = await fileStorage.saveOrder(orderData);
      console.log('Order saved to file storage:', savedOrder.orderNumber);
      res.status(201).json(savedOrder);
    }
  } catch (error: any) {
    console.error('Error creating order:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.message });
    }
    
    // Handle MongoDB connection errors
    if (error.name === 'MongoServerError' || error.message?.includes('Mongo')) {
      return res.status(500).json({ error: 'Database error. Please check MongoDB connection.' });
    }
    
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Get all orders
router.get('/', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find().sort({ date: -1 });
      res.json(orders);
    } else {
      const orders = await fileStorage.getOrders();
      // Sort by date descending
      orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.json(orders);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get specific order
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } else {
      const order = await fileStorage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Delete order by ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ message: 'Order deleted successfully' });
    } else {
      const deleted = await fileStorage.deleteOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ message: 'Order deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Delete orders by date range
router.delete('/range/by-date', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before or equal to end date' });
    }

    if (mongoose.connection.readyState === 1) {
      // MongoDB is connected - use it
      const result = await Order.deleteMany({
        date: {
          $gte: start,
          $lte: end,
        },
      });

      console.log(`Deleted ${result.deletedCount} orders from MongoDB (${start.toISOString()} to ${end.toISOString()})`);
      res.json({ 
        message: 'Orders deleted successfully', 
        deletedCount: result.deletedCount 
      });
    } else {
      // MongoDB not available - use file storage
      const deletedCount = await fileStorage.deleteOrdersByDateRange(start, end);
      console.log(`Deleted ${deletedCount} orders from file storage (${start.toISOString()} to ${end.toISOString()})`);
      res.json({ 
        message: 'Orders deleted successfully', 
        deletedCount 
      });
    }
  } catch (error: any) {
    console.error('Error deleting orders by date range:', error);
    res.status(500).json({ error: 'Failed to delete orders', details: error.message });
  }
});

export default router;

