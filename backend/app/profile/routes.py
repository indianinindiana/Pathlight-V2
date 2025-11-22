from fastapi import APIRouter, HTTPException, status
from app.shared.models import Profile
from app.shared.database import get_profiles_collection
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/v1/profiles", tags=["profiles"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_profile(profile: Profile):
    """Create a new user profile."""
    collection = get_profiles_collection()
    
    # Convert profile to dict and remove id if present
    profile_dict = profile.model_dump(by_alias=True, exclude={"id"})
    profile_dict["created_at"] = datetime.utcnow()
    profile_dict["updated_at"] = datetime.utcnow()
    
    # Insert into database
    result = await collection.insert_one(profile_dict)
    
    # Retrieve the created profile
    created_profile = await collection.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string for response
    created_profile["_id"] = str(created_profile["_id"])
    
    return created_profile

@router.get("/{profile_id}")
async def get_profile(profile_id: str):
    """Get a user profile by ID."""
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
    
    # Convert ObjectId to string
    profile["_id"] = str(profile["_id"])
    
    return profile

@router.put("/{profile_id}")
async def update_profile(profile_id: str, profile: Profile):
    """Update a user profile."""
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
    update_dict = profile.model_dump(by_alias=True, exclude={"id", "created_at"})
    update_dict["updated_at"] = datetime.utcnow()
    
    # Update profile
    await collection.update_one(
        {"_id": object_id},
        {"$set": update_dict}
    )
    
    # Retrieve updated profile
    updated_profile = await collection.find_one({"_id": object_id})
    updated_profile["_id"] = str(updated_profile["_id"])
    
    return updated_profile