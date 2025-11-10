# Deployment Guide

This project is configured to deploy the **frontend on Vercel** and the **backend on Render**.

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **MongoDB Atlas Account** - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (or use your own MongoDB instance)

## Backend Deployment on Render

### Step 1: Prepare MongoDB

1. Create a MongoDB Atlas cluster (or use your existing MongoDB instance)
2. Get your MongoDB connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority`

### Step 2: Deploy Backend to Render

#### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and configure the service
6. Set the following environment variables in Render dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `CLIENT_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render sets this automatically, but you can specify)

#### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `amirtham-cooldrinks-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
5. Set environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `CLIENT_URL`: Your Vercel frontend URL
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (optional, Render sets this automatically)
6. Click "Create Web Service"

### Step 3: Get Backend URL

After deployment, Render will provide a URL like: `https://amirtham-cooldrinks-backend.onrender.com`

**Note**: On the free plan, your service may spin down after inactivity. The first request after inactivity may take 30-60 seconds.

## Frontend Deployment on Vercel

### Step 1: Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Other (or Vite)
   - **Root Directory**: `frontend` (or leave as root)
   - **Build Command**: `cd frontend && npm install --no-workspaces --legacy-peer-deps && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install --no-workspaces --legacy-peer-deps`
6. Add environment variable:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g., `https://amirtham-cooldrinks-backend.onrender.com/api`)
7. Click "Deploy"

### Step 2: Update Backend CORS

After getting your Vercel frontend URL:

1. Go to Render dashboard → Your backend service → Environment
2. Update `CLIENT_URL` to your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
3. Redeploy the backend service

### Step 3: Update Frontend API URL

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Update `VITE_API_URL` if needed
3. Redeploy the frontend

## Environment Variables Summary

### Backend (Render)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
CLIENT_URL=https://your-frontend-app.vercel.app
NODE_ENV=production
PORT=10000
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-backend-app.onrender.com/api
```

## Local Development

### Backend

1. Navigate to `backend` directory
2. Create `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/amirtham-cooldrinks
   PORT=5001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```
3. Run `npm install`
4. Run `npm run dev`

### Frontend

1. Navigate to `frontend` directory
2. Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```
3. Run `npm install`
4. Run `npm run dev`

## Troubleshooting

### Backend Issues

- **Connection timeout**: Free Render services spin down after inactivity. First request may be slow.
- **CORS errors**: Ensure `CLIENT_URL` in backend matches your Vercel frontend URL exactly
- **MongoDB connection**: Verify `MONGODB_URI` is correct and MongoDB Atlas allows connections from Render IPs (0.0.0.0/0)

### Frontend Issues

- **API calls failing**: Check `VITE_API_URL` is set correctly in Vercel environment variables
- **Build errors**: Ensure all dependencies are in `package.json` and use `--legacy-peer-deps` flag if needed

## Notes

- The `api/` directory in the root is not used in this deployment setup (it was for Vercel serverless functions)
- Render free tier services may have cold starts (30-60 seconds after inactivity)
- Consider upgrading to paid tiers for production use

