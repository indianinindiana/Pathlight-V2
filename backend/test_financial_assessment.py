"""
Test script for Financial Assessment Module

This script demonstrates all three layers of the financial assessment:
1. Deterministic calculation
2. Financial interpretation
3. AI-generated UX copy (with fallback)
"""

import asyncio
from app.shared.financial_assessment import (
    DebtInput,
    UserContext,
    DeterministicCalculator,
    FinancialInterpreter,
    UXCopyGenerator,
    assess_financial_health,
    RiskBand,
    DriverType,
    Goal,
    StressLevel,
    EmploymentStatus,
    LifeEvent,
    AgeRange
)


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80 + "\n")


def test_scenario_1_excellent():
    """Test Scenario 1: Excellent Risk Profile"""
    print_section("SCENARIO 1: Excellent Risk Profile")
    
    debts = [
        DebtInput(balance=5000, apr=6.5, is_delinquent=False),
        DebtInput(balance=3000, apr=4.2, is_delinquent=False)
    ]
    
    print("Input Debts:")
    for i, debt in enumerate(debts, 1):
        print(f"  Debt {i}: ${debt.balance:,.2f} @ {debt.apr}% APR, Delinquent: {debt.is_delinquent}")
    
    # Layer 1: Deterministic Calculation
    risk_output = DeterministicCalculator.calculate(debts)
    
    print("\n--- Layer 1: Deterministic Calculation ---")
    print(f"Risk Score: {risk_output.risk_score:.2f}/100")
    print(f"Risk Band: {risk_output.risk_band.value}")
    print(f"Debt Count: {risk_output.debt_count}")
    print(f"Primary Driver: {risk_output.primary_driver.value}")
    print(f"\nDrivers:")
    print(f"  Delinquency Factor: {risk_output.drivers.delinquency_factor:.2f} (contributes {risk_output.drivers.delinquency_factor * 50:.1f} points)")
    print(f"  High Rate Factor: {risk_output.drivers.high_rate_factor:.2f} (contributes {risk_output.drivers.high_rate_factor * 30:.1f} points)")
    print(f"  Complexity Factor: {risk_output.drivers.complexity_factor:.2f} (contributes {risk_output.drivers.complexity_factor * 20:.1f} points)")
    print(f"\nDriver Severity (by weighted impact): {[d.value for d in risk_output.driver_severity]}")
    
    # Layer 2: Financial Interpretation
    interpretation = FinancialInterpreter.interpret(risk_output, debts)
    
    print("\n--- Layer 2: Financial Interpretation ---")
    print(f"Summary: {interpretation.summary}")
    print(f"\nKey Drivers:")
    for driver in interpretation.key_drivers:
        print(f"  • {driver}")
    print(f"\nInterpretation Points:")
    for point in interpretation.interpretation_points:
        print(f"  • {point}")


def test_scenario_2_high_risk():
    """Test Scenario 2: High Risk Profile"""
    print_section("SCENARIO 2: High Risk Profile")
    
    debts = [
        DebtInput(balance=8000, apr=24.99, is_delinquent=True),
        DebtInput(balance=5000, apr=22.5, is_delinquent=False),
        DebtInput(balance=3000, apr=19.9, is_delinquent=False),
        DebtInput(balance=2000, apr=15.0, is_delinquent=False),
        DebtInput(balance=1500, apr=12.5, is_delinquent=False)
    ]
    
    print("Input Debts:")
    for i, debt in enumerate(debts, 1):
        status = "DELINQUENT" if debt.is_delinquent else "Current"
        print(f"  Debt {i}: ${debt.balance:,.2f} @ {debt.apr}% APR [{status}]")
    
    # Layer 1: Deterministic Calculation
    risk_output = DeterministicCalculator.calculate(debts)
    
    print("\n--- Layer 1: Deterministic Calculation ---")
    print(f"Risk Score: {risk_output.risk_score:.2f}/100")
    print(f"Risk Band: {risk_output.risk_band.value}")
    print(f"Debt Count: {risk_output.debt_count}")
    print(f"Primary Driver: {risk_output.primary_driver.value}")
    print(f"\nDrivers:")
    print(f"  Delinquency Factor: {risk_output.drivers.delinquency_factor:.2f} (contributes {risk_output.drivers.delinquency_factor * 50:.1f} points)")
    print(f"  High Rate Factor: {risk_output.drivers.high_rate_factor:.2f} (contributes {risk_output.drivers.high_rate_factor * 30:.1f} points)")
    print(f"  Complexity Factor: {risk_output.drivers.complexity_factor:.2f} (contributes {risk_output.drivers.complexity_factor * 20:.1f} points)")
    print(f"\nDriver Severity (by weighted impact): {[d.value for d in risk_output.driver_severity]}")
    
    # Layer 2: Financial Interpretation
    interpretation = FinancialInterpreter.interpret(risk_output, debts)
    
    print("\n--- Layer 2: Financial Interpretation ---")
    print(f"Summary: {interpretation.summary}")
    print(f"\nKey Drivers:")
    for driver in interpretation.key_drivers:
        print(f"  • {driver}")
    print(f"\nInterpretation Points:")
    for point in interpretation.interpretation_points:
        print(f"  • {point}")


def test_scenario_3_moderate_complexity():
    """Test Scenario 3: Moderate Risk - Complexity Driven"""
    print_section("SCENARIO 3: Moderate Risk - Complexity Driven")
    
    # 9 debts with moderate rates
    debts = [
        DebtInput(balance=2000, apr=15.0, is_delinquent=False),
        DebtInput(balance=1800, apr=14.5, is_delinquent=False),
        DebtInput(balance=1600, apr=16.0, is_delinquent=False),
        DebtInput(balance=1400, apr=13.5, is_delinquent=False),
        DebtInput(balance=1200, apr=15.5, is_delinquent=False),
        DebtInput(balance=1000, apr=14.0, is_delinquent=False),
        DebtInput(balance=800, apr=16.5, is_delinquent=False),
        DebtInput(balance=600, apr=15.0, is_delinquent=False),
        DebtInput(balance=400, apr=14.5, is_delinquent=False)
    ]
    
    print(f"Input: {len(debts)} debts with moderate interest rates")
    total_balance = sum(d.balance for d in debts)
    avg_apr = sum(d.apr for d in debts) / len(debts)
    print(f"Total Balance: ${total_balance:,.2f}")
    print(f"Average APR: {avg_apr:.2f}%")
    
    # Layer 1: Deterministic Calculation
    risk_output = DeterministicCalculator.calculate(debts)
    
    print("\n--- Layer 1: Deterministic Calculation ---")
    print(f"Risk Score: {risk_output.risk_score:.2f}/100")
    print(f"Risk Band: {risk_output.risk_band.value}")
    print(f"Debt Count: {risk_output.debt_count}")
    print(f"Primary Driver: {risk_output.primary_driver.value}")
    print(f"\nDrivers:")
    print(f"  Delinquency Factor: {risk_output.drivers.delinquency_factor:.2f} (contributes {risk_output.drivers.delinquency_factor * 50:.1f} points)")
    print(f"  High Rate Factor: {risk_output.drivers.high_rate_factor:.2f} (contributes {risk_output.drivers.high_rate_factor * 30:.1f} points)")
    print(f"  Complexity Factor: {risk_output.drivers.complexity_factor:.2f} (contributes {risk_output.drivers.complexity_factor * 20:.1f} points)")
    print(f"\nDriver Severity (by weighted impact): {[d.value for d in risk_output.driver_severity]}")
    
    # Layer 2: Financial Interpretation
    interpretation = FinancialInterpreter.interpret(risk_output, debts)
    
    print("\n--- Layer 2: Financial Interpretation ---")
    print(f"Summary: {interpretation.summary}")
    print(f"\nKey Drivers:")
    for driver in interpretation.key_drivers:
        print(f"  • {driver}")
    print(f"\nInterpretation Points:")
    for point in interpretation.interpretation_points:
        print(f"  • {point}")


async def test_full_assessment():
    """Test complete assessment with all three layers"""
    print_section("COMPLETE ASSESSMENT: All Three Layers")
    
    debts = [
        DebtInput(balance=10000, apr=24.99, is_delinquent=False),
        DebtInput(balance=5000, apr=21.5, is_delinquent=False),
        DebtInput(balance=3000, apr=8.5, is_delinquent=False)
    ]
    
    user_context = UserContext(
        goal=Goal.REDUCE_STRESS,
        stress_level=StressLevel.HIGH,
        employment_status=EmploymentStatus.STABLE,
        life_events=LifeEvent.BABY,
        age_range=AgeRange.AGE_35_44
    )
    
    print("Input Debts:")
    for i, debt in enumerate(debts, 1):
        print(f"  Debt {i}: ${debt.balance:,.2f} @ {debt.apr}% APR")
    
    print("\nUser Context:")
    print(f"  Goal: {user_context.goal}")
    print(f"  Stress Level: {user_context.stress_level}")
    print(f"  Employment: {user_context.employment_status}")
    print(f"  Life Events: {user_context.life_events}")
    print(f"  Age Range: {user_context.age_range}")
    
    # Run complete assessment (without AI service, will use fallback)
    result = await assess_financial_health(debts, user_context, ai_service=None)
    
    print("\n--- Layer 1: Deterministic Output ---")
    print(f"Risk Score: {result.deterministic_output.risk_score:.2f}/100")
    print(f"Risk Band: {result.deterministic_output.risk_band.value}")
    print(f"Primary Driver: {result.deterministic_output.primary_driver.value}")
    
    print("\n--- Layer 2: Financial Interpretation ---")
    print(f"Summary: {result.financial_interpretation.summary}")
    
    print("\n--- Layer 3: Personalized UX Copy (Fallback) ---")
    print(f"\nUser-Friendly Summary:")
    print(f"  {result.personalized_ux.user_friendly_summary}")
    print(f"\nPersonalized Recommendations:")
    for i, rec in enumerate(result.personalized_ux.personalized_recommendations, 1):
        print(f"  {i}. {rec}")
    print(f"\nClosing Message:")
    print(f"  {result.personalized_ux.closing_message}")


def test_edge_cases():
    """Test edge cases and boundary conditions"""
    print_section("EDGE CASES & BOUNDARY CONDITIONS")
    
    # Test 1: Single debt
    print("Test 1: Single Debt (Minimum Complexity)")
    debts = [DebtInput(balance=5000, apr=15.0, is_delinquent=False)]
    risk_output = DeterministicCalculator.calculate(debts)
    print(f"  Risk Score: {risk_output.risk_score:.2f}/100")
    print(f"  Complexity Factor: {risk_output.drivers.complexity_factor:.2f}")
    print(f"  Primary Driver: {risk_output.primary_driver.value}")
    
    # Test 2: Exactly 3 debts (complexity baseline)
    print("\nTest 2: Exactly 3 Debts (Complexity Baseline)")
    debts = [
        DebtInput(balance=5000, apr=15.0, is_delinquent=False),
        DebtInput(balance=3000, apr=12.0, is_delinquent=False),
        DebtInput(balance=2000, apr=10.0, is_delinquent=False)
    ]
    risk_output = DeterministicCalculator.calculate(debts)
    print(f"  Risk Score: {risk_output.risk_score:.2f}/100")
    print(f"  Complexity Factor: {risk_output.drivers.complexity_factor:.2f}")
    
    # Test 3: 10+ debts (maximum complexity)
    print("\nTest 3: 10+ Debts (Maximum Complexity)")
    debts = [DebtInput(balance=1000, apr=15.0, is_delinquent=False) for _ in range(12)]
    risk_output = DeterministicCalculator.calculate(debts)
    print(f"  Risk Score: {risk_output.risk_score:.2f}/100")
    print(f"  Complexity Factor: {risk_output.drivers.complexity_factor:.2f}")
    print(f"  Debt Count: {risk_output.debt_count}")
    
    # Test 4: All delinquent
    print("\nTest 4: All Debts Delinquent")
    debts = [
        DebtInput(balance=5000, apr=15.0, is_delinquent=True),
        DebtInput(balance=3000, apr=12.0, is_delinquent=True)
    ]
    risk_output = DeterministicCalculator.calculate(debts)
    print(f"  Risk Score: {risk_output.risk_score:.2f}/100")
    print(f"  Delinquency Factor: {risk_output.drivers.delinquency_factor:.2f}")
    print(f"  Risk Band: {risk_output.risk_band.value}")
    
    # Test 5: All high-rate debt
    print("\nTest 5: All High-Rate Debt (≥20% APR)")
    debts = [
        DebtInput(balance=5000, apr=24.99, is_delinquent=False),
        DebtInput(balance=3000, apr=22.5, is_delinquent=False)
    ]
    risk_output = DeterministicCalculator.calculate(debts)
    print(f"  Risk Score: {risk_output.risk_score:.2f}/100")
    print(f"  High Rate Factor: {risk_output.drivers.high_rate_factor:.2f}")
    print(f"  Primary Driver: {risk_output.primary_driver.value}")
    
    # Test 6: Boundary at 20% APR
    print("\nTest 6: Boundary Test (19.9% vs 20.0% APR)")
    debts_below = [DebtInput(balance=5000, apr=19.9, is_delinquent=False)]
    debts_at = [DebtInput(balance=5000, apr=20.0, is_delinquent=False)]
    risk_below = DeterministicCalculator.calculate(debts_below)
    risk_at = DeterministicCalculator.calculate(debts_at)
    print(f"  19.9% APR - High Rate Factor: {risk_below.drivers.high_rate_factor:.2f}")
    print(f"  20.0% APR - High Rate Factor: {risk_at.drivers.high_rate_factor:.2f}")


def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("  FINANCIAL ASSESSMENT MODULE - COMPREHENSIVE TEST SUITE")
    print("=" * 80)
    
    # Test individual scenarios
    test_scenario_1_excellent()
    test_scenario_2_high_risk()
    test_scenario_3_moderate_complexity()
    
    # Test edge cases
    test_edge_cases()
    
    # Test complete assessment with all layers
    print("\n")
    asyncio.run(test_full_assessment())
    
    print("\n" + "=" * 80)
    print("  ALL TESTS COMPLETED")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()