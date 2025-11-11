import axios from 'axios';
import { MenuItem } from '../types';

// Use environment variable for API URL, fallback to localhost in development
// Ensure VITE_API_URL includes /api at the end
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // If VITE_API_URL is set, ensure it ends with /api
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  return import.meta.env.PROD 
    ? 'https://amirtham-cooldrinks-backend.onrender.com/api'
    : 'http://localhost:5001/api';
};

const API_BASE_URL = getBaseUrl();

// Export helper function to get API base URL
export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  return import.meta.env.PROD 
    ? 'https://amirtham-cooldrinks-backend.onrender.com/api'
    : 'http://localhost:5001/api';
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for Render's cold starts
});

// Add request interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silently handle errors - they will be caught by individual API calls
    return Promise.reject(error);
  }
);

// Menu Items API
export const menuItemsAPI = {
  // Get all menu items
  getAll: async (): Promise<MenuItem[]> => {
    try {
      const response = await api.get<MenuItem[]>('/menu-items');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch menu items');
    }
  },

  // Get single menu item by ID
  getById: async (id: string): Promise<MenuItem> => {
    try {
      const response = await api.get<MenuItem>(`/menu-items/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch menu item');
    }
  },

  // Create new menu item
  create: async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    try {
      const response = await api.post<MenuItem>('/menu-items', item);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create menu item');
    }
  },

  // Update menu item
  update: async (id: string, item: Partial<Omit<MenuItem, 'id'>>): Promise<MenuItem> => {
    try {
      const response = await api.put<MenuItem>(`/menu-items/${id}`, item);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update menu item');
    }
  },

  // Delete menu item
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/menu-items/${id}`);
    } catch (error: any) {
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
      throw new Error(error.response?.data?.error || 'Failed to create order');
    }
  },

  // Get all orders
  getAll: async (): Promise<any[]> => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch orders');
    }
  },

  // Get order by ID
  getById: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch order');
    }
  },

  // Delete order
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/orders/${id}`);
    } catch (error: any) {
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
      throw new Error(error.response?.data?.error || 'Failed to fetch item-wise sales');
    }
  },
};

// Category interface
export interface Category {
  id: string;
  name: string;
  displayOrder?: number;
}

// Categories API
export const categoriesAPI = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await api.get<Category[]>('/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch categories');
    }
  },

  // Get single category by ID
  getById: async (id: string): Promise<Category> => {
    try {
      const response = await api.get<Category>(`/categories/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch category');
    }
  },

  // Create new category
  create: async (category: { name: string; displayOrder?: number }): Promise<Category> => {
    try {
      const response = await api.post<Category>('/categories', category);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create category');
    }
  },

  // Update category
  update: async (id: string, category: { name?: string; displayOrder?: number }): Promise<Category> => {
    try {
      const response = await api.put<Category>(`/categories/${id}`, category);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update category');
    }
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete category');
    }
  },
};

export default api;

