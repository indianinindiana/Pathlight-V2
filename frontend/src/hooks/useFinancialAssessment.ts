/**
 * useFinancialAssessment Hook
 * Custom hook for fetching and managing financial assessment data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  FinancialAssessmentResult,
  FinancialAssessmentRequest,
  FinancialAssessmentError,
  DebtInput,
  UserContext,
} from '../types/financialAssessment';

interface UseFinancialAssessmentOptions {
  profileId: string;
  debts: DebtInput[];
  userContext: UserContext;
  enabled?: boolean;
  debounceMs?: number;
}

interface UseFinancialAssessmentReturn {
  data: FinancialAssessmentResult | null;
  loading: boolean;
  error: FinancialAssessmentError | null;
  refetch: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useFinancialAssessment({
  profileId,
  debts,
  userContext,
  enabled = true,
  debounceMs = 2000,
}: UseFinancialAssessmentOptions): UseFinancialAssessmentReturn {
  const [data, setData] = useState<FinancialAssessmentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<FinancialAssessmentError | null>(null);
  const [lastFetchKey, setLastFetchKey] = useState<string>('');

  const fetchAssessment = useCallback(async () => {
    // Don't fetch if disabled or no debts
    if (!enabled || !debts || debts.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestBody: FinancialAssessmentRequest = {
        profile_id: profileId,
        debts,
        user_context: userContext,
      };

      const response = await fetch(
        `${API_BASE_URL}/personalization/financial-assessment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch financial assessment');
      }

      const result: FinancialAssessmentResult = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError({
        detail: errorMessage,
        error_code: 'FETCH_ERROR',
      });
      console.error('Error fetching financial assessment:', err);
    } finally {
      setLoading(false);
    }
  }, [profileId, debts, userContext, enabled]);

  // Debounced effect to fetch assessment
  useEffect(() => {
    if (!enabled || !debts || debts.length === 0) {
      return;
    }

    // Create a key from the current state to prevent unnecessary refetches
    const fetchKey = `${profileId}-${debts.length}-${JSON.stringify(debts.map(d => d.balance + d.apr))}`;
    
    // Only fetch if the key has changed
    if (fetchKey === lastFetchKey) {
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchAssessment();
      setLastFetchKey(fetchKey);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [profileId, debts, userContext, enabled, debounceMs, lastFetchKey]);

  return {
    data,
    loading,
    error,
    refetch: fetchAssessment,
  };
}

/**
 * Hook for fetching assessment with manual trigger
 */
export function useFinancialAssessmentLazy() {
  const [data, setData] = useState<FinancialAssessmentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<FinancialAssessmentError | null>(null);

  const fetchAssessment = useCallback(
    async (request: FinancialAssessmentRequest) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/personalization/financial-assessment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch financial assessment');
        }

        const result: FinancialAssessmentResult = await response.json();
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        const error: FinancialAssessmentError = {
          detail: errorMessage,
          error_code: 'FETCH_ERROR',
        };
        setError(error);
        console.error('Error fetching financial assessment:', err);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    loading,
    error,
    fetchAssessment,
  };
}