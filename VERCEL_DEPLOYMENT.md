# Vercel Deployment Guide

This guide will help you deploy both the frontend and backend of Amirtham Cooldrinks to Vercel.

## Prerequisites

1. GitHub repository with your code (already done ✅)
2. Vercel account (sign up at https://vercel.com)
3. MongoDB Atlas connection string

## Step 1: Install Vercel CLI (Optional)

You can deploy via Vercel dashboard or CLI. For CLI:

```bash
npm install -g vercel
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `Sridharj9095/amirtham-cooldrinks`
4. Vercel will auto-detect the project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Configure Project Settings**:
   - **Root Directory**: Leave as default (or set to project root)
   - **Framework Preset**: Vite
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install --prefix frontend && npm install --prefix backend`

6. **Add Environment Variables**:
   Click on "Environment Variables" and add:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `NODE_ENV` - `production`

7. Click **"Deploy"**

### Option B: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? amirtham-cooldrinks
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add MONGODB_URI
# Paste your MongoDB connection string when prompted

# Deploy to production
vercel --prod
```

## Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add the following:

| Variable | Value | Environment |
|----------|-------|-------------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

## Step 4: Verify Deployment

After deployment:

1. Visit your Vercel deployment URL (e.g., `https://amirtham-cooldrinks.vercel.app`)
2. Test the application:
   - Navigate through pages
   - Test API endpoints (check browser console for errors)
   - Verify MongoDB connection works

## Step 5: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Project Structure for Vercel

```
.
├── api/                    # Vercel serverless functions
│   ├── _lib/              # Shared utilities
│   │   ├── db.ts          # MongoDB connection
│   │   └── models.ts      # Mongoose models
│   ├── orders/           # Order API endpoints
│   ├── menu-items/        # Menu items API endpoints
│   ├── sales/             # Sales API endpoints
│   └── settings/          # Settings API endpoints
├── frontend/              # React frontend
│   └── dist/              # Build output (generated)
├── vercel.json            # Vercel configuration
└── package.json           # Root package.json
```

## API Endpoints

All API endpoints are available at `/api/*`:

- `GET /api/health` - Health check
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order by ID
- `DELETE /api/orders/[id]` - Delete order
- `DELETE /api/orders/range/by-date` - Delete orders by date range
- `GET /api/menu-items` - Get all menu items
- `POST /api/menu-items` - Create menu item
- `GET /api/menu-items/[id]` - Get menu item by ID
- `PUT /api/menu-items/[id]` - Update menu item
- `DELETE /api/menu-items/[id]` - Delete menu item
- `GET /api/sales/monthly` - Get monthly sales
- `GET /api/sales/item` - Get item-wise sales
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `PUT /api/settings/upi-id` - Update UPI ID

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version (Vercel uses Node 18 by default)

### API Endpoints Not Working

1. Check environment variables are set correctly
2. Verify MongoDB connection string is valid
3. Check Vercel function logs in dashboard

### CORS Errors

CORS is already configured in all API endpoints. If you still see errors:
1. Check API endpoint URLs in frontend code
2. Verify `vercel.json` rewrites are correct

### MongoDB Connection Issues

1. Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs)
2. Verify connection string format
3. Check MongoDB Atlas cluster is running

## Continuous Deployment

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

## Support

For issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas connection
3. Review browser console for frontend errors
4. Check Vercel function logs

## Next Steps

After successful deployment:
1. Test all features
2. Set up custom domain (optional)
3. Configure analytics (optional)
4. Set up monitoring (optional)

