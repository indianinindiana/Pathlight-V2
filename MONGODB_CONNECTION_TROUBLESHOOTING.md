# MongoDB Atlas Connection Timeout - Troubleshooting

## Current Error
```
SSL handshake failed: ac-drw3gf1-shard-00-01.atqhfjr.mongodb.net:27017: 
[Errno 60] Operation timed out
```

## Quick Fixes (Try in Order)

### 1. Check MongoDB Atlas IP Whitelist (Most Common Issue)
Your IP address may have changed, blocking the connection.

**Fix:**
1. Go to https://cloud.mongodb.com
2. Click your cluster
3. Click **"Network Access"** in left sidebar
4. Check if your current IP is listed
5. **Quick fix**: Add `0.0.0.0/0` (allows all IPs - for testing only)
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"**
   - Click **"Confirm"**
6. Wait 1-2 minutes for changes to propagate

### 2. Check if Cluster is Running
1. Go to MongoDB Atlas dashboard
2. Look at your cluster status
3. If it says "Paused", click **"Resume"**

### 3. Verify Connection String
Check your `backend/.env` file:
```bash
cat backend/.env | grep DATABASE_URL
```

Should look like:
```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/
```

### 4. Test Internet Connection
```bash
ping google.com
```

If this fails, you have a general internet connectivity issue.

### 5. Restart Backend Server
Once MongoDB connection is fixed:
```bash
# Stop the current backend (Ctrl+C in Terminal 26)
# Then restart:
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload
```

## Why This Happened
The backend server reloaded after our code changes, and when it tried to reconnect to MongoDB Atlas, the connection timed out. This is **NOT** caused by our code changes - it's a network/configuration issue.

## After Fixing
1. Restart the backend server
2. Refresh your browser
3. The Scenarios page should load
4. The new Recommended Strategy section should appear!

## Prevention
To avoid this in the future:
- Keep `0.0.0.0/0` in IP whitelist during development
- Or add your specific IP address range
- Check if your ISP assigns dynamic IPs (changes frequently)