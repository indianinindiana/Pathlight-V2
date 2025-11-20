import { useState, useEffect } from 'react';
import { mockApiService } from '@/services/mockApi';
import { useDebt } from '@/context/DebtContext';

export const usePersonalization = () => {
  const { debts, financialContext } = useDebt();
  const [alerts, setAlerts] = useState<Array<{
    type: 'warning' | 'info' | 'success';
    message: string;
    condition: boolean;
  }>>([]);
  const [hints, setHints] = useState<Array<{
    location: string;
    message: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!financialContext) return;

    const fetchPersonalization = async () => {
      setIsLoading(true);
      try {
        const cashFlow = financialContext.monthlyIncome - financialContext.monthlyExpenses;
        const result = await mockApiService.getPersonalizedMicrocopy({
          stressLevel: financialContext.stressLevel,
          cashFlow,
          debtCount: debts.length,
          goal: financialContext.primaryGoal
        });
        setAlerts(result.alerts);
        setHints(result.hints);
      } catch (error) {
        console.error('Failed to fetch personalization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalization();
  }, [debts, financialContext]);

  return { alerts, hints, isLoading };
};

export const useNextBestActions = () => {
  const { debts, financialContext } = useDebt();
  const [actions, setActions] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (debts.length === 0) return;

    const fetchActions = async () => {
      setIsLoading(true);
      try {
        const cashFlow = financialContext 
          ? financialContext.monthlyIncome - financialContext.monthlyExpenses
          : 0;
        
        const result = await mockApiService.getNextBestActions({
          debts,
          financialContext,
          cashFlow
        });
        setActions(result);
      } catch (error) {
        console.error('Failed to fetch next best actions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActions();
  }, [debts, financialContext]);

  return { actions, isLoading };
};

export const useRecommendations = () => {
  const { debts, financialContext } = useDebt();
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (debts.length === 0) return;

    const fetchRecommendation = async () => {
      setIsLoading(true);
      try {
        const result = await mockApiService.getRecommendations({
          debts,
          financialContext
        });
        setRecommendation(result);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendation();
  }, [debts, financialContext]);

  return { recommendation, isLoading };
};

export const useConfidenceScore = () => {
  const { debts, financialContext } = useDebt();
  const [confidence, setConfidence] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchConfidence = async () => {
      setIsLoading(true);
      try {
        const result = await mockApiService.getConfidenceScore({
          debts,
          financialContext
        });
        setConfidence(result);
      } catch (error) {
        console.error('Failed to fetch confidence score:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfidence();
  }, [debts, financialContext]);

  return { confidence, isLoading };
};

export const useAIInsights = (scenarios: any[]) => {
  const { debts, financialContext } = useDebt();
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (debts.length === 0) return;

    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        const result = await mockApiService.getAIInsights({
          debts,
          financialContext,
          scenarios
        });
        setInsights(result);
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [debts, financialContext, scenarios]);

  return { insights, isLoading };
};