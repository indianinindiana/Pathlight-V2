"""
Scenarios API routes for debt payoff simulation and recommendations.
Implements Sprint S2 requirements.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import date, timedelta
from copy import deepcopy

from ..shared.database import get_database
from ..shared.simple_debt_models import SimpleDebt
from ..shared.models import Profile
from ..shared.scenario_models import (
    SimulateScenarioRequest, PayoffScenario,
    WhatIfScenarioRequest, WhatIfType, ScenarioType,
    OptimizePaymentRequest, OptimizePaymentResponse,
    StrategyRecommendationRequest, StrategyRecommendation,
    PayoffStrategy, ScenarioComparison
)
from ..shared.calculation_utils import (
    simulate_payoff_scenario,
    calculate_minimum_payment_scenario,
    compare_scenarios,
    calculate_confidence_score
)

router = APIRouter(prefix="/api/v1/scenarios", tags=["scenarios"])

@router.post("/simulate", response_model=PayoffScenario, status_code=status.HTTP_200_OK)
async def simulate_scenario(request: SimulateScenarioRequest):
    """
    Simulate a debt payoff scenario with the specified strategy.
    
    This endpoint calculates a complete payoff schedule based on:
    - Payoff strategy (snowball, avalanche, or custom)
    - Monthly payment amount
    - Current debt balances and interest rates
    
    Returns a detailed scenario with month-by-month payment schedule.
    """
    db = await get_database()
    
    # Fetch all debts for the profile
    debts_cursor = db.debts.find({"profile_id": request.profile_id})
    debts_data = await debts_cursor.to_list(length=None)
    
    if not debts_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No debts found for this profile"
        )
    
    # Convert to SimpleDebt models
    debts = [SimpleDebt(**debt) for debt in debts_data]
    
    # Use today as start date if not provided
    start_date = request.start_date or date.today()
    
    try:
        # Simulate the scenario
        scenario = simulate_payoff_scenario(
            debts=debts,
            strategy=request.strategy,
            monthly_payment=request.monthly_payment,
            start_date=start_date,
            custom_order=request.custom_debt_order
        )
        
        return scenario
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/what-if", response_model=PayoffScenario, status_code=status.HTTP_200_OK)
async def what_if_analysis(request: WhatIfScenarioRequest):
    """
    Perform what-if analysis on debt payoff scenarios.
    
    Supports various what-if scenarios:
    - Extra one-time payment
    - Increased monthly payment
    - Debt consolidation
    - Balance transfer
    - Interest rate changes
    
    Returns a modified scenario showing the impact of the change.
    """
    db = await get_database()
    
    # Fetch all debts for the profile
    debts_cursor = db.debts.find({"profile_id": request.profile_id})
    debts_data = await debts_cursor.to_list(length=None)
    
    if not debts_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No debts found for this profile"
        )
    
    # Convert to SimpleDebt models
    debts = [SimpleDebt(**debt) for debt in debts_data]
    start_date = request.start_date or date.today()
    
    try:
        # Handle different what-if types
        if request.what_if_type == WhatIfType.EXTRA_PAYMENT:
            scenario = _simulate_extra_payment(
                debts, request, start_date
            )
        
        elif request.what_if_type == WhatIfType.INCREASED_MONTHLY:
            if not request.increased_payment_amount:
                raise ValueError("increased_payment_amount is required for this what-if type")
            
            scenario = simulate_payoff_scenario(
                debts=debts,
                strategy=request.strategy,
                monthly_payment=request.increased_payment_amount,
                start_date=start_date,
                scenario_name=f"Increased Payment: ${request.increased_payment_amount:.2f}/mo"
            )
        
        elif request.what_if_type == WhatIfType.DEBT_CONSOLIDATION:
            scenario = _simulate_consolidation(
                debts, request, start_date
            )
        
        elif request.what_if_type == WhatIfType.BALANCE_TRANSFER:
            scenario = _simulate_balance_transfer(
                debts, request, start_date
            )
        
        elif request.what_if_type == WhatIfType.RATE_CHANGE:
            scenario = _simulate_rate_change(
                debts, request, start_date
            )
        
        else:
            raise ValueError(f"Unsupported what-if type: {request.what_if_type}")
        
        # Mark as what-if scenario
        scenario.scenario_type = ScenarioType.WHAT_IF
        
        return scenario
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/optimize", response_model=OptimizePaymentResponse, status_code=status.HTTP_200_OK)
async def optimize_payment(request: OptimizePaymentRequest):
    """
    Optimize monthly payment amount based on goals and constraints.
    
    Calculates the optimal monthly payment to:
    - Reach debt freedom in target months, OR
    - Maximize payoff speed within budget constraints
    
    Returns recommended payment with rationale and projected scenario.
    """
    db = await get_database()
    
    # Fetch all debts for the profile
    debts_cursor = db.debts.find({"profile_id": request.profile_id})
    debts_data = await debts_cursor.to_list(length=None)
    
    if not debts_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No debts found for this profile"
        )
    
    # Fetch profile for context
    profile_data = await db.profiles.find_one({"user_id": request.profile_id})
    if not profile_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    profile = Profile(**profile_data)
    debts = [SimpleDebt(**debt) for debt in debts_data]
    start_date = date.today()
    
    # Calculate minimum payment scenario for comparison
    min_scenario = calculate_minimum_payment_scenario(debts, start_date)
    
    try:
        if request.target_months:
            # Binary search to find payment amount for target months
            recommended_payment = _optimize_for_target_months(
                debts, request.strategy, request.target_months, start_date
            )
            rationale = f"To reach debt freedom in {request.target_months} months, you need to pay ${recommended_payment:.2f} per month."
        
        elif request.max_monthly_payment:
            # Use maximum affordable payment
            recommended_payment = request.max_monthly_payment
            rationale = f"With your maximum affordable payment of ${recommended_payment:.2f}/month, you can optimize your debt payoff."
        
        else:
            # Suggest 20% more than minimums as a reasonable target
            total_minimums = sum(d.minimum_payment for d in debts)
            recommended_payment = total_minimums * 1.2
            rationale = f"We recommend paying ${recommended_payment:.2f}/month (20% more than minimums) to make meaningful progress."
        
        # Simulate with recommended payment
        scenario = simulate_payoff_scenario(
            debts=debts,
            strategy=request.strategy,
            monthly_payment=recommended_payment,
            start_date=start_date,
            scenario_name="Optimized Payment Plan"
        )
        scenario.scenario_type = ScenarioType.OPTIMIZED
        
        # Calculate savings vs minimum payments
        savings = min_scenario.total_interest - scenario.total_interest
        
        return OptimizePaymentResponse(
            recommended_payment=recommended_payment,
            scenario=scenario,
            rationale=rationale,
            savings_vs_minimum=savings
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/compare", response_model=ScenarioComparison, status_code=status.HTTP_200_OK)
async def compare_two_scenarios(
    scenario_a_request: SimulateScenarioRequest,
    scenario_b_request: SimulateScenarioRequest
):
    """
    Compare two different payoff scenarios side-by-side.
    
    Useful for comparing:
    - Different strategies (snowball vs avalanche)
    - Different payment amounts
    - Base scenario vs what-if scenario
    
    Returns detailed comparison with recommendations.
    """
    db = await get_database()
    
    # Fetch debts (assuming same profile for both scenarios)
    debts_cursor = db.debts.find({"profile_id": scenario_a_request.profile_id})
    debts_data = await debts_cursor.to_list(length=None)
    
    if not debts_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No debts found for this profile"
        )
    
    debts = [SimpleDebt(**debt) for debt in debts_data]
    start_date = date.today()
    
    try:
        # Simulate both scenarios
        scenario_a = simulate_payoff_scenario(
            debts=debts,
            strategy=scenario_a_request.strategy,
            monthly_payment=scenario_a_request.monthly_payment,
            start_date=start_date
        )
        
        scenario_b = simulate_payoff_scenario(
            debts=debts,
            strategy=scenario_b_request.strategy,
            monthly_payment=scenario_b_request.monthly_payment,
            start_date=start_date
        )
        
        # Calculate differences
        comparison = compare_scenarios(scenario_a, scenario_b)
        
        # Generate recommendation
        if comparison['interest_savings'] > 0 and comparison['time_savings_months'] > 0:
            recommendation = f"Scenario A saves ${comparison['interest_savings']:.2f} in interest and pays off {comparison['time_savings_months']} months faster."
        elif comparison['interest_savings'] > 0:
            recommendation = f"Scenario A saves ${comparison['interest_savings']:.2f} in interest but takes {abs(comparison['time_savings_months'])} months longer."
        elif comparison['time_savings_months'] > 0:
            recommendation = f"Scenario A pays off {comparison['time_savings_months']} months faster but costs ${abs(comparison['interest_savings']):.2f} more in interest."
        else:
            recommendation = "Scenario B is more cost-effective overall."
        
        return ScenarioComparison(
            scenario_a=scenario_a,
            scenario_b=scenario_b,
            interest_savings=comparison['interest_savings'],
            time_savings_months=comparison['time_savings_months'],
            monthly_payment_difference=comparison['monthly_payment_difference'],
            recommendation=recommendation
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# Helper functions for what-if scenarios

def _simulate_extra_payment(
    debts: List[SimpleDebt],
    request: WhatIfScenarioRequest,
    start_date: date
) -> PayoffScenario:
    """Simulate scenario with one-time extra payment."""
    if not request.extra_payment_amount or not request.extra_payment_month:
        raise ValueError("extra_payment_amount and extra_payment_month are required")
    
    # First simulate base scenario to get to the extra payment month
    base_scenario = simulate_payoff_scenario(
        debts=debts,
        strategy=request.strategy,
        monthly_payment=request.monthly_payment,
        start_date=start_date
    )
    
    # Apply extra payment by modifying debt balances at specified month
    # This is a simplified approach - in production, you'd want to
    # recalculate from the extra payment month forward
    modified_debts = deepcopy(debts)
    
    if request.extra_payment_debt_id:
        # Apply to specific debt
        target_debt = next((d for d in modified_debts if d.id == request.extra_payment_debt_id), None)
        if target_debt:
            target_debt.balance = max(0, target_debt.balance - request.extra_payment_amount)
    else:
        # Apply to first debt in strategy order
        from ..shared.calculation_utils import order_debts_by_strategy
        ordered = order_debts_by_strategy(modified_debts, request.strategy)
        if ordered:
            ordered[0].balance = max(0, ordered[0].balance - request.extra_payment_amount)
    
    # Simulate with modified debts
    scenario = simulate_payoff_scenario(
        debts=modified_debts,
        strategy=request.strategy,
        monthly_payment=request.monthly_payment,
        start_date=start_date,
        scenario_name=f"Extra Payment: ${request.extra_payment_amount:.2f} in Month {request.extra_payment_month}"
    )
    
    return scenario

def _simulate_consolidation(
    debts: List[SimpleDebt],
    request: WhatIfScenarioRequest,
    start_date: date
) -> PayoffScenario:
    """Simulate debt consolidation scenario."""
    if not request.consolidation_apr or not request.consolidation_debt_ids:
        raise ValueError("consolidation_apr and consolidation_debt_ids are required")
    
    # Separate debts to consolidate and keep separate
    debts_to_consolidate = [d for d in debts if d.id in request.consolidation_debt_ids]
    other_debts = [d for d in debts if d.id not in request.consolidation_debt_ids]
    
    if not debts_to_consolidate:
        raise ValueError("No valid debts found for consolidation")
    
    # Create consolidated debt
    total_balance = sum(d.balance for d in debts_to_consolidate)
    avg_minimum = sum(d.minimum_payment for d in debts_to_consolidate)
    
    consolidated_debt = SimpleDebt(
        id="consolidated",
        profile_id=debts[0].profile_id,
        type=debts_to_consolidate[0].type,
        name="Consolidated Loan",
        balance=total_balance,
        apr=request.consolidation_apr,
        minimum_payment=avg_minimum,
        next_payment_date=start_date,
        is_delinquent=False
    )
    
    # Combine with other debts
    all_debts = other_debts + [consolidated_debt]
    
    scenario = simulate_payoff_scenario(
        debts=all_debts,
        strategy=request.strategy,
        monthly_payment=request.monthly_payment,
        start_date=start_date,
        scenario_name=f"Consolidation at {request.consolidation_apr:.2f}% APR"
    )
    
    return scenario

def _simulate_balance_transfer(
    debts: List[SimpleDebt],
    request: WhatIfScenarioRequest,
    start_date: date
) -> PayoffScenario:
    """Simulate balance transfer scenario."""
    if not request.balance_transfer_debt_id or request.balance_transfer_new_apr is None:
        raise ValueError("balance_transfer_debt_id and balance_transfer_new_apr are required")
    
    modified_debts = deepcopy(debts)
    target_debt = next((d for d in modified_debts if d.id == request.balance_transfer_debt_id), None)
    
    if not target_debt:
        raise ValueError("Debt not found for balance transfer")
    
    # Apply balance transfer fee if specified
    if request.balance_transfer_fee_percent:
        fee = target_debt.balance * (request.balance_transfer_fee_percent / 100)
        target_debt.balance += fee
    
    # Update APR
    target_debt.apr = request.balance_transfer_new_apr
    
    scenario = simulate_payoff_scenario(
        debts=modified_debts,
        strategy=request.strategy,
        monthly_payment=request.monthly_payment,
        start_date=start_date,
        scenario_name=f"Balance Transfer to {request.balance_transfer_new_apr:.2f}% APR"
    )
    
    return scenario

def _simulate_rate_change(
    debts: List[SimpleDebt],
    request: WhatIfScenarioRequest,
    start_date: date
) -> PayoffScenario:
    """Simulate interest rate change scenario."""
    if not request.rate_change_debt_id or request.rate_change_new_apr is None:
        raise ValueError("rate_change_debt_id and rate_change_new_apr are required")
    
    modified_debts = deepcopy(debts)
    target_debt = next((d for d in modified_debts if d.id == request.rate_change_debt_id), None)
    
    if not target_debt:
        raise ValueError("Debt not found for rate change")
    
    old_apr = target_debt.apr
    target_debt.apr = request.rate_change_new_apr
    
    scenario = simulate_payoff_scenario(
        debts=modified_debts,
        strategy=request.strategy,
        monthly_payment=request.monthly_payment,
        start_date=start_date,
        scenario_name=f"Rate Change: {old_apr:.2f}% → {request.rate_change_new_apr:.2f}%"
    )
    
    return scenario

def _optimize_for_target_months(
    debts: List[SimpleDebt],
    strategy: PayoffStrategy,
    target_months: int,
    start_date: date
) -> float:
    """
    Use binary search to find the monthly payment needed to reach target months.
    """
    total_minimums = sum(d.minimum_payment for d in debts)
    total_debt = sum(d.balance for d in debts)
    
    # Set search bounds
    low = total_minimums
    high = total_debt  # Maximum possible payment
    tolerance = 1.0  # $1 tolerance
    max_iterations = 50
    
    for _ in range(max_iterations):
        mid = (low + high) / 2
        
        try:
            scenario = simulate_payoff_scenario(
                debts=debts,
                strategy=strategy,
                monthly_payment=mid,
                start_date=start_date
            )
            
            if abs(scenario.total_months - target_months) <= 1:
                return mid
            elif scenario.total_months > target_months:
                # Need to pay more
                low = mid
            else:
                # Paying too much
                high = mid
                
        except ValueError:
            # Payment too low
            low = mid
        
        if high - low < tolerance:
            break
    
    return (low + high) / 2