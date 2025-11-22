from fastapi import APIRouter, HTTPException, status, Query
from app.shared.models import Debt
from app.shared.database import get_debts_collection
from bson import ObjectId
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/v1/debts", tags=["debts"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_debt(debt: Debt):
    """Create a new debt."""
    collection = get_debts_collection()
    
    # Convert debt to dict and remove id if present
    debt_dict = debt.model_dump(by_alias=True, exclude={"id"})
    debt_dict["created_at"] = datetime.utcnow()
    debt_dict["updated_at"] = datetime.utcnow()
    
    # Insert into database
    result = await collection.insert_one(debt_dict)
    
    # Retrieve the created debt
    created_debt = await collection.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string for response
    created_debt["_id"] = str(created_debt["_id"])
    
    return created_debt

@router.get("")
async def get_debts(profile_id: Optional[str] = Query(None, description="Filter debts by profile ID")):
    """Get all debts, optionally filtered by profile_id."""
    collection = get_debts_collection()
    
    # Build query filter
    query = {}
    if profile_id:
        query["profile_id"] = profile_id
    
    # Find all debts matching the query
    cursor = collection.find(query)
    debts = await cursor.to_list(length=None)
    
    # Convert ObjectId to string for each debt
    for debt in debts:
        debt["_id"] = str(debt["_id"])
    
    return debts

@router.get("/{debt_id}")
async def get_debt(debt_id: str):
    """Get a debt by ID."""
    collection = get_debts_collection()
    
    # Validate ObjectId
    try:
        object_id = ObjectId(debt_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid debt ID format"
        )
    
    # Find debt
    debt = await collection.find_one({"_id": object_id})
    
    if not debt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debt not found"
        )
    
    # Convert ObjectId to string
    debt["_id"] = str(debt["_id"])
    
    return debt

@router.put("/{debt_id}")
async def update_debt(debt_id: str, debt: Debt):
    """Update a debt."""
    collection = get_debts_collection()
    
    # Validate ObjectId
    try:
        object_id = ObjectId(debt_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid debt ID format"
        )
    
    # Check if debt exists
    existing_debt = await collection.find_one({"_id": object_id})
    if not existing_debt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debt not found"
        )
    
    # Prepare update data
    update_dict = debt.model_dump(by_alias=True, exclude={"id", "created_at"})
    update_dict["updated_at"] = datetime.utcnow()
    
    # Update debt
    await collection.update_one(
        {"_id": object_id},
        {"$set": update_dict}
    )
    
    # Retrieve updated debt
    updated_debt = await collection.find_one({"_id": object_id})
    updated_debt["_id"] = str(updated_debt["_id"])
    
    return updated_debt

@router.delete("/{debt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_debt(debt_id: str):
    """Delete a debt."""
    collection = get_debts_collection()
    
    # Validate ObjectId
    try:
        object_id = ObjectId(debt_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid debt ID format"
        )
    
    # Delete the debt
    result = await collection.delete_one({"_id": object_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debt not found"
        )
    
    return None