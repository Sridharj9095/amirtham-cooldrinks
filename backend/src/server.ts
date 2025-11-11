import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import orderRoutes from './routes/orders.js';
import salesRoutes from './routes/sales.js';
import menuItemRoutes from './routes/menuItems.js';
import settingsRoutes from './routes/settings.js';
import categoryRoutes from './routes/categories.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
// Determine if we're in production (Render.com or production environment)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

const corsOptions = {
  origin: process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.split(',').map(url => url.trim()) // Support multiple origins (comma-separated)
    : (isProduction 
        ? [
            'https://my-new-restaurant-frontend.vercel.app', // Current Vercel frontend URL
            'https://amirtham-cooldrinks-frontend.vercel.app', // Previous Vercel frontend URL (for backward compatibility)
          ]
        : ['http://localhost:3000', 'http://localhost:5173']), // Allow localhost for development
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Log CORS configuration for debugging
console.log('CORS Configuration:', {
  isProduction,
  clientUrl: process.env.CLIENT_URL || 'Not set',
  allowedOrigins: corsOptions.origin
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free the port or use a different port.`);
    console.error('To find and kill the process using port 5000, run: lsof -ti:5000 | xargs kill -9');
    process.exit(1);
  } else {
    throw err;
  }
});

