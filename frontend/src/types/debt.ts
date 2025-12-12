export type DebtType = 'credit-card' | 'personal-loan' | 'student-loan' | 'auto-loan' | 'mortgage' | 'installment-loan';

export type PayoffGoal = 'lower-payment' | 'pay-faster' | 'reduce-interest' | 'avoid-default';

export type PayoffStrategy = 'snowball' | 'avalanche' | 'custom' | 'consolidation' | 'settlement';

export type WhatIfType =
  | 'extra-payment'
  | 'increased-monthly'
  | 'consolidation'
  | 'settlement'
  | 'balance-transfer'
  | 'rate-change';

export type CreditScoreRange = '300-579' | '580-669' | '670-739' | '740-799' | '800-850';

export type AgeRange = '18-24' | '25-34' | '35-44' | '45-59' | '60+';

export type EmploymentStatus = 'full-time' | 'part-time' | 'self-employed' | 'unemployed' | 'retired' | 'student';

export type PayoffPriority = 'aggressive-freedom' | 'minimize-interest' | 'balance-savings' | 'cash-flow-relief';

export type StressLevel = 1 | 2 | 3 | 4 | 5;

export type LifeEvent = 
  | 'income-increase'
  | 'income-decrease'
  | 'major-expense'
  | 'household-changes'
  | 'other-goals';

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
  // Optional common fields
  lenderName?: string;
  aprType?: 'fixed' | 'variable';
  paymentType?: 'minimum' | 'fixed-amount' | 'full' | 'custom';
  actualMonthlyPayment?: number;
  // Optional loan fields
  originalPrincipal?: number;
  termMonths?: number;
  originationDate?: Date;
  remainingMonths?: number;
  // Optional credit card fields
  creditLimit?: number;
  lateFees?: number;
  // Optional student loan fields
  loanProgram?: 'federal' | 'private';
  // Optional mortgage fields
  escrowIncluded?: boolean;
  propertyTax?: number;
  homeInsurance?: number;
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
  payoffPriority?: PayoffPriority;
  stressLevel: StressLevel;
  lifeEvents?: LifeEvent[];
}

// ============================================
// EVENT STRUCTURES (Client-Side Simulation)
// ============================================

export interface SettlementEvent {
  month: number;
  debtId: string;
  debtName: string;
  originalBalance: number;
  settledAmount: number;
  forgivenAmount: number;
  settlementFee?: number;
  programPayment?: number;
}

export interface ConsolidationEvent {
  month: number;
  consolidatedDebtIds: string[];
  consolidatedDebtNames: string[];
  totalConsolidatedBalance: number;
  newLoanId: string;
  newLoanName: string;
  newAPR: number;
  newTermMonths: number;
  originationFee?: number;
}

export interface BalanceTransferEvent {
  month: number;
  sourceDebtId: string;
  transferredAmount: number;
  newAPR: number;
  transferFee: number;
  promotionalPeriodMonths?: number;
  postPromoAPR?: number;
}

export interface ExtraPaymentEvent {
  month: number;
  debtId: string;
  amount: number;
  source: 'windfall' | 'bonus' | 'tax-refund' | 'other';
}

// ============================================
// DEBT TIMELINE (For Chart 2 Visualization)
// ============================================

export interface DebtTimeline {
  debtId: string;
  debtName: string;
  originalBalance: number;
  monthlyBalances: Array<{
    month: number;
    balance: number;
    forgivenAmount?: number;
    isConsolidated?: boolean;
  }>;
  totalPaid: number;
  totalInterest: number;
  payoffMonth: number;
  settlementMonth?: number;
  consolidationMonth?: number;
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
  
  // Event tracking for visualization
  settlementEvents?: SettlementEvent[];
  consolidationEvent?: ConsolidationEvent;
  balanceTransferEvents?: BalanceTransferEvent[];
  extraPaymentEvents?: ExtraPaymentEvent[];
  
  // Metadata for comparison
  scenarioType?: 'base' | 'what-if';
  baseScenarioId?: string;
  whatIfType?: WhatIfType;
  
  // Debt-level summaries (for Chart 2)
  debtTimelines?: DebtTimeline[];
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

// ============================================
// WHAT-IF SCENARIO CONFIGURATION
// ============================================

export interface WhatIfConfig {
  type: WhatIfType;
  baseScenarioId?: string;
  
  extraPayment?: {
    amount: number;
    month: number;
    targetDebtId?: string;
  };
  
  increasedPayment?: {
    newMonthlyAmount: number;
    startMonth?: number;
  };
  
  consolidation?: {
    debtIds: string[];
    newAPR: number;
    newTermMonths: number;
    originationFeePercent?: number;
    startMonth?: number;
  };
  
  settlement?: {
    debtId: string;
    settlementPercentage: number;
    settlementMonth: number;
    monthlyProgramPayment: number;
    programDurationMonths: number;
  };
  
  balanceTransfer?: {
    sourceDebtId: string;
    transferAmount: number;
    newAPR: number;
    transferFeePercent: number;
    promotionalMonths?: number;
    postPromoAPR?: number;
  };
  
  rateChange?: {
    debtId: string;
    newAPR: number;
    effectiveMonth: number;
  };
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