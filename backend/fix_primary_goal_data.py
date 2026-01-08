"""
Database migration script to fix primary_goal typo in profiles collection.
Changes 'lower-payments' to 'lower-payment' to match the backend enum.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def fix_primary_goal_typo():
    """Fix the primary_goal typo in all affected profiles"""
    
    # Get MongoDB connection string
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    database_name = os.getenv('DATABASE_NAME', 'pathlight')
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(mongodb_uri)
    db = client[database_name]
    
    print("🔍 Checking for profiles with 'lower-payments' typo...")
    
    # Find all profiles with the typo
    affected_profiles = await db.profiles.count_documents({"primary_goal": "lower-payments"})
    
    if affected_profiles == 0:
        print("✅ No profiles found with the typo. Database is clean!")
        return
    
    print(f"📊 Found {affected_profiles} profile(s) with the typo")
    
    # Update all affected profiles
    result = await db.profiles.update_many(
        {"primary_goal": "lower-payments"},
        {"$set": {"primary_goal": "lower-payment"}}
    )
    
    print(f"✅ Updated {result.modified_count} profile(s)")
    
    # Verify the fix
    remaining = await db.profiles.count_documents({"primary_goal": "lower-payments"})
    
    if remaining == 0:
        print("✅ Migration successful! All profiles fixed.")
    else:
        print(f"⚠️  Warning: {remaining} profile(s) still have the typo")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Primary Goal Data Migration")
    print("=" * 60)
    asyncio.run(fix_primary_goal_typo())
    print("=" * 60)