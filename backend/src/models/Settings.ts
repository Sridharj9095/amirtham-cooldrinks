import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  shopName?: string;
  upiId?: string;
  soundNotifications?: boolean;
  autoSaveOrders?: boolean;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema({
  shopName: {
    type: String,
    trim: true,
    default: 'My Restaurant',
  },
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

// Ensure only one settings document exists by using a singleton pattern
// We'll handle this in the route by always finding/updating the first document

export default mongoose.model<ISettings>('Settings', SettingsSchema);

