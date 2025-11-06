# 🚀 Quick Start - MongoDB Atlas Setup

## ⚡ 5-Minute Setup

### Step 1: Create MongoDB Atlas Account (2 minutes)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email
3. Verify your email

### Step 2: Create Cluster (1 minute)
1. Click "Build a Database"
2. Choose **FREE** (M0) tier
3. Select region closest to you
4. Click "Create"
5. Wait 3-5 minutes for cluster creation

### Step 3: Setup Database Access (1 minute)
1. Click "Database Access" → "Add New Database User"
2. Username: `amirtham-admin` (or your choice)
3. Password: Click "Autogenerate" OR create your own
4. **⚠️ COPY THE PASSWORD NOW!** You won't see it again
5. Privileges: "Read and write to any database"
6. Click "Add User"

### Step 4: Setup Network Access (30 seconds)
1. Click "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (for development)
3. Click "Confirm"

### Step 5: Get Connection String (30 seconds)
1. Click "Database" → "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" → "5.5 or later"
4. Copy the connection string

### Step 6: Configure Backend (30 seconds)
1. Go to `backend` folder
2. Create `.env` file:
   ```bash
   touch .env
   ```
3. Add this to `.env`:
   ```env
   PORT=5001
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/amirtham-cooldrinks?retryWrites=true&w=majority
   ```
4. **Replace**:
   - `YOUR_USERNAME` → Your database username (from Step 3)
   - `YOUR_PASSWORD` → Your database password (from Step 3)
   - `cluster0.xxxxx` → Your actual cluster name
   - Add `/amirtham-cooldrinks` before the `?` mark

### Step 7: Test (30 seconds)
```bash
cd backend
npm run dev
```

**Look for**: `✅ MongoDB connected successfully`

## 🎯 Example Connection String

**Before editing**:
```
mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

**After editing** (add database name):
```
mongodb+srv://amirtham-admin:MyPassword123@cluster0.abc123.mongodb.net/amirtham-cooldrinks?retryWrites=true&w=majority
```

## ✅ Quick Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster created (Status: Idle)
- [ ] Database user created (username & password saved)
- [ ] Network access: 0.0.0.0/0 added
- [ ] Connection string copied
- [ ] `.env` file created with connection string
- [ ] Backend shows "MongoDB connected successfully"
- [ ] Can add menu items in frontend
- [ ] Data appears in MongoDB Atlas Collections

## 🐛 Common Issues

| Error | Solution |
|------|---------|
| Authentication failed | Check username/password in `.env` |
| IP not whitelisted | Add 0.0.0.0/0 in Network Access |
| Timeout | Check internet, verify cluster name |
| Connection string error | Add `/amirtham-cooldrinks` before `?` |

## 📚 Full Guide

For detailed instructions, see: **SETUP_GUIDE.md**

## 🎉 You're Done!

Once you see "MongoDB connected successfully", you're ready to go!

Start using the app - all menu items and orders will now be saved to MongoDB Atlas.

