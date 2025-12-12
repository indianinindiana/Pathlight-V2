import { Debt, PayoffScenario, PayoffScheduleItem, PayoffStrategy } from '@/types/debt';

/**
 * Helper: Check if a debt can be consolidated
 * Only credit cards, personal loans, installment loans, and student loans can be consolidated
 * Mortgages and auto loans are secured debts and cannot be consolidated
 */
export const canConsolidate = (debt: Debt): boolean => {
  return ['credit-card', 'personal-loan', 'installment-loan', 'student-loan'].includes(debt.type);
};

/**
 * Helper: Check if a debt can be settled
 * Only credit cards, personal loans, installment loans, and PRIVATE student loans can be settled
 * Auto loans, mortgages, and federal student loans cannot be settled
 */
export const canSettle = (debt: Debt): boolean => {
  // Credit cards, personal loans, and installment loans can always be settled
  if (['credit-card', 'personal-loan', 'installment-loan'].includes(debt.type)) {
    return true;
  }
  
  // Student loans can only be settled if they are private
  if (debt.type === 'student-loan' && debt.loanProgram === 'private') {
    return true;
  }
  
  return false;
};

export const calculateWeightedAPR = (debts: Debt[]): number => {
  if (debts.length === 0) return 0;
  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  if (totalBalance === 0) return 0;
  const weightedSum = debts.reduce((sum, d) => sum + (d.balance * d.apr), 0);
  return weightedSum / totalBalance;
};

export const calculateTotalDebt = (debts: Debt[]): number => {
  return debts.reduce((sum, d) => sum + d.balance, 0);
};

export const calculateTotalMinimumPayment = (debts: Debt[]): number => {
  return debts.reduce((sum, d) => sum + d.minimumPayment, 0);
};

export const calculateDebtToIncome = (totalDebt: number, monthlyIncome: number): number => {
  if (monthlyIncome === 0) return 0;
  return (totalDebt / (monthlyIncome * 12)) * 100;
};

export const calculateUtilization = (debts: Debt[]): number => {
  const creditCardDebts = debts.filter(d => d.type === 'credit-card');
  if (creditCardDebts.length === 0) return 0;
  
  // Assume credit limit is roughly 2x the current balance for estimation
  const totalBalance = creditCardDebts.reduce((sum, d) => sum + d.balance, 0);
  const estimatedLimit = totalBalance * 2;
  
  return (totalBalance / estimatedLimit) * 100;
};

export const orderDebtsByStrategy = (debts: Debt[], strategy: PayoffStrategy): Debt[] => {
  const sortedDebts = [...debts];
  
  switch (strategy) {
    case 'snowball':
      // Smallest balance first
      return sortedDebts.sort((a, b) => a.balance - b.balance);
    
    case 'avalanche':
      // Highest APR first
      return sortedDebts.sort((a, b) => b.apr - a.apr);
    
    case 'custom':
      // Use custom order if set, otherwise by balance
      return sortedDebts.sort((a, b) => {
        if (a.customOrder !== undefined && b.customOrder !== undefined) {
          return a.customOrder - b.customOrder;
        }
        return a.balance - b.balance;
      });
    
    default:
      return sortedDebts;
  }
};

export const calculatePayoffScenario = (
  debts: Debt[],
  strategy: PayoffStrategy,
  monthlyPayment: number,
  startDate: Date = new Date()
): PayoffScenario => {
  const orderedDebts = orderDebtsByStrategy(debts, strategy);
  const schedule: PayoffScheduleItem[] = [];
  
  // Create working copies of debts with tracking fields
  type WorkingDebt = Debt & {
    remainingBalance: number;
    cumulativeInterest: number;
    monthlyInterest?: number;
    principalPaidThisMonth?: number;
    interestPaidThisMonth?: number;
    paymentThisMonth?: number;
  };
  
  const workingDebts: WorkingDebt[] = orderedDebts.map(d => ({
    ...d,
    remainingBalance: d.balance,
    cumulativeInterest: 0,
  }));
  
  let currentMonth = 0;
  let totalInterest = 0;
  let currentDate = new Date(startDate);
  
  // Add month 0 entries (starting state, no payments yet)
  for (const debt of workingDebts) {
    schedule.push({
      month: 0,
      date: new Date(startDate),
      debtId: debt.id,
      debtName: debt.name,
      payment: 0,
      principal: 0,
      interest: 0,
      remainingBalance: debt.balance,
    });
  }
  
  // Continue until all debts are paid off
  while (workingDebts.some(d => d.remainingBalance > 0.01)) { // Use small epsilon for floating point
    currentMonth++;
    currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + currentMonth);
    
    // Step 1: Calculate interest for all debts
    for (const debt of workingDebts) {
      if (debt.remainingBalance > 0.01) {
        debt.monthlyInterest = (debt.remainingBalance * (debt.apr / 100)) / 12;
      } else {
        debt.monthlyInterest = 0;
        debt.remainingBalance = 0; // Clean up small balances
      }
    }
    
    // Step 2: Apply minimum payments to all debts
    let totalMinApplied = 0;
    for (const debt of workingDebts) {
      if (debt.remainingBalance <= 0) {
        // Debt already paid off - record zero entry
        schedule.push({
          month: currentMonth,
          date: new Date(currentDate),
          debtId: debt.id,
          debtName: debt.name,
          payment: 0,
          principal: 0,
          interest: 0,
          remainingBalance: 0,
        });
        continue;
      }
      
      const monthlyInterest = debt.monthlyInterest || 0;
      
      // Maximum we can pay is remaining balance + interest
      const maxFinalPayment = debt.remainingBalance + monthlyInterest;
      
      // Apply minimum payment (or final payment if less)
      const appliedMinPayment = Math.min(debt.minimumPayment, maxFinalPayment);
      
      // Interest portion is always the full monthly interest charged
      const interestPortion = monthlyInterest;
      
      // Principal portion (may be negative if interest > appliedMinPayment)
      let principalPortion = appliedMinPayment - interestPortion;
      
      // Handle negative amortization explicitly
      let unpaidInterest = 0;
      if (principalPortion < 0) {
        // Interest exceeds payment - balance will grow
        unpaidInterest = -principalPortion;
        principalPortion = 0;
      }
      
      // Update balance: subtract principal paid, add unpaid interest
      debt.remainingBalance = debt.remainingBalance - principalPortion + unpaidInterest;
      
      // Track cumulative interest
      debt.cumulativeInterest = (debt.cumulativeInterest || 0) + interestPortion;
      totalInterest += interestPortion;
      
      // Store temp values for extra payment processing
      debt.principalPaidThisMonth = principalPortion;
      debt.interestPaidThisMonth = interestPortion;
      debt.paymentThisMonth = appliedMinPayment;
      
      totalMinApplied += appliedMinPayment;
    }
    
    // Step 3: Apply extra payment to debts in strategy order (cascade)
    let remainingExtra = Math.max(0, monthlyPayment - totalMinApplied);
    
    for (const debt of workingDebts) {
      if (remainingExtra <= 0) break;
      if (debt.remainingBalance <= 0.01) continue;
      
      // Amount needed to fully pay off this debt this month
      const neededToFinish = debt.remainingBalance;
      
      // Apply as much extra as possible (up to what's needed)
      const appliedExtra = Math.min(remainingExtra, neededToFinish);
      
      debt.principalPaidThisMonth = (debt.principalPaidThisMonth || 0) + appliedExtra;
      debt.paymentThisMonth = (debt.paymentThisMonth || 0) + appliedExtra;
      debt.remainingBalance -= appliedExtra;
      
      remainingExtra -= appliedExtra;
      
      // Clean up small balances
      if (debt.remainingBalance < 0.01) {
        debt.remainingBalance = 0;
      }
    }
    
    // Step 4: Record exactly one schedule entry per debt for this month
    for (const debt of workingDebts) {
      schedule.push({
        month: currentMonth,
        date: new Date(currentDate),
        debtId: debt.id,
        debtName: debt.name,
        payment: debt.paymentThisMonth || 0,
        principal: debt.principalPaidThisMonth || 0,
        interest: debt.interestPaidThisMonth || 0,
        remainingBalance: Math.max(0, debt.remainingBalance),
      });
      
      // Reset per-month tracking
      debt.principalPaidThisMonth = 0;
      debt.interestPaidThisMonth = 0;
      debt.paymentThisMonth = 0;
      debt.monthlyInterest = 0;
    }
    
    // Safety check to prevent infinite loops
    if (currentMonth > 600) { // 50 years max
      console.warn('Payoff calculation exceeded 600 months - stopping');
      break;
    }
  }
  
  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + currentMonth);
  
  return {
    id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${strategy.charAt(0).toUpperCase() + strategy.slice(1)} Strategy`,
    strategy,
    monthlyPayment,
    totalMonths: currentMonth,
    totalInterest,
    payoffDate,
    schedule
  };
};

export const validateMinimumPayment = (balance: number, apr: number, minimumPayment: number): boolean => {
  // Minimum payment should cover at least the monthly interest
  const monthlyInterest = (balance * (apr / 100)) / 12;
  return minimumPayment >= monthlyInterest;
};

export const suggestMinimumPayment = (balance: number, apr: number): number => {
  // Suggest 2% of balance or interest + $25, whichever is higher
  const monthlyInterest = (balance * (apr / 100)) / 12;
  const twoPercent = balance * 0.02;
  return Math.max(monthlyInterest + 25, twoPercent);
};

// ============================================
// CONSOLIDATION SIMULATION
// ============================================

export const simulateConsolidation = (
  debts: Debt[],
  debtIds: string[],
  newAPR: number,
  newTermMonths: number,
  monthlyPayment: number,
  originationFeePercent: number = 0,
  startDate: Date = new Date()
): PayoffScenario => {
  // Filter to only eligible debts
  const debtsToConsolidate = debts.filter(d => debtIds.includes(d.id) && canConsolidate(d));
  
  // Validate that we have eligible debts
  if (debtsToConsolidate.length === 0) {
    throw new Error('No eligible debts for consolidation. Only credit cards, personal loans, installment loans, and student loans can be consolidated.');
  }
  
  // Warn if some debts were filtered out
  const requestedDebts = debts.filter(d => debtIds.includes(d.id));
  if (requestedDebts.length > debtsToConsolidate.length) {
    const ineligibleDebts = requestedDebts.filter(d => !canConsolidate(d));
    console.warn(`Excluded ${ineligibleDebts.length} ineligible debt(s) from consolidation:`,
      ineligibleDebts.map(d => `${d.name} (${d.type})`));
  }
  const totalBalance = debtsToConsolidate.reduce((sum, d) => sum + d.balance, 0);
  const originationFee = totalBalance * (originationFeePercent / 100);
  const consolidatedBalance = totalBalance + originationFee;
  
  // Create consolidated loan
  const consolidatedLoan: Debt = {
    id: `consolidated-${Date.now()}`,
    name: 'Consolidated Loan',
    type: 'personal-loan',
    balance: consolidatedBalance,
    apr: newAPR,
    minimumPayment: consolidatedBalance / newTermMonths,
    nextPaymentDate: new Date(startDate),
  };
  
  // Keep non-consolidated debts
  const remainingDebts = debts.filter(d => !debtIds.includes(d.id));
  const allDebts = [...remainingDebts, consolidatedLoan];
  
  // Run standard payoff calculation
  const scenario = calculatePayoffScenario(allDebts, 'avalanche', monthlyPayment, startDate);
  
  // Add consolidation event
  scenario.consolidationEvent = {
    month: 0,
    consolidatedDebtIds: debtIds,
    consolidatedDebtNames: debtsToConsolidate.map(d => d.name),
    totalConsolidatedBalance: totalBalance,
    newLoanId: consolidatedLoan.id,
    newLoanName: consolidatedLoan.name,
    newAPR,
    newTermMonths,
    originationFee,
  };
  
  scenario.scenarioType = 'what-if';
  scenario.whatIfType = 'consolidation';
  scenario.strategy = 'consolidation';
  
  return scenario;
};

// ============================================
// SETTLEMENT SIMULATION
// ============================================

export const simulateSettlement = (
  debts: Debt[],
  debtId: string,
  settlementPercentage: number,
  settlementMonth: number,
  monthlyProgramPayment: number,
  monthlyPayment: number,
  startDate: Date = new Date()
): PayoffScenario => {
  // Validate debt eligibility
  const targetDebtCheck = debts.find(d => d.id === debtId);
  if (!targetDebtCheck) {
    throw new Error(`Debt with ID ${debtId} not found`);
  }
  
  if (!canSettle(targetDebtCheck)) {
    const reason = targetDebtCheck.type === 'student-loan'
      ? 'Federal student loans cannot be settled. Only private student loans are eligible.'
      : `${targetDebtCheck.type} debts cannot be settled. Only credit cards, personal loans, installment loans, and private student loans are eligible.`;
    throw new Error(reason);
  }
  type WorkingDebt = Debt & {
    remainingBalance: number;
    cumulativeInterest: number;
    monthlyInterest?: number;
    principalPaidThisMonth?: number;
    interestPaidThisMonth?: number;
    paymentThisMonth?: number;
    isSettled?: boolean;
  };
  
  const workingDebts: WorkingDebt[] = debts.map(d => ({
    ...d,
    remainingBalance: d.balance,
    cumulativeInterest: 0,
    isSettled: false,
  }));
  
  const targetDebt = workingDebts.find(d => d.id === debtId)!;
  const originalBalance = targetDebt.balance;
  
  const schedule: PayoffScheduleItem[] = [];
  let currentMonth = 0;
  let totalInterest = 0;
  let currentDate = new Date(startDate);
  
  // Add month 0 entries
  for (const debt of workingDebts) {
    schedule.push({
      month: 0,
      date: new Date(startDate),
      debtId: debt.id,
      debtName: debt.name,
      payment: 0,
      principal: 0,
      interest: 0,
      remainingBalance: debt.balance,
    });
  }
  
  // Simulate month-by-month
  while (workingDebts.some(d => d.remainingBalance > 0.01)) {
    currentMonth++;
    currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + currentMonth);
    
    // Settlement event occurs
    if (currentMonth === settlementMonth && !targetDebt.isSettled) {
      const settledAmount = originalBalance * (settlementPercentage / 100);
      const forgivenAmount = targetDebt.remainingBalance - settledAmount;
      targetDebt.remainingBalance = settledAmount;
      targetDebt.isSettled = true;
      
      // Record settlement in schedule
      schedule.push({
        month: currentMonth,
        date: new Date(currentDate),
        debtId: targetDebt.id,
        debtName: targetDebt.name,
        payment: 0,
        principal: forgivenAmount,
        interest: 0,
        remainingBalance: settledAmount,
      });
      
      // Continue to next month for other debts
      for (const debt of workingDebts) {
        if (debt.id !== targetDebt.id) {
          schedule.push({
            month: currentMonth,
            date: new Date(currentDate),
            debtId: debt.id,
            debtName: debt.name,
            payment: 0,
            principal: 0,
            interest: 0,
            remainingBalance: debt.remainingBalance,
          });
        }
      }
      continue;
    }
    
    // Calculate interest for all debts
    for (const debt of workingDebts) {
      if (debt.remainingBalance > 0.01) {
        debt.monthlyInterest = (debt.remainingBalance * (debt.apr / 100)) / 12;
      } else {
        debt.monthlyInterest = 0;
        debt.remainingBalance = 0;
      }
    }
    
    // Apply minimum payments
    let totalMinApplied = 0;
    for (const debt of workingDebts) {
      if (debt.remainingBalance <= 0) {
        schedule.push({
          month: currentMonth,
          date: new Date(currentDate),
          debtId: debt.id,
          debtName: debt.name,
          payment: 0,
          principal: 0,
          interest: 0,
          remainingBalance: 0,
        });
        continue;
      }
      
      const monthlyInterest = debt.monthlyInterest || 0;
      const maxFinalPayment = debt.remainingBalance + monthlyInterest;
      const appliedMinPayment = Math.min(debt.minimumPayment, maxFinalPayment);
      const interestPortion = monthlyInterest;
      let principalPortion = appliedMinPayment - interestPortion;
      
      let unpaidInterest = 0;
      if (principalPortion < 0) {
        unpaidInterest = -principalPortion;
        principalPortion = 0;
      }
      
      debt.remainingBalance = debt.remainingBalance - principalPortion + unpaidInterest;
      debt.cumulativeInterest = (debt.cumulativeInterest || 0) + interestPortion;
      totalInterest += interestPortion;
      
      debt.principalPaidThisMonth = principalPortion;
      debt.interestPaidThisMonth = interestPortion;
      debt.paymentThisMonth = appliedMinPayment;
      
      totalMinApplied += appliedMinPayment;
    }
    
    // Apply extra payment
    let remainingExtra = Math.max(0, monthlyPayment - totalMinApplied);
    
    // Sort working debts by avalanche strategy (highest APR first)
    const sortedDebts = [...workingDebts].sort((a, b) => b.apr - a.apr);
    
    for (const debt of sortedDebts) {
      if (remainingExtra <= 0) break;
      if (debt.remainingBalance <= 0.01) continue;
      
      const neededToFinish = debt.remainingBalance;
      const appliedExtra = Math.min(remainingExtra, neededToFinish);
      
      debt.principalPaidThisMonth = (debt.principalPaidThisMonth || 0) + appliedExtra;
      debt.paymentThisMonth = (debt.paymentThisMonth || 0) + appliedExtra;
      debt.remainingBalance -= appliedExtra;
      remainingExtra -= appliedExtra;
      
      if (debt.remainingBalance < 0.01) {
        debt.remainingBalance = 0;
      }
    }
    
    // Record schedule entries
    for (const debt of workingDebts) {
      schedule.push({
        month: currentMonth,
        date: new Date(currentDate),
        debtId: debt.id,
        debtName: debt.name,
        payment: debt.paymentThisMonth || 0,
        principal: debt.principalPaidThisMonth || 0,
        interest: debt.interestPaidThisMonth || 0,
        remainingBalance: Math.max(0, debt.remainingBalance),
      });
      
      debt.principalPaidThisMonth = 0;
      debt.interestPaidThisMonth = 0;
      debt.paymentThisMonth = 0;
      debt.monthlyInterest = 0;
    }
    
    if (currentMonth > 600) break;
  }
  
  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + currentMonth);
  
  const settledAmount = originalBalance * (settlementPercentage / 100);
  const forgivenAmount = originalBalance - settledAmount;
  
  return {
    id: `settlement-${Date.now()}`,
    name: 'Settlement Scenario',
    strategy: 'settlement',
    monthlyPayment,
    totalMonths: currentMonth,
    totalInterest,
    payoffDate,
    schedule,
    scenarioType: 'what-if',
    whatIfType: 'settlement',
    settlementEvents: [{
      month: settlementMonth,
      debtId,
      debtName: targetDebt.name,
      originalBalance,
      settledAmount,
      forgivenAmount,
      programPayment: monthlyProgramPayment,
    }],
  };
};

// ============================================
// GENERATE DEBT TIMELINES (For Chart 2)
// ============================================

export const generateDebtTimelines = (
  scenario: PayoffScenario,
  debts: Debt[]
): import('@/types/debt').DebtTimeline[] => {
  return debts.map(debt => {
    const debtSchedule = scenario.schedule.filter(s => s.debtId === debt.id);
    
    const monthlyBalances = debtSchedule.map(s => ({
      month: s.month,
      balance: s.remainingBalance,
      forgivenAmount: scenario.settlementEvents?.find(
        e => e.debtId === debt.id && e.month === s.month
      )?.forgivenAmount,
      isConsolidated: scenario.consolidationEvent?.consolidatedDebtIds.includes(debt.id),
    }));
    
    const totalPaid = debtSchedule.reduce((sum, s) => sum + s.payment, 0);
    const totalInterest = debtSchedule.reduce((sum, s) => sum + s.interest, 0);
    const payoffMonth = debtSchedule.findIndex(s => s.remainingBalance === 0);
    
    return {
      debtId: debt.id,
      debtName: debt.name,
      originalBalance: debt.balance,
      monthlyBalances,
      totalPaid,
      totalInterest,
      payoffMonth: payoffMonth >= 0 ? payoffMonth : scenario.totalMonths,
      settlementMonth: scenario.settlementEvents?.find(e => e.debtId === debt.id)?.month,
      consolidationMonth: scenario.consolidationEvent?.consolidatedDebtIds.includes(debt.id) 
        ? scenario.consolidationEvent.month 
        : undefined,
    };
  });
};