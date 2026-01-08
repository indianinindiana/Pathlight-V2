# Quick Guide: Fix Existing Profile Data

## Best Method: Use MongoDB Atlas Web Interface

This is the fastest and safest way to fix the data issue.

### Step 1: Access MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Log in to your account
3. Click on your cluster (the one your app uses)
4. Click **"Browse Collections"** button

### Step 2: Find Affected Profiles
1. Select your database (probably `pathlight`)
2. Click on the `profiles` collection
3. Look for documents where `primary_goal` = `"lower-payments"` (with an 's')

### Step 3: Fix the Data
**Option A: Edit Individual Documents**
1. Click the pencil icon (✏️) next to the document
2. Find the `primary_goal` field
3. Change `"lower-payments"` to `"lower-payment"` (remove the 's')
4. Click **Update**

**Option B: Use Aggregation Pipeline (Bulk Fix)**
1. Click on the **"Aggregation"** tab
2. Add this pipeline stage:
```javascript
[
  {
    $match: {
      primary_goal: "lower-payments"
    }
  },
  {
    $set: {
      primary_goal: "lower-payment"
    }
  },
  {
    $merge: {
      into: "profiles",
      whenMatched: "replace"
    }
  }
]
```
3. Click **Run**

### Step 4: Verify the Fix
1. Go back to the `profiles` collection
2. Search for `primary_goal: "lower-payments"`
3. Should return 0 results

### Step 5: Test the App
1. Refresh your browser on the Scenarios page
2. The Recommended Strategy section should now appear!

---

## Alternative: Use MongoDB Compass (Desktop App)

If you prefer a desktop application:

### Step 1: Download MongoDB Compass
- Download from: https://www.mongodb.com/try/download/compass
- Install and open the app

### Step 2: Connect to Atlas
1. Get your connection string from Atlas:
   - In Atlas, click **"Connect"**
   - Choose **"Connect using MongoDB Compass"**
   - Copy the connection string
2. Paste it into Compass and click **Connect**

### Step 3: Fix the Data
1. Navigate to your database → `profiles` collection
2. Click the **"Filter"** button
3. Enter: `{ "primary_goal": "lower-payments" }`
4. For each result:
   - Click the document
   - Edit `primary_goal` to `"lower-payment"`
   - Click **Update**

---

## Alternative: Python Script (If You Prefer Code)

Update the migration script to use your Atlas connection:

### Step 1: Check Your .env File
Make sure `backend/.env` has:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DATABASE_NAME=pathlight
```

### Step 2: Run the Fixed Script
```bash
cd backend
source venv/bin/activate
python fix_primary_goal_data.py
```

If it still fails, the script is trying to use localhost. The issue is that the script needs to load the .env file properly.

---

## Quickest Solution: Manual Update via Atlas

**I recommend using the MongoDB Atlas web interface** because:
- ✅ No code needed
- ✅ Visual interface
- ✅ Immediate results
- ✅ Can verify changes instantly
- ✅ No connection string issues

Just log into Atlas → Browse Collections → Edit the document → Save!

---

## After Fixing

Once you've updated the profile data:

1. **Refresh the Scenarios page** in your browser
2. **Check the browser console** for any errors
3. **Look for the new section** at the top of the page
4. If it still doesn't appear, check the Network tab to see the API response

The Recommended Strategy section should now be visible! 🎉