import { Debt, PayoffScenario, PayoffScheduleItem, PayoffStrategy } from '@/types/debt';

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
  
  // Create working copies of debts
  const workingDebts = orderedDebts.map(d => ({
    ...d,
    remainingBalance: d.balance
  }));
  
  let currentMonth = 0;
  let totalInterest = 0;
  let currentDate = new Date(startDate);
  
  // Continue until all debts are paid off
  while (workingDebts.some(d => d.remainingBalance > 0)) {
    currentMonth++;
    currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + currentMonth);
    
    let remainingPayment = monthlyPayment;
    
    // First, pay minimum payments on all debts
    for (const debt of workingDebts) {
      if (debt.remainingBalance > 0) {
        const monthlyInterest = (debt.remainingBalance * (debt.apr / 100)) / 12;
        const minPayment = Math.min(debt.minimumPayment, debt.remainingBalance + monthlyInterest);
        const interestPortion = Math.min(monthlyInterest, minPayment);
        const principalPortion = minPayment - interestPortion;
        
        debt.remainingBalance -= principalPortion;
        totalInterest += interestPortion;
        remainingPayment -= minPayment;
        
        schedule.push({
          month: currentMonth,
          date: new Date(currentDate),
          debtId: debt.id,
          debtName: debt.name,
          payment: minPayment,
          principal: principalPortion,
          interest: interestPortion,
          remainingBalance: Math.max(0, debt.remainingBalance)
        });
      }
    }
    
    // Apply extra payment to first debt with balance
    if (remainingPayment > 0) {
      const targetDebt = workingDebts.find(d => d.remainingBalance > 0);
      if (targetDebt) {
        const extraPayment = Math.min(remainingPayment, targetDebt.remainingBalance);
        targetDebt.remainingBalance -= extraPayment;
        
        // Add to schedule
        const lastEntry = schedule[schedule.length - 1];
        if (lastEntry && lastEntry.debtId === targetDebt.id && lastEntry.month === currentMonth) {
          lastEntry.payment += extraPayment;
          lastEntry.principal += extraPayment;
          lastEntry.remainingBalance = Math.max(0, targetDebt.remainingBalance);
        }
      }
    }
    
    // Safety check to prevent infinite loops
    if (currentMonth > 600) { // 50 years max
      break;
    }
  }
  
  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + currentMonth);
  
  return {
    id: `scenario-${Date.now()}`,
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