export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  image: string; // URL or base64 data URL
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id?: string;
  orderNumber: string;
  items: CartItem[];
  totalAmount: number;
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface SalesData {
  date: string;
  totalAmount: number;
  orderCount: number;
}

export interface MonthlySales {
  month: string;
  year: number;
  totalSales: number;
  orderCount: number;
  dailyTransactions: SalesData[];
}

export interface CategorySales {
  category: string;
  totalSales: number;
  itemCount: number;
}

export interface ItemSales {
  itemName: string;
  totalSales: number;
  quantitySold: number;
}

