from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB Atlas"""
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is not set")
        
        try:
            # Simple connection - let Motor handle SSL/TLS automatically
            cls.client = AsyncIOMotorClient(
                database_url,
                serverSelectionTimeoutMS=30000,
                connectTimeoutMS=30000,
                socketTimeoutMS=30000
            )
            
            # Test the connection
            await cls.client.admin.command('ping')
            print("✓ Successfully connected to MongoDB Atlas")
        except Exception as e:
            print(f"✗ Failed to connect to MongoDB Atlas: {str(e)}")
            print(f"   Possible issues:")
            print(f"   1. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)")
            print(f"   2. Verify credentials in connection string")
            print(f"   3. Ensure cluster is running")
            print(f"   4. Check network connectivity")
            raise
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            print("Closed MongoDB connection")
    
    @classmethod
    def get_database(cls):
        """Get the database instance"""
        if not cls.client:
            raise ValueError("Database not connected. Call connect_db() first.")
        return cls.client.pathfinder
    
    @classmethod
    def get_collection(cls, collection_name: str):
        """Get a specific collection"""
        db = cls.get_database()
        return db[collection_name]

# Convenience function to get database
def get_db():
    return Database.get_database()

# Convenience functions to get collections
def get_profiles_collection():
    return Database.get_collection("profiles")

def get_debts_collection():
    return Database.get_collection("debts")