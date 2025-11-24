from pydantic import BaseModel, Field, field_validator, computed_field
from typing import Optional
from datetime import datetime, date
from .enums import DebtType, APRType, PaymentType, LoanProgram

class SimpleDebt(BaseModel):
    """
    Simplified debt model that matches the frontend structure.
    Includes all optional fields from the complex model for comprehensive debt tracking.
    Implements BR-1: Minimum payment validation and calculated fields.
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
    
    @field_validator('apr')
    @classmethod
    def validate_apr(cls, v: float) -> float:
        """Validate APR and warn if unusually high (BR-1)"""
        if v > 30:
            # Note: This is a warning, not an error. The validation passes but we flag it.
            # The API endpoint should check this and return a warning message.
            pass
        return v
    
    @field_validator('minimum_payment')
    @classmethod
    def validate_minimum_payment(cls, v: float, info) -> float:
        """
        Validate that minimum payment covers monthly interest (BR-1).
        Formula: Monthly Interest = (Balance × APR ÷ 100) ÷ 12
        Minimum Payment ≥ Monthly Interest
        """
        # Get balance and apr from the validation context
        if 'balance' in info.data and 'apr' in info.data:
            balance = info.data['balance']
            apr = info.data['apr']
            monthly_interest = (balance * apr / 100) / 12
            
            if v < monthly_interest:
                raise ValueError(
                    f"Minimum payment (${v:.2f}) must be at least equal to monthly interest "
                    f"(${monthly_interest:.2f}) to ensure debt principal decreases over time. "
                    f"Suggested minimum: ${monthly_interest:.2f}"
                )
        return v
    
    @computed_field
    @property
    def monthly_interest(self) -> float:
        """Calculate monthly interest charge (BR-1)"""
        return (self.balance * self.apr / 100) / 12
    
    @computed_field
    @property
    def suggested_minimum_payment(self) -> float:
        """
        Calculate suggested minimum payment (BR-1).
        This is the monthly interest plus a small amount to reduce principal.
        """
        monthly_interest = self.monthly_interest
        # Add 1% of balance or $25, whichever is greater, to ensure principal reduction
        principal_payment = max(self.balance * 0.01, 25.0)
        return monthly_interest + principal_payment
    
    @computed_field
    @property
    def principal_portion(self) -> float:
        """Calculate principal portion of minimum payment"""
        return max(0, self.minimum_payment - self.monthly_interest)
    
    @computed_field
    @property
    def months_to_payoff_at_minimum(self) -> Optional[int]:
        """
        Calculate months to payoff at minimum payment.
        Returns None if payment doesn't cover interest.
        """
        if self.minimum_payment <= self.monthly_interest:
            return None
        
        # Simple calculation (doesn't account for decreasing interest over time)
        # For more accurate calculation, we'd need to iterate month by month
        remaining_balance = self.balance
        months = 0
        max_months = 600  # 50 years safety limit
        
        while remaining_balance > 0 and months < max_months:
            interest = (remaining_balance * self.apr / 100) / 12
            principal = self.minimum_payment - interest
            if principal <= 0:
                return None
            remaining_balance -= principal
            months += 1
        
        return months if remaining_balance <= 0 else None
    
    @computed_field
    @property
    def total_interest_at_minimum(self) -> Optional[float]:
        """
        Calculate total interest paid if paying minimum payment.
        Returns None if payment doesn't cover interest.
        """
        months = self.months_to_payoff_at_minimum
        if months is None:
            return None
        
        return (self.minimum_payment * months) - self.balance
    
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