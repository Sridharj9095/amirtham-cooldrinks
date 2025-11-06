import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORDERS_FILE = path.join(__dirname, '../../data/orders.json');

interface OrderData {
  _id?: string;
  orderNumber: string;
  items: any[];
  totalAmount: number;
  date: string;
  status: string;
}

export const fileStorage = {
  ensureDataDir: async (): Promise<void> => {
    const dataDir = path.dirname(ORDERS_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  },

  readOrders: async (): Promise<OrderData[]> => {
    try {
      await fileStorage.ensureDataDir();
      const data = await fs.readFile(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  },

  writeOrders: async (orders: OrderData[]): Promise<void> => {
    await fileStorage.ensureDataDir();
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  },

  saveOrder: async (order: OrderData): Promise<OrderData> => {
    const orders = await fileStorage.readOrders();
    const orderWithId = {
      ...order,
      _id: order._id || `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    orders.push(orderWithId);
    await fileStorage.writeOrders(orders);
    return orderWithId;
  },

  getOrders: async (): Promise<OrderData[]> => {
    return await fileStorage.readOrders();
  },

  getOrderById: async (id: string): Promise<OrderData | null> => {
    const orders = await fileStorage.readOrders();
    return orders.find(o => o._id === id) || null;
  },

  deleteOrder: async (id: string): Promise<boolean> => {
    const orders = await fileStorage.readOrders();
    const filtered = orders.filter(o => o._id !== id);
    if (filtered.length === orders.length) {
      return false; // Order not found
    }
    await fileStorage.writeOrders(filtered);
    return true;
  },

  deleteOrdersByDateRange: async (startDate: Date, endDate: Date): Promise<number> => {
    const orders = await fileStorage.readOrders();
    const start = startDate.getTime();
    const end = endDate.getTime();
    
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.date).getTime();
      return orderDate < start || orderDate > end;
    });
    
    const deletedCount = orders.length - filtered.length;
    await fileStorage.writeOrders(filtered);
    return deletedCount;
  },
};

