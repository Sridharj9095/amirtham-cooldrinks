# MongoDB Setup Guide

This guide will help you set up MongoDB Atlas for your Amirtham Cooldrinks application.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account (if you don't have one)
3. Create a new cluster (Free tier M0 is sufficient)

## Step 2: Configure Database Access

1. In MongoDB Atlas, go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create a username and password (save these securely!)
5. Under **Database User Privileges**, select **Read and write to any database**
6. Click **Add User**

## Step 3: Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. For development, click **Allow Access from Anywhere** (0.0.0.0/0)
   - **Note**: For production, restrict to specific IP addresses
4. Click **Confirm**

## Step 4: Get Your Connection String

1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Select **Connect your application**
4. Choose **Node.js** and version **5.5 or later**
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 5: Configure Your Backend

1. Create a `.env` file in the `backend` directory (if it doesn't exist):
   ```bash
   cd backend
   touch .env
   ```

2. Add your MongoDB connection string to `.env`:
   ```
   PORT=5001
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/amirtham-cooldrinks?retryWrites=true&w=majority
   ```
   
   **Important**: Replace `<username>` and `<password>` with the credentials you created in Step 2.

3. Replace `cluster0.xxxxx` with your actual cluster name from the connection string.

## Step 6: Verify Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Check the console output. You should see:
   ```
   MongoDB connected successfully
   Server is running on port 5001
   ```

3. If you see connection errors, check:
   - Your MongoDB Atlas username and password are correct
   - Network access is configured (Step 3)
   - The connection string is properly formatted in `.env`

## Step 7: Test the Application

1. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to the Menu Management page
3. Try adding a new menu item - it should save to MongoDB
4. Check MongoDB Atlas → **Collections** to see your data

## Troubleshooting

### Connection Error: "authentication failed"
- Verify your username and password in the `.env` file
- Make sure you've created a database user in MongoDB Atlas

### Connection Error: "IP not whitelisted"
- Go to MongoDB Atlas → Network Access
- Add your current IP address or use 0.0.0.0/0 for development

### Connection Error: "timeout"
- Check your internet connection
- Verify the cluster name in your connection string matches your actual cluster

### Data Not Showing
- Check MongoDB Atlas → Collections to verify data exists
- Check backend console for any error messages
- Verify the database name in your connection string matches what you're using

## Migration from LocalStorage

If you have existing menu items in localStorage:

1. Ensure MongoDB is connected (see Step 6)
2. Go to Menu Management page
3. The app will try to fetch from MongoDB first
4. To migrate existing items:
   - Option A: Manually add them through "Add Menu Item" (they'll save to MongoDB)
   - Option B: The app will automatically use localStorage items as fallback until MongoDB has data

## Production Considerations

For production deployment:

1. **Security**: 
   - Never commit `.env` file to version control
   - Use environment variables in your hosting platform
   - Restrict network access to your server IP only

2. **Connection String**:
   - Use a dedicated database user (not the admin user)
   - Use strong passwords
   - Enable MongoDB Atlas monitoring and alerts

3. **Backup**:
   - Enable MongoDB Atlas automated backups
   - Set up regular backup schedules

4. **Performance**:
   - Consider upgrading from free tier for production workloads
   - Monitor database performance in Atlas dashboard

## Support

If you encounter issues:
1. Check the backend console for error messages
2. Verify your MongoDB Atlas cluster is running
3. Check network connectivity
4. Review MongoDB Atlas logs in the dashboard

