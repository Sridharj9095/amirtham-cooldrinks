import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amirtham-cooldrinks';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Server will continue to run, but database operations will fail.');
    console.error('Please ensure MongoDB is running and accessible at:', process.env.MONGODB_URI || 'mongodb://localhost:27017/amirtham-cooldrinks');
    // Don't exit - allow server to start even if DB is not available
    // This helps with debugging
  }
};

