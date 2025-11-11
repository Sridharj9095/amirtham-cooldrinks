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
const corsOptions = {
  origin: process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.split(',').map(url => url.trim()) // Support multiple origins (comma-separated)
    : (process.env.NODE_ENV === 'production' 
        ? ['https://amirtham-cooldrinks-frontend.vercel.app'] // Vercel frontend URL
        : ['http://localhost:3000', 'http://localhost:5173']), // Allow localhost for development
  credentials: true,
  optionsSuccessStatus: 200
};

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

