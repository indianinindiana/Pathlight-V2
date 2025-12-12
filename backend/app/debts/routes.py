from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
from app.shared.simple_debt_models import SimpleDebt, SimpleDebtUpdate
from app.shared.database import get_debts_collection
from app.shared.enums import DebtType
from bson import ObjectId
from datetime import datetime, timezone, date
from typing import Optional, List, Dict, Any
from pydantic import ValidationError
import csv
import io

router = APIRouter(prefix="/api/v1/debts", tags=["debts"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_debt(debt: SimpleDebt):
    """
    Create a new debt with simplified structure.
    """
    collection = get_debts_collection()
    
    # Convert debt to dict and remove id if present
    debt_dict = debt.model_dump(by_alias=True, exclude={"id"}, exclude_none=True)
    
    # Convert all date fields to datetime for MongoDB compatibility
    date_fields = ["next_payment_date", "origination_date"]
    for field in date_fields:
        if field in debt_dict and isinstance(debt_dict[field], date):
            debt_dict[field] = datetime.combine(
                debt_dict[field],
                datetime.min.time()
            ).replace(tzinfo=timezone.utc)
    
    # Convert all enums to strings
    enum_fields = ["type", "apr_type", "payment_type", "loan_program"]
    for field in enum_fields:
        if field in debt_dict and hasattr(debt_dict[field], "value"):
            debt_dict[field] = debt_dict[field].value
    
    debt_dict["created_at"] = datetime.now(timezone.utc)
    debt_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Insert into database
    result = await collection.insert_one(debt_dict)
    
    # Retrieve the created debt
    created_debt = await collection.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string for response and add 'id' field
    created_debt["_id"] = str(created_debt["_id"])
    created_debt["id"] = created_debt["_id"]
    
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
    
    # Convert ObjectId to string for each debt and add 'id' field
    for debt in debts:
        debt["_id"] = str(debt["_id"])
        debt["id"] = debt["_id"]
    
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
    
    # Convert ObjectId to string and add 'id' field
    debt["_id"] = str(debt["_id"])
    debt["id"] = debt["_id"]
    
    return debt

@router.patch("/{debt_id}")
async def update_debt_partial(debt_id: str, debt_update: SimpleDebtUpdate):
    """
    Partially update a debt.
    Only provided fields will be updated, others remain unchanged.
    """
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
    
    # Prepare update data - only include fields that were provided
    update_dict = debt_update.model_dump(exclude_none=True)
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update"
        )
    
    # Convert all date fields to datetime for MongoDB compatibility
    date_fields = ["next_payment_date", "origination_date"]
    for field in date_fields:
        if field in update_dict and isinstance(update_dict[field], date):
            update_dict[field] = datetime.combine(
                update_dict[field],
                datetime.min.time()
            ).replace(tzinfo=timezone.utc)
    
    # Convert all enums to strings
    enum_fields = ["type", "apr_type", "payment_type", "loan_program"]
    for field in enum_fields:
        if field in update_dict and hasattr(update_dict[field], "value"):
            update_dict[field] = update_dict[field].value
    
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Update debt
    await collection.update_one(
        {"_id": object_id},
        {"$set": update_dict}
    )
    
    # Retrieve updated debt
    updated_debt = await collection.find_one({"_id": object_id})
    updated_debt["_id"] = str(updated_debt["_id"])
    updated_debt["id"] = updated_debt["_id"]
    
    return updated_debt

@router.put("/{debt_id}")
async def update_debt_full(debt_id: str, debt: SimpleDebt):
    """
    Fully replace a debt (legacy endpoint).
    Use PATCH for partial updates instead.
    """
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
    update_dict = debt.model_dump(by_alias=True, exclude={"id", "created_at"}, exclude_none=True)
    
    # Convert all date fields to datetime for MongoDB compatibility
    date_fields = ["next_payment_date", "origination_date"]
    for field in date_fields:
        if field in update_dict and isinstance(update_dict[field], date):
            update_dict[field] = datetime.combine(
                update_dict[field],
                datetime.min.time()
            ).replace(tzinfo=timezone.utc)
    
    # Convert all enums to strings
    enum_fields = ["type", "apr_type", "payment_type", "loan_program"]
    for field in enum_fields:
        if field in update_dict and hasattr(update_dict[field], "value"):
            update_dict[field] = update_dict[field].value
    
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    # Update debt
    await collection.update_one(
        {"_id": object_id},
        {"$set": update_dict}
    )
    
    # Retrieve updated debt
    updated_debt = await collection.find_one({"_id": object_id})
    updated_debt["_id"] = str(updated_debt["_id"])
    updated_debt["id"] = updated_debt["_id"]
    
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

@router.post("/import", status_code=status.HTTP_200_OK)
async def import_debts_from_csv(
    file: UploadFile = File(...),
    profile_id: str = Query(..., description="Profile ID to associate debts with")
):
    """
    Import multiple debts from a CSV file.
    
    Expected CSV format:
    type,name,balance,apr,minimum_payment,next_payment_date,lender_name,is_delinquent
    
    Returns:
    - success_count: Number of successfully imported debts
    - error_count: Number of failed imports
    - errors: List of errors with row numbers and details
    - imported_debts: List of successfully imported debt IDs
    """
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV file"
        )
    
    # Read file content
    try:
        content = await file.read()
        decoded_content = content.decode('utf-8')
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read CSV file: {str(e)}"
        )
    
    # Parse CSV
    csv_reader = csv.DictReader(io.StringIO(decoded_content))
    
    # Validate CSV headers
    required_fields = {'type', 'name', 'balance', 'apr', 'minimum_payment', 'next_payment_date'}
    optional_fields = {'lender_name', 'is_delinquent', 'actual_monthly_payment', 'credit_limit',
                      'late_fees', 'original_principal', 'term_months', 'apr_type', 'payment_type'}
    
    if not csv_reader.fieldnames:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file is empty or has no headers"
        )
    
    csv_fields = set(csv_reader.fieldnames)
    missing_fields = required_fields - csv_fields
    
    if missing_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CSV is missing required fields: {', '.join(missing_fields)}"
        )
    
    # Process rows
    collection = get_debts_collection()
    success_count = 0
    error_count = 0
    errors: List[Dict[str, Any]] = []
    imported_debt_ids: List[str] = []
    
    for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 (1 is header)
        try:
            # Clean and prepare data
            debt_data = {
                'profile_id': profile_id,
                'type': row['type'].strip().lower().replace(' ', '-'),
                'name': row['name'].strip(),
                'balance': float(row['balance']),
                'apr': float(row['apr']),
                'minimum_payment': float(row['minimum_payment']),
                'next_payment_date': datetime.strptime(row['next_payment_date'].strip(), '%Y-%m-%d').date(),
                'is_delinquent': row.get('is_delinquent', 'false').strip().lower() == 'true'
            }
            
            # Add optional fields if present
            if 'lender_name' in row and row['lender_name'].strip():
                debt_data['lender_name'] = row['lender_name'].strip()
            
            if 'actual_monthly_payment' in row and row['actual_monthly_payment'].strip():
                debt_data['actual_monthly_payment'] = float(row['actual_monthly_payment'])
            
            if 'credit_limit' in row and row['credit_limit'].strip():
                debt_data['credit_limit'] = float(row['credit_limit'])
            
            if 'late_fees' in row and row['late_fees'].strip():
                debt_data['late_fees'] = float(row['late_fees'])
            
            if 'original_principal' in row and row['original_principal'].strip():
                debt_data['original_principal'] = float(row['original_principal'])
            
            if 'term_months' in row and row['term_months'].strip():
                debt_data['term_months'] = int(row['term_months'])
            
            if 'apr_type' in row and row['apr_type'].strip():
                debt_data['apr_type'] = row['apr_type'].strip().lower()
            
            if 'payment_type' in row and row['payment_type'].strip():
                debt_data['payment_type'] = row['payment_type'].strip().lower()
            
            # Validate debt type
            try:
                DebtType(debt_data['type'])
            except ValueError:
                raise ValueError(f"Invalid debt type: {debt_data['type']}. Must be one of: {', '.join([t.value for t in DebtType])}")
            
            # Create and validate debt model
            try:
                debt = SimpleDebt(**debt_data)
            except ValidationError as ve:
                # Extract validation error messages
                error_messages = []
                for error in ve.errors():
                    field = '.'.join(str(loc) for loc in error['loc'])
                    message = error['msg']
                    error_messages.append(f"{field}: {message}")
                raise ValueError('; '.join(error_messages))
            
            # Convert to dict for MongoDB
            debt_dict = debt.model_dump(by_alias=True, exclude={"id"}, exclude_none=True)
            
            # Convert all date fields to datetime for MongoDB compatibility
            date_fields = ["next_payment_date", "origination_date"]
            for field in date_fields:
                if field in debt_dict and isinstance(debt_dict[field], date):
                    debt_dict[field] = datetime.combine(
                        debt_dict[field],
                        datetime.min.time()
                    ).replace(tzinfo=timezone.utc)
            
            # Convert all enums to strings
            enum_fields = ["type", "apr_type", "payment_type", "loan_program"]
            for field in enum_fields:
                if field in debt_dict and hasattr(debt_dict[field], "value"):
                    debt_dict[field] = debt_dict[field].value
            
            debt_dict["created_at"] = datetime.now(timezone.utc)
            debt_dict["updated_at"] = datetime.now(timezone.utc)
            
            # Insert into database
            result = await collection.insert_one(debt_dict)
            imported_debt_ids.append(str(result.inserted_id))
            success_count += 1
            
        except ValueError as ve:
            error_count += 1
            errors.append({
                "row": row_num,
                "error": str(ve),
                "data": row
            })
        except Exception as e:
            error_count += 1
            errors.append({
                "row": row_num,
                "error": f"Unexpected error: {str(e)}",
                "data": row
            })
    
    # Prepare response
    response = {
        "success_count": success_count,
        "error_count": error_count,
        "total_rows": success_count + error_count,
        "imported_debt_ids": imported_debt_ids,
        "errors": errors
    }
    
    # Add warnings for high APR
    warnings = []
    if success_count > 0:
        # Check for high APR debts
        high_apr_debts = await collection.find({
            "_id": {"$in": [ObjectId(id) for id in imported_debt_ids]},
            "apr": {"$gt": 30}
        }).to_list(length=None)
        
        if high_apr_debts:
            warnings.append({
                "type": "high_apr",
                "message": f"{len(high_apr_debts)} debt(s) have unusually high APR (>30%). Consider refinancing options.",
                "debt_ids": [str(debt["_id"]) for debt in high_apr_debts]
            })
    
    if warnings:
        response["warnings"] = warnings
    
    return response

@router.get("/import/template")
async def download_csv_template():
    """
    Download a CSV template for debt import.
    Returns a CSV file with headers and example data.
    """
    template_data = [
        {
            "type": "credit-card",
            "name": "Example Credit Card",
            "balance": "5000.00",
            "apr": "18.99",
            "minimum_payment": "150.00",
            "next_payment_date": "2024-02-01",
            "lender_name": "Example Bank",
            "is_delinquent": "false"
        },
        {
            "type": "personal-loan",
            "name": "Example Personal Loan",
            "balance": "10000.00",
            "apr": "12.50",
            "minimum_payment": "300.00",
            "next_payment_date": "2024-02-15",
            "lender_name": "Example Lender",
            "is_delinquent": "false"
        }
    ]
    
    # Create CSV content
    output = io.StringIO()
    fieldnames = ["type", "name", "balance", "apr", "minimum_payment", "next_payment_date", "lender_name", "is_delinquent"]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(template_data)
    
    csv_content = output.getvalue()
    
    from fastapi.responses import Response
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=debt_import_template.csv"
        }
    )

@router.post("/validate")
async def validate_debt(debt_data: Dict[str, Any]):
    """
    Validate debt data without saving it.
    Returns validation results, warnings, and suggestions.
    
    Request body should contain debt fields to validate:
    - balance (required)
    - apr (required)
    - minimum_payment (required)
    - type (optional)
    - name (optional)
    """
    validation_result = {
        "valid": True,
        "errors": [],
        "warnings": [],
        "suggestions": {}
    }
    
    # Extract required fields
    balance = debt_data.get('balance')
    apr = debt_data.get('apr')
    minimum_payment = debt_data.get('minimum_payment')
    
    # Validate required fields are present
    if balance is None:
        validation_result["valid"] = False
        validation_result["errors"].append("Balance is required")
    
    if apr is None:
        validation_result["valid"] = False
        validation_result["errors"].append("APR is required")
    
    if minimum_payment is None:
        validation_result["valid"] = False
        validation_result["errors"].append("Minimum payment is required")
    
    # If we have the required fields, perform validation
    if balance is not None and apr is not None and minimum_payment is not None:
        try:
            balance = float(balance)
            apr = float(apr)
            minimum_payment = float(minimum_payment)
            
            # Validate ranges
            if balance <= 0:
                validation_result["valid"] = False
                validation_result["errors"].append("Balance must be greater than 0")
            
            if apr < 0 or apr > 100:
                validation_result["valid"] = False
                validation_result["errors"].append("APR must be between 0 and 100")
            
            if minimum_payment <= 0:
                validation_result["valid"] = False
                validation_result["errors"].append("Minimum payment must be greater than 0")
            
            # Calculate monthly interest (BR-1)
            monthly_interest = (balance * apr / 100) / 12
            
            # Validate minimum payment covers interest (BR-1)
            if minimum_payment < monthly_interest:
                validation_result["valid"] = False
                validation_result["errors"].append(
                    f"Minimum payment (${minimum_payment:.2f}) must be at least equal to monthly interest "
                    f"(${monthly_interest:.2f}) to ensure debt principal decreases over time."
                )
            
            # Calculate suggested minimum payment
            principal_payment = max(balance * 0.01, 25.0)
            suggested_minimum = monthly_interest + principal_payment
            
            validation_result["suggestions"]["monthly_interest"] = round(monthly_interest, 2)
            validation_result["suggestions"]["suggested_minimum_payment"] = round(suggested_minimum, 2)
            validation_result["suggestions"]["principal_portion"] = round(max(0, minimum_payment - monthly_interest), 2)
            
            # Warn if APR is high (BR-1)
            if apr > 30:
                validation_result["warnings"].append({
                    "type": "high_apr",
                    "message": f"APR of {apr}% is unusually high. Consider refinancing options to reduce interest costs.",
                    "severity": "high"
                })
            elif apr > 20:
                validation_result["warnings"].append({
                    "type": "elevated_apr",
                    "message": f"APR of {apr}% is elevated. You may benefit from exploring lower-rate options.",
                    "severity": "medium"
                })
            
            # Warn if minimum payment is barely covering interest
            if minimum_payment < monthly_interest * 1.1:  # Less than 10% above interest
                validation_result["warnings"].append({
                    "type": "low_principal_payment",
                    "message": "Your minimum payment barely covers the interest. Consider increasing your payment to pay off debt faster.",
                    "severity": "medium"
                })
            
            # Calculate payoff timeline at minimum payment
            if minimum_payment > monthly_interest:
                remaining_balance = balance
                months = 0
                max_months = 600  # 50 years safety limit
                
                while remaining_balance > 0 and months < max_months:
                    interest = (remaining_balance * apr / 100) / 12
                    principal = minimum_payment - interest
                    if principal <= 0:
                        break
                    remaining_balance -= principal
                    months += 1
                
                if months < max_months and remaining_balance <= 0:
                    years = months / 12
                    total_interest = (minimum_payment * months) - balance
                    
                    validation_result["suggestions"]["months_to_payoff"] = months
                    validation_result["suggestions"]["years_to_payoff"] = round(years, 1)
                    validation_result["suggestions"]["total_interest_paid"] = round(total_interest, 2)
                    
                    # Warn if payoff timeline is very long
                    if years > 10:
                        validation_result["warnings"].append({
                            "type": "long_payoff_timeline",
                            "message": f"At this payment rate, it will take {years:.1f} years to pay off this debt. Consider increasing your payment.",
                            "severity": "medium"
                        })
        
        except (ValueError, TypeError) as e:
            validation_result["valid"] = False
            validation_result["errors"].append(f"Invalid numeric value: {str(e)}")
    
    return validation_result

@router.post("/suggest-minimum-payment")
async def suggest_minimum_payment(debt_data: Dict[str, Any]):
    """
    Calculate suggested minimum payment based on balance and APR.
    
    Request body:
    - balance (required): Current debt balance
    - apr (required): Annual Percentage Rate
    
    Returns:
    - monthly_interest: Monthly interest charge
    - suggested_minimum_payment: Recommended minimum payment
    - reasoning: Explanation of the calculation
    """
    balance = debt_data.get('balance')
    apr = debt_data.get('apr')
    
    if balance is None or apr is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both balance and apr are required"
        )
    
    try:
        balance = float(balance)
        apr = float(apr)
        
        if balance <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Balance must be greater than 0"
            )
        
        if apr < 0 or apr > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="APR must be between 0 and 100"
            )
        
        # Calculate monthly interest (BR-1)
        monthly_interest = (balance * apr / 100) / 12
        
        # Calculate suggested minimum payment
        # Add 1% of balance or $25 (whichever is greater) to ensure principal reduction
        principal_payment = max(balance * 0.01, 25.0)
        suggested_minimum = monthly_interest + principal_payment
        
        return {
            "balance": balance,
            "apr": apr,
            "monthly_interest": round(monthly_interest, 2),
            "suggested_minimum_payment": round(suggested_minimum, 2),
            "principal_portion": round(principal_payment, 2),
            "reasoning": (
                f"Monthly interest is ${monthly_interest:.2f}. "
                f"We suggest adding ${principal_payment:.2f} to reduce the principal, "
                f"for a total minimum payment of ${suggested_minimum:.2f}."
            )
        }
    
    except (ValueError, TypeError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid numeric value: {str(e)}"
        )