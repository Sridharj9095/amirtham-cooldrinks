# Amirtham Cooldrinks - Restaurant Management System

A modern, full-stack restaurant management system built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

- 🍽️ **Menu Management**: Add, edit, delete menu items with categories
- 🛒 **Shopping Cart**: Multi-order management for handling multiple customers
- 💰 **Billing System**: Generate bills, print receipts, and process payments
- 📊 **Sales Reports**: View daily, monthly sales with charts and detailed transactions
- ⚙️ **Settings**: Configure UPI ID, theme (light/dark mode), and preferences
- 📱 **Responsive Design**: Works seamlessly on mobile and desktop

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) for components
- Vite for build tooling
- Chart.js for data visualization
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- File storage fallback for offline mode

## Project Structure

```
.
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── utils/        # Utility functions
│   │   └── types/        # TypeScript types
│   └── package.json
├── backend/          # Express backend API
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── models/      # MongoDB models
│   │   └── config/      # Configuration files
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd amirtham-cooldrinks
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up environment variables**

   Create `backend/.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/amirtham-cooldrinks
   PORT=5001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

   Create `frontend/.env` file (optional, for local development):
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

5. **Start the development servers**

   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:5173 (Vite default port)
   - Backend API: http://localhost:5001

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Start production server

## MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Add it to `backend/.env` as `MONGODB_URI`

For detailed MongoDB setup instructions, see `MONGODB_SETUP.md`.

## Deployment

This project is configured for deployment with:
- **Frontend**: Vercel
- **Backend**: Render

See `DEPLOYMENT.md` for detailed deployment instructions.

## Environment Variables

### Backend (.env)
- `MONGODB_URI` - MongoDB connection string (required)
- `PORT` - Server port (default: 5001)
- `NODE_ENV` - Environment mode (development/production)
- `CLIENT_URL` - Frontend URL for CORS (comma-separated for multiple origins)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:5001/api)

**Note**: The `api/` directory in the root contains Vercel serverless functions that are not used in the current deployment setup (frontend on Vercel, backend on Render).

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
