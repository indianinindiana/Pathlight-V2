from fastapi import APIRouter, HTTPException, status, Query
from app.shared.models import Profile, ProfileUpdate
from app.shared.database import get_profiles_collection
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional

router = APIRouter(prefix="/api/v1/profiles", tags=["profiles"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_profile(profile: Profile):
    """
    Create a new user profile with minimal required fields.
    Only user_id and primary_goal are required initially.
    """
    collection = get_profiles_collection()
    
    # Check if profile with this user_id already exists
    existing = await collection.find_one({"user_id": profile.user_id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile with this user_id already exists"
        )
    
    # Convert profile to dict and remove id if present
    profile_dict = profile.model_dump(by_alias=True, exclude={"id"}, exclude_none=True)
    profile_dict["created_at"] = datetime.now(timezone.utc)
    profile_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Insert into database
    result = await collection.insert_one(profile_dict)
    
    # Retrieve the created profile
    created_profile = await collection.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string for response and add 'id' field
    created_profile["_id"] = str(created_profile["_id"])
    created_profile["id"] = created_profile["_id"]
    
    return created_profile

@router.get("/by-user/{user_id}")
async def get_profile_by_user_id(user_id: str):
    """Get a user profile by user_id (session identifier)."""
    collection = get_profiles_collection()
    
    # Find profile by user_id
    profile = await collection.find_one({"user_id": user_id})
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found for this user_id"
        )
    
    # Convert ObjectId to string and add 'id' field
    profile["_id"] = str(profile["_id"])
    profile["id"] = profile["_id"]
    
    return profile

@router.get("/{profile_id}")
async def get_profile(profile_id: str):
    """Get a user profile by profile ID."""
    collection = get_profiles_collection()
    
    # Validate ObjectId
    try:
        object_id = ObjectId(profile_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid profile ID format"
        )
    
    # Find profile
    profile = await collection.find_one({"_id": object_id})
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Convert ObjectId to string and add 'id' field
    profile["_id"] = str(profile["_id"])
    profile["id"] = profile["_id"]
    
    return profile

@router.patch("/{profile_id}")
async def update_profile_partial(profile_id: str, profile_update: ProfileUpdate):
    """
    Partially update a user profile (progressive onboarding).
    Only provided fields will be updated, others remain unchanged.
    """
    collection = get_profiles_collection()
    
    # Validate ObjectId
    try:
        object_id = ObjectId(profile_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid profile ID format"
        )
    
    # Check if profile exists
    existing_profile = await collection.find_one({"_id": object_id})
    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Prepare update data - only include fields that were provided
    update_dict = profile_update.model_dump(exclude_none=True)
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update"
        )
    
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Update profile
    await collection.update_one(
        {"_id": object_id},
        {"$set": update_dict}
    )
    
    # Retrieve updated profile
    updated_profile = await collection.find_one({"_id": object_id})
    updated_profile["_id"] = str(updated_profile["_id"])
    updated_profile["id"] = updated_profile["_id"]
    
    return updated_profile

@router.put("/{profile_id}")
async def update_profile_full(profile_id: str, profile: Profile):
    """
    Fully replace a user profile (legacy endpoint).
    Use PATCH for progressive updates instead.
    """
    collection = get_profiles_collection()
    
    # Validate ObjectId
    try:
        object_id = ObjectId(profile_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid profile ID format"
        )
    
    # Check if profile exists
    existing_profile = await collection.find_one({"_id": object_id})
    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Prepare update data
    update_dict = profile.model_dump(by_alias=True, exclude={"id", "created_at"}, exclude_none=True)
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Update profile
    await collection.update_one(
        {"_id": object_id},
        {"$set": update_dict}
    )
    
    # Retrieve updated profile
    updated_profile = await collection.find_one({"_id": object_id})
    updated_profile["_id"] = str(updated_profile["_id"])
    updated_profile["id"] = updated_profile["_id"]
    
    return updated_profile