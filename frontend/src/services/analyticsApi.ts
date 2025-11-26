import { API_BASE_URL } from './debtApi';

export type EventType =
  | 'profile_created'
  | 'profile_updated'
  | 'debt_added'
  | 'debt_updated'
  | 'debt_deleted'
  | 'debt_paid_off'
  | 'scenario_created'
  | 'scenario_viewed'
  | 'what_if_analyzed'
  | 'strategy_compared'
  | 'ai_insight_requested'
  | 'ai_question_asked'
  | 'data_exported'
  | 'page_viewed';

export type MilestoneType =
  | 'first_debt_added'
  | 'first_scenario_created'
  | 'first_debt_paid_off'
  | 'halfway_to_debt_free'
  | 'debt_free'
  | 'balance_reduced_25'
  | 'balance_reduced_50'
  | 'balance_reduced_75'
  | 'total_interest_saved'
  | 'consistent_payments';

export interface TrackEventRequest {
  profile_id: string;
  event_type: EventType;
  event_data?: Record<string, any>;
  session_id?: string;
}

export interface TrackEventResponse {
  success: boolean;
  message: string;
  event_id: string;
  timestamp: string;
}

export interface EventSummary {
  profile_id: string;
  total_events: number;
  events_by_type: Record<string, number>;
  first_event: string;
  last_event: string;
  most_common_event: string;
}

export interface Milestone {
  milestone_id: string;
  profile_id: string;
  milestone_type: MilestoneType;
  title: string;
  description: string;
  achieved_at: string;
  celebration_shown: boolean;
  metadata?: Record<string, any>;
}

export interface CheckMilestonesRequest {
  profile_id: string;
  trigger_event?: EventType;
}

export interface CheckMilestonesResponse {
  success: boolean;
  message: string;
  new_milestones: Milestone[];
  total_milestones: number;
}

export interface MilestoneListResponse {
  milestones: Milestone[];
  total_count: number;
  unshown_count: number;
}

/**
 * Track a user event
 */
export async function trackEvent(request: TrackEventRequest): Promise<TrackEventResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to track event');
    }

    return response.json();
  } catch (error) {
    console.error('Error tracking event:', error);
    // Don't throw - analytics should fail silently
    return {
      success: false,
      message: 'Failed to track event',
      event_id: '',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get event summary for a profile
 */
export async function getEventSummary(profileId: string): Promise<EventSummary> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/events/${profileId}/summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get event summary');
  }

  return response.json();
}

/**
 * Check for new milestones
 */
export async function checkMilestones(
  request: CheckMilestonesRequest
): Promise<CheckMilestonesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/analytics/milestones/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to check milestones');
    }

    return response.json();
  } catch (error) {
    console.error('Error checking milestones:', error);
    return {
      success: false,
      message: 'Failed to check milestones',
      new_milestones: [],
      total_milestones: 0,
    };
  }
}

/**
 * Get all milestones for a profile
 */
export async function getMilestones(
  profileId: string,
  unshownOnly: boolean = false
): Promise<MilestoneListResponse> {
  const url = new URL(`${API_BASE_URL}/api/v1/analytics/milestones/${profileId}`);
  if (unshownOnly) {
    url.searchParams.append('unshown_only', 'true');
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get milestones');
  }

  return response.json();
}

/**
 * Mark milestone as shown to user
 */
export async function markMilestoneShown(milestoneId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/analytics/milestones/${milestoneId}/shown`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to mark milestone as shown');
  }
}

/**
 * Helper function to track page views
 */
export function trackPageView(profileId: string, pageName: string, sessionId?: string): void {
  trackEvent({
    profile_id: profileId,
    event_type: 'page_viewed',
    event_data: { page: pageName },
    session_id: sessionId,
  });
}