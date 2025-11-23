from pydantic import BaseModel, Field
from typing import Optional, Union, Literal
from datetime import datetime, date
from .enums import DebtType, APRType, PaymentType, LoanProgram

# ============================================================================
# DETAIL MODELS - Specific fields for each debt type
# ============================================================================

class CreditCardDetails(BaseModel):
    """Detailed schema for credit card debt"""
    lender_name: Optional[str] = None
    current_balance: float = Field(..., gt=0, description="Current outstanding balance")
    apr: float = Field(..., ge=0, le=100, description="Annual Percentage Rate")
    apr_type: Optional[APRType] = None
    credit_limit: Optional[float] = Field(None, gt=0, description="Total credit limit")
    minimum_payment: Optional[float] = Field(None, gt=0, description="Minimum monthly payment required")
    payment_type: Optional[PaymentType] = None
    late_fees: Optional[float] = Field(None, ge=0, description="Late fees charged")
    actual_monthly_payment: float = Field(..., gt=0, description="Actual amount being paid monthly")
    next_payment_date: date = Field(..., description="Next payment due date")

class PersonalLoanDetails(BaseModel):
    """Detailed schema for personal loans"""
    lender_name: Optional[str] = None
    current_balance: float = Field(..., gt=0, description="Current outstanding balance")
    apr: float = Field(..., ge=0, le=100, description="Annual Percentage Rate")
    minimum_payment: Optional[float] = Field(None, gt=0, description="Minimum monthly payment")
    actual_monthly_payment: float = Field(..., gt=0, description="Actual amount being paid monthly")
    original_principal: Optional[float] = Field(None, gt=0, description="Original loan amount")
    term_months: Optional[int] = Field(None, gt=0, description="Total loan term in months")
    origination_date: Optional[date] = None
    remaining_months: Optional[int] = Field(None, ge=0, description="Months remaining on loan")

class AutoLoanDetails(BaseModel):
    """Detailed schema for auto loans"""
    lender_name: Optional[str] = None
    current_balance: float = Field(..., gt=0, description="Current outstanding balance")
    apr: float = Field(..., ge=0, le=100, description="Annual Percentage Rate")
    minimum_payment: Optional[float] = Field(None, gt=0, description="Minimum monthly payment")
    actual_monthly_payment: float = Field(..., gt=0, description="Actual amount being paid monthly")
    original_principal: Optional[float] = Field(None, gt=0, description="Original loan amount")
    term_months: Optional[int] = Field(None, gt=0, description="Total loan term in months")
    origination_date: Optional[date] = None
    remaining_months: Optional[int] = Field(None, ge=0, description="Months remaining on loan")

class InstallmentLoanDetails(BaseModel):
    """Detailed schema for other installment loans"""
    lender_name: Optional[str] = None
    current_balance: float = Field(..., gt=0, description="Current outstanding balance")
    apr: float = Field(..., ge=0, le=100, description="Annual Percentage Rate")
    minimum_payment: Optional[float] = Field(None, gt=0, description="Minimum monthly payment")
    actual_monthly_payment: float = Field(..., gt=0, description="Actual amount being paid monthly")
    original_principal: Optional[float] = Field(None, gt=0, description="Original loan amount")
    term_months: Optional[int] = Field(None, gt=0, description="Total loan term in months")
    origination_date: Optional[date] = None
    remaining_months: Optional[int] = Field(None, ge=0, description="Months remaining on loan")

class StudentLoanDetails(BaseModel):
    """Detailed schema for student loans"""
    lender_name: Optional[str] = None
    current_balance: float = Field(..., gt=0, description="Current outstanding balance")
    apr: float = Field(..., ge=0, le=100, description="Annual Percentage Rate")
    minimum_payment: float = Field(..., gt=0, description="Minimum monthly payment required")
    loan_program: Optional[LoanProgram] = None
    term_months: Optional[int] = Field(None, gt=0, description="Total loan term in months")
    origination_date: Optional[date] = None
    remaining_months: Optional[int] = Field(None, ge=0, description="Months remaining on loan")
    actual_monthly_payment: Optional[float] = Field(None, gt=0, description="Actual amount being paid monthly")

class MortgageDetails(BaseModel):
    """Detailed schema for mortgage debt"""
    lender_name: Optional[str] = None
    current_balance: float = Field(..., gt=0, description="Current outstanding balance")
    apr: float = Field(..., ge=0, le=100, description="Annual Percentage Rate")
    minimum_payment: float = Field(..., gt=0, description="Minimum monthly payment required")
    term_months: int = Field(..., gt=0, description="Total loan term in months")
    escrow_included: Optional[bool] = Field(None, description="Whether escrow is included in payment")
    property_tax: Optional[float] = Field(None, ge=0, description="Annual property tax")
    home_insurance: Optional[float] = Field(None, ge=0, description="Annual home insurance")
    origination_date: Optional[date] = None
    actual_monthly_payment: Optional[float] = Field(None, gt=0, description="Actual amount being paid monthly")

# ============================================================================
# BASE MODELS WITH DISCRIMINATOR - One for each debt type
# ============================================================================

class CreditCardDebt(BaseModel):
    """Credit card debt with discriminator"""
    debt_type: Literal[DebtType.CREDIT_CARD] = DebtType.CREDIT_CARD
    details: CreditCardDetails

class PersonalLoanDebt(BaseModel):
    """Personal loan debt with discriminator"""
    debt_type: Literal[DebtType.PERSONAL_LOAN] = DebtType.PERSONAL_LOAN
    details: PersonalLoanDetails

class AutoLoanDebt(BaseModel):
    """Auto loan debt with discriminator"""
    debt_type: Literal[DebtType.AUTO_LOAN] = DebtType.AUTO_LOAN
    details: AutoLoanDetails

class InstallmentLoanDebt(BaseModel):
    """Installment loan debt with discriminator"""
    debt_type: Literal[DebtType.INSTALLMENT_LOAN] = DebtType.INSTALLMENT_LOAN
    details: InstallmentLoanDetails

class StudentLoanDebt(BaseModel):
    """Student loan debt with discriminator"""
    debt_type: Literal[DebtType.STUDENT_LOAN] = DebtType.STUDENT_LOAN
    details: StudentLoanDetails

class MortgageDebt(BaseModel):
    """Mortgage debt with discriminator"""
    debt_type: Literal[DebtType.MORTGAGE] = DebtType.MORTGAGE
    details: MortgageDetails

# ============================================================================
# UNIFIED DEBT MODEL - Union of all debt types
# ============================================================================

DebtInfo = Union[
    CreditCardDebt,
    PersonalLoanDebt,
    AutoLoanDebt,
    InstallmentLoanDebt,
    StudentLoanDebt,
    MortgageDebt
]

# ============================================================================
# TOP-LEVEL DEBT DOCUMENT - What gets stored in the database
# ============================================================================

class Debt(BaseModel):
    """
    Top-level debt document stored in the database.
    Uses polymorphic debt_info field that can be any of the 6 debt types.
    """
    id: Optional[str] = Field(alias="_id", default=None)
    profile_id: str = Field(..., description="ID of the profile this debt belongs to")
    name: str = Field(..., min_length=1, max_length=100, description="User-friendly name for this debt")
    is_delinquent: bool = Field(default=False, description="Whether this debt is currently delinquent")
    debt_info: DebtInfo = Field(..., discriminator="debt_type", description="Detailed debt information")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class DebtUpdate(BaseModel):
    """Model for partial debt updates (PATCH operations)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    is_delinquent: Optional[bool] = None
    debt_info: Optional[DebtInfo] = Field(None, discriminator="debt_type")