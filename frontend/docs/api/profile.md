# Profile API

Manage user financial profiles including demographics, income, expenses, goals, and life events.

---

## Overview

The Profile API stores and manages a user's financial context, which is used throughout the application to personalize recommendations, scenarios, and guidance.

**Base Path:** `/profile`

---

## Endpoints

### Create/Update Profile

Creates or updates the user's financial profile. This is an upsert operation - if a profile exists, it will be updated; otherwise, a new one will be created.

**Endpoint:** `POST /profile`

**Authentication:** Required

**Request Body:**
```json
{
  "ageRange": "25-34",
  "employmentStatus": "full-time",
  "zipCode": "94102",
  "monthlyIncome": 5000,
  "monthlyExpenses": 3500,
  "liquidSavings": 2000,
  "creditScoreRange": "670-739",
  "primaryGoal": "pay-faster",
  "payoffPriority": "aggressive-freedom",
  "stressLevel": 3,
  "lifeEvents": ["income-increase", "other-goals"]
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ageRange` | enum | Yes | User's age range: `18-24`, `25-34`, `35-44`, `45-59`, `60+` |
| `employmentStatus` | enum | Yes | Employment status: `full-time`, `part-time`, `self-employed`, `unemployed`, `retired`, `student` |
| `zipCode` | string | No | ZIP code for regional recommendations |
| `monthlyIncome` | number | Yes | Monthly take-home income (USD) |
| `monthlyExpenses` | number | Yes | Monthly expenses excluding debt payments (USD) |
| `liquidSavings` | number | Yes | Available liquid savings (USD) |
| `creditScoreRange` | enum | Yes | Credit score range: `300-579`, `580-669`, `670-739`, `740-799`, `800-850` |
| `primaryGoal` | enum | Yes | Primary goal: `lower-payment`, `pay-faster`, `reduce-interest`, `avoid-default` |
| `payoffPriority` | enum | No | Payoff priority: `aggressive-freedom`, `minimize-interest`, `balance-savings`, `cash-flow-relief` |
| `stressLevel` | number | Yes | Stress level (1-5 scale) |
| `lifeEvents` | array | No | Upcoming life events affecting finances |

**Response:** `200 OK` or `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "session-uuid",
  "ageRange": "25-34",
  "employmentStatus": "full-time",
  "zipCode": "94102",
  "monthlyIncome": 5000,
  "monthlyExpenses": 3500,
  "liquidSavings": 2000,
  "creditScoreRange": "670-739",
  "primaryGoal": "pay-faster",
  "payoffPriority": "aggressive-freedom",
  "stressLevel": 3,
  "lifeEvents": ["income-increase", "other-goals"],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ageRange": "25-34",
    "employmentStatus": "full-time",
    "monthlyIncome": 5000,
    "monthlyExpenses": 3500,
    "liquidSavings": 2000,
    "creditScoreRange": "670-739",
    "primaryGoal": "pay-faster",
    "stressLevel": 3
  }'
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Invalid or expired token
- `422 Unprocessable Entity` - Validation errors

**Validation Errors Example:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Multiple validation errors occurred",
    "details": {
      "errors": [
        {
          "field": "monthlyIncome",
          "message": "Monthly income must be greater than 0"
        },
        {
          "field": "stressLevel",
          "message": "Stress level must be between 1 and 5"
        }
      ]
    }
  }
}
```

---

### Get Profile

Retrieves the user's current financial profile.

**Endpoint:** `GET /profile`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "session-uuid",
  "ageRange": "25-34",
  "employmentStatus": "full-time",
  "zipCode": "94102",
  "monthlyIncome": 5000,
  "monthlyExpenses": 3500,
  "liquidSavings": 2000,
  "creditScoreRange": "670-739",
  "primaryGoal": "pay-faster",
  "payoffPriority": "aggressive-freedom",
  "stressLevel": 3,
  "lifeEvents": ["income-increase"],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "completeness": 0.95
}
```

**Example:**
```bash
curl -X GET https://api.debtpathfinder.com/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - Profile not found

---

### Update Profile (Partial)

Updates specific fields in the user's profile without replacing the entire profile.

**Endpoint:** `PATCH /profile`

**Authentication:** Required

**Request Body:**
```json
{
  "monthlyIncome": 5500,
  "stressLevel": 2,
  "lifeEvents": ["income-increase", "household-changes"]
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "session-uuid",
  "ageRange": "25-34",
  "employmentStatus": "full-time",
  "monthlyIncome": 5500,
  "monthlyExpenses": 3500,
  "liquidSavings": 2000,
  "creditScoreRange": "670-739",
  "primaryGoal": "pay-faster",
  "stressLevel": 2,
  "lifeEvents": ["income-increase", "household-changes"],
  "updatedAt": "2024-01-16T14:20:00Z"
}
```

**Example:**
```bash
curl -X PATCH https://api.debtpathfinder.com/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyIncome": 5500,
    "stressLevel": 2
  }'
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - Profile not found

---

### Delete Profile

Deletes the user's financial profile. This does not delete the session.

**Endpoint:** `DELETE /profile`

**Authentication:** Required

**Response:** `204 No Content`

**Example:**
```bash
curl -X DELETE https://api.debtpathfinder.com/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - Profile not found

---

### Get Profile Completeness

Returns a detailed breakdown of profile completeness, useful for guiding users to complete their profile.

**Endpoint:** `GET /profile/completeness`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "overall": 0.85,
  "sections": {
    "demographics": {
      "completeness": 1.0,
      "fields": {
        "ageRange": true,
        "employmentStatus": true,
        "zipCode": true
      }
    },
    "finances": {
      "completeness": 1.0,
      "fields": {
        "monthlyIncome": true,
        "monthlyExpenses": true,
        "liquidSavings": true
      }
    },
    "credit": {
      "completeness": 1.0,
      "fields": {
        "creditScoreRange": true
      }
    },
    "goals": {
      "completeness": 0.5,
      "fields": {
        "primaryGoal": true,
        "payoffPriority": false
      }
    },
    "context": {
      "completeness": 1.0,
      "fields": {
        "stressLevel": true,
        "lifeEvents": true
      }
    }
  },
  "missingFields": ["payoffPriority"],
  "recommendations": [
    "Add your payoff priority to get more personalized recommendations"
  ]
}
```

**Example:**
```bash
curl -X GET https://api.debtpathfinder.com/v1/profile/completeness \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Validate Profile Data

Validates profile data without saving it. Useful for client-side validation.

**Endpoint:** `POST /profile/validate`

**Authentication:** Required

**Request Body:**
```json
{
  "monthlyIncome": 5000,
  "monthlyExpenses": 6000,
  "stressLevel": 3
}
```

**Response:** `200 OK`
```json
{
  "valid": false,
  "errors": [
    {
      "field": "monthlyExpenses",
      "message": "Monthly expenses exceed monthly income",
      "severity": "warning"
    }
  ],
  "warnings": [
    {
      "field": "liquidSavings",
      "message": "Consider building emergency savings before aggressive debt payoff"
    }
  ]
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/profile/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyIncome": 5000,
    "monthlyExpenses": 3500,
    "stressLevel": 3
  }'
```

---

## Calculated Fields

The API automatically calculates and returns additional fields based on the profile data:

### Available Cash Flow
```
availableCashFlow = monthlyIncome - monthlyExpenses - totalMinimumPayments
```

### Debt-to-Income Ratio
```
debtToIncomeRatio = (totalDebt / (monthlyIncome * 12)) * 100
```

### Emergency Fund Ratio
```
emergencyFundRatio = liquidSavings / monthlyExpenses
```

These are included in the response when debts are also available:

```json
{
  "profile": { ... },
  "calculated": {
    "availableCashFlow": 1500,
    "debtToIncomeRatio": 35.5,
    "emergencyFundRatio": 0.57,
    "monthsOfExpensesCovered": 0.57
  }
}
```

---

## Validation Rules

### Income and Expenses
- `monthlyIncome` must be ≥ 0
- `monthlyExpenses` must be ≥ 0
- Warning if `monthlyExpenses > monthlyIncome`

### Savings
- `liquidSavings` must be ≥ 0
- Warning if `liquidSavings < monthlyExpenses` (less than 1 month emergency fund)

### Stress Level
- Must be integer between 1 and 5
- 1 = Low stress, 5 = High stress

### Life Events
- Must be valid enum values
- Maximum 5 life events

### Credit Score
- Must be valid range enum
- Used for product recommendations

---

## Best Practices

### 1. Update Profile Incrementally

```javascript
// Update only changed fields
async function updateIncome(newIncome) {
  await fetch('/api/v1/profile', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      monthlyIncome: newIncome
    })
  });
}
```

### 2. Validate Before Saving

```javascript
async function saveProfile(profileData) {
  // Validate first
  const validation = await fetch('/api/v1/profile/validate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  }).then(r => r.json());
  
  if (!validation.valid) {
    // Show errors to user
    showErrors(validation.errors);
    return;
  }
  
  // Save if valid
  await fetch('/api/v1/profile', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
}
```

### 3. Track Completeness

```javascript
async function checkProfileCompleteness() {
  const completeness = await fetch('/api/v1/profile/completeness', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then(r => r.json());
  
  if (completeness.overall < 0.8) {
    // Prompt user to complete profile
    showCompletionPrompt(completeness.missingFields);
  }
}
```

### 4. Handle Life Events

```javascript
async function addLifeEvent(event) {
  const profile = await getProfile();
  const updatedEvents = [...(profile.lifeEvents || []), event];
  
  await fetch('/api/v1/profile', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      lifeEvents: updatedEvents
    })
  });
}
```

---

## Profile-Based Personalization

The profile data is used throughout the API to personalize:

### Recommendations
- **High stress** → Snowball method for quick wins
- **Low cash flow** → Focus on budget optimization
- **Good credit** → Consolidation opportunities

### Messaging
- **Young age** → Long-term planning focus
- **Near retirement** → Aggressive payoff strategies
- **Life events** → Flexible planning

### Scenarios
- **Available cash flow** → Determines payment ranges
- **Goals** → Influences strategy recommendations
- **Savings** → Emergency fund considerations

---

## Example Workflows

### Complete Onboarding Flow

```javascript
// 1. Create session
const session = await createSession();

// 2. Create profile
const profile = await fetch('/api/v1/profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ageRange: '25-34',
    employmentStatus: 'full-time',
    monthlyIncome: 5000,
    monthlyExpenses: 3500,
    liquidSavings: 2000,
    creditScoreRange: '670-739',
    primaryGoal: 'pay-faster',
    stressLevel: 3
  })
}).then(r => r.json());

// 3. Add debts (see Debts API)
// 4. Get recommendations (see Recommendations API)
```

### Update Financial Situation

```javascript
// User gets a raise
await fetch('/api/v1/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    monthlyIncome: 6000,
    lifeEvents: ['income-increase']
  })
});

// Recalculate scenarios with new income
await recalculateScenarios();
```

---

## Related Documentation

- [Getting Started](./getting-started.md) - Authentication and setup
- [Debts API](./debts.md) - Managing debt accounts
- [Recommendations API](./recommendations.md) - Strategy recommendations
- [Personalization API](./personalization.md) - Dynamic content
- [Data Models](./data-models.md) - Complete type definitions