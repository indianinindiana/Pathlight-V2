/**
 * Clara AI Service API
 * Handles all interactions with the AI Services API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ============================================================================
// Types
// ============================================================================

export interface AIInsightsRequest {
  profile_id: string;
  include_recommendations?: boolean;
  focus_areas?: string[];
}

export interface AIInsightsResponse {
  schema_version: string;
  request_id: string;
  timestamp: string;
  response: {
    summary: string;
    insights: string[];
    opportunities?: string[];
    risks?: string[];
    next_actions: string[];
  };
}

export interface AIQuestionRequest {
  profile_id: string;
  question: string;
  context?: Record<string, any>;
}

export interface AIQuestionResponse {
  schema_version: string;
  request_id: string;
  timestamp: string;
  response: {
    answer: string;
    context?: string;
    next_steps?: string[];
    related_topics?: string[];
    confidence?: 'high' | 'medium' | 'low';
  };
}

export interface AIStrategyComparisonRequest {
  profile_id: string;
  snowball_data: {
    total_months: number;
    total_interest: number;
    first_debt_paid: string;
  };
  avalanche_data: {
    total_months: number;
    total_interest: number;
    first_debt_paid: string;
  };
}

export interface AIStrategyComparisonResponse {
  schema_version: string;
  request_id: string;
  timestamp: string;
  response: {
    recommended_strategy: 'snowball' | 'avalanche';
    reasoning: string;
    trade_offs: string;
    confidence: 'high' | 'medium' | 'low';
  };
}

export interface AIOnboardingRequest {
  session_id: string;
  step?: string;
  user_input?: string;
  collected_data?: Record<string, any>;
}

export interface AIOnboardingResponse {
  schema_version: string;
  request_id: string;
  timestamp: string;
  response: {
    message: string;
    next_question?: string;
    help_text?: string;
    options?: Array<{
      value: string;
      label: string;
    }>;
    is_complete?: boolean;
  };
}

export interface AIOnboardingReactionRequest {
  session_id: string;
  step_id: string;
  user_answers: Record<string, any>;
  is_resume?: boolean;
}

export interface AIOnboardingReactionResponse {
  schema_version: string;
  request_id: string;
  timestamp: string;
  clara_message: string;
  validation_error: string | null;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get AI-powered insights about user's debt portfolio
 */
export async function getAIInsights(
  request: AIInsightsRequest
): Promise<AIInsightsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/insights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      detail: 'Failed to generate insights' 
    }));
    throw new Error(error.detail || 'Failed to generate insights');
  }

  return response.json();
}

/**
 * Ask Clara a question about debt management
 */
export async function askClara(
  request: AIQuestionRequest
): Promise<AIQuestionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      detail: 'Failed to get answer' 
    }));
    throw new Error(error.detail || 'Failed to get answer');
  }

  return response.json();
}

/**
 * Compare debt payoff strategies with AI recommendation
 */
export async function compareStrategies(
  request: AIStrategyComparisonRequest
): Promise<AIStrategyComparisonResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/compare-strategies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      detail: 'Failed to compare strategies' 
    }));
    throw new Error(error.detail || 'Failed to compare strategies');
  }

  return response.json();
}

/**
 * Conversational onboarding with Clara
 */
export async function claraOnboarding(
  request: AIOnboardingRequest
): Promise<AIOnboardingResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      detail: 'Failed to get onboarding message' 
    }));
    throw new Error(error.detail || 'Failed to get onboarding message');
  }

  return response.json();
}

/**
 * Get Clara's empathetic reaction to user's onboarding answer
 */
export async function getOnboardingReaction(
  request: AIOnboardingReactionRequest
): Promise<AIOnboardingReactionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/onboarding-reaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: 'Failed to get Clara reaction'
    }));
    throw new Error(error.detail || 'Failed to get Clara reaction');
  }

  return response.json();
}

/**
 * Check AI services health
 */
export async function checkAIHealth(): Promise<{
  status: string;
  provider: string;
  config_loaded: boolean;
  api_key_configured: boolean;
}> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('AI services health check failed');
  }

  return response.json();
}