from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from .enums import DebtType, APRType, PaymentType, LoanProgram

class SimpleDebt(BaseModel):
    """
    Simplified debt model that matches the frontend structure.
    Includes all optional fields from the complex model for comprehensive debt tracking.
    """
    id: Optional[str] = Field(alias="_id", default=None)
    profile_id: str = Field(..., description="ID of the profile this debt belongs to")
    type: DebtType = Field(..., description="Type of debt")
    name: str = Field(..., min_length=1, max_length=100, description="User-friendly name for this debt")
    
    # Required fields
    balance: float = Field(..., gt=0, description="Current debt balance")
    apr: float = Field(..., ge=0, le=100, description="Annual Percentage Rate")
    minimum_payment: float = Field(..., gt=0, description="Minimum monthly payment")
    next_payment_date: date = Field(..., description="Next payment due date")
    is_delinquent: bool = Field(default=False, description="Whether this debt is currently delinquent")
    
    # Optional common fields
    lender_name: Optional[str] = Field(None, max_length=100, description="Name of the lender")
    apr_type: Optional[APRType] = Field(None, description="Fixed or variable APR")
    payment_type: Optional[PaymentType] = Field(None, description="Payment type")
    actual_monthly_payment: Optional[float] = Field(None, gt=0, description="Actual amount being paid monthly")
    
    # Optional loan-specific fields
    original_principal: Optional[float] = Field(None, gt=0, description="Original loan amount")
    term_months: Optional[int] = Field(None, gt=0, description="Total loan term in months")
    origination_date: Optional[date] = Field(None, description="Date the loan was originated")
    remaining_months: Optional[int] = Field(None, ge=0, description="Months remaining on loan")
    
    # Optional credit card specific fields
    credit_limit: Optional[float] = Field(None, gt=0, description="Total credit limit")
    late_fees: Optional[float] = Field(None, ge=0, description="Late fees charged")
    
    # Optional student loan specific fields
    loan_program: Optional[LoanProgram] = Field(None, description="Federal or private loan")
    
    # Optional mortgage specific fields
    escrow_included: Optional[bool] = Field(None, description="Whether escrow is included in payment")
    property_tax: Optional[float] = Field(None, ge=0, description="Annual property tax")
    home_insurance: Optional[float] = Field(None, ge=0, description="Annual home insurance")
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

class SimpleDebtUpdate(BaseModel):
    """Model for partial debt updates (PATCH operations)"""
    type: Optional[DebtType] = None
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    balance: Optional[float] = Field(None, gt=0)
    apr: Optional[float] = Field(None, ge=0, le=100)
    minimum_payment: Optional[float] = Field(None, gt=0)
    next_payment_date: Optional[date] = None
    is_delinquent: Optional[bool] = None
    
    # Optional fields
    lender_name: Optional[str] = Field(None, max_length=100)
    apr_type: Optional[APRType] = None
    payment_type: Optional[PaymentType] = None
    actual_monthly_payment: Optional[float] = Field(None, gt=0)
    original_principal: Optional[float] = Field(None, gt=0)
    term_months: Optional[int] = Field(None, gt=0)
    origination_date: Optional[date] = None
    remaining_months: Optional[int] = Field(None, ge=0)
    credit_limit: Optional[float] = Field(None, gt=0)
    late_fees: Optional[float] = Field(None, ge=0)
    loan_program: Optional[LoanProgram] = None
    escrow_included: Optional[bool] = None
    property_tax: Optional[float] = Field(None, ge=0)
    home_insurance: Optional[float] = Field(None, ge=0)