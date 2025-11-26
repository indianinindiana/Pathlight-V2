from pydantic import BaseModel, Field, computed_field
from typing import List, Optional, Literal
from datetime import datetime
from datetime import date as date_type
from enum import Enum

class PayoffStrategy(str, Enum):
    """Debt payoff strategies"""
    SNOWBALL = "snowball"  # Smallest balance first
    AVALANCHE = "avalanche"  # Highest APR first
    CUSTOM = "custom"  # User-defined order

class ScenarioType(str, Enum):
    """Types of scenarios"""
    BASE = "base"  # Standard payoff scenario
    WHAT_IF = "what-if"  # What-if analysis
    OPTIMIZED = "optimized"  # Optimized payment plan

class WhatIfType(str, Enum):
    """Types of what-if scenarios"""
    EXTRA_PAYMENT = "extra-payment"  # One-time extra payment
    INCREASED_MONTHLY = "increased-monthly"  # Increased monthly payment
    DEBT_CONSOLIDATION = "debt-consolidation"  # Consolidate debts
    BALANCE_TRANSFER = "balance-transfer"  # Transfer balance to lower APR
    RATE_CHANGE = "rate-change"  # APR change on one or more debts

class PayoffScheduleItem(BaseModel):
    """Individual payment in the payoff schedule"""
    month: int = Field(..., description="Month number in the schedule")
    payment_date: date_type = Field(..., description="Payment date")
    debt_id: str = Field(..., description="ID of the debt being paid")
    debt_name: str = Field(..., description="Name of the debt")
    payment: float = Field(..., ge=0, description="Total payment amount")
    principal: float = Field(..., ge=0, description="Principal portion")
    interest: float = Field(..., ge=0, description="Interest portion")
    remaining_balance: float = Field(..., ge=0, description="Remaining balance after payment")

class DebtPayoffSummary(BaseModel):
    """Summary of payoff for a single debt"""
    debt_id: str
    debt_name: str
    original_balance: float
    total_paid: float
    total_interest: float
    months_to_payoff: int
    payoff_date: date_type

class PayoffScenario(BaseModel):
    """Complete payoff scenario with schedule and metrics"""
    scenario_id: str = Field(..., description="Unique scenario identifier (UUID)")
    name: str = Field(..., description="Scenario name")
    strategy: PayoffStrategy = Field(..., description="Payoff strategy used")
    scenario_type: ScenarioType = Field(default=ScenarioType.BASE)
    
    # Input parameters
    monthly_payment: float = Field(..., gt=0, description="Total monthly payment amount")
    start_date: date_type = Field(..., description="Start date of payoff plan")
    
    # Results
    total_months: int = Field(..., ge=0, description="Total months to debt freedom")
    payoff_date: date_type = Field(..., description="Date when all debts are paid off")
    total_interest: float = Field(..., ge=0, description="Total interest paid")
    total_paid: float = Field(..., gt=0, description="Total amount paid (principal + interest)")
    
    # Detailed schedule
    schedule: List[PayoffScheduleItem] = Field(..., description="Month-by-month payment schedule")
    debt_summaries: List[DebtPayoffSummary] = Field(..., description="Per-debt payoff summaries")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    @computed_field
    @property
    def average_monthly_interest(self) -> float:
        """Calculate average monthly interest paid"""
        if self.total_months == 0:
            return 0
        return self.total_interest / self.total_months
    
    @computed_field
    @property
    def interest_to_principal_ratio(self) -> float:
        """Calculate ratio of interest to principal"""
        principal = self.total_paid - self.total_interest
        if principal == 0:
            return 0
        return (self.total_interest / principal) * 100

class SimulateScenarioRequest(BaseModel):
    """Request to simulate a payoff scenario"""
    profile_id: str = Field(..., description="Profile ID")
    strategy: PayoffStrategy = Field(..., description="Payoff strategy to use")
    monthly_payment: float = Field(..., gt=0, description="Total monthly payment amount")
    start_date: Optional[date_type] = Field(None, description="Start date (defaults to today)")
    custom_debt_order: Optional[List[str]] = Field(None, description="Custom debt order (debt IDs) for custom strategy")

class WhatIfScenarioRequest(BaseModel):
    """Request for what-if analysis"""
    profile_id: str = Field(..., description="Profile ID")
    base_scenario_id: Optional[str] = Field(None, description="Base scenario to compare against")
    what_if_type: WhatIfType = Field(..., description="Type of what-if analysis")
    
    # Base parameters
    strategy: PayoffStrategy = Field(default=PayoffStrategy.AVALANCHE)
    monthly_payment: float = Field(..., gt=0, description="Base monthly payment")
    start_date: Optional[date_type] = Field(None, description="Start date")
    
    # What-if specific parameters
    extra_payment_amount: Optional[float] = Field(None, ge=0, description="One-time extra payment amount")
    extra_payment_month: Optional[int] = Field(None, ge=1, description="Month to apply extra payment")
    extra_payment_debt_id: Optional[str] = Field(None, description="Debt to apply extra payment to")
    
    increased_payment_amount: Optional[float] = Field(None, gt=0, description="New monthly payment amount")
    
    consolidation_apr: Optional[float] = Field(None, ge=0, le=100, description="New APR for consolidated debt")
    consolidation_debt_ids: Optional[List[str]] = Field(None, description="Debts to consolidate")
    
    balance_transfer_debt_id: Optional[str] = Field(None, description="Debt to transfer")
    balance_transfer_new_apr: Optional[float] = Field(None, ge=0, le=100, description="New APR after transfer")
    balance_transfer_fee_percent: Optional[float] = Field(None, ge=0, le=10, description="Balance transfer fee %")
    
    rate_change_debt_id: Optional[str] = Field(None, description="Debt with rate change")
    rate_change_new_apr: Optional[float] = Field(None, ge=0, le=100, description="New APR")

class OptimizePaymentRequest(BaseModel):
    """Request to optimize payment amount"""
    profile_id: str = Field(..., description="Profile ID")
    target_months: Optional[int] = Field(None, gt=0, description="Target months to debt freedom")
    max_monthly_payment: Optional[float] = Field(None, gt=0, description="Maximum affordable monthly payment")
    strategy: PayoffStrategy = Field(default=PayoffStrategy.AVALANCHE)

class OptimizePaymentResponse(BaseModel):
    """Response with optimized payment recommendation"""
    recommended_payment: float = Field(..., description="Recommended monthly payment")
    scenario: PayoffScenario = Field(..., description="Resulting payoff scenario")
    rationale: str = Field(..., description="Explanation of recommendation")
    savings_vs_minimum: float = Field(..., description="Interest savings vs paying minimums only")

class StrategyRecommendation(BaseModel):
    """Recommendation for best payoff strategy"""
    recommended_strategy: PayoffStrategy = Field(..., description="Recommended strategy")
    confidence_score: float = Field(..., ge=0, le=100, description="Confidence in recommendation (0-100)")
    rationale: str = Field(..., description="Explanation of why this strategy is recommended")
    
    # Comparison of strategies
    snowball_scenario: PayoffScenario
    avalanche_scenario: PayoffScenario
    
    # Key differences
    interest_difference: float = Field(..., description="Interest difference between strategies")
    time_difference_months: int = Field(..., description="Time difference in months")
    
    # Factors considered
    factors: List[str] = Field(..., description="Factors that influenced the recommendation")

class StrategyRecommendationRequest(BaseModel):
    """Request for strategy recommendation"""
    profile_id: str = Field(..., description="Profile ID")
    monthly_payment: float = Field(..., gt=0, description="Available monthly payment")
    start_date: Optional[date_type] = Field(None, description="Start date")

class ScenarioComparison(BaseModel):
    """Comparison between two scenarios"""
    scenario_a: PayoffScenario
    scenario_b: PayoffScenario
    
    interest_savings: float = Field(..., description="Interest savings (A vs B)")
    time_savings_months: int = Field(..., description="Time savings in months (A vs B)")
    monthly_payment_difference: float = Field(..., description="Monthly payment difference")
    
    recommendation: str = Field(..., description="Which scenario is better and why")