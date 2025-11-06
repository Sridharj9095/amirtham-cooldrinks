# 🔧 Fix Authentication Error

You're getting: `bad auth : authentication failed`

This means your username or password is incorrect. Here's how to fix it:

## 🔍 Step 1: Verify Database User Exists

1. **Go to MongoDB Atlas Dashboard**
2. **Click** "Database & Network Access" (left sidebar, under SECURITY)
3. **Go to** "Database Access" tab
4. **Check** if user `amirtham-admin` exists
   - If you see it, proceed to Step 2
   - If you DON'T see it, go to Step 3

## ✅ Step 2: Reset Password (If User Exists)

1. **Find** the `amirtham-admin` user in the list
2. **Click** the "Edit" button (pencil icon) next to it
3. **Click** "Edit Password"
4. **Choose**:
   - **Option A**: Click "Autogenerate Secure Password"
     - **⚠️ COPY THE PASSWORD IMMEDIATELY!**
   - **Option B**: Create your own password
     - Make sure it's strong (at least 8 characters)
     - **Avoid special characters** that might cause issues (like `@`, `#`, `%`, etc.)
5. **Click** "Update User"
6. **Save the new password** somewhere safe

## ➕ Step 3: Create New Database User (If User Doesn't Exist)

1. **Click** "Add New Database User" button
2. **Authentication Method**: Password
3. **Username**: `amirtham-admin` (or your choice)
4. **Password**: 
   - Click "Autogenerate Secure Password"
   - **⚠️ COPY THE PASSWORD IMMEDIATELY!**
   - OR create your own (avoid special characters)
5. **Database User Privileges**: "Read and write to any database"
6. **Click** "Add User"
7. **Save the credentials**:
   - Username: _______________
   - Password: _______________

## 🔐 Step 4: Update .env File

1. **Open** `backend/.env` file in your editor

2. **Update** the `MONGODB_URI` with the correct password:

```env
PORT=5001
MONGODB_URI=mongodb+srv://amirtham-admin:NEW_PASSWORD_HERE@cluster0.h4eivdx.mongodb.net/amirtham-cooldrinks?retryWrites=true&w=majority
```

**Replace** `NEW_PASSWORD_HERE` with the password you just created/reset.

## ⚠️ Important: Special Characters in Password

If your password contains special characters, you may need to URL-encode them:

| Character | URL Encoded |
|-----------|-------------|
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |
| `/` | `%2F` |
| ` ` (space) | `%20` |

**Example:**
- Password: `My@Pass#123`
- URL Encoded: `My%40Pass%23123`
- Connection string: `mongodb+srv://amirtham-admin:My%40Pass%23123@cluster0.h4eivdx.mongodb.net/...`

**Easier Solution**: Use a password WITHOUT special characters to avoid encoding issues.

## 🧪 Step 5: Test Connection

1. **Save** the `.env` file

2. **Restart** your backend server:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   cd backend
   npm run dev
   ```

3. **Look for**:
   ```
   ✅ MongoDB connected successfully
   Server is running on port 5001
   ```

## 🔄 Alternative: Use Connection String from Atlas

If you're still having issues, get a fresh connection string:

1. **Go to** MongoDB Atlas → Database
2. **Click** "Connect" on Cluster0
3. **Choose** "Connect your application"
4. **Select** "Node.js" → "5.5 or later"
5. **Copy** the connection string
6. **Replace** `<password>` with your actual password
7. **Add** `/amirtham-cooldrinks` before the `?` mark
8. **Update** `.env` file with this connection string

## ✅ Quick Fix Checklist

- [ ] Verified database user exists in MongoDB Atlas
- [ ] Reset/created password (saved it securely)
- [ ] Updated `.env` file with correct password
- [ ] URL-encoded special characters (if any)
- [ ] Restarted backend server
- [ ] See "MongoDB connected successfully" message

## 🎯 Recommended: Simple Password

To avoid encoding issues, use a password like:
- `Amirtham2024!` (simple special character)
- `AmirthamCooldrinks123` (no special characters)
- Or let Atlas autogenerate (usually works fine)

## 🆘 Still Not Working?

1. **Double-check** username and password in `.env` file
2. **Verify** the user exists in MongoDB Atlas → Database Access
3. **Check** network access is configured (0.0.0.0/0)
4. **Try** creating a completely new database user with a simple password
5. **Verify** the connection string format is correct

---

**Current Error**: Authentication failed  
**Solution**: Update password in MongoDB Atlas and `.env` file

