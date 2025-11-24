/**
 * Debt API Service
 * Handles all interactions with the Debt API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface DebtCreateRequest {
  profile_id: string;
  type: 'credit-card' | 'personal-loan' | 'student-loan' | 'auto-loan' | 'mortgage' | 'installment-loan';
  name: string;
  balance: number;
  apr: number;
  minimum_payment: number;
  next_payment_date: string; // ISO 8601 date string
  is_delinquent?: boolean;
  lender_name?: string;
  apr_type?: 'fixed' | 'variable';
  payment_type?: 'minimum' | 'fixed-amount' | 'full' | 'custom';
  actual_monthly_payment?: number;
  credit_limit?: number;
  late_fees?: number;
  original_principal?: number;
  term_months?: number;
  origination_date?: string;
  remaining_months?: number;
  loan_program?: 'federal' | 'private';
  escrow_included?: boolean;
  property_tax?: number;
  home_insurance?: number;
}

export interface DebtUpdateRequest {
  type?: 'credit-card' | 'personal-loan' | 'student-loan' | 'auto-loan' | 'mortgage' | 'installment-loan';
  name?: string;
  balance?: number;
  apr?: number;
  minimum_payment?: number;
  next_payment_date?: string;
  is_delinquent?: boolean;
  lender_name?: string;
  apr_type?: 'fixed' | 'variable';
  payment_type?: 'minimum' | 'fixed-amount' | 'full' | 'custom';
  actual_monthly_payment?: number;
  credit_limit?: number;
  late_fees?: number;
  original_principal?: number;
  term_months?: number;
  origination_date?: string;
  remaining_months?: number;
  loan_program?: 'federal' | 'private';
  escrow_included?: boolean;
  property_tax?: number;
  home_insurance?: number;
}

export interface DebtResponse {
  id: string;
  profile_id: string;
  type: string;
  name: string;
  balance: number;
  apr: number;
  minimum_payment: number;
  next_payment_date: string;
  is_delinquent: boolean;
  lender_name?: string;
  apr_type?: string;
  payment_type?: string;
  actual_monthly_payment?: number;
  credit_limit?: number;
  late_fees?: number;
  original_principal?: number;
  term_months?: number;
  origination_date?: string;
  remaining_months?: number;
  loan_program?: string;
  escrow_included?: boolean;
  property_tax?: number;
  home_insurance?: number;
  created_at: string;
  updated_at: string;
  // Calculated fields
  monthly_interest?: number;
  suggested_minimum_payment?: number;
  principal_portion?: number;
  months_to_payoff_at_minimum?: number;
  total_interest_at_minimum?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: Array<{
    type: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  suggestions: {
    monthly_interest?: number;
    suggested_minimum_payment?: number;
    principal_portion?: number;
    months_to_payoff?: number;
    years_to_payoff?: number;
    total_interest_paid?: number;
  };
}

export interface SuggestedPaymentResponse {
  balance: number;
  apr: number;
  monthly_interest: number;
  suggested_minimum_payment: number;
  principal_portion: number;
  reasoning: string;
}

export interface CSVImportResponse {
  success_count: number;
  error_count: number;
  total_rows: number;
  imported_debt_ids: string[];
  errors: Array<{
    row: number;
    error: string;
    data: Record<string, string>;
  }>;
  warnings?: Array<{
    type: string;
    message: string;
    debt_ids: string[];
  }>;
}

/**
 * Create a new debt
 */
export async function createDebt(data: DebtCreateRequest): Promise<DebtResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/debts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create debt' }));
    throw new Error(error.detail || 'Failed to create debt');
  }

  return response.json();
}

/**
 * Get all debts for a profile
 */
export async function getDebts(profileId: string): Promise<DebtResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/debts?profile_id=${profileId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch debts' }));
    throw new Error(error.detail || 'Failed to fetch debts');
  }

  return response.json();
}

/**
 * Get a single debt by ID
 */
export async function getDebt(debtId: string): Promise<DebtResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/debts/${debtId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch debt' }));
    throw new Error(error.detail || 'Failed to fetch debt');
  }

  return response.json();
}

/**
 * Update a debt (partial update)
 */
export async function updateDebt(
  debtId: string,
  updates: DebtUpdateRequest
): Promise<DebtResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/debts/${debtId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update debt' }));
    throw new Error(error.detail || 'Failed to update debt');
  }

  return response.json();
}

/**
 * Delete a debt
 */
export async function deleteDebt(debtId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/debts/${debtId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete debt' }));
    throw new Error(error.detail || 'Failed to delete debt');
  }
}

/**
 * Validate debt data without saving
 */
export async function validateDebt(debtData: {
  balance: number;
  apr: number;
  minimum_payment: number;
  type?: string;
  name?: string;
}): Promise<ValidationResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/debts/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(debtData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to validate debt' }));
    throw new Error(error.detail || 'Failed to validate debt');
  }

  return response.json();
}

/**
 * Get suggested minimum payment
 */
export async function getSuggestedMinimumPayment(
  balance: number,
  apr: number
): Promise<SuggestedPaymentResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/debts/suggest-minimum-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ balance, apr }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get suggestion' }));
    throw new Error(error.detail || 'Failed to get suggestion');
  }

  return response.json();
}

/**
 * Import debts from CSV file
 */
export async function importDebtsFromCSV(
  file: File,
  profileId: string
): Promise<CSVImportResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/debts/import?profile_id=${profileId}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to import CSV' }));
    throw new Error(error.detail || 'Failed to import CSV');
  }

  return response.json();
}

/**
 * Download CSV template
 */
export async function downloadCSVTemplate(): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/v1/debts/import/template`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to download template');
  }

  return response.blob();
}