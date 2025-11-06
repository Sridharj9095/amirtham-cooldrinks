import { MenuItem, CartItem } from '../types';

const MENU_STORAGE_KEY = 'amirtham_menu_items';
const CART_STORAGE_KEY = 'amirtham_cart';
const CATEGORIES_STORAGE_KEY = 'amirtham_categories';
const PENDING_ORDERS_KEY = 'amirtham_pending_orders';
const CURRENT_PENDING_ORDER_ID_KEY = 'amirtham_current_pending_order_id';

export interface PendingOrder {
  id: string;
  name: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
}

export const menuStorage = {
  getItems: (): MenuItem[] => {
    try {
      const items = localStorage.getItem(MENU_STORAGE_KEY);
      if (!items) return [];
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error reading menu items from localStorage:', error);
      return [];
    }
  },

  saveItems: (items: MenuItem[]): void => {
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving menu items to localStorage:', error);
    }
  },

  addItem: (item: MenuItem): void => {
    const items = menuStorage.getItems();
    items.push(item);
    menuStorage.saveItems(items);
  },

  updateItem: (id: string, updatedItem: Partial<MenuItem>): void => {
    const items = menuStorage.getItems();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedItem };
      menuStorage.saveItems(items);
    }
  },

  deleteItem: (id: string): void => {
    const items = menuStorage.getItems();
    const filtered = items.filter(item => item.id !== id);
    menuStorage.saveItems(filtered);
  },
};

export const cartStorage = {
  getItems: (): CartItem[] => {
    const items = localStorage.getItem(CART_STORAGE_KEY);
    return items ? JSON.parse(items) : [];
  },

  saveItems: (items: CartItem[]): void => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  },

  addItem: (item: MenuItem): void => {
    const cartItems = cartStorage.getItems();
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
      });
    }
    
    cartStorage.saveItems(cartItems);
  },

  updateQuantity: (id: string, quantity: number): void => {
    const cartItems = cartStorage.getItems();
    const item = cartItems.find(item => item.id === id);
    
    if (item) {
      if (quantity <= 0) {
        cartStorage.removeItem(id);
      } else {
        item.quantity = quantity;
        cartStorage.saveItems(cartItems);
      }
    }
  },

  removeItem: (id: string): void => {
    const cartItems = cartStorage.getItems();
    const filtered = cartItems.filter(item => item.id !== id);
    cartStorage.saveItems(filtered);
  },

  clearCart: (): void => {
    localStorage.removeItem(CART_STORAGE_KEY);
    // Also clear the pending order ID when cart is cleared
    localStorage.removeItem(CURRENT_PENDING_ORDER_ID_KEY);
  },

  getTotalItems: (): number => {
    const cartItems = cartStorage.getItems();
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalAmount: (): number => {
    const cartItems = cartStorage.getItems();
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
};

export const categoryStorage = {
  getCategories: (): string[] => {
    const categories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    return categories ? JSON.parse(categories) : ['Fresh Juices', 'Milkshakes'];
  },

  saveCategories: (categories: string[]): void => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  },

  addCategory: (category: string): void => {
    const categories = categoryStorage.getCategories();
    if (!categories.includes(category)) {
      categories.push(category);
      categoryStorage.saveCategories(categories);
    }
  },

  removeCategory: (category: string): void => {
    const categories = categoryStorage.getCategories();
    const filtered = categories.filter(cat => cat !== category);
    categoryStorage.saveCategories(filtered);
  },
};

export const pendingOrdersStorage = {
  getOrders: (): PendingOrder[] => {
    try {
      const orders = localStorage.getItem(PENDING_ORDERS_KEY);
      return orders ? JSON.parse(orders) : [];
    } catch (error) {
      console.error('Error reading pending orders from localStorage:', error);
      return [];
    }
  },

  saveOrders: (orders: PendingOrder[]): void => {
    try {
      localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving pending orders to localStorage:', error);
    }
  },

  addOrder: (name: string, items: CartItem[]): string => {
    const orders = pendingOrdersStorage.getOrders();
    const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const newOrder: PendingOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      items,
      totalAmount,
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    pendingOrdersStorage.saveOrders(orders);
    return newOrder.id;
  },

  removeOrder: (id: string): void => {
    const orders = pendingOrdersStorage.getOrders();
    const filtered = orders.filter(order => order.id !== id);
    pendingOrdersStorage.saveOrders(filtered);
  },

  getOrder: (id: string): PendingOrder | null => {
    const orders = pendingOrdersStorage.getOrders();
    return orders.find(order => order.id === id) || null;
  },

  updateOrder: (id: string, updatedOrder: Partial<PendingOrder>): void => {
    const orders = pendingOrdersStorage.getOrders();
    const index = orders.findIndex(order => order.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updatedOrder };
      pendingOrdersStorage.saveOrders(orders);
    }
  },
};

// Helper to track which pending order is currently in cart
export const currentPendingOrderStorage = {
  setCurrentPendingOrderId: (id: string | null): void => {
    if (id) {
      localStorage.setItem(CURRENT_PENDING_ORDER_ID_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_PENDING_ORDER_ID_KEY);
    }
  },

  getCurrentPendingOrderId: (): string | null => {
    try {
      return localStorage.getItem(CURRENT_PENDING_ORDER_ID_KEY);
    } catch (error) {
      console.error('Error reading current pending order ID:', error);
      return null;
    }
  },

  clearCurrentPendingOrderId: (): void => {
    localStorage.removeItem(CURRENT_PENDING_ORDER_ID_KEY);
  },
};

