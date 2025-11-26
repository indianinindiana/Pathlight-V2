"""
Recommendations API routes for strategy recommendations and confidence scoring.
Implements Sprint S2 requirements for BR-2 and BR-3.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List

from ..shared.database import get_database
from ..shared.simple_debt_models import SimpleDebt
from ..shared.models import Profile
from ..shared.scenario_models import (
    StrategyRecommendationRequest, StrategyRecommendation,
    PayoffStrategy
)
from ..shared.calculation_utils import (
    simulate_payoff_scenario,
    calculate_confidence_score
)
from datetime import date

router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])

@router.post("/strategy", response_model=StrategyRecommendation, status_code=status.HTTP_200_OK)
async def recommend_strategy(request: StrategyRecommendationRequest):
    """
    Recommend the best payoff strategy based on user profile and goals.
    
    Analyzes user's:
    - Primary goal (pay faster, lower payment, reduce interest, avoid default)
    - Stress level
    - Financial context
    - Debt composition
    
    Returns recommendation with confidence score and comparison of strategies.
    Implements BR-2 (Strategy Selection) and BR-3 (Confidence Scoring).
    """
    db = await get_database()
    
    # Fetch profile
    profile_data = await db.profiles.find_one({"user_id": request.profile_id})
    if not profile_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    profile = Profile(**profile_data)
    
    # Fetch all debts
    debts_cursor = db.debts.find({"profile_id": request.profile_id})
    debts_data = await debts_cursor.to_list(length=None)
    
    if not debts_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No debts found for this profile"
        )
    
    debts = [SimpleDebt(**debt) for debt in debts_data]
    start_date = request.start_date or date.today()
    
    try:
        # Simulate both snowball and avalanche strategies
        snowball_scenario = simulate_payoff_scenario(
            debts=debts,
            strategy=PayoffStrategy.SNOWBALL,
            monthly_payment=request.monthly_payment,
            start_date=start_date
        )
        
        avalanche_scenario = simulate_payoff_scenario(
            debts=debts,
            strategy=PayoffStrategy.AVALANCHE,
            monthly_payment=request.monthly_payment,
            start_date=start_date
        )
        
        # Determine recommended strategy based on profile (BR-2)
        recommended_strategy, rationale, factors = _determine_best_strategy(
            profile, debts, snowball_scenario, avalanche_scenario
        )
        
        # Calculate confidence score (BR-3)
        confidence = _calculate_recommendation_confidence(
            profile, debts, snowball_scenario, avalanche_scenario
        )
        
        # Calculate key differences
        interest_diff = snowball_scenario.total_interest - avalanche_scenario.total_interest
        time_diff = snowball_scenario.total_months - avalanche_scenario.total_months
        
        return StrategyRecommendation(
            recommended_strategy=recommended_strategy,
            confidence_score=confidence,
            rationale=rationale,
            snowball_scenario=snowball_scenario,
            avalanche_scenario=avalanche_scenario,
            interest_difference=interest_diff,
            time_difference_months=time_diff,
            factors=factors
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/confidence", status_code=status.HTTP_200_OK)
async def calculate_recommendation_confidence(profile_id: str):
    """
    Calculate confidence score for recommendations based on profile completeness.
    
    Implements BR-3 (Confidence Scoring).
    
    Returns:
        Confidence score (0-100) and factors affecting confidence
    """
    db = await get_database()
    
    # Fetch profile
    profile_data = await db.profiles.find_one({"user_id": profile_id})
    if not profile_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    profile = Profile(**profile_data)
    
    # Fetch debts
    debts_cursor = db.debts.find({"profile_id": profile_id})
    debts_data = await debts_cursor.to_list(length=None)
    debts = [SimpleDebt(**debt) for debt in debts_data]
    
    # Calculate confidence factors
    profile_completeness = profile.profile_completeness
    debt_count = len(debts)
    has_delinquent = any(d.is_delinquent for d in debts)
    
    # Calculate cash flow ratio
    total_minimums = sum(d.minimum_payment for d in debts)
    cash_flow_ratio = 1.0
    if profile.cash_flow and total_minimums > 0:
        cash_flow_ratio = profile.cash_flow / total_minimums
    
    confidence = calculate_confidence_score(
        profile_completeness=profile_completeness,
        debt_count=debt_count,
        has_delinquent=has_delinquent,
        cash_flow_ratio=cash_flow_ratio
    )
    
    # Identify factors affecting confidence
    factors = []
    if profile_completeness < 0.7:
        factors.append("Incomplete profile information")
    if debt_count > 10:
        factors.append("High number of debts increases complexity")
    if has_delinquent:
        factors.append("Delinquent debts present")
    if cash_flow_ratio < 1.2:
        factors.append("Limited cash flow for debt repayment")
    
    if not factors:
        factors.append("Strong profile with complete information")
    
    return {
        "status": "success",
        "data": {
            "confidence_score": confidence,
            "profile_completeness": profile_completeness * 100,
            "factors": factors,
            "debt_count": debt_count,
            "has_delinquent": has_delinquent,
            "cash_flow_ratio": cash_flow_ratio
        }
    }

# Helper functions

def _determine_best_strategy(
    profile: Profile,
    debts: List[SimpleDebt],
    snowball: any,
    avalanche: any
) -> tuple[PayoffStrategy, str, List[str]]:
    """
    Determine the best strategy based on user profile and goals (BR-2).
    
    Returns:
        (recommended_strategy, rationale, factors_considered)
    """
    factors = []
    
    # Analyze primary goal
    goal = profile.primary_goal
    stress = profile.stress_level or 3
    
    # Calculate key metrics
    interest_savings = snowball.total_interest - avalanche.total_interest
    time_difference = snowball.total_months - avalanche.total_months
    
    # Count small debts (balance < $2000)
    small_debts = sum(1 for d in debts if d.balance < 2000)
    total_debts = len(debts)
    
    # Decision logic based on BR-2
    if goal.value == "pay-faster":
        # Prioritize speed - usually avalanche is faster
        if time_difference > 3:  # Avalanche is significantly faster
            factors.append("Avalanche strategy pays off debt faster")
            factors.append(f"Saves {abs(time_difference)} months compared to snowball")
            return PayoffStrategy.AVALANCHE, \
                   f"Avalanche strategy aligns with your goal to pay off debt as quickly as possible, saving you {abs(time_difference)} months.", \
                   factors
        else:
            # Similar time, consider psychological factors
            if stress >= 4 and small_debts >= 2:
                factors.append("High stress level benefits from quick wins")
                factors.append(f"{small_debts} small debts can be eliminated quickly")
                return PayoffStrategy.SNOWBALL, \
                       "Snowball strategy provides psychological wins by eliminating debts quickly, which is important given your high stress level.", \
                       factors
            else:
                factors.append("Minimal time difference between strategies")
                factors.append(f"Avalanche saves ${abs(interest_savings):.2f} in interest")
                return PayoffStrategy.AVALANCHE, \
                       f"Avalanche strategy saves ${abs(interest_savings):.2f} in interest with similar payoff time.", \
                       factors
    
    elif goal.value == "reduce-interest":
        # Prioritize interest savings - always avalanche
        factors.append("Avalanche strategy minimizes total interest paid")
        factors.append(f"Saves ${abs(interest_savings):.2f} compared to snowball")
        return PayoffStrategy.AVALANCHE, \
               f"Avalanche strategy directly addresses your goal by saving ${abs(interest_savings):.2f} in interest charges.", \
               factors
    
    elif goal.value == "lower-payment":
        # User wants lower stress, psychological wins matter
        if small_debts >= 2:
            factors.append("Multiple small debts can be eliminated quickly")
            factors.append("Quick wins reduce monthly obligations faster")
            return PayoffStrategy.SNOWBALL, \
                   f"Snowball strategy eliminates {small_debts} small debts quickly, reducing your monthly payment obligations sooner.", \
                   factors
        else:
            factors.append("Few small debts to eliminate")
            factors.append(f"Avalanche saves ${abs(interest_savings):.2f} in interest")
            return PayoffStrategy.AVALANCHE, \
                   "Avalanche strategy is more cost-effective when there aren't many small debts to eliminate.", \
                   factors
    
    elif goal.value == "avoid-default":
        # High stress situation - need psychological wins
        factors.append("High-stress situation benefits from momentum")
        factors.append("Quick wins build confidence and motivation")
        if small_debts >= 1:
            return PayoffStrategy.SNOWBALL, \
                   "Snowball strategy provides quick wins and builds momentum, which is crucial when avoiding default.", \
                   factors
        else:
            return PayoffStrategy.AVALANCHE, \
                   "Focus on highest-rate debts to minimize total cost while building a sustainable payment plan.", \
                   factors
    
    # Default to avalanche if no clear winner
    factors.append("Avalanche strategy is mathematically optimal")
    return PayoffStrategy.AVALANCHE, \
           "Avalanche strategy minimizes total interest and is mathematically optimal for most situations.", \
           factors

def _calculate_recommendation_confidence(
    profile: Profile,
    debts: List[SimpleDebt],
    snowball: any,
    avalanche: any
) -> float:
    """
    Calculate confidence score for the recommendation (BR-3).
    
    Factors:
    - Profile completeness
    - Number of debts
    - Presence of delinquent debts
    - Cash flow adequacy
    - Difference between strategies
    """
    # Base confidence from profile
    total_minimums = sum(d.minimum_payment for d in debts)
    cash_flow_ratio = 1.0
    if profile.cash_flow and total_minimums > 0:
        cash_flow_ratio = profile.cash_flow / total_minimums
    
    confidence = calculate_confidence_score(
        profile_completeness=profile.profile_completeness,
        debt_count=len(debts),
        has_delinquent=any(d.is_delinquent for d in debts),
        cash_flow_ratio=cash_flow_ratio
    )
    
    # Adjust based on strategy difference
    interest_diff = abs(snowball.total_interest - avalanche.total_interest)
    time_diff = abs(snowball.total_months - avalanche.total_months)
    
    # If strategies are very similar, reduce confidence slightly
    if interest_diff < 100 and time_diff < 3:
        confidence *= 0.95  # Strategies are nearly identical
    
    # If one strategy is clearly better, increase confidence
    if interest_diff > 1000 or time_diff > 12:
        confidence *= 1.05  # Clear winner
    
    return min(100, max(0, confidence))