# How to Update Shop Name in MongoDB

The shop name is now fully dynamic and can be changed in two ways:

## Method 1: Using the Settings Page (Recommended)

1. Open your website
2. Navigate to the **Settings** page
3. Find the **Shop Information** section
4. Click **Edit** next to the Shop Name field
5. Enter your new shop name
6. Click **Save**

The shop name will be updated in MongoDB automatically and will appear throughout the website immediately.

## Method 2: Direct MongoDB Update (For Advanced Users)

If you need to update the shop name directly in MongoDB, you can use the provided script:

### Using the Script:

```bash
cd backend
npm run update-shop-name "Your New Shop Name"
```

Or if you want to set it to the default "My Restaurant":

```bash
cd backend
npm run update-shop-name
```

### Manual MongoDB Update:

If you prefer to update it manually using MongoDB Compass or MongoDB Shell:

1. Connect to your MongoDB database
2. Navigate to the `settings` collection
3. Find the settings document (there should only be one)
4. Update the `shopName` field with your new shop name
5. Save the document

Example MongoDB Shell command:
```javascript
db.settings.updateOne(
  {},
  { $set: { shopName: "Your New Shop Name" } }
)
```

## Default Shop Name

The default shop name has been changed from "Amirtham Cooldrinks" to **"My Restaurant"**. 

- New installations will use "My Restaurant" as the default
- Existing installations with "Amirtham Cooldrinks" can be updated using either method above

## Where the Shop Name Appears

Once updated, the shop name will appear in:
- Navigation bar (top of the page)
- Billing receipts
- Sales reports (PDF exports)
- Page title (browser tab)
- Settings page (About section)

