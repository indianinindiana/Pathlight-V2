import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  DebtTradeline,
  FinancialContext,
  PayoffProjection,
  WhatIfScenario,
  ProductRecommendation,
  DebtSummary,
} from '@/types/debt';

interface DebtContextType {
  // Financial Context
  financialContext: FinancialContext | null;
  setFinancialContext: (context: FinancialContext) => void;
  
  // Debt Tradelines
  debts: DebtTradeline[];
  addDebt: (debt: DebtTradeline) => void;
  updateDebt: (id: string, debt: Partial<DebtTradeline>) => void;
  deleteDebt: (id: string) => void;
  clearDebts: () => void;
  
  // Payoff Projections
  baseProjection: PayoffProjection | null;
  setBaseProjection: (projection: PayoffProjection) => void;
  
  // What-If Scenarios
  whatIfScenarios: WhatIfScenario[];
  addWhatIfScenario: (scenario: WhatIfScenario) => void;
  removeWhatIfScenario: (id: string) => void;
  clearWhatIfScenarios: () => void;
  
  // Recommendations
  recommendations: ProductRecommendation[];
  setRecommendations: (recommendations: ProductRecommendation[]) => void;
  dismissRecommendation: (id: string) => void;
  
  // Summary
  debtSummary: DebtSummary | null;
  
  // Session Management
  clearSession: () => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
}

const DebtContext = createContext<DebtContextType | undefined>(undefined);

export const useDebt = () => {
  const context = useContext(DebtContext);
  if (!context) {
    throw new Error('useDebt must be used within DebtProvider');
  }
  return context;
};

interface DebtProviderProps {
  children: ReactNode;
}

export const DebtProvider: React.FC<DebtProviderProps> = ({ children }) => {
  const [financialContext, setFinancialContextState] = useState<FinancialContext | null>(null);
  const [debts, setDebts] = useState<DebtTradeline[]>([]);
  const [baseProjection, setBaseProjectionState] = useState<PayoffProjection | null>(null);
  const [whatIfScenarios, setWhatIfScenarios] = useState<WhatIfScenario[]>([]);
  const [recommendations, setRecommendationsState] = useState<ProductRecommendation[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);
  const [debtSummary, setDebtSummary] = useState<DebtSummary | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('debtPathfinderSession');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFinancialContextState(parsed.financialContext || null);
        setDebts(parsed.debts || []);
        setBaseProjectionState(parsed.baseProjection || null);
        setWhatIfScenarios(parsed.whatIfScenarios || []);
        setRecommendationsState(parsed.recommendations || []);
        setHasCompletedOnboardingState(parsed.hasCompletedOnboarding || false);
      } catch (error) {
        console.error('Error loading session data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const sessionData = {
      financialContext,
      debts,
      baseProjection,
      whatIfScenarios,
      recommendations,
      hasCompletedOnboarding,
    };
    localStorage.setItem('debtPathfinderSession', JSON.stringify(sessionData));
  }, [financialContext, debts, baseProjection, whatIfScenarios, recommendations, hasCompletedOnboarding]);

  // Calculate debt summary whenever debts or financial context changes
  useEffect(() => {
    if (debts.length === 0) {
      setDebtSummary(null);
      return;
    }

    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const numberOfAccounts = debts.length;
    
    // Calculate weighted APR
    const weightedAPR = debts.reduce((sum, debt) => {
      return sum + (debt.apr * debt.balance);
    }, 0) / totalDebt;

    // Calculate debt composition
    const compositionMap = new Map<string, number>();
    debts.forEach(debt => {
      const current = compositionMap.get(debt.type) || 0;
      compositionMap.set(debt.type, current + debt.balance);
    });

    const debtComposition = Array.from(compositionMap.entries()).map(([type, amount]) => ({
      type: type as any,
      amount,
      percentage: (amount / totalDebt) * 100,
    }));

    // Calculate DTI if we have financial context
    const debtToIncomeRatio = financialContext 
      ? (debts.reduce((sum, debt) => sum + debt.minimumPayment, 0) / financialContext.monthlyIncome) * 100
      : 0;

    // Utilization rate (simplified - would need credit limits for accurate calculation)
    const utilizationRate = 0; // Placeholder

    setDebtSummary({
      totalDebt,
      numberOfAccounts,
      weightedAPR,
      utilizationRate,
      debtToIncomeRatio,
      debtComposition,
    });
  }, [debts, financialContext]);

  const setFinancialContext = (context: FinancialContext) => {
    setFinancialContextState(context);
  };

  const addDebt = (debt: DebtTradeline) => {
    setDebts(prev => [...prev, debt]);
  };

  const updateDebt = (id: string, updates: Partial<DebtTradeline>) => {
    setDebts(prev => prev.map(debt => 
      debt.id === id ? { ...debt, ...updates } : debt
    ));
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(debt => debt.id !== id));
  };

  const clearDebts = () => {
    setDebts([]);
  };

  const setBaseProjection = (projection: PayoffProjection) => {
    setBaseProjectionState(projection);
  };

  const addWhatIfScenario = (scenario: WhatIfScenario) => {
    setWhatIfScenarios(prev => [...prev, scenario]);
  };

  const removeWhatIfScenario = (id: string) => {
    setWhatIfScenarios(prev => prev.filter(s => s.id !== id));
  };

  const clearWhatIfScenarios = () => {
    setWhatIfScenarios([]);
  };

  const setRecommendations = (recs: ProductRecommendation[]) => {
    setRecommendationsState(recs);
  };

  const dismissRecommendation = (id: string) => {
    setRecommendationsState(prev => prev.filter(r => r.id !== id));
  };

  const clearSession = () => {
    setFinancialContextState(null);
    setDebts([]);
    setBaseProjectionState(null);
    setWhatIfScenarios([]);
    setRecommendationsState([]);
    setHasCompletedOnboardingState(false);
    localStorage.removeItem('debtPathfinderSession');
  };

  const setHasCompletedOnboarding = (completed: boolean) => {
    setHasCompletedOnboardingState(completed);
  };

  return (
    <DebtContext.Provider
      value={{
        financialContext,
        setFinancialContext,
        debts,
        addDebt,
        updateDebt,
        deleteDebt,
        clearDebts,
        baseProjection,
        setBaseProjection,
        whatIfScenarios,
        addWhatIfScenario,
        removeWhatIfScenario,
        clearWhatIfScenarios,
        recommendations,
        setRecommendations,
        dismissRecommendation,
        debtSummary,
        clearSession,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
      }}
    >
      {children}
    </DebtContext.Provider>
  );
};