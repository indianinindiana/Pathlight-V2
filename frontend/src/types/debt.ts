export type DebtType = 'credit-card' | 'personal-loan' | 'student-loan' | 'auto-loan';

export type PayoffGoal = 'lower-payment' | 'pay-faster' | 'reduce-interest' | 'avoid-default';

export type PayoffStrategy = 'snowball' | 'avalanche' | 'custom';

export type CreditScoreRange = '300-579' | '580-669' | '670-739' | '740-799' | '800-850';

export type AgeRange = '18-24' | '25-34' | '35-44' | '45-59' | '60+';

export type EmploymentStatus = 'full-time' | 'part-time' | 'self-employed' | 'unemployed' | 'retired' | 'student';

export type PayoffPriority = 'aggressive-freedom' | 'minimize-interest' | 'balance-savings' | 'cash-flow-relief';

export type StressLevel = 1 | 2 | 3 | 4 | 5;

export interface Debt {
  id: string;
  type: DebtType;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
  nextPaymentDate: Date;
  customOrder?: number;
  isDelinquent?: boolean;
}

export interface FinancialContext {
  ageRange: AgeRange;
  employmentStatus: EmploymentStatus;
  zipCode?: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  liquidSavings: number;
  creditScoreRange: CreditScoreRange;
  primaryGoal: PayoffGoal;
  payoffPriority: PayoffPriority;
  stressLevel: StressLevel;
}

export interface PayoffScenario {
  id: string;
  name: string;
  strategy: PayoffStrategy;
  monthlyPayment: number;
  totalMonths: number;
  totalInterest: number;
  payoffDate: Date;
  schedule: PayoffScheduleItem[];
}

export interface PayoffScheduleItem {
  month: number;
  date: Date;
  debtId: string;
  debtName: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface WhatIfScenario {
  id: string;
  type: 'extra-payment' | 'consolidation' | 'settlement' | 'balance-transfer';
  name: string;
  baseScenarioId: string;
  parameters: Record<string, any>;
  result: PayoffScenario;
}

export interface ProductRecommendation {
  id: string;
  type: 'consolidation' | 'settlement' | 'balance-transfer';
  name: string;
  newAPR: number;
  monthlyPaymentChange: number;
  interestSavings: number;
  payoffTimeChange: number;
  fitScore: 'low' | 'medium' | 'high';
  eligibilityCriteria: string[];
  tradeoffs: string[];
}

export interface AIGuidance {
  id: string;
  trigger: 'debt-entry-complete' | 'inconsistent-data' | 'recommendation-view' | 'scenario-view' | 'user-request';
  context: string;
  message: string;
  helpful?: boolean;
}