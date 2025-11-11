import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  collection: 'categories',
});

export default mongoose.model<ICategory>('Category', CategorySchema);

