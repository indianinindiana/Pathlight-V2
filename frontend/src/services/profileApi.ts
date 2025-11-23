/**
 * Profile API Service
 * Handles all interactions with the Profile API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ProfileCreateRequest {
  user_id: string;
  primary_goal: 'pay-faster' | 'lower-payment' | 'reduce-interest' | 'avoid-default';
}

export interface ProfileUpdateRequest {
  stress_level?: 1 | 2 | 3 | 4 | 5;
  financial_context?: {
    age_range?: '18-24' | '25-34' | '35-44' | '45-59' | '60+';
    employment_status?: 'full-time' | 'part-time' | 'self-employed' | 'unemployed' | 'retired' | 'student';
    monthly_income?: number;
    monthly_expenses?: number;
    liquid_savings?: number;
    credit_score_range?: '300-579' | '580-669' | '670-739' | '740-799' | '800-850';
    life_events?: Array<'income-increase' | 'income-decrease' | 'major-expense' | 'household-changes' | 'other-goals'>;
  };
}

export interface ProfileResponse {
  id: string;
  user_id: string;
  primary_goal: string;
  stress_level?: number;
  financial_context?: {
    age_range?: string;
    employment_status?: string;
    monthly_income?: number;
    monthly_expenses?: number;
    liquid_savings?: number;
    credit_score_range?: string;
    life_events?: string[];
  };
  created_at: string;
  updated_at: string;
}

/**
 * Create a new profile with minimal required fields
 */
export async function createProfile(data: ProfileCreateRequest): Promise<ProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create profile' }));
    throw new Error(error.detail || 'Failed to create profile');
  }

  return response.json();
}

/**
 * Get profile by user_id (for session recovery)
 */
export async function getProfileByUserId(userId: string): Promise<ProfileResponse | null> {
  const response = await fetch(`${API_BASE_URL}/api/v1/profiles/by-user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 404) {
    return null; // Profile doesn't exist yet
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch profile' }));
    throw new Error(error.detail || 'Failed to fetch profile');
  }

  return response.json();
}

/**
 * Get profile by profile_id (database primary key)
 */
export async function getProfileById(profileId: string): Promise<ProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/profiles/${profileId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch profile' }));
    throw new Error(error.detail || 'Failed to fetch profile');
  }

  return response.json();
}

/**
 * Update profile progressively (PATCH - only provided fields are updated)
 */
export async function updateProfile(
  profileId: string,
  updates: ProfileUpdateRequest
): Promise<ProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/profiles/${profileId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update profile' }));
    throw new Error(error.detail || 'Failed to update profile');
  }

  return response.json();
}

/**
 * Replace profile completely (PUT - full replacement)
 */
export async function replaceProfile(
  profileId: string,
  data: ProfileCreateRequest & ProfileUpdateRequest
): Promise<ProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/profiles/${profileId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to replace profile' }));
    throw new Error(error.detail || 'Failed to replace profile');
  }

  return response.json();
}