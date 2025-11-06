import mongoose from 'mongoose';

// Cache the connection to reuse across serverless function invocations
let cachedConnection: typeof mongoose | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  // Return cached connection if available
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // If connection exists but not ready, wait for it
  if (cachedConnection) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
    });
    return cachedConnection;
  }

  // Create new connection
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    cachedConnection = conn;
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

