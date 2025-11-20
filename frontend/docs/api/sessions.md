# Sessions API

Manage user sessions and authentication tokens.

---

## Overview

The Sessions API provides endpoints for creating, retrieving, and deleting user sessions. Sessions are the primary authentication mechanism for the Debt PathFinder API.

**Base Path:** `/sessions`

---

## Endpoints

### Create Session

Creates a new user session and returns an authentication token.

**Endpoint:** `POST /sessions`

**Authentication:** None required

**Request Body:**
```json
{
  "deviceId": "string (optional)",
  "userAgent": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-12-31T23:59:59Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "mobile-app-v1.0",
    "userAgent": "DebtPathFinder iOS/1.0"
  }'
```

**Error Responses:**
- `500 Internal Server Error` - Server error creating session

---

### Get Session

Retrieves information about an existing session.

**Endpoint:** `GET /sessions/{sessionId}`

**Authentication:** Required

**Path Parameters:**
- `sessionId` (string, required) - The session ID

**Response:** `200 OK`
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastActivity": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-12-31T23:59:59Z",
  "dataCompleteness": 0.75,
  "deviceId": "mobile-app-v1.0",
  "userAgent": "DebtPathFinder iOS/1.0"
}
```

**Example:**
```bash
curl -X GET https://api.debtpathfinder.com/v1/sessions/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - Session not found

---

### Refresh Session

Extends the expiration time of an existing session.

**Endpoint:** `POST /sessions/{sessionId}/refresh`

**Authentication:** Required

**Path Parameters:**
- `sessionId` (string, required) - The session ID

**Response:** `200 OK`
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-01-31T23:59:59Z"
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/sessions/550e8400-e29b-41d4-a716-446655440000/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - Session not found

---

### Delete Session

Deletes a session and all associated data. This action cannot be undone.

**Endpoint:** `DELETE /sessions/{sessionId}`

**Authentication:** Required

**Path Parameters:**
- `sessionId` (string, required) - The session ID

**Response:** `204 No Content`

**Example:**
```bash
curl -X DELETE https://api.debtpathfinder.com/v1/sessions/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Session not found

---

### Validate Token

Validates an authentication token without retrieving session data.

**Endpoint:** `POST /sessions/validate`

**Authentication:** Required

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "valid": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/sessions/validate \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired token

---

## Session Lifecycle

### Creation
1. Client calls `POST /sessions`
2. Server creates session and generates JWT token
3. Token is returned to client
4. Client stores token securely

### Usage
1. Client includes token in `Authorization` header
2. Server validates token on each request
3. Server updates `lastActivity` timestamp
4. Session remains active

### Expiration
- Sessions expire after 30 days of inactivity
- `lastActivity` is updated on each authenticated request
- Expired sessions return `401 Unauthorized`
- Client should create new session when expired

### Deletion
1. Client calls `DELETE /sessions/{sessionId}`
2. Server deletes session and all associated data
3. Token becomes invalid immediately
4. Client should discard token

---

## Security Considerations

### Token Storage
- **Web**: Store in httpOnly cookie or sessionStorage
- **Mobile**: Store in secure keychain/keystore
- **Never**: Store in localStorage or expose in URLs

### Token Transmission
- Always use HTTPS
- Include token in `Authorization` header
- Never include token in query parameters

### Token Validation
- Validate token on every request
- Check expiration time
- Verify signature
- Handle expired tokens gracefully

---

## Best Practices

### 1. Create Session on App Launch
```javascript
async function initializeApp() {
  let token = getStoredToken();
  
  if (!token || isTokenExpired(token)) {
    const session = await createSession();
    token = session.token;
    storeToken(token);
  }
  
  return token;
}
```

### 2. Handle Token Expiration
```javascript
async function apiRequest(url, options) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (response.status === 401) {
      // Token expired, create new session
      const session = await createSession();
      storeToken(session.token);
      
      // Retry request with new token
      return apiRequest(url, options);
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

### 3. Refresh Session Periodically
```javascript
// Refresh session every 7 days
setInterval(async () => {
  try {
    const session = await refreshSession();
    storeToken(session.token);
  } catch (error) {
    console.error('Failed to refresh session:', error);
  }
}, 7 * 24 * 60 * 60 * 1000);
```

### 4. Clean Up on Logout
```javascript
async function logout() {
  try {
    await deleteSession(getSessionId());
  } catch (error) {
    console.error('Failed to delete session:', error);
  } finally {
    clearStoredToken();
    redirectToLogin();
  }
}
```

---

## Rate Limits

Session endpoints have special rate limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /sessions` | 10 | 1 hour |
| `GET /sessions/{id}` | 100 | 1 hour |
| `POST /sessions/{id}/refresh` | 20 | 1 hour |
| `DELETE /sessions/{id}` | 10 | 1 hour |
| `POST /sessions/validate` | 1000 | 1 hour |

---

## Related Documentation

- [Getting Started](./getting-started.md) - Authentication basics
- [Common Patterns](./common-patterns.md) - Error handling and security
- [Profile API](./profile.md) - User profile management