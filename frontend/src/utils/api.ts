import axios from 'axios';
import { MenuItem } from '../types';

// Use relative path in production, localhost in development
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');

// Export helper function to get API base URL
export const getApiBaseUrl = (): string => {
  return import.meta.env.PROD 
    ? '/api' 
    : (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menu Items API
export const menuItemsAPI = {
  // Get all menu items
  getAll: async (): Promise<MenuItem[]> => {
    try {
      const response = await api.get<MenuItem[]>('/menu-items');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching menu items:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch menu items');
    }
  },

  // Get single menu item by ID
  getById: async (id: string): Promise<MenuItem> => {
    try {
      const response = await api.get<MenuItem>(`/menu-items/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching menu item:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch menu item');
    }
  },

  // Create new menu item
  create: async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    try {
      const response = await api.post<MenuItem>('/menu-items', item);
      return response.data;
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      throw new Error(error.response?.data?.error || 'Failed to create menu item');
    }
  },

  // Update menu item
  update: async (id: string, item: Partial<Omit<MenuItem, 'id'>>): Promise<MenuItem> => {
    try {
      const response = await api.put<MenuItem>(`/menu-items/${id}`, item);
      return response.data;
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      throw new Error(error.response?.data?.error || 'Failed to update menu item');
    }
  },

  // Delete menu item
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/menu-items/${id}`);
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete menu item');
    }
  },
};

// Orders API
export const ordersAPI = {
  // Create new order
  create: async (order: {
    orderNumber?: string;
    items: any[];
    totalAmount: number;
  }): Promise<any> => {
    try {
      const response = await api.post('/orders', order);
      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw new Error(error.response?.data?.error || 'Failed to create order');
    }
  },

  // Get all orders
  getAll: async (): Promise<any[]> => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch orders');
    }
  },

  // Get order by ID
  getById: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch order');
    }
  },

  // Delete order
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/orders/${id}`);
    } catch (error: any) {
      console.error('Error deleting order:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete order');
    }
  },
};

// Sales API
export const salesAPI = {
  // Get monthly sales
  getMonthly: async (year?: number, month?: number): Promise<any> => {
    try {
      const params: any = {};
      if (year) params.year = year;
      if (month) params.month = month;
      const response = await api.get('/sales/monthly', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching monthly sales:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch monthly sales');
    }
  },

  // Get item-wise sales
  getItemWise: async (year?: number, month?: number): Promise<any> => {
    try {
      const params: any = {};
      if (year) params.year = year;
      if (month) params.month = month;
      const response = await api.get('/sales/item', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching item-wise sales:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch item-wise sales');
    }
  },
};

export default api;

