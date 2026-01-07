import React, { createContext, useContext, useState, useEffect } from 'react';
import { Debt, FinancialContext, PayoffScenario, WhatIfScenario, ProductRecommendation, AIGuidance } from '@/types/debt';
import * as debtApi from '@/services/debtApi';
import { getProfileId, getSessionId, setProfileId as saveProfileId } from '@/services/sessionManager';
import { showSuccess, showError } from '@/utils/toast';
import { trackEvent, checkMilestones } from '@/services/analyticsApi';

// User Journey State Type
export type UserJourneyState =
  | 'new'                    // Anonymous/new user, no debts
  | 'debt_entry_started'     // Onboarding complete, debts being entered
  | 'snapshot_generated';    // Debts entered, snapshot available

interface DebtContextType {
  // Financial Context
  financialContext: FinancialContext | null;
  setFinancialContext: (context: FinancialContext) => void;
  
  // Debts
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
  updateDebt: (id: string, debt: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  setDebts: (debts: Debt[]) => void;
  loadDebts: () => Promise<void>;
  isLoadingDebts: boolean;
  
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
  
  // Journey State
  journeyState: UserJourneyState;
  setJourneyState: (state: UserJourneyState) => void;
  
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
  const [isLoadingDebts, setIsLoadingDebts] = useState(false);
  
  // Journey State with localStorage persistence
  const [journeyState, setJourneyStateInternal] = useState<UserJourneyState>(() => {
    const saved = localStorage.getItem('journey_state');
    return (saved as UserJourneyState) || 'new';
  });
  
  // Wrapper to persist to localStorage
  const setJourneyState = (state: UserJourneyState) => {
    setJourneyStateInternal(state);
    localStorage.setItem('journey_state', state);
  };

  // Load debts from backend when profile is available
  const loadDebts = async () => {
    const currentProfileId = getProfileId();
    if (!currentProfileId) {
      console.log('No profile ID available, skipping debt load');
      return;
    }

    setIsLoadingDebts(true);
    try {
      const fetchedDebts = await debtApi.getDebts(currentProfileId);
      // Convert backend response to frontend Debt type
      const convertedDebts: Debt[] = fetchedDebts.map((d) => ({
        id: d.id,
        type: d.type as any,
        name: d.name,
        balance: d.balance,
        apr: d.apr,
        minimumPayment: d.minimum_payment,
        nextPaymentDate: new Date(d.next_payment_date),
        isDelinquent: d.is_delinquent,
        lenderName: d.lender_name,
        aprType: d.apr_type as any,
        paymentType: d.payment_type as any,
        actualMonthlyPayment: d.actual_monthly_payment,
        creditLimit: d.credit_limit,
        lateFees: d.late_fees,
        originalPrincipal: d.original_principal,
        termMonths: d.term_months,
        originationDate: d.origination_date ? new Date(d.origination_date) : undefined,
        remainingMonths: d.remaining_months,
        loanProgram: d.loan_program as any,
        escrowIncluded: d.escrow_included,
        propertyTax: d.property_tax,
        homeInsurance: d.home_insurance
      }));
      setDebtsState(convertedDebts);
    } catch (error) {
      console.error('Failed to load debts:', error);
      showError('Failed to load debts from server');
    } finally {
      setIsLoadingDebts(false);
    }
  };

  // Load from localStorage on mount and load debts from backend
  // Also check for profileId in URL parameters
  useEffect(() => {
    // Check for profile ID in URL first
    const urlParams = new URLSearchParams(window.location.search);
    const urlProfileId = urlParams.get('profileId') || urlParams.get('profile_id');
    
    if (urlProfileId) {
      // Load profile from URL parameter
      console.log('Loading profile from URL:', urlProfileId);
      setProfileIdState(urlProfileId);
      
      // Save to sessionManager
      saveProfileId(urlProfileId);
      
      // Save to localStorage
      const data = {
        profileId: urlProfileId,
        onboardingComplete: true,
        calibrationComplete: true
      };
      localStorage.setItem('debtPathfinderSession', JSON.stringify(data));
      
      // Clear URL parameter after loading (optional - keeps URL clean)
      window.history.replaceState({}, '', window.location.pathname);
      
      // Load debts for this profile
      setTimeout(() => loadDebts(), 100);
    } else {
      // Load from localStorage
      const saved = localStorage.getItem('debtPathfinderSession');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.financialContext) setFinancialContextState(data.financialContext);
          if (data.onboardingComplete) setOnboardingCompleteState(data.onboardingComplete);
          if (data.profileId) setProfileIdState(data.profileId);
        } catch (e) {
          console.error('Failed to load session:', e);
        }
      }

      // Load debts from backend if profile exists
      loadDebts();
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
  
  // Update journey state based on debts
  useEffect(() => {
    if (debts.length > 0 && journeyState === 'debt_entry_started') {
      setJourneyState('snapshot_generated');
    }
  }, [debts.length, journeyState]);

  const setFinancialContext = (context: FinancialContext) => {
    setFinancialContextState(context);
  };

  const addDebt = async (debt: Omit<Debt, 'id'>) => {
    const currentProfileId = getProfileId();
    if (!currentProfileId) {
      showError('No profile found. Please complete onboarding first.');
      return;
    }

    try {
      // Convert frontend Debt type to backend API format
      const debtData: debtApi.DebtCreateRequest = {
        profile_id: currentProfileId,
        type: debt.type as any,
        name: debt.name,
        balance: debt.balance,
        apr: debt.apr,
        minimum_payment: debt.minimumPayment,
        next_payment_date: debt.nextPaymentDate.toISOString().split('T')[0],
        is_delinquent: debt.isDelinquent,
        lender_name: debt.lenderName,
        apr_type: debt.aprType as any,
        payment_type: debt.paymentType as any,
        actual_monthly_payment: debt.actualMonthlyPayment,
        credit_limit: debt.creditLimit,
        late_fees: debt.lateFees,
        original_principal: debt.originalPrincipal,
        term_months: debt.termMonths,
        origination_date: debt.originationDate?.toISOString().split('T')[0],
        remaining_months: debt.remainingMonths,
        loan_program: debt.loanProgram as any,
        escrow_included: debt.escrowIncluded,
        property_tax: debt.propertyTax,
        home_insurance: debt.homeInsurance
      };

      const createdDebt = await debtApi.createDebt(debtData);
      
      // Convert response back to frontend format
      const newDebt: Debt = {
        id: createdDebt.id,
        type: createdDebt.type as any,
        name: createdDebt.name,
        balance: createdDebt.balance,
        apr: createdDebt.apr,
        minimumPayment: createdDebt.minimum_payment,
        nextPaymentDate: new Date(createdDebt.next_payment_date),
        isDelinquent: createdDebt.is_delinquent,
        lenderName: createdDebt.lender_name,
        aprType: createdDebt.apr_type as any,
        paymentType: createdDebt.payment_type as any,
        actualMonthlyPayment: createdDebt.actual_monthly_payment,
        creditLimit: createdDebt.credit_limit,
        lateFees: createdDebt.late_fees,
        originalPrincipal: createdDebt.original_principal,
        termMonths: createdDebt.term_months,
        originationDate: createdDebt.origination_date ? new Date(createdDebt.origination_date) : undefined,
        remainingMonths: createdDebt.remaining_months,
        loanProgram: createdDebt.loan_program as any,
        escrowIncluded: createdDebt.escrow_included,
        propertyTax: createdDebt.property_tax,
        homeInsurance: createdDebt.home_insurance
      };

      setDebtsState(prev => [...prev, newDebt]);
      showSuccess('Debt added successfully');
      
      // Track analytics event
      if (currentProfileId) {
        trackEvent({
          profile_id: currentProfileId,
          event_type: 'debt_added',
          event_data: {
            debt_type: newDebt.type,
            balance: newDebt.balance,
            apr: newDebt.apr,
          },
          session_id: getSessionId(),
        });
        
        // Check for milestones
        checkMilestones({
          profile_id: currentProfileId,
          trigger_event: 'debt_added',
        });
      }
    } catch (error) {
      console.error('Failed to add debt:', error);
      showError(error instanceof Error ? error.message : 'Failed to add debt');
      throw error;
    }
  };

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    try {
      // Convert frontend updates to backend format
      const updateData: debtApi.DebtUpdateRequest = {};
      if (updates.type) updateData.type = updates.type as any;
      if (updates.name) updateData.name = updates.name;
      if (updates.balance !== undefined) updateData.balance = updates.balance;
      if (updates.apr !== undefined) updateData.apr = updates.apr;
      if (updates.minimumPayment !== undefined) updateData.minimum_payment = updates.minimumPayment;
      if (updates.nextPaymentDate) updateData.next_payment_date = updates.nextPaymentDate.toISOString().split('T')[0];
      if (updates.isDelinquent !== undefined) updateData.is_delinquent = updates.isDelinquent;
      if (updates.lenderName) updateData.lender_name = updates.lenderName;
      if (updates.aprType) updateData.apr_type = updates.aprType as any;
      if (updates.paymentType) updateData.payment_type = updates.paymentType as any;
      if (updates.actualMonthlyPayment !== undefined) updateData.actual_monthly_payment = updates.actualMonthlyPayment;
      if (updates.creditLimit !== undefined) updateData.credit_limit = updates.creditLimit;
      if (updates.lateFees !== undefined) updateData.late_fees = updates.lateFees;
      if (updates.originalPrincipal !== undefined) updateData.original_principal = updates.originalPrincipal;
      if (updates.termMonths !== undefined) updateData.term_months = updates.termMonths;
      if (updates.originationDate) updateData.origination_date = updates.originationDate.toISOString().split('T')[0];
      if (updates.remainingMonths !== undefined) updateData.remaining_months = updates.remainingMonths;
      if (updates.loanProgram) updateData.loan_program = updates.loanProgram as any;
      if (updates.escrowIncluded !== undefined) updateData.escrow_included = updates.escrowIncluded;
      if (updates.propertyTax !== undefined) updateData.property_tax = updates.propertyTax;
      if (updates.homeInsurance !== undefined) updateData.home_insurance = updates.homeInsurance;

      const updatedDebt = await debtApi.updateDebt(id, updateData);
      
      // Convert response back to frontend format
      const convertedDebt: Debt = {
        id: updatedDebt.id,
        type: updatedDebt.type as any,
        name: updatedDebt.name,
        balance: updatedDebt.balance,
        apr: updatedDebt.apr,
        minimumPayment: updatedDebt.minimum_payment,
        nextPaymentDate: new Date(updatedDebt.next_payment_date),
        isDelinquent: updatedDebt.is_delinquent,
        lenderName: updatedDebt.lender_name,
        aprType: updatedDebt.apr_type as any,
        paymentType: updatedDebt.payment_type as any,
        actualMonthlyPayment: updatedDebt.actual_monthly_payment,
        creditLimit: updatedDebt.credit_limit,
        lateFees: updatedDebt.late_fees,
        originalPrincipal: updatedDebt.original_principal,
        termMonths: updatedDebt.term_months,
        originationDate: updatedDebt.origination_date ? new Date(updatedDebt.origination_date) : undefined,
        remainingMonths: updatedDebt.remaining_months,
        loanProgram: updatedDebt.loan_program as any,
        escrowIncluded: updatedDebt.escrow_included,
        propertyTax: updatedDebt.property_tax,
        homeInsurance: updatedDebt.home_insurance
      };

      setDebtsState(prev => prev.map(d => d.id === id ? convertedDebt : d));
      showSuccess('Debt updated successfully');
      
      // Track analytics event
      const currentProfileId = getProfileId();
      if (currentProfileId) {
        trackEvent({
          profile_id: currentProfileId,
          event_type: 'debt_updated',
          event_data: {
            debt_id: id,
            updated_fields: Object.keys(updates),
          },
          session_id: getSessionId(),
        });
      }
    } catch (error) {
      console.error('Failed to update debt:', error);
      showError(error instanceof Error ? error.message : 'Failed to update debt');
      throw error;
    }
  };

  const deleteDebt = async (id: string) => {
    try {
      const deletedDebt = debts.find(d => d.id === id);
      await debtApi.deleteDebt(id);
      setDebtsState(prev => prev.filter(d => d.id !== id));
      showSuccess('Debt deleted successfully');
      
      // Track analytics event
      const currentProfileId = getProfileId();
      if (currentProfileId && deletedDebt) {
        trackEvent({
          profile_id: currentProfileId,
          event_type: 'debt_deleted',
          event_data: {
            debt_type: deletedDebt.type,
            balance: deletedDebt.balance,
          },
          session_id: getSessionId(),
        });
      }
    } catch (error) {
      console.error('Failed to delete debt:', error);
      showError(error instanceof Error ? error.message : 'Failed to delete debt');
      throw error;
    }
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
    setJourneyState('new');
    localStorage.removeItem('debtPathfinderSession');
    localStorage.removeItem('journey_state');
    
    // Clear legacy conversational storage
    sessionStorage.removeItem('onboarding_answers');
    sessionStorage.removeItem('onboarding_step');
    sessionStorage.removeItem('onboarding_timestamp');
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
      loadDebts,
      isLoadingDebts,
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
      journeyState,
      setJourneyState,
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