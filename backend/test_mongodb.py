"""
MongoDB Connection Test Script
Tests the connection to MongoDB Atlas and performs basic operations
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from datetime import datetime, timezone

# Load environment variables
load_dotenv()

async def test_mongodb_connection():
    """Test MongoDB connection and basic operations"""
    
    print("=" * 60)
    print("MongoDB Connection Test")
    print("=" * 60)
    
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in environment variables")
        return False
    
    print(f"\n1. Connection String Found: ✓")
    print(f"   Server: {database_url.split('@')[1].split('/')[0] if '@' in database_url else 'Unknown'}")
    
    try:
        # Connect to MongoDB
        print("\n2. Attempting to connect to MongoDB Atlas...")
        client = AsyncIOMotorClient(
            database_url,
            serverSelectionTimeoutMS=10000,
            tlsAllowInvalidCertificates=True
        )
        
        # Test connection with ping
        print("   Sending ping command...")
        await client.admin.command('ping')
        print("   ✓ Connection successful!")
        
        # Get database
        db = client.pathfinder
        print(f"\n3. Database: pathfinder")
        
        # List collections
        print("\n4. Listing existing collections...")
        collections = await db.list_collection_names()
        if collections:
            print(f"   Found {len(collections)} collection(s):")
            for coll in collections:
                count = await db[coll].count_documents({})
                print(f"   - {coll}: {count} document(s)")
        else:
            print("   No collections found (database is empty)")
        
        # Test write operation
        print("\n5. Testing write operation...")
        test_collection = db.connection_test
        test_doc = {
            "test": True,
            "timestamp": datetime.now(timezone.utc),
            "message": "MongoDB connection test successful"
        }
        result = await test_collection.insert_one(test_doc)
        print(f"   ✓ Test document inserted with ID: {result.inserted_id}")
        
        # Test read operation
        print("\n6. Testing read operation...")
        found_doc = await test_collection.find_one({"_id": result.inserted_id})
        if found_doc:
            print(f"   ✓ Test document retrieved successfully")
            print(f"   Message: {found_doc.get('message')}")
        
        # Clean up test document
        print("\n7. Cleaning up test document...")
        await test_collection.delete_one({"_id": result.inserted_id})
        print("   ✓ Test document deleted")
        
        # Test profiles collection (if exists)
        print("\n8. Checking profiles collection...")
        profiles_count = await db.profiles.count_documents({})
        print(f"   Profiles collection: {profiles_count} document(s)")
        
        # Test debts collection (if exists)
        print("\n9. Checking debts collection...")
        debts_count = await db.debts.count_documents({})
        print(f"   Debts collection: {debts_count} document(s)")
        
        # Close connection
        client.close()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED - MongoDB connection is working!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("\nPossible issues:")
        print("1. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)")
        print("2. Verify credentials in connection string")
        print("3. Ensure cluster is running")
        print("4. Check network connectivity")
        print("\n" + "=" * 60)
        return False

if __name__ == "__main__":
    success = asyncio.run(test_mongodb_connection())
    exit(0 if success else 1)