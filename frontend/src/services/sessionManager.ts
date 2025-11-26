/**
 * Session Manager
 * Handles user_id generation, storage, and profile_id management for progressive onboarding
 */

const SESSION_STORAGE_KEY = 'debtPathfinderSession';
const USER_ID_KEY = 'userId';
const PROFILE_ID_KEY = 'profileId';

export interface SessionData {
  userId: string;
  profileId?: string;
  createdAt: string;
  lastUpdated: string;
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create user_id (session identifier)
 * This is generated on first visit and persists across sessions
 */
export function getUserId(): string {
  try {
    const sessionData = getSessionData();
    
    if (sessionData?.userId) {
      return sessionData.userId;
    }
    
    // Generate new user_id
    const newUserId = generateUUID();
    const newSessionData: SessionData = {
      userId: newUserId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSessionData));
    return newUserId;
  } catch (error) {
    console.error('Error getting/creating user_id:', error);
    // Fallback to generating a new UUID if localStorage fails
    return generateUUID();
  }
}

/**
 * Get the current profile_id (database primary key)
 */
export function getProfileId(): string | null {
  try {
    const sessionData = getSessionData();
    return sessionData?.profileId || null;
  } catch (error) {
    console.error('Error getting profile_id:', error);
    return null;
  }
}

/**
 * Set the profile_id after creating a profile
 */
export function setProfileId(profileId: string): void {
  try {
    const sessionData = getSessionData() || {
      userId: getUserId(),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    sessionData.profileId = profileId;
    sessionData.lastUpdated = new Date().toISOString();
    
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Error setting profile_id:', error);
  }
}

/**
 * Get all session data
 */
export function getSessionData(): SessionData | null {
  try {
    const data = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!data) return null;
    
    return JSON.parse(data) as SessionData;
  } catch (error) {
    console.error('Error parsing session data:', error);
    return null;
  }
}

/**
 * Clear session data (logout/reset)
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Check if user has an active session with a profile
 */
export function hasActiveProfile(): boolean {
  const sessionData = getSessionData();
  return !!(sessionData?.userId && sessionData?.profileId);
}

/**
 * Update session timestamp
 */
export function updateSessionTimestamp(): void {
  try {
    const sessionData = getSessionData();
    if (sessionData) {
      sessionData.lastUpdated = new Date().toISOString();
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    }
  } catch (error) {
    console.error('Error updating session timestamp:', error);
  }
}

/**
 * Get or create a session ID for analytics tracking
 * This is separate from userId and is used for tracking user sessions
 */
export function getSessionId(): string {
  const SESSION_ID_KEY = 'sessionId';
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  
  try {
    const stored = sessionStorage.getItem(SESSION_ID_KEY);
    if (stored) {
      const { id, timestamp } = JSON.parse(stored);
      const now = Date.now();
      
      // Check if session is still valid
      if (now - timestamp < SESSION_DURATION) {
        return id;
      }
    }
    
    // Create new session
    const newSessionId = generateUUID();
    sessionStorage.setItem(SESSION_ID_KEY, JSON.stringify({
      id: newSessionId,
      timestamp: Date.now()
    }));
    
    return newSessionId;
  } catch (error) {
    console.error('Error managing session ID:', error);
    return generateUUID();
  }
}