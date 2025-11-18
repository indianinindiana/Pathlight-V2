import { DebtTradeline, FinancialContext, ProductRecommendation, FitScore, CreditScoreRange } from '@/types/debt';

// Configurable recommendation rules
export const RECOMMENDATION_RULES = {
  consolidation: {
    minTotalDebt: 5000,
    minAPR: 15,
    maxAPR: 35,
    creditScoreRanges: {
      excellent: { newAPR: 6.5, eligible: true },
      very_good: { newAPR: 8.5, eligible: true },
      good: { newAPR: 12.5, eligible: true },
      fair: { newAPR: 18.5, eligible: true },
      poor: { newAPR: 0, eligible: false },
    },
    eligibleDebtTypes: ['credit_card', 'personal_loan'],
  },
  settlement: {
    minTotalDebt: 10000,
    minAPR: 18,
    creditScoreRanges: {
      excellent: { eligible: false },
      very_good: { eligible: false },
      good: { eligible: true },
      fair: { eligible: true },
      poor: { eligible: true },
    },
    settlementPercentage: 0.5, // 50% of balance
    eligibleDebtTypes: ['credit_card', 'personal_loan'],
  },
  balanceTransfer: {
    minBalance: 1000,
    minAPR: 15,
    creditScoreRanges: {
      excellent: { newAPR: 0, promoMonths: 18, eligible: true },
      very_good: { newAPR: 0, promoMonths: 15, eligible: true },
      good: { newAPR: 0, promoMonths: 12, eligible: true },
      fair: { newAPR: 3.99, promoMonths: 6, eligible: true },
      poor: { newAPR: 0, promoMonths: 0, eligible: false },
    },
    transferFee: 0.03, // 3%
    postPromoAPR: 18.99,
    eligibleDebtTypes: ['credit_card'],
  },
};

const getCreditScoreNumeric = (range: CreditScoreRange): number => {
  const ranges = {
    poor: 500,
    fair: 625,
    good: 705,
    very_good: 770,
    excellent: 825,
  };
  return ranges[range];
};

const calculateFitScore = (
  debtTotal: number,
  avgAPR: number,
  creditScore: CreditScoreRange,
  recommendationType: 'consolidation' | 'settlement' | 'balanceTransfer'
): FitScore => {
  const scoreValue = getCreditScoreNumeric(creditScore);
  
  if (recommendationType === 'consolidation') {
    if (scoreValue >= 740 && avgAPR >= 20 && debtTotal >= 10000) return 'high';
    if (scoreValue >= 670 && avgAPR >= 15 && debtTotal >= 5000) return 'medium';
    return 'low';
  }
  
  if (recommendationType === 'settlement') {
    if (scoreValue <= 669 && avgAPR >= 22 && debtTotal >= 15000) return 'high';
    if (scoreValue <= 739 && avgAPR >= 18 && debtTotal >= 10000) return 'medium';
    return 'low';
  }
  
  if (recommendationType === 'balanceTransfer') {
    if (scoreValue >= 740 && avgAPR >= 18) return 'high';
    if (scoreValue >= 670 && avgAPR >= 15) return 'medium';
    return 'low';
  }
  
  return 'low';
};

export const generateRecommendations = (
  debts: DebtTradeline[],
  financialContext: FinancialContext
): ProductRecommendation[] => {
  const recommendations: ProductRecommendation[] = [];
  
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const avgAPR = debts.reduce((sum, d) => sum + (d.apr * d.balance), 0) / totalDebt;
  const creditScore = financialContext.creditScoreRange;

  // Consolidation Loan Recommendation
  const consolidationRule = RECOMMENDATION_RULES.consolidation;
  const consolidationEligible = consolidationRule.creditScoreRanges[creditScore].eligible;
  const eligibleConsolidationDebts = debts.filter(d => 
    consolidationRule.eligibleDebtTypes.includes(d.type) && d.apr >= consolidationRule.minAPR
  );
  const consolidationTotal = eligibleConsolidationDebts.reduce((sum, d) => sum + d.balance, 0);

  if (consolidationEligible && consolidationTotal >= consolidationRule.minTotalDebt) {
    const newAPR = consolidationRule.creditScoreRanges[creditScore].newAPR;
    const currentMonthlyPayment = eligibleConsolidationDebts.reduce((sum, d) => sum + d.minimumPayment, 0);
    
    // Simplified calculation for interest savings
    const currentInterestRate = avgAPR / 100 / 12;
    const newInterestRate = newAPR / 100 / 12;
    const estimatedMonths = 48; // 4 years
    const currentTotalInterest = consolidationTotal * currentInterestRate * estimatedMonths;
    const newTotalInterest = consolidationTotal * newInterestRate * estimatedMonths;
    const interestSavings = currentTotalInterest - newTotalInterest;

    const newMonthlyPayment = (consolidationTotal * (newInterestRate * Math.pow(1 + newInterestRate, estimatedMonths))) / 
                              (Math.pow(1 + newInterestRate, estimatedMonths) - 1);

    recommendations.push({
      id: 'consolidation-1',
      type: 'consolidation',
      name: 'Personal Consolidation Loan',
      description: `Combine ${eligibleConsolidationDebts.length} debts into one loan with a lower rate`,
      newAPR,
      monthlyPaymentChange: newMonthlyPayment - currentMonthlyPayment,
      interestSavings,
      payoffTimeChange: -12, // Estimated 12 months faster
      fitScore: calculateFitScore(consolidationTotal, avgAPR, creditScore, 'consolidation'),
      eligibilityCriteria: [
        `Credit score: ${creditScore}`,
        `Total debt: $${consolidationTotal.toLocaleString()}`,
        `Current APR: ${avgAPR.toFixed(1)}%`,
      ],
      tradeoffs: [
        'May require good credit score',
        'Origination fee may apply (1-5%)',
        'Fixed payment schedule',
      ],
    });
  }

  // Balance Transfer Recommendation
  const balanceTransferRule = RECOMMENDATION_RULES.balanceTransfer;
  const btEligible = balanceTransferRule.creditScoreRanges[creditScore].eligible;
  const eligibleBTDebts = debts.filter(d => 
    balanceTransferRule.eligibleDebtTypes.includes(d.type) && 
    d.apr >= balanceTransferRule.minAPR &&
    d.balance >= balanceTransferRule.minBalance
  );

  if (btEligible && eligibleBTDebts.length > 0) {
    const btConfig = balanceTransferRule.creditScoreRanges[creditScore];
    const btTotal = eligibleBTDebts.reduce((sum, d) => sum + d.balance, 0);
    const transferFee = btTotal * balanceTransferRule.transferFee;
    
    // Calculate interest savings during promo period
    const currentMonthlyInterest = eligibleBTDebts.reduce((sum, d) => 
      sum + (d.balance * (d.apr / 100 / 12)), 0
    );
    const promoInterestSavings = currentMonthlyInterest * btConfig.promoMonths;

    recommendations.push({
      id: 'balance-transfer-1',
      type: 'balance_transfer',
      name: `${btConfig.promoMonths}-Month 0% Balance Transfer`,
      description: `Transfer high-interest credit card debt to a 0% APR card`,
      newAPR: btConfig.newAPR,
      monthlyPaymentChange: -currentMonthlyInterest, // Save on interest during promo
      interestSavings: promoInterestSavings - transferFee,
      payoffTimeChange: 0,
      fitScore: calculateFitScore(btTotal, avgAPR, creditScore, 'balanceTransfer'),
      eligibilityCriteria: [
        `Credit score: ${creditScore}`,
        `${btConfig.promoMonths} months at ${btConfig.newAPR}% APR`,
        `Transfer fee: ${(balanceTransferRule.transferFee * 100).toFixed(1)}%`,
      ],
      tradeoffs: [
        `After ${btConfig.promoMonths} months, APR becomes ${balanceTransferRule.postPromoAPR}%`,
        `Transfer fee: $${transferFee.toFixed(0)}`,
        'Must pay off during promo period for maximum benefit',
      ],
    });
  }

  // Debt Settlement Recommendation
  const settlementRule = RECOMMENDATION_RULES.settlement;
  const settlementEligible = settlementRule.creditScoreRanges[creditScore].eligible;
  const eligibleSettlementDebts = debts.filter(d => 
    settlementRule.eligibleDebtTypes.includes(d.type) && d.apr >= settlementRule.minAPR
  );
  const settlementTotal = eligibleSettlementDebts.reduce((sum, d) => sum + d.balance, 0);

  if (settlementEligible && settlementTotal >= settlementRule.minTotalDebt) {
    const settledAmount = settlementTotal * settlementRule.settlementPercentage;
    const savings = settlementTotal - settledAmount;

    recommendations.push({
      id: 'settlement-1',
      type: 'settlement',
      name: 'Debt Settlement Program',
      description: `Negotiate to pay ${(settlementRule.settlementPercentage * 100).toFixed(0)}% of your debt`,
      newAPR: 0,
      monthlyPaymentChange: 0,
      interestSavings: savings,
      payoffTimeChange: -24, // Typically 2-4 years
      fitScore: calculateFitScore(settlementTotal, avgAPR, creditScore, 'settlement'),
      eligibilityCriteria: [
        `Total debt: $${settlementTotal.toLocaleString()}`,
        'Experiencing financial hardship',
        'Behind on payments or at risk of default',
      ],
      tradeoffs: [
        'Significant negative impact on credit score',
        'Settled debt may be taxable income',
        'Not all creditors may agree to settle',
        'May take 2-4 years to complete',
      ],
    });
  }

  return recommendations;
};