import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL") or os.getenv("DATABASE_URL")

async def verify_data():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.pathlight
    
    profiles_collection = db.profiles
    debts_collection = db.debts
    
    print("--- Verifying Profiles ---")
    profile_count = 0
    async for profile in profiles_collection.find():
        profile_count += 1
        print(profile)
    if profile_count == 0:
        print("No profiles found.")
    else:
        print(f"\nFound {profile_count} profiles.")
    
    print("\n--- Verifying Debts ---")
    debt_count = 0
    async for debt in debts_collection.find():
        debt_count += 1
        print(debt)
    if debt_count == 0:
        print("No debts found.")
    else:
        print(f"\nFound {debt_count} debts.")

    client.close()

if __name__ == "__main__":
    asyncio.run(verify_data())