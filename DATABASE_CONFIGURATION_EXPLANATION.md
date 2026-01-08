# Database Configuration Explanation

## Current Setup

Your backend is configured to use:
- **Database Name**: `pathlight` (hardcoded in `backend/app/shared/database.py` line 52)
- **Connection**: Uses `DATABASE_URL` from your `.env` file

## Why You See Multiple Clusters

You likely have:
1. **PathLight cluster** - For this current app
2. **Pathfinder cluster** - Possibly from a previous/different project

## Which One Is Your App Using?

Check your `backend/.env` file to see which cluster your `DATABASE_URL` points to:

```bash
# Look at your .env file
cat backend/.env | grep DATABASE_URL
```

The connection string will look like:
```
mongodb+srv://username:password@cluster-name.mongodb.net/
```

The `cluster-name` tells you which cluster you're connected to.

## Recommendation

**Use ONE cluster with multiple databases:**

Instead of having separate clusters, you can have:
- **One MongoDB Atlas Cluster**
  - Database: `pathlight` (for this app)
  - Database: `pathfinder` (for other app, if needed)
  - Database: `test` (for testing)

This is more cost-effective and easier to manage.

## How to Consolidate (Optional)

If you want to use just one cluster:

1. **Keep your main cluster** (whichever has the most data)
2. **Update the DATABASE_URL** in `.env` to point to that cluster
3. **The database name** (`pathlight`) is already set in the code
4. **Migrate data** from the other cluster if needed

## For This Task

To see the new Recommended Strategy section:

1. **Check which cluster** your `.env` points to
2. **Open that cluster** in MongoDB Atlas
3. **Find the `pathlight` database**
4. **Fix the profile** in the `profiles` collection
5. Change `primary_goal: "lower-payments"` to `"lower-payment"`

The app will always use the `pathlight` database on whatever cluster your `DATABASE_URL` points to.

## Quick Check Command

```bash
# See your current DATABASE_URL (from project root)
cd backend
cat .env | grep DATABASE_URL
```

This will show you which cluster you're actually using!