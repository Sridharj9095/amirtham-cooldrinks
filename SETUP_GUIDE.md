# Complete MongoDB Atlas Setup Guide

This is a detailed, visual guide to set up MongoDB Atlas for your Amirtham Cooldrinks application.

## 📋 Prerequisites

- A MongoDB Atlas account (free tier available)
- Node.js installed on your computer
- Your backend server code ready

## 🚀 Step-by-Step Setup

### Step 1: Create MongoDB Atlas Account

1. **Visit MongoDB Atlas**: Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Sign Up**: Click "Try Free" or "Sign Up"
3. **Fill in Details**: 
   - Email address
   - Password (save this securely!)
   - Company name (optional)
   - Accept terms and conditions
4. **Verify Email**: Check your email and click the verification link

### Step 2: Create a Cluster

1. **Choose Provider & Region**:
   - Click "Build a Database"
   - Choose **FREE** (M0) tier
   - Select a cloud provider (AWS, Google Cloud, or Azure)
   - Choose a region closest to you (e.g., `N. Virginia (us-east-1)` for US)
   - Click "Create"

2. **Wait for Cluster Creation** (takes 3-5 minutes)
   - You'll see "Creating" status
   - Wait until it shows "Idle"

### Step 3: Create Database User

1. **Go to Database Access**:
   - Click "Database Access" in the left sidebar
   - Or click "Create Database User" if prompted

2. **Create User**:
   - **Authentication Method**: Password
   - **Username**: Create a username (e.g., `amirtham-admin`)
   - **Password**: 
     - Click "Autogenerate Secure Password" OR
     - Create your own strong password
   - **IMPORTANT**: Copy and save the password! You won't see it again.
   - **Database User Privileges**: Select "Read and write to any database"
   - Click "Add User"

3. **Save Credentials Securely**:
   ```
   Username: amirtham-admin
   Password: [the password you just created]
   ```

### Step 4: Configure Network Access

1. **Go to Network Access**:
   - Click "Network Access" in the left sidebar
   - Or you might see a prompt to add IP address

2. **Add IP Address**:
   - Click "Add IP Address"
   - For development/testing: Click "Allow Access from Anywhere"
     - This adds `0.0.0.0/0` (all IPs)
     - **Note**: Only use this for development!
   - For production: Add your specific server IP address
   - Click "Confirm"

### Step 5: Get Connection String

1. **Go to Database**:
   - Click "Database" in the left sidebar
   - You should see your cluster

2. **Connect to Cluster**:
   - Click "Connect" button on your cluster
   - Choose "Connect your application"

3. **Get Connection String**:
   - Driver: **Node.js**
   - Version: **5.5 or later**
   - Copy the connection string (looks like):
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

### Step 6: Configure Backend

1. **Navigate to Backend Directory**:
   ```bash
   cd backend
   ```

2. **Create .env File**:
   ```bash
   # On Mac/Linux
   touch .env
   
   # On Windows
   type nul > .env
   ```

3. **Open .env File**:
   - Open `.env` in your code editor
   - Copy the template from `.env.example` or use this format:

4. **Add Your Configuration**:
   ```env
   PORT=5001
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/amirtham-cooldrinks?retryWrites=true&w=majority
   ```

   **Important Changes**:
   - Replace `YOUR_USERNAME` with the username from Step 3
   - Replace `YOUR_PASSWORD` with the password from Step 3
   - Replace `cluster0.xxxxx` with your actual cluster name
   - Add `/amirtham-cooldrinks` before the `?` mark (this is your database name)

   **Example**:
   ```env
   PORT=5001
   MONGODB_URI=mongodb+srv://amirtham-admin:MySecurePass123@cluster0.abc123.mongodb.net/amirtham-cooldrinks?retryWrites=true&w=majority
   ```

5. **Save the File**: Make sure `.env` is saved

### Step 7: Test Connection

1. **Install Dependencies** (if not done):
   ```bash
   cd backend
   npm install
   ```

2. **Start Backend Server**:
   ```bash
   npm run dev
   ```

3. **Check Console Output**:
   You should see:
   ```
   MongoDB connected successfully
   Server is running on port 5001
   ```

   ✅ **Success!** Your MongoDB Atlas is connected!

   ❌ **If you see errors**, see Troubleshooting below.

### Step 8: Test with Frontend

1. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test Menu Management**:
   - Open browser: `http://localhost:3000` (or your frontend port)
   - Navigate to "Menu Management"
   - Click "Add Menu Item"
   - Fill in the form and save
   - Go back to MongoDB Atlas → Database → Collections
   - You should see a `menuitems` collection with your data!

## 🎯 Quick Setup Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 free tier)
- [ ] Database user created (username & password saved)
- [ ] Network access configured (0.0.0.0/0 for dev)
- [ ] Connection string copied
- [ ] `.env` file created with correct connection string
- [ ] Backend server starts without errors
- [ ] "MongoDB connected successfully" message appears
- [ ] Can add menu items through frontend
- [ ] Data appears in MongoDB Atlas Collections

## 🔧 Troubleshooting

### ❌ Error: "authentication failed"

**Problem**: Wrong username or password

**Solution**:
1. Check your `.env` file - username and password must match exactly
2. Make sure you're using the database user password (not your Atlas account password)
3. Username/password are case-sensitive
4. Special characters in password might need URL encoding (use `%` followed by hex code)

### ❌ Error: "IP not whitelisted" or "IP address not allowed"

**Problem**: Your IP address is not allowed to connect

**Solution**:
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Wait 1-2 minutes for changes to take effect
5. Try connecting again

### ❌ Error: "timeout" or "connection timeout"

**Problem**: Can't reach MongoDB servers

**Solution**:
1. Check your internet connection
2. Verify the cluster name in connection string matches your actual cluster
3. Check if your firewall is blocking the connection
4. Try using a different network (mobile hotspot)

### ❌ Error: "Server selection timed out"

**Problem**: Network or configuration issue

**Solution**:
1. Verify cluster status in Atlas dashboard (should be "Idle")
2. Check if you're behind a corporate firewall/VPN
3. Try restarting your backend server
4. Double-check the connection string format

### ❌ Backend shows "MongoDB not available"

**Problem**: Connection string might be wrong or MongoDB not connected

**Solution**:
1. Check backend console for specific error messages
2. Verify `.env` file exists and has correct format
3. Make sure you restarted the server after creating `.env`
4. Check that `MONGODB_URI` is spelled correctly (case-sensitive)

### ❌ Data not showing in MongoDB Atlas

**Problem**: Data might not be saving or connection issue

**Solution**:
1. Check backend console for any errors when saving
2. Verify MongoDB connection status in backend logs
3. Check MongoDB Atlas → Database → Collections
4. Refresh the Collections view
5. Try adding a new item through the frontend

## 📝 Connection String Format

Your connection string should look like this:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

**Breakdown**:
- `mongodb+srv://` - Protocol
- `USERNAME` - Your database user (from Step 3)
- `PASSWORD` - Your database user password (from Step 3)
- `CLUSTER` - Your cluster name (e.g., `cluster0.abc123`)
- `DATABASE_NAME` - Database name (use `amirtham-cooldrinks`)
- `?retryWrites=true&w=majority` - Connection options

## 🔐 Security Best Practices

### For Development:
- ✅ Use free tier M0 cluster
- ✅ Allow access from anywhere (0.0.0.0/0) - for testing only
- ✅ Keep `.env` file local (don't commit to git)

### For Production:
- ✅ Use dedicated production cluster (paid tier)
- ✅ Restrict network access to specific IP addresses
- ✅ Use strong, unique passwords
- ✅ Enable MongoDB Atlas monitoring
- ✅ Set up automated backups
- ✅ Use environment variables (not hardcoded strings)
- ✅ Never commit `.env` to version control

## 🚀 Next Steps

Once MongoDB Atlas is connected:

1. **Test Menu Management**:
   - Add menu items through the UI
   - Edit existing items
   - Delete items
   - Verify all operations work

2. **Test Orders**:
   - Create an order through billing
   - Check MongoDB Atlas → Collections → `orders`
   - Verify order appears in sales reports

3. **Migrate Existing Data** (if you have localStorage data):
   - The app will automatically use MongoDB first
   - Old localStorage data will be used as fallback
   - You can manually add items through UI to migrate them

4. **Monitor Your Database**:
   - Check MongoDB Atlas dashboard regularly
   - Monitor storage usage (free tier has 512MB limit)
   - Review database performance metrics

## 📞 Need Help?

If you're still having issues:

1. Check backend console for detailed error messages
2. Review MongoDB Atlas dashboard for cluster status
3. Verify all steps in this guide were completed
4. Check the troubleshooting section above
5. Review MongoDB Atlas logs in the dashboard

## ✅ Verification Commands

Test your connection with these steps:

```bash
# 1. Check if .env file exists
cd backend
ls -la .env  # Should show .env file

# 2. Start backend (should show "MongoDB connected successfully")
npm run dev

# 3. In another terminal, test API (optional)
curl http://localhost:5001/api/health
# Should return: {"status":"OK","message":"Server is running"}

# 4. Test menu items API (should return empty array if no items)
curl http://localhost:5001/api/menu-items
```

Congratulations! 🎉 You've successfully set up MongoDB Atlas for your application!

