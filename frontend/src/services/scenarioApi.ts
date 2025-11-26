import { PayoffScenario, PayoffStrategy, WhatIfScenario } from '@/types/debt';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface SimulateScenarioRequest {
  profile_id: string;
  strategy: PayoffStrategy;
  monthly_payment: number;
  start_date?: string;
  custom_debt_order?: string[];
}

export interface WhatIfScenarioRequest {
  profile_id: string;
  base_scenario_id?: string;
  what_if_type: 'extra-payment' | 'increased-monthly' | 'debt-consolidation' | 'balance-transfer' | 'rate-change';
  strategy?: PayoffStrategy;
  monthly_payment: number;
  start_date?: string;
  
  // Extra payment parameters
  extra_payment_amount?: number;
  extra_payment_month?: number;
  extra_payment_debt_id?: string;
  
  // Increased payment parameters
  increased_payment_amount?: number;
  
  // Consolidation parameters
  consolidation_apr?: number;
  consolidation_debt_ids?: string[];
  
  // Balance transfer parameters
  balance_transfer_debt_id?: string;
  balance_transfer_new_apr?: number;
  balance_transfer_fee_percent?: number;
  
  // Rate change parameters
  rate_change_debt_id?: string;
  rate_change_new_apr?: number;
}

export interface OptimizePaymentRequest {
  profile_id: string;
  target_months?: number;
  max_monthly_payment?: number;
  strategy?: PayoffStrategy;
}

export interface OptimizePaymentResponse {
  recommended_payment: number;
  scenario: PayoffScenario;
  rationale: string;
  savings_vs_minimum: number;
}

export interface StrategyRecommendationRequest {
  profile_id: string;
  monthly_payment: number;
  start_date?: string;
}

export interface StrategyRecommendation {
  recommended_strategy: PayoffStrategy;
  confidence_score: number;
  rationale: string;
  snowball_scenario: PayoffScenario;
  avalanche_scenario: PayoffScenario;
  interest_difference: number;
  time_difference_months: number;
  factors: string[];
}

export interface ScenarioComparison {
  scenario_a: PayoffScenario;
  scenario_b: PayoffScenario;
  interest_savings: number;
  time_savings_months: number;
  monthly_payment_difference: number;
  recommendation: string;
}

/**
 * Simulate a debt payoff scenario
 */
export async function simulateScenario(request: SimulateScenarioRequest): Promise<PayoffScenario> {
  const response = await fetch(`${API_BASE_URL}/api/v1/scenarios/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to simulate scenario');
  }

  return response.json();
}

/**
 * Perform what-if analysis
 */
export async function whatIfAnalysis(request: WhatIfScenarioRequest): Promise<PayoffScenario> {
  const response = await fetch(`${API_BASE_URL}/api/v1/scenarios/what-if`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to perform what-if analysis');
  }

  return response.json();
}

/**
 * Optimize monthly payment amount
 */
export async function optimizePayment(request: OptimizePaymentRequest): Promise<OptimizePaymentResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/scenarios/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to optimize payment');
  }

  return response.json();
}

/**
 * Get strategy recommendation
 */
export async function getStrategyRecommendation(
  request: StrategyRecommendationRequest
): Promise<StrategyRecommendation> {
  const response = await fetch(`${API_BASE_URL}/api/v1/recommendations/strategy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get strategy recommendation');
  }

  return response.json();
}

/**
 * Calculate confidence score for recommendations
 */
export async function getConfidenceScore(profileId: string): Promise<{
  confidence_score: number;
  profile_completeness: number;
  factors: string[];
  debt_count: number;
  has_delinquent: boolean;
  cash_flow_ratio: number;
}> {
  const response = await fetch(`${API_BASE_URL}/api/v1/recommendations/confidence`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profile_id: profileId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to calculate confidence score');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Compare two scenarios
 */
export async function compareScenarios(
  scenarioARequest: SimulateScenarioRequest,
  scenarioBRequest: SimulateScenarioRequest
): Promise<ScenarioComparison> {
  const response = await fetch(`${API_BASE_URL}/api/v1/scenarios/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      scenario_a_request: scenarioARequest,
      scenario_b_request: scenarioBRequest,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to compare scenarios');
  }

  return response.json();
}

/**
 * Helper function to format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Helper function to format date
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Helper function to calculate months between dates
 */
export function monthsBetween(start: Date, end: Date): number {
  const months = (end.getFullYear() - start.getFullYear()) * 12;
  return months + end.getMonth() - start.getMonth();
}

/**
 * Helper function to get strategy display name
 */
export function getStrategyDisplayName(strategy: PayoffStrategy): string {
  const names: Record<PayoffStrategy, string> = {
    snowball: 'Debt Snowball',
    avalanche: 'Debt Avalanche',
    custom: 'Custom Order',
  };
  return names[strategy] || strategy;
}

/**
 * Helper function to get strategy description
 */
export function getStrategyDescription(strategy: PayoffStrategy): string {
  const descriptions: Record<PayoffStrategy, string> = {
    snowball: 'Pay off smallest balances first for psychological wins and momentum',
    avalanche: 'Pay off highest interest rates first to minimize total interest paid',
    custom: 'Pay off debts in your preferred order',
  };
  return descriptions[strategy] || '';
}