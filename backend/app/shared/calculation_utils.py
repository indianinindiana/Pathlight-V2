"""
Calculation utilities for debt payoff scenarios.
Implements business rules BR-1, BR-2, BR-6 from the PRD.
"""
from typing import List, Tuple, Dict
from datetime import date, timedelta
from .simple_debt_models import SimpleDebt
from .scenario_models import (
    PayoffStrategy, PayoffScheduleItem, DebtPayoffSummary,
    PayoffScenario, ScenarioType
)
import uuid
from copy import deepcopy

def calculate_monthly_interest(balance: float, apr: float) -> float:
    """
    Calculate monthly interest charge (BR-6).
    Formula: (Balance × APR ÷ 100) ÷ 12
    """
    return (balance * apr / 100) / 12

def order_debts_by_strategy(
    debts: List[SimpleDebt],
    strategy: PayoffStrategy,
    custom_order: List[str] = None
) -> List[SimpleDebt]:
    """
    Order debts according to the specified strategy (BR-2).
    
    Args:
        debts: List of debts to order
        strategy: Payoff strategy (snowball, avalanche, custom)
        custom_order: List of debt IDs in custom order (for custom strategy)
    
    Returns:
        Ordered list of debts
    """
    if strategy == PayoffStrategy.SNOWBALL:
        # Smallest balance first
        return sorted(debts, key=lambda d: d.balance)
    
    elif strategy == PayoffStrategy.AVALANCHE:
        # Highest APR first
        return sorted(debts, key=lambda d: d.apr, reverse=True)
    
    elif strategy == PayoffStrategy.CUSTOM:
        if not custom_order:
            # Fallback to snowball if no custom order provided
            return sorted(debts, key=lambda d: d.balance)
        
        # Create a mapping of debt_id to debt
        debt_map = {d.id: d for d in debts}
        ordered = []
        
        # Add debts in custom order
        for debt_id in custom_order:
            if debt_id in debt_map:
                ordered.append(debt_map[debt_id])
        
        # Add any remaining debts not in custom order
        remaining = [d for d in debts if d.id not in custom_order]
        ordered.extend(sorted(remaining, key=lambda d: d.balance))
        
        return ordered
    
    return debts

def simulate_payoff_scenario(
    debts: List[SimpleDebt],
    strategy: PayoffStrategy,
    monthly_payment: float,
    start_date: date,
    custom_order: List[str] = None,
    scenario_name: str = None
) -> PayoffScenario:
    """
    Simulate a complete debt payoff scenario.
    
    Args:
        debts: List of debts to pay off
        strategy: Payoff strategy to use
        monthly_payment: Total monthly payment amount
        start_date: Start date of the payoff plan
        custom_order: Custom debt order (for custom strategy)
        scenario_name: Optional custom name for the scenario
    
    Returns:
        Complete PayoffScenario with schedule and metrics
    """
    if not debts:
        raise ValueError("No debts provided for simulation")
    
    # Validate monthly payment covers all minimums
    total_minimums = sum(d.minimum_payment for d in debts)
    if monthly_payment < total_minimums:
        raise ValueError(
            f"Monthly payment (${monthly_payment:.2f}) must be at least "
            f"${total_minimums:.2f} to cover all minimum payments"
        )
    
    # Order debts according to strategy
    ordered_debts = order_debts_by_strategy(debts, strategy, custom_order)
    
    # Create working copies with remaining balance tracking
    working_debts = [
        {
            'debt': deepcopy(debt),
            'remaining_balance': debt.balance,
            'total_paid': 0.0,
            'total_interest': 0.0,
            'months_to_payoff': 0,
            'paid_off': False
        }
        for debt in ordered_debts
    ]
    
    schedule: List[PayoffScheduleItem] = []
    current_month = 0
    current_date = start_date
    total_interest = 0.0
    total_paid = 0.0
    
    # Safety limit to prevent infinite loops
    MAX_MONTHS = 600  # 50 years
    
    # Continue until all debts are paid off
    while any(not wd['paid_off'] for wd in working_debts) and current_month < MAX_MONTHS:
        current_month += 1
        current_date = start_date + timedelta(days=30 * current_month)
        
        remaining_payment = monthly_payment
        
        # Phase 1: Pay minimum payments on all active debts
        for wd in working_debts:
            if wd['paid_off']:
                continue
            
            debt = wd['debt']
            balance = wd['remaining_balance']
            
            # Calculate interest for this month
            monthly_interest = calculate_monthly_interest(balance, debt.apr)
            
            # Determine payment amount (minimum or remaining balance + interest)
            payment_amount = min(
                debt.minimum_payment,
                balance + monthly_interest
            )
            
            # Split into interest and principal
            interest_portion = min(monthly_interest, payment_amount)
            principal_portion = payment_amount - interest_portion
            
            # Update balances
            wd['remaining_balance'] -= principal_portion
            wd['total_paid'] += payment_amount
            wd['total_interest'] += interest_portion
            total_interest += interest_portion
            total_paid += payment_amount
            remaining_payment -= payment_amount
            
            # Check if paid off
            if wd['remaining_balance'] <= 0.01:  # Account for floating point
                wd['remaining_balance'] = 0
                wd['paid_off'] = True
                wd['months_to_payoff'] = current_month
            
            # Add to schedule
            schedule.append(PayoffScheduleItem(
                month=current_month,
                payment_date=current_date,
                debt_id=debt.id,
                debt_name=debt.name,
                payment=payment_amount,
                principal=principal_portion,
                interest=interest_portion,
                remaining_balance=max(0, wd['remaining_balance'])
            ))
        
        # Phase 2: Apply extra payment to first unpaid debt (strategy order)
        if remaining_payment > 0.01:
            target_wd = next((wd for wd in working_debts if not wd['paid_off']), None)
            
            if target_wd:
                debt = target_wd['debt']
                extra_payment = min(remaining_payment, target_wd['remaining_balance'])
                
                # Extra payment goes entirely to principal
                target_wd['remaining_balance'] -= extra_payment
                target_wd['total_paid'] += extra_payment
                total_paid += extra_payment
                
                # Check if paid off
                if target_wd['remaining_balance'] <= 0.01:
                    target_wd['remaining_balance'] = 0
                    target_wd['paid_off'] = True
                    target_wd['months_to_payoff'] = current_month
                
                # Update the last schedule entry for this debt
                for item in reversed(schedule):
                    if item.debt_id == debt.id and item.month == current_month:
                        item.payment += extra_payment
                        item.principal += extra_payment
                        item.remaining_balance = max(0, target_wd['remaining_balance'])
                        break
    
    # Create debt summaries
    debt_summaries = [
        DebtPayoffSummary(
            debt_id=wd['debt'].id,
            debt_name=wd['debt'].name,
            original_balance=wd['debt'].balance,
            total_paid=wd['total_paid'],
            total_interest=wd['total_interest'],
            months_to_payoff=wd['months_to_payoff'],
            payoff_date=start_date + timedelta(days=30 * wd['months_to_payoff'])
        )
        for wd in working_debts
    ]
    
    # Generate scenario name if not provided
    if not scenario_name:
        strategy_names = {
            PayoffStrategy.SNOWBALL: "Snowball Strategy",
            PayoffStrategy.AVALANCHE: "Avalanche Strategy",
            PayoffStrategy.CUSTOM: "Custom Strategy"
        }
        scenario_name = strategy_names.get(strategy, "Payoff Scenario")
    
    payoff_date = start_date + timedelta(days=30 * current_month)
    
    return PayoffScenario(
        scenario_id=str(uuid.uuid4()),
        name=scenario_name,
        strategy=strategy,
        scenario_type=ScenarioType.BASE,
        monthly_payment=monthly_payment,
        start_date=start_date,
        total_months=current_month,
        payoff_date=payoff_date,
        total_interest=total_interest,
        total_paid=total_paid,
        schedule=schedule,
        debt_summaries=debt_summaries
    )

def calculate_minimum_payment_scenario(
    debts: List[SimpleDebt],
    start_date: date
) -> PayoffScenario:
    """
    Calculate scenario paying only minimum payments.
    Used as a baseline for comparisons.
    """
    total_minimums = sum(d.minimum_payment for d in debts)
    
    # Use avalanche strategy for minimum payment scenario
    return simulate_payoff_scenario(
        debts=debts,
        strategy=PayoffStrategy.AVALANCHE,
        monthly_payment=total_minimums,
        start_date=start_date,
        scenario_name="Minimum Payments Only"
    )

def compare_scenarios(
    scenario_a: PayoffScenario,
    scenario_b: PayoffScenario
) -> Dict[str, any]:
    """
    Compare two scenarios and return key differences.
    
    Returns:
        Dictionary with comparison metrics
    """
    return {
        'interest_savings': scenario_b.total_interest - scenario_a.total_interest,
        'time_savings_months': scenario_b.total_months - scenario_a.total_months,
        'monthly_payment_difference': scenario_a.monthly_payment - scenario_b.monthly_payment,
        'total_savings': (scenario_b.total_paid - scenario_a.total_paid)
    }

def calculate_confidence_score(
    profile_completeness: float,
    debt_count: int,
    has_delinquent: bool,
    cash_flow_ratio: float
) -> float:
    """
    Calculate confidence score for recommendations (BR-3).
    
    Args:
        profile_completeness: Profile completeness score (0-1)
        debt_count: Number of debts
        has_delinquent: Whether any debts are delinquent
        cash_flow_ratio: Ratio of available cash flow to total minimums
    
    Returns:
        Confidence score (0-100)
    """
    score = 100.0
    
    # Reduce score based on profile completeness
    score *= profile_completeness
    
    # Reduce score if too many debts (complexity)
    if debt_count > 10:
        score *= 0.8
    elif debt_count > 5:
        score *= 0.9
    
    # Reduce score if delinquent debts exist
    if has_delinquent:
        score *= 0.7
    
    # Reduce score if cash flow is tight
    if cash_flow_ratio < 1.1:
        score *= 0.8
    elif cash_flow_ratio < 1.2:
        score *= 0.9
    
    return max(0, min(100, score))