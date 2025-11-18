import { DebtTradeline, PayoffProjection, PayoffStrategy, MonthlyPayment, DebtAllocation } from '@/types/debt';

export const calculatePayoffProjection = (
  debts: DebtTradeline[],
  strategy: PayoffStrategy,
  monthlyBudget: number,
  customOrder?: string[]
): PayoffProjection => {
  // Clone debts to avoid mutation
  const workingDebts = debts.map(d => ({ ...d, remainingBalance: d.balance }));
  
  // Sort debts based on strategy
  let sortedDebts = [...workingDebts];
  if (strategy === 'snowball') {
    sortedDebts.sort((a, b) => a.balance - b.balance);
  } else if (strategy === 'avalanche') {
    sortedDebts.sort((a, b) => b.apr - a.apr);
  } else if (strategy === 'custom' && customOrder) {
    sortedDebts = customOrder.map(id => workingDebts.find(d => d.id === id)!).filter(Boolean);
  }

  const monthlyBreakdown: MonthlyPayment[] = [];
  let currentMonth = 0;
  let totalInterestPaid = 0;
  const startDate = new Date();

  // Continue until all debts are paid off
  while (sortedDebts.some(d => d.remainingBalance > 0)) {
    currentMonth++;
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + currentMonth);

    let remainingBudget = monthlyBudget;
    const debtAllocations: DebtAllocation[] = [];
    let monthTotalPayment = 0;
    let monthTotalPrincipal = 0;
    let monthTotalInterest = 0;

    // First, pay minimum payments on all debts
    for (const debt of sortedDebts) {
      if (debt.remainingBalance <= 0) continue;

      const monthlyInterestRate = debt.apr / 100 / 12;
      const interestCharge = debt.remainingBalance * monthlyInterestRate;
      const minPayment = Math.min(debt.minimumPayment, debt.remainingBalance + interestCharge);
      const principal = Math.max(0, minPayment - interestCharge);

      debt.remainingBalance -= principal;
      remainingBudget -= minPayment;
      totalInterestPaid += interestCharge;

      debtAllocations.push({
        debtId: debt.id,
        debtName: debt.name,
        payment: minPayment,
        principal,
        interest: interestCharge,
        remainingBalance: Math.max(0, debt.remainingBalance),
      });

      monthTotalPayment += minPayment;
      monthTotalPrincipal += principal;
      monthTotalInterest += interestCharge;
    }

    // Apply extra payment to highest priority debt with balance
    if (remainingBudget > 0) {
      for (const debt of sortedDebts) {
        if (debt.remainingBalance > 0) {
          const extraPayment = Math.min(remainingBudget, debt.remainingBalance);
          debt.remainingBalance -= extraPayment;

          // Update the allocation for this debt
          const allocation = debtAllocations.find(a => a.debtId === debt.id);
          if (allocation) {
            allocation.payment += extraPayment;
            allocation.principal += extraPayment;
            allocation.remainingBalance = Math.max(0, debt.remainingBalance);
          }

          monthTotalPayment += extraPayment;
          monthTotalPrincipal += extraPayment;
          remainingBudget -= extraPayment;
          break;
        }
      }
    }

    const totalRemainingBalance = sortedDebts.reduce((sum, d) => sum + Math.max(0, d.remainingBalance), 0);

    monthlyBreakdown.push({
      month: currentMonth,
      date: currentDate.toISOString().split('T')[0],
      payment: monthTotalPayment,
      principal: monthTotalPrincipal,
      interest: monthTotalInterest,
      remainingBalance: totalRemainingBalance,
      debtAllocations,
    });

    // Safety check to prevent infinite loops
    if (currentMonth > 600) { // 50 years max
      break;
    }
  }

  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + currentMonth);

  return {
    strategy,
    monthlyPayment: monthlyBudget,
    totalMonths: currentMonth,
    totalInterestPaid,
    payoffDate: payoffDate.toISOString().split('T')[0],
    monthlyBreakdown,
  };
};

export const validateMinimumPayment = (balance: number, apr: number, minimumPayment: number): boolean => {
  // Minimum payment should cover at least the monthly interest
  const monthlyInterestRate = apr / 100 / 12;
  const monthlyInterest = balance * monthlyInterestRate;
  
  // Minimum payment should be at least the interest plus 1% of balance
  const expectedMinimum = monthlyInterest + (balance * 0.01);
  
  // Allow some tolerance (within 20% of expected)
  return minimumPayment >= expectedMinimum * 0.8;
};

export const calculateTotalMinimumPayment = (debts: DebtTradeline[]): number => {
  return debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};