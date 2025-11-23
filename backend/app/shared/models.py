from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .enums import AgeRange, EmploymentStatus, CreditScoreRange, LifeEvent, PrimaryGoal

class FinancialContext(BaseModel):
    """Financial context with all fields optional for progressive data capture"""
    age_range: Optional[AgeRange] = None
    employment_status: Optional[EmploymentStatus] = None
    monthly_income: Optional[float] = Field(None, gt=0, description="User's total monthly income")
    monthly_expenses: Optional[float] = Field(None, gt=0, description="User's total monthly expenses")
    available_for_debt_repayment: Optional[float] = Field(None, ge=0, description="Calculated as income - expenses")
    liquid_savings: Optional[float] = Field(None, ge=0, description="User's liquid savings")
    credit_score_range: Optional[CreditScoreRange] = None
    life_events: Optional[List[LifeEvent]] = Field(None, description="Upcoming life events")

class Profile(BaseModel):
    """User profile with minimal required fields for initial creation"""
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str = Field(..., description="Frontend-generated session identifier")
    primary_goal: PrimaryGoal = Field(..., description="User's primary debt payoff goal")
    stress_level: Optional[int] = Field(None, ge=1, le=5, description="User's stress level from 1 (low) to 5 (high)")
    financial_context: Optional[FinancialContext] = Field(None, description="Detailed financial information")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

class ProfileUpdate(BaseModel):
    """Model for partial profile updates (PATCH operations)"""
    primary_goal: Optional[PrimaryGoal] = None
    stress_level: Optional[int] = Field(None, ge=1, le=5)
    financial_context: Optional[FinancialContext] = None

class Debt(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    profile_id: str
    name: str
    balance: float = Field(..., gt=0, description="Current debt balance")
    interest_rate: float = Field(..., ge=0, le=100, description="Annual interest rate (APR)")
    minimum_payment: float = Field(..., gt=0, description="Minimum monthly payment")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True