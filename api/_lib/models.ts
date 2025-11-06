import mongoose, { Schema, Document } from 'mongoose';

// Order Model
export interface IOrder extends Document {
  orderNumber: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totalAmount: number;
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

const OrderSchema: Schema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed',
  },
});

// MenuItem Model
export interface IMenuItem extends Document {
  name: string;
  category: string;
  description?: string;
  price: number;
  image: string;
}

const MenuItemSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Settings Model
export interface ISettings extends Document {
  upiId?: string;
  soundNotifications?: boolean;
  autoSaveOrders?: boolean;
}

const SettingsSchema: Schema = new Schema({
  upiId: {
    type: String,
    trim: true,
    default: '',
  },
  soundNotifications: {
    type: Boolean,
    default: true,
  },
  autoSaveOrders: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'settings',
});

// Export models (will be created after connection)
export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export const MenuItem = mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
export const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

