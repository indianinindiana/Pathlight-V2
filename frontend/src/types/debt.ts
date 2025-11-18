export type DebtType = 'credit_card' | 'personal_loan' | 'student_loan' | 'auto_loan';

export type CreditScoreRange = 
  | 'poor' // 300-579
  | 'fair' // 580-669
  | 'good' // 670-739
  | 'very_good' // 740-799
  | 'excellent'; // 800-850

export type RepaymentGoal = 
  | 'lower_payment'
  | 'pay_off_faster'
  | 'reduce_interest'
  | 'avoid_default';

export type PayoffStrategy = 'snowball' | 'avalanche' | 'custom';

export type FitScore = 'low' | 'medium' | 'high';

export interface DebtTradeline {
  id: string;
  type: DebtType;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
  nextPaymentDate: string;
}

export interface FinancialContext {
  name: string;
  zipCode: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  liquidSavings: number;
  creditScoreRange: CreditScoreRange;
  primaryGoal: RepaymentGoal;
  timeHorizon: number; // months
}

export interface PayoffProjection {
  strategy: PayoffStrategy;
  monthlyPayment: number;
  totalMonths: number;
  totalInterestPaid: number;
  payoffDate: string;
  monthlyBreakdown: MonthlyPayment[];
}

export interface MonthlyPayment {
  month: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  debtAllocations: DebtAllocation[];
}

export interface DebtAllocation {
  debtId: string;
  debtName: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface WhatIfScenario {
  id: string;
  type: 'extra_payment' | 'consolidation' | 'settlement' | 'balance_transfer';
  name: string;
  parameters: Record<string, any>;
  projection: PayoffProjection;
}

export interface ProductRecommendation {
  id: string;
  type: 'consolidation' | 'settlement' | 'balance_transfer';
  name: string;
  description: string;
  newAPR: number;
  monthlyPaymentChange: number;
  interestSavings: number;
  payoffTimeChange: number; // months
  fitScore: FitScore;
  eligibilityCriteria: string[];
  tradeoffs: string[];
}

export interface DebtSummary {
  totalDebt: number;
  numberOfAccounts: number;
  weightedAPR: number;
  utilizationRate: number;
  debtToIncomeRatio: number;
  debtComposition: { type: DebtType; amount: number; percentage: number }[];
}