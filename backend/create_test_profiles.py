"""
Create synthetic test profiles with sample debts for testing.
Run this script to populate the database with realistic test data.

Usage: python create_test_profiles.py
"""
import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL") or os.getenv("DATABASE_URL")

async def create_test_profiles():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.pathlight
    
    profiles_collection = db.profiles
    debts_collection = db.debts
    
    print("Creating test profiles with sample debts...\n")
    
    # Profile 1: Young Professional with Credit Card Debt
    profile1_id = "test_profile_young_professional"
    profile1 = {
        "user_id": profile1_id,
        "stress_level": 3,
        "monthly_income": 5500,
        "monthly_expenses": 4200,
        "primary_goal": "pay-faster",
        "employment_status": "full-time",
        "age_range": "25-34",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await profiles_collection.delete_many({"user_id": profile1_id})
    await profiles_collection.insert_one(profile1)
    
    debts1 = [
        {
            "profile_id": profile1_id,
            "type": "credit-card",
            "name": "Chase Sapphire",
            "balance": 8500,
            "apr": 18.99,
            "minimum_payment": 255,
            "next_payment_date": datetime.utcnow() + timedelta(days=15),
            "is_delinquent": False,
            "credit_limit": 15000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile1_id,
            "type": "credit-card",
            "name": "Capital One Quicksilver",
            "balance": 3200,
            "apr": 22.49,
            "minimum_payment": 96,
            "next_payment_date": datetime.utcnow() + timedelta(days=20),
            "is_delinquent": False,
            "credit_limit": 5000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile1_id,
            "type": "personal-loan",
            "name": "Upstart Personal Loan",
            "balance": 7500,
            "apr": 14.5,
            "minimum_payment": 250,
            "next_payment_date": datetime.utcnow() + timedelta(days=10),
            "is_delinquent": False,
            "term_months": 36,
            "original_principal": 10000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile1_id,
            "type": "student-loan",
            "name": "Federal Student Loan",
            "balance": 28000,
            "apr": 4.5,
            "minimum_payment": 290,
            "next_payment_date": datetime.utcnow() + timedelta(days=5),
            "is_delinquent": False,
            "term_months": 120,
            "loan_program": "federal",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await debts_collection.delete_many({"profile_id": profile1_id})
    await debts_collection.insert_many(debts1)
    print(f"✓ Profile 1: Young Professional")
    print(f"  Profile ID: {profile1_id}")
    print(f"  Total Debt: ${sum(d['balance'] for d in debts1):,.2f}")
    print(f"  Debts: {len(debts1)} tradelines\n")
    
    # Profile 2: Family with Mortgage and Auto Loan
    profile2_id = "test_profile_family_homeowner"
    profile2 = {
        "user_id": profile2_id,
        "stress_level": 4,
        "monthly_income": 8500,
        "monthly_expenses": 6800,
        "primary_goal": "reduce-interest",
        "employment_status": "full-time",
        "age_range": "35-44",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await profiles_collection.delete_many({"user_id": profile2_id})
    await profiles_collection.insert_one(profile2)
    
    debts2 = [
        {
            "profile_id": profile2_id,
            "type": "mortgage",
            "name": "Home Mortgage",
            "balance": 285000,
            "apr": 4.25,
            "minimum_payment": 1650,
            "next_payment_date": datetime.utcnow() + timedelta(days=1),
            "is_delinquent": False,
            "term_months": 360,
            "original_principal": 320000,
            "escrow_included": True,
            "property_tax": 4800,
            "home_insurance": 1200,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile2_id,
            "type": "auto-loan",
            "name": "Honda CR-V",
            "balance": 22000,
            "apr": 5.9,
            "minimum_payment": 425,
            "next_payment_date": datetime.utcnow() + timedelta(days=12),
            "is_delinquent": False,
            "term_months": 60,
            "original_principal": 28000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile2_id,
            "type": "credit-card",
            "name": "Discover It",
            "balance": 5400,
            "apr": 16.99,
            "minimum_payment": 162,
            "next_payment_date": datetime.utcnow() + timedelta(days=18),
            "is_delinquent": False,
            "credit_limit": 10000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile2_id,
            "type": "credit-card",
            "name": "Amazon Prime Visa",
            "balance": 2800,
            "apr": 19.24,
            "minimum_payment": 84,
            "next_payment_date": datetime.utcnow() + timedelta(days=22),
            "is_delinquent": False,
            "credit_limit": 8000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile2_id,
            "type": "personal-loan",
            "name": "Home Improvement Loan",
            "balance": 12000,
            "apr": 9.5,
            "minimum_payment": 380,
            "next_payment_date": datetime.utcnow() + timedelta(days=8),
            "is_delinquent": False,
            "term_months": 36,
            "original_principal": 15000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await debts_collection.delete_many({"profile_id": profile2_id})
    await debts_collection.insert_many(debts2)
    print(f"✓ Profile 2: Family Homeowner")
    print(f"  Profile ID: {profile2_id}")
    print(f"  Total Debt: ${sum(d['balance'] for d in debts2):,.2f}")
    print(f"  Debts: {len(debts2)} tradelines\n")
    
    # Profile 3: High Debt Stress Case
    profile3_id = "test_profile_high_stress"
    profile3 = {
        "user_id": profile3_id,
        "stress_level": 5,
        "monthly_income": 4200,
        "monthly_expenses": 3800,
        "primary_goal": "avoid-default",
        "employment_status": "part-time",
        "age_range": "25-34",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await profiles_collection.delete_many({"user_id": profile3_id})
    await profiles_collection.insert_one(profile3)
    
    debts3 = [
        {
            "profile_id": profile3_id,
            "type": "credit-card",
            "name": "Maxed Out Card 1",
            "balance": 4950,
            "apr": 24.99,
            "minimum_payment": 149,
            "next_payment_date": datetime.utcnow() + timedelta(days=3),
            "is_delinquent": True,
            "credit_limit": 5000,
            "late_fees": 39,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile3_id,
            "type": "credit-card",
            "name": "Maxed Out Card 2",
            "balance": 2980,
            "apr": 27.49,
            "minimum_payment": 89,
            "next_payment_date": datetime.utcnow() + timedelta(days=5),
            "is_delinquent": False,
            "credit_limit": 3000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile3_id,
            "type": "credit-card",
            "name": "Store Card",
            "balance": 1200,
            "apr": 29.99,
            "minimum_payment": 36,
            "next_payment_date": datetime.utcnow() + timedelta(days=10),
            "is_delinquent": False,
            "credit_limit": 1500,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile3_id,
            "type": "personal-loan",
            "name": "Payday Alternative Loan",
            "balance": 3500,
            "apr": 35.99,
            "minimum_payment": 175,
            "next_payment_date": datetime.utcnow() + timedelta(days=7),
            "is_delinquent": False,
            "term_months": 24,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile3_id,
            "type": "student-loan",
            "name": "Private Student Loan",
            "balance": 18000,
            "apr": 8.5,
            "minimum_payment": 220,
            "next_payment_date": datetime.utcnow() + timedelta(days=15),
            "is_delinquent": False,
            "term_months": 120,
            "loan_program": "private",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile3_id,
            "type": "installment-loan",
            "name": "Medical Bill Payment Plan",
            "balance": 2400,
            "apr": 0,
            "minimum_payment": 100,
            "next_payment_date": datetime.utcnow() + timedelta(days=20),
            "is_delinquent": False,
            "term_months": 24,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await debts_collection.delete_many({"profile_id": profile3_id})
    await debts_collection.insert_many(debts3)
    print(f"✓ Profile 3: High Stress Case")
    print(f"  Profile ID: {profile3_id}")
    print(f"  Total Debt: ${sum(d['balance'] for d in debts3):,.2f}")
    print(f"  Debts: {len(debts3)} tradelines\n")
    
    # Profile 4: Diverse Portfolio
    profile4_id = "test_profile_diverse"
    profile4 = {
        "user_id": profile4_id,
        "stress_level": 2,
        "monthly_income": 12000,
        "monthly_expenses": 8500,
        "primary_goal": "pay-faster",
        "employment_status": "full-time",
        "age_range": "45-59",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await profiles_collection.delete_many({"user_id": profile4_id})
    await profiles_collection.insert_one(profile4)
    
    debts4 = [
        {
            "profile_id": profile4_id,
            "type": "mortgage",
            "name": "Primary Residence",
            "balance": 180000,
            "apr": 3.75,
            "minimum_payment": 1250,
            "next_payment_date": datetime.utcnow() + timedelta(days=1),
            "is_delinquent": False,
            "term_months": 240,
            "original_principal": 250000,
            "escrow_included": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile4_id,
            "type": "auto-loan",
            "name": "Tesla Model 3",
            "balance": 35000,
            "apr": 4.5,
            "minimum_payment": 650,
            "next_payment_date": datetime.utcnow() + timedelta(days=10),
            "is_delinquent": False,
            "term_months": 60,
            "original_principal": 42000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile4_id,
            "type": "auto-loan",
            "name": "Honda Accord",
            "balance": 12000,
            "apr": 6.2,
            "minimum_payment": 280,
            "next_payment_date": datetime.utcnow() + timedelta(days=10),
            "is_delinquent": False,
            "term_months": 48,
            "original_principal": 18000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile4_id,
            "type": "credit-card",
            "name": "Amex Platinum",
            "balance": 6500,
            "apr": 17.99,
            "minimum_payment": 195,
            "next_payment_date": datetime.utcnow() + timedelta(days=15),
            "is_delinquent": False,
            "credit_limit": 25000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile4_id,
            "type": "credit-card",
            "name": "Costco Visa",
            "balance": 3200,
            "apr": 15.24,
            "minimum_payment": 96,
            "next_payment_date": datetime.utcnow() + timedelta(days=20),
            "is_delinquent": False,
            "credit_limit": 15000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile4_id,
            "type": "student-loan",
            "name": "MBA Student Loan",
            "balance": 45000,
            "apr": 5.8,
            "minimum_payment": 490,
            "next_payment_date": datetime.utcnow() + timedelta(days=5),
            "is_delinquent": False,
            "term_months": 120,
            "loan_program": "private",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile4_id,
            "type": "personal-loan",
            "name": "Pool Installation",
            "balance": 18000,
            "apr": 7.9,
            "minimum_payment": 550,
            "next_payment_date": datetime.utcnow() + timedelta(days=12),
            "is_delinquent": False,
            "term_months": 36,
            "original_principal": 22000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile4_id,
            "type": "installment-loan",
            "name": "Solar Panel Financing",
            "balance": 15000,
            "apr": 2.99,
            "minimum_payment": 270,
            "next_payment_date": datetime.utcnow() + timedelta(days=8),
            "is_delinquent": False,
            "term_months": 60,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile4_id,
            "type": "credit-card",
            "name": "Business Card",
            "balance": 8500,
            "apr": 14.99,
            "minimum_payment": 255,
            "next_payment_date": datetime.utcnow() + timedelta(days=18),
            "is_delinquent": False,
            "credit_limit": 30000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "profile_id": profile4_id,
            "type": "credit-card",
            "name": "Travel Rewards Card",
            "balance": 4200,
            "apr": 18.49,
            "minimum_payment": 126,
            "next_payment_date": datetime.utcnow() + timedelta(days=25),
            "is_delinquent": False,
            "credit_limit": 20000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await debts_collection.delete_many({"profile_id": profile4_id})
    await debts_collection.insert_many(debts4)
    print(f"✓ Profile 4: Diverse Portfolio")
    print(f"  Profile ID: {profile4_id}")
    print(f"  Total Debt: ${sum(d['balance'] for d in debts4):,.2f}")
    print(f"  Debts: {len(debts4)} tradelines\n")
    
    print("=" * 60)
    print("Test profiles created successfully!")
    print("=" * 60)
    print("\nTo load a profile, use one of these URLs:")
    print(f"http://localhost:5173/?profileId={profile1_id}")
    print(f"http://localhost:5173/?profileId={profile2_id}")
    print(f"http://localhost:5173/?profileId={profile3_id}")
    print(f"http://localhost:5173/?profileId={profile4_id}")
    print("\nOr use localStorage in browser console:")
    print(f"localStorage.setItem('debtPathfinderSession', JSON.stringify({{profileId: '{profile1_id}'}}))")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_test_profiles())