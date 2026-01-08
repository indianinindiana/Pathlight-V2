/**
 * Financial Assessment Types
 * TypeScript definitions for the Financial Health Assessment module
 */

// ============================================================================
// Enums
// ============================================================================

export enum RiskBand {
  EXCELLENT = 'excellent',
  LOW_MODERATE = 'low_moderate',
  MODERATE = 'moderate',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum DriverType {
  DELINQUENCY = 'delinquency',
  HIGH_RATE = 'high_rate',
  COMPLEXITY = 'complexity',
}

export enum RecommendationCategory {
  CASH_FLOW = 'cash_flow',
  STRESS_REDUCTION = 'stress_reduction',
  DELINQUENCY = 'delinquency',
  INTEREST_COST = 'interest_cost',
  COMPLEXITY = 'complexity',
}

export enum Goal {
  REDUCE_STRESS = 'reduce_stress',
  LOWER_PAYMENTS = 'lower_payments',
  BECOME_DEBT_FREE = 'become_debt_free',
  BUILD_SAVINGS = 'build_savings',
  IMPROVE_CREDIT = 'improve_credit',
}

export enum StressLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum EmploymentStatus {
  STABLE = 'stable',
  VARIABLE = 'variable',
  TRANSITIONING = 'transitioning',
  UNEMPLOYED = 'unemployed',
}

export enum LifeEvent {
  NONE = 'none',
  BABY = 'baby',
  MOVE = 'move',
  JOB_CHANGE = 'job_change',
  MARRIAGE = 'marriage',
  DIVORCE = 'divorce',
  MEDICAL = 'medical',
  EDUCATION = 'education',
}

export enum AgeRange {
  UNDER_25 = 'under_25',
  AGE_25_34 = '25_34',
  AGE_35_44 = '35_44',
  AGE_45_54 = '45_54',
  AGE_55_64 = '55_64',
  AGE_65_PLUS = '65_plus',
}

// ============================================================================
// Input Types
// ============================================================================

export interface DebtInput {
  balance: number;
  apr: number;
  is_delinquent: boolean;
}

export interface FinancialMetrics {
  monthly_income: number;
  monthly_expenses: number;
  liquid_savings: number;
  total_minimum_payments: number;
}

export interface UserContext {
  goal: Goal;
  stress_level: StressLevel;
  employment_status: EmploymentStatus;
  life_events: LifeEvent;
  age_range: AgeRange;
}

// ============================================================================
// Output Types
// ============================================================================

export interface RiskDrivers {
  delinquency_factor: number;
  high_rate_factor: number;
  complexity_factor: number;
}

export interface DeterministicRiskOutput {
  risk_score: number;
  risk_band: RiskBand;
  debt_count: number;
  primary_driver: DriverType;
  drivers: RiskDrivers;
  driver_severity: DriverType[];
  dti_ratio?: number;
  net_cash_flow?: number;
  emergency_savings_ratio?: number;
}

export interface FinancialInterpretation {
  summary: string;
  key_drivers: string[];
  interpretation_points: string[];
}

export interface RecommendationItem {
  text: string;
  category: RecommendationCategory;
  priority: number;
  action_id: string | null;
}

export interface PersonalizedUXCopy {
  user_friendly_summary: string;
  what_this_means: string[];
  personalized_recommendations: RecommendationItem[];
  closing_message: string;
}

export interface FinancialAssessmentResult {
  assessment_version: string;
  generated_at: string;
  deterministic_output: DeterministicRiskOutput;
  financial_interpretation: FinancialInterpretation;
  personalized_ux: PersonalizedUXCopy;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface FinancialAssessmentRequest {
  profile_id: string;
  debts: DebtInput[];
  user_context: UserContext;
  financial_metrics: FinancialMetrics;
}

export interface FinancialAssessmentError {
  detail: string;
  error_code?: string;
  fallback_available?: boolean;
}

// ============================================================================
// UI Helper Types
// ============================================================================

export interface RiskBandConfig {
  label: string;
  color: string;
  description: string;
  icon: string;
}

export const RISK_BAND_CONFIGS: Record<RiskBand, RiskBandConfig> = {
  [RiskBand.EXCELLENT]: {
    label: 'Excellent',
    color: 'green',
    description: 'Very low risk',
    icon: '✓',
  },
  [RiskBand.LOW_MODERATE]: {
    label: 'Low-Moderate',
    color: 'blue',
    description: 'Minor risk factors',
    icon: 'ℹ',
  },
  [RiskBand.MODERATE]: {
    label: 'Moderate',
    color: 'yellow',
    description: 'Multiple emerging risks',
    icon: '⚠',
  },
  [RiskBand.HIGH]: {
    label: 'High',
    color: 'orange',
    description: 'High-cost or hard-to-manage debt',
    icon: '⚠',
  },
  [RiskBand.CRITICAL]: {
    label: 'Critical',
    color: 'red',
    description: 'Severe risk; likely financial strain',
    icon: '⚠',
  },
};

export interface DriverConfig {
  label: string;
  icon: string;
  description: string;
}

export const DRIVER_CONFIGS: Record<DriverType, DriverConfig> = {
  [DriverType.DELINQUENCY]: {
    label: 'Missed Payment Risk',
    icon: '⏰',
    description: 'Missed or late payments increasing fees and credit damage',
  },
  [DriverType.HIGH_RATE]: {
    label: 'High Interest Costs',
    icon: '💰',
    description: 'High interest rates (≥15% APR) increasing total cost',
  },
  [DriverType.COMPLEXITY]: {
    label: 'Number of Debt Accounts',
    icon: '📊',
    description: 'Multiple accounts making debt harder to manage',
  },
};