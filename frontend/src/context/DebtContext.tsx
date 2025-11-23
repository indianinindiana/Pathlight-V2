import React, { createContext, useContext, useState, useEffect } from 'react';
import { Debt, FinancialContext, PayoffScenario, WhatIfScenario, ProductRecommendation, AIGuidance } from '@/types/debt';

interface DebtContextType {
  // Financial Context
  financialContext: FinancialContext | null;
  setFinancialContext: (context: FinancialContext) => void;
  
  // Debts
  debts: Debt[];
  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  setDebts: (debts: Debt[]) => void;
  
  // Scenarios
  scenarios: PayoffScenario[];
  addScenario: (scenario: PayoffScenario) => void;
  removeScenario: (id: string) => void;
  
  // What If Scenarios
  whatIfScenarios: WhatIfScenario[];
  addWhatIfScenario: (scenario: WhatIfScenario) => void;
  removeWhatIfScenario: (id: string) => void;
  
  // Recommendations
  recommendations: ProductRecommendation[];
  setRecommendations: (recommendations: ProductRecommendation[]) => void;
  
  // AI Guidance
  aiGuidance: AIGuidance[];
  addAIGuidance: (guidance: AIGuidance) => void;
  
  // Session State
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  calibrationComplete: boolean;
  setCalibrationComplete: (complete: boolean) => void;
  profileId: string | null;
  setProfileId: (id: string | null) => void;
  
  // Utility
  clearSession: () => void;
}

const DebtContext = createContext<DebtContextType | undefined>(undefined);

export const DebtProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [financialContext, setFinancialContextState] = useState<FinancialContext | null>(null);
  const [debts, setDebtsState] = useState<Debt[]>([]);
  const [scenarios, setScenariosState] = useState<PayoffScenario[]>([]);
  const [whatIfScenarios, setWhatIfScenariosState] = useState<WhatIfScenario[]>([]);
  const [recommendations, setRecommendationsState] = useState<ProductRecommendation[]>([]);
  const [aiGuidance, setAIGuidanceState] = useState<AIGuidance[]>([]);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [calibrationComplete, setCalibrationCompleteState] = useState(false);
  const [profileId, setProfileIdState] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('debtPathfinderSession');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.financialContext) setFinancialContextState(data.financialContext);
        if (data.debts) setDebtsState(data.debts.map((d: any) => ({
          ...d,
          nextPaymentDate: new Date(d.nextPaymentDate)
        })));
        if (data.onboardingComplete) setOnboardingCompleteState(data.onboardingComplete);
        if (data.profileId) setProfileIdState(data.profileId);
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    const data = {
      financialContext,
      debts,
      onboardingComplete,
      calibrationComplete,
      profileId
    };
    localStorage.setItem('debtPathfinderSession', JSON.stringify(data));
  }, [financialContext, debts, onboardingComplete, calibrationComplete, profileId]);

  const setFinancialContext = (context: FinancialContext) => {
    setFinancialContextState(context);
  };

  const addDebt = (debt: Debt) => {
    setDebtsState(prev => [...prev, debt]);
  };

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    setDebtsState(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDebt = (id: string) => {
    setDebtsState(prev => prev.filter(d => d.id !== id));
  };

  const setDebts = (debts: Debt[]) => {
    setDebtsState(debts);
  };

  const addScenario = (scenario: PayoffScenario) => {
    setScenariosState(prev => [...prev, scenario]);
  };

  const removeScenario = (id: string) => {
    setScenariosState(prev => prev.filter(s => s.id !== id));
  };

  const addWhatIfScenario = (scenario: WhatIfScenario) => {
    setWhatIfScenariosState(prev => [...prev, scenario]);
  };

  const removeWhatIfScenario = (id: string) => {
    setWhatIfScenariosState(prev => prev.filter(s => s.id !== id));
  };

  const setRecommendations = (recommendations: ProductRecommendation[]) => {
    setRecommendationsState(recommendations);
  };

  const addAIGuidance = (guidance: AIGuidance) => {
    setAIGuidanceState(prev => [...prev, guidance]);
  };

  const setOnboardingComplete = (complete: boolean) => {
    setOnboardingCompleteState(complete);
  };

  const setCalibrationComplete = (complete: boolean) => {
    setCalibrationCompleteState(complete);
  };

  const setProfileId = (id: string | null) => {
    setProfileIdState(id);
  };

  const clearSession = () => {
    setFinancialContextState(null);
    setDebtsState([]);
    setScenariosState([]);
    setWhatIfScenariosState([]);
    setRecommendationsState([]);
    setAIGuidanceState([]);
    setOnboardingCompleteState(false);
    setCalibrationCompleteState(false);
    setProfileIdState(null);
    localStorage.removeItem('debtPathfinderSession');
  };

  return (
    <DebtContext.Provider value={{
      financialContext,
      setFinancialContext,
      debts,
      addDebt,
      updateDebt,
      deleteDebt,
      setDebts,
      scenarios,
      addScenario,
      removeScenario,
      whatIfScenarios,
      addWhatIfScenario,
      removeWhatIfScenario,
      recommendations,
      setRecommendations,
      aiGuidance,
      addAIGuidance,
      onboardingComplete,
      setOnboardingComplete,
      calibrationComplete,
      setCalibrationComplete,
      profileId,
      setProfileId,
      clearSession
    }}>
      {children}
    </DebtContext.Provider>
  );
};

export const useDebt = () => {
  const context = useContext(DebtContext);
  if (!context) {
    throw new Error('useDebt must be used within DebtProvider');
  }
  return context;
};