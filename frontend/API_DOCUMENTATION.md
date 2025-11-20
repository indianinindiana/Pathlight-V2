# Debt PathFinder - Backend API Documentation

This document outlines all the API endpoints that the backend should implement to support the Debt PathFinder frontend application.

## Table of Contents
1. [Authentication & Sessions](#authentication--sessions)
2. [User Profile Management](#user-profile-management)
3. [Debt Management](#debt-management)
4. [Personalization Engine](#personalization-engine)
5. [Recommendation Engine](#recommendation-engine)
6. [Scenario Modeling](#scenario-modeling)
7. [AI Services](#ai-services)
8. [Analytics & Logging](#analytics--logging)
9. [Export & Data Management](#export--data-management)

---

## Base URL
```
Production: https://api.debtpathfinder.com/v1
Development: http://localhost:3000/api/v1
```

## Authentication
All API requests should include a session token in the header:
```
Authorization: Bearer {session_token}
```

For frontend-only mode (no backend), the session is stored in localStorage.

---

## 1. Authentication & Sessions

### Create Session
**Endpoint:** `POST /sessions`

**Description:** Creates a new user session. No authentication required.

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
  "sessionId": "uuid",
  "token": "jwt_token",
  "expiresAt": "2024-12-31T23:59:59Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `500 Internal Server Error` - Server error

---

### Get Session
**Endpoint:** `GET /sessions/{sessionId}`

**Description:** Retrieves session information.

**Response:** `200 OK`
```json
{
  "sessionId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastActivity": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-12-31T23:59:59Z",
  "dataCompleteness": 0.75
}
```

**Error Responses:**
- `404 Not Found` - Session not found
- `401 Unauthorized` - Invalid or expired token

---

### Delete Session
**Endpoint:** `DELETE /sessions/{sessionId}`

**Description:** Deletes a session and all associated data.

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found` - Session not found
- `401 Unauthorized` - Invalid token

---

## 2. User Profile Management

### Create/Update Profile
**Endpoint:** `POST /profile`

**Description:** Creates or updates the user's financial profile.

**Request Body:**
```json
{
  "ageRange": "25-34",
  "employmentStatus": "full-time",
  "zipCode": "12345",
  "monthlyIncome": 5000,
  "monthlyExpenses": 3500,
  "liquidSavings": 2000,
  "creditScoreRange": "670-739",
  "primaryGoal": "pay-faster",
  "payoffPriority": "aggressive-freedom",
  "stressLevel": 3,
  "lifeEvents": ["income-increase", "major-expense"]
}
```

**Response:** `200 OK`
```json
{
  "profileId": "uuid",
  "tags": [
    "cash-flow-positive",
    "moderate-stress",
    "good-credit",
    "goal-speed-focused"
  ],
  "contradictions": [],
  "completeness": 0.9,
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Invalid token

---

### Get Profile
**Endpoint:** `GET /profile`

**Description:** Retrieves the user's financial profile.

**Response:** `200 OK`
```json
{
  "ageRange": "25-34",
  "employmentStatus": "full-time",
  "monthlyIncome": 5000,
  "monthlyExpenses": 3500,
  "liquidSavings": 2000,
  "creditScoreRange": "670-739",
  "primaryGoal": "pay-faster",
  "stressLevel": 3,
  "lifeEvents": ["income-increase"],
  "tags": ["cash-flow-positive", "moderate-stress"],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Profile not found
- `401 Unauthorized` - Invalid token

---

### Detect Profile Contradictions
**Endpoint:** `GET /profile/contradictions`

**Description:** Analyzes the profile for contradictory signals.

**Response:** `200 OK`
```json
{
  "contradictions": [
    {
      "type": "goal-stress-mismatch",
      "severity": "medium",
      "description": "You want to pay off debt quickly but report high stress. Consider a more balanced approach.",
      "suggestion": "Try the Snowball method for quick wins to reduce stress"
    }
  ]
}
```

---

## 3. Debt Management

### Create Debt
**Endpoint:** `POST /debts`

**Description:** Adds a new debt to the user's profile.

**Request Body:**
```json
{
  "type": "credit-card",
  "name": "Chase Visa",
  "balance": 5000,
  "apr": 18.99,
  "minimumPayment": 150,
  "nextPaymentDate": "2024-02-01",
  "isDelinquent": false,
  "customOrder": 1
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "type": "credit-card",
  "name": "Chase Visa",
  "balance": 5000,
  "apr": 18.99,
  "minimumPayment": 150,
  "nextPaymentDate": "2024-02-01",
  "isDelinquent": false,
  "customOrder": 1,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Invalid token

---

### Get All Debts
**Endpoint:** `GET /debts`

**Description:** Retrieves all debts for the user.

**Query Parameters:**
- `sortBy` (optional): `balance`, `apr`, `name`, `priority`
- `order` (optional): `asc`, `desc`
- `type` (optional): Filter by debt type

**Response:** `200 OK`
```json
{
  "debts": [
    {
      "id": "uuid",
      "type": "credit-card",
      "name": "Chase Visa",
      "balance": 5000,
      "apr": 18.99,
      "minimumPayment": 150,
      "nextPaymentDate": "2024-02-01",
      "isDelinquent": false,
      "customOrder": 1,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "summary": {
    "totalDebt": 25000,
    "totalMinimumPayment": 750,
    "averageAPR": 15.5,
    "debtCount": 5
  }
}
```

---

### Update Debt
**Endpoint:** `PUT /debts/{debtId}`

**Description:** Updates an existing debt.

**Request Body:**
```json
{
  "balance": 4500,
  "minimumPayment": 140,
  "customOrder": 2
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "type": "credit-card",
  "name": "Chase Visa",
  "balance": 4500,
  "apr": 18.99,
  "minimumPayment": 140,
  "nextPaymentDate": "2024-02-01",
  "customOrder": 2,
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Delete Debt
**Endpoint:** `DELETE /debts/{debtId}`

**Description:** Deletes a debt.

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found` - Debt not found
- `401 Unauthorized` - Invalid token

---

### Bulk Import Debts (CSV)
**Endpoint:** `POST /debts/import`

**Description:** Imports multiple debts from CSV data.

**Request Body:**
```json
{
  "csvData": "name,type,balance,apr,minimumPayment,nextPaymentDate\nChase Visa,credit-card,5000,18.99,150,2024-02-01",
  "validateOnly": false
}
```

**Response:** `200 OK`
```json
{
  "imported": 5,
  "failed": 0,
  "errors": [],
  "warnings": [
    {
      "row": 3,
      "field": "apr",
      "message": "APR seems high (36.5%) - please verify"
    }
  ],
  "debts": [
    {
      "id": "uuid",
      "name": "Chase Visa",
      "balance": 5000
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid CSV format
- `401 Unauthorized` - Invalid token

---

## 4. Personalization Engine

### Get Personalized Microcopy
**Endpoint:** `POST /personalization/microcopy`

**Description:** Returns contextual messages, alerts, and hints based on user profile.

**Request Body:**
```json
{
  "context": {
    "page": "dashboard",
    "stressLevel": 4,
    "cashFlow": -200,
    "debtCount": 5,
    "goal": "pay-faster"
  }
}
```

**Response:** `200 OK`
```json
{
  "alerts": [
    {
      "type": "warning",
      "message": "We notice you're feeling stressed. Let's focus on creating breathing room first.",
      "condition": true,
      "priority": 1
    },
    {
      "type": "warning",
      "message": "Your expenses exceed income. Let's explore ways to free up cash flow.",
      "condition": true,
      "priority": 2
    }
  ],
  "hints": [
    {
      "location": "scenarios",
      "message": "Consider the Snowball method for quick wins to reduce stress",
      "trigger": "stress-level-high"
    }
  ],
  "motivationalMessage": "You're taking the right steps by seeking help. Every journey starts with a single step."
}
```

---

### Get Next Best Actions
**Endpoint:** `POST /personalization/actions`

**Description:** Returns prioritized next best actions for the user.

**Request Body:**
```json
{
  "debts": [
    {
      "id": "uuid",
      "balance": 5000,
      "apr": 24.99,
      "minimumPayment": 150
    }
  ],
  "financialContext": {
    "monthlyIncome": 5000,
    "monthlyExpenses": 3500,
    "liquidSavings": 500,
    "creditScoreRange": "670-739"
  }
}
```

**Response:** `200 OK`
```json
{
  "actions": [
    {
      "priority": 1,
      "title": "Build Emergency Buffer",
      "description": "Save $500 before aggressive debt payoff to prevent new debt from emergencies",
      "impact": "Prevents falling behind on payments",
      "cta": "Start Saving Plan",
      "action": "emergency-savings",
      "progress": 0.5,
      "confidence": "high",
      "estimatedTimeToComplete": "2 months",
      "potentialSavings": 0
    },
    {
      "priority": 2,
      "title": "Attack High-Interest Debt",
      "description": "Pay extra $200/month on Chase Visa (24.99% APR)",
      "impact": "Save $2,400 in interest over 2 years",
      "cta": "Start Avalanche Plan",
      "action": "high-interest-focus",
      "progress": 0,
      "confidence": "high",
      "estimatedTimeToComplete": "24 months",
      "potentialSavings": 2400
    }
  ]
}
```

---

### Get Contextual Hints
**Endpoint:** `GET /personalization/hints`

**Description:** Returns contextual hints for specific pages/features.

**Query Parameters:**
- `page`: Current page (dashboard, scenarios, what-if)
- `feature`: Specific feature being used

**Response:** `200 OK`
```json
{
  "hints": [
    {
      "location": "scenario-slider",
      "message": "Paying an extra $100/month could save you $1,200 in interest",
      "type": "tip",
      "dismissible": true
    }
  ]
}
```

---

## 5. Recommendation Engine

### Get Strategy Recommendation
**Endpoint:** `POST /recommendations/strategy`

**Description:** Returns the recommended payoff strategy based on user profile.

**Request Body:**
```json
{
  "debts": [
    {
      "id": "uuid",
      "balance": 5000,
      "apr": 18.99,
      "minimumPayment": 150
    }
  ],
  "financialContext": {
    "stressLevel": 4,
    "primaryGoal": "pay-faster",
    "monthlyIncome": 5000,
    "monthlyExpenses": 3500
  }
}
```

**Response:** `200 OK`
```json
{
  "recommendedStrategy": "snowball",
  "confidence": "high",
  "confidenceScore": 0.85,
  "factors": [
    {
      "name": "Complete debt information",
      "met": true,
      "weight": 0.3
    },
    {
      "name": "Accurate income data",
      "met": true,
      "weight": 0.25
    },
    {
      "name": "Recent credit score",
      "met": true,
      "weight": 0.15
    }
  ],
  "explanation": "Given your high stress level, the Snowball method provides quick wins to build momentum and motivation.",
  "alternatives": [
    {
      "strategy": "avalanche",
      "reason": "Saves the most money on interest",
      "potentialSavings": 1200,
      "tradeoff": "Takes 2 months longer"
    }
  ],
  "reasoning": [
    {
      "factor": "Stress Level",
      "value": "High (4/5)",
      "impact": "Snowball method recommended for psychological benefits"
    },
    {
      "factor": "Debt Count",
      "value": "5 debts",
      "impact": "Multiple quick wins possible with Snowball"
    }
  ]
}
```

---

### Get Confidence Score
**Endpoint:** `POST /recommendations/confidence`

**Description:** Returns confidence score for recommendations based on data completeness.

**Request Body:**
```json
{
  "debts": [
    {
      "id": "uuid",
      "balance": 5000,
      "apr": 18.99
    }
  ],
  "financialContext": {
    "monthlyIncome": 5000,
    "monthlyExpenses": 3500
  }
}
```

**Response:** `200 OK`
```json
{
  "level": "high",
  "score": 0.85,
  "factors": [
    {
      "name": "Complete debt information",
      "met": true,
      "weight": 0.3,
      "description": "All debts have balance and APR"
    },
    {
      "name": "Accurate income data",
      "met": true,
      "weight": 0.25,
      "description": "Monthly income provided"
    },
    {
      "name": "Recent credit score",
      "met": false,
      "weight": 0.15,
      "description": "Credit score not provided"
    }
  ],
  "suggestions": [
    "Adding your credit score would improve recommendation accuracy by 15%"
  ],
  "dataCompleteness": 0.85
}
```

---

### Explain Recommendation
**Endpoint:** `POST /recommendations/explain`

**Description:** Provides detailed explanation of why a recommendation was made.

**Request Body:**
```json
{
  "recommendationType": "strategy",
  "recommendation": "snowball",
  "context": {
    "stressLevel": 4,
    "debtCount": 5,
    "cashFlow": 500
  }
}
```

**Response:** `200 OK`
```json
{
  "explanation": {
    "summary": "We recommend the Snowball method because it provides quick wins that can help reduce your stress.",
    "factors": [
      {
        "icon": "heart",
        "title": "Considers your stress level",
        "description": "With your high stress level (4/5), quick wins from paying off smaller debts first can provide psychological relief and motivation."
      },
      {
        "icon": "target",
        "title": "Matches your goals",
        "description": "You want to pay off debt faster, and the Snowball method keeps you motivated to stick with your plan."
      }
    ],
    "tradeoffs": [
      {
        "benefit": "Faster psychological wins",
        "cost": "May pay $1,200 more in interest compared to Avalanche method"
      }
    ]
  }
}
```

---

## 6. Scenario Modeling

### Simulate Payoff Scenario
**Endpoint:** `POST /scenarios/simulate`

**Description:** Simulates a debt payoff scenario with given parameters.

**Request Body:**
```json
{
  "debts": [
    {
      "id": "uuid",
      "balance": 5000,
      "apr": 18.99,
      "minimumPayment": 150
    }
  ],
  "strategy": "avalanche",
  "monthlyPayment": 800,
  "startDate": "2024-02-01",
  "modifications": {
    "incomeChange": 500,
    "expenseChange": -200,
    "aprChanges": [
      {
        "debtId": "uuid",
        "newAPR": 12.99
      }
    ]
  }
}
```

**Response:** `200 OK`
```json
{
  "scenario": {
    "id": "uuid",
    "name": "Avalanche Strategy",
    "strategy": "avalanche",
    "monthlyPayment": 800,
    "totalMonths": 36,
    "totalInterest": 3200,
    "totalPaid": 28200,
    "payoffDate": "2027-02-01",
    "schedule": [
      {
        "month": 1,
        "date": "2024-02-01",
        "debtId": "uuid",
        "debtName": "Chase Visa",
        "payment": 800,
        "principal": 720,
        "interest": 80,
        "remainingBalance": 4280
      }
    ]
  },
  "comparison": {
    "vsMinimumPayments": {
      "monthsSaved": 24,
      "interestSaved": 4800
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Invalid token

---

### Optimize Scenario
**Endpoint:** `POST /scenarios/optimize`

**Description:** Finds the optimal payoff strategy based on constraints.

**Request Body:**
```json
{
  "debts": [
    {
      "id": "uuid",
      "balance": 5000,
      "apr": 18.99,
      "minimumPayment": 150
    }
  ],
  "constraints": {
    "maxMonthlyPayment": 1000,
    "targetPayoffDate": "2026-12-31",
    "minimumEmergencyFund": 1000
  },
  "optimizationGoal": "minimize-interest"
}
```

**Response:** `200 OK`
```json
{
  "optimalScenario": {
    "strategy": "avalanche",
    "monthlyPayment": 850,
    "totalMonths": 32,
    "totalInterest": 2800,
    "payoffDate": "2026-10-01"
  },
  "alternatives": [
    {
      "strategy": "snowball",
      "monthlyPayment": 850,
      "totalMonths": 34,
      "totalInterest": 3100,
      "tradeoff": "2 months longer, $300 more interest, but better for motivation"
    }
  ]
}
```

---

### Compare Scenarios
**Endpoint:** `POST /scenarios/compare`

**Description:** Compares multiple scenarios side-by-side.

**Request Body:**
```json
{
  "scenarios": [
    {
      "id": "uuid-1",
      "strategy": "snowball",
      "monthlyPayment": 800
    },
    {
      "id": "uuid-2",
      "strategy": "avalanche",
      "monthlyPayment": 800
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "comparison": {
    "scenarios": [
      {
        "id": "uuid-1",
        "name": "Snowball",
        "totalMonths": 38,
        "totalInterest": 3500,
        "payoffDate": "2027-04-01"
      },
      {
        "id": "uuid-2",
        "name": "Avalanche",
        "totalMonths": 36,
        "totalInterest": 3200,
        "payoffDate": "2027-02-01"
      }
    ],
    "winner": {
      "byTime": "uuid-2",
      "byInterest": "uuid-2",
      "byMotivation": "uuid-1"
    },
    "insights": [
      "Avalanche saves $300 in interest and finishes 2 months faster",
      "Snowball provides 2 quick wins in first 6 months"
    ]
  }
}
```

---

## 7. AI Services

### Generate AI Insights
**Endpoint:** `POST /ai/insights`

**Description:** Generates AI-powered insights about the user's debt situation.

**Request Body:**
```json
{
  "debts": [
    {
      "id": "uuid",
      "balance": 5000,
      "apr": 18.99,
      "type": "credit-card"
    }
  ],
  "financialContext": {
    "monthlyIncome": 5000,
    "monthlyExpenses": 3500,
    "stressLevel": 4
  },
  "scenarios": [
    {
      "id": "uuid",
      "strategy": "avalanche",
      "totalMonths": 36,
      "totalInterest": 3200
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "summary": "You have $25,000 in debt across 5 accounts with an average APR of 16.5%. Based on your financial situation, you have several paths to becoming debt-free.",
  "keyInsights": [
    "Your highest-interest debt (24.99% APR) is costing you $104/month in interest alone",
    "With your current minimum payments, you'll pay $8,500 in interest over 5 years",
    "Paying an extra $100/month could save you $2,400 and 12 months"
  ],
  "recommendations": [
    "Focus on your Chase Visa (24.99% APR) first to maximize savings",
    "Consider building a $500 emergency fund before aggressive payoff",
    "Look into balance transfer offers for your credit card debt"
  ],
  "motivationalMessage": "You're taking the right steps by seeking help. Every journey starts with a single step, and you've already taken it.",
  "personalizedGuidance": "Given your high stress level, we recommend starting with small wins. The Snowball method can help you see progress quickly and stay motivated."
}
```

---

### Generate Guidance
**Endpoint:** `POST /ai/guide`

**Description:** Generates personalized guidance for specific situations.

**Request Body:**
```json
{
  "situation": "high-stress-negative-cashflow",
  "context": {
    "stressLevel": 5,
    "cashFlow": -300,
    "debtCount": 7,
    "hasEmergencyFund": false
  }
}
```

**Response:** `200 OK`
```json
{
  "guidance": {
    "immediate": [
      "First, take a deep breath. You're not alone, and there are solutions.",
      "Focus on covering minimum payments to avoid late fees and credit damage.",
      "Look for ways to reduce expenses by $300/month to break even."
    ],
    "shortTerm": [
      "Create a bare-bones budget focusing only on essentials.",
      "Consider a side gig or selling unused items to generate extra income.",
      "Contact creditors to discuss hardship programs or payment plans."
    ],
    "longTerm": [
      "Once cash flow is positive, build a $500 emergency buffer.",
      "Then focus on the Snowball method for quick psychological wins.",
      "Consider credit counseling for professional guidance."
    ]
  },
  "resources": [
    {
      "title": "Budget Worksheet",
      "url": "/resources/budget-worksheet",
      "type": "tool"
    },
    {
      "title": "Creditor Negotiation Scripts",
      "url": "/resources/negotiation-scripts",
      "type": "guide"
    }
  ]
}
```

---

### Explain Calculation
**Endpoint:** `POST /ai/explain`

**Description:** Explains how a calculation or recommendation was made.

**Request Body:**
```json
{
  "calculationType": "payoff-timeline",
  "inputs": {
    "balance": 5000,
    "apr": 18.99,
    "monthlyPayment": 200
  }
}
```

**Response:** `200 OK`
```json
{
  "explanation": {
    "summary": "With a $200 monthly payment on a $5,000 balance at 18.99% APR, you'll be debt-free in 32 months.",
    "breakdown": [
      {
        "step": "Calculate monthly interest",
        "formula": "Balance × (APR / 12)",
        "calculation": "$5,000 × (18.99% / 12) = $79.13",
        "result": "$79.13 in interest for month 1"
      },
      {
        "step": "Calculate principal payment",
        "formula": "Monthly Payment - Interest",
        "calculation": "$200 - $79.13 = $120.87",
        "result": "$120.87 goes toward principal"
      },
      {
        "step": "Calculate new balance",
        "formula": "Previous Balance - Principal",
        "calculation": "$5,000 - $120.87 = $4,879.13",
        "result": "New balance: $4,879.13"
      }
    ],
    "assumptions": [
      "APR remains constant",
      "No additional charges or fees",
      "Payments made on time each month"
    ]
  }
}
```

---

## 8. Analytics & Logging

### Log Event
**Endpoint:** `POST /analytics/events`

**Description:** Logs user interactions and events.

**Request Body:**
```json
{
  "eventType": "scenario_created",
  "eventData": {
    "strategy": "avalanche",
    "monthlyPayment": 800,
    "customNamed": true
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "page": "scenarios",
  "sessionDuration": 1200
}
```

**Response:** `201 Created`
```json
{
  "eventId": "uuid",
  "recorded": true
}
```

---

### Get Analytics Summary
**Endpoint:** `GET /analytics/summary`

**Description:** Returns analytics summary for the session.

**Response:** `200 OK`
```json
{
  "session": {
    "duration": 3600,
    "pagesVisited": 5,
    "actionsCompleted": 12
  },
  "engagement": {
    "scenariosCreated": 3,
    "debtsAdded": 5,
    "comparisonsViewed": 2
  },
  "milestones": [
    {
      "type": "onboarding_complete",
      "timestamp": "2024-01-15T10:00:00Z"
    },
    {
      "type": "first_scenario_created",
      "timestamp": "2024-01-15T10:15:00Z"
    }
  ]
}
```

---

### Get User Insights
**Endpoint:** `GET /analytics/insights`

**Description:** Returns behavioral insights about the user.

**Response:** `200 OK`
```json
{
  "insights": [
    {
      "type": "engagement",
      "message": "You've spent 45 minutes exploring scenarios - you're thorough!",
      "sentiment": "positive"
    },
    {
      "type": "behavior",
      "message": "You've created 3 custom scenarios, showing strong planning",
      "sentiment": "positive"
    }
  ],
  "recommendations": [
    "Consider exporting your favorite scenario for reference",
    "You might want to explore What-If scenarios next"
  ]
}
```

---

## 9. Export & Data Management

### Export Session Data
**Endpoint:** `GET /export/session`

**Description:** Exports all session data in various formats.

**Query Parameters:**
- `format`: `json`, `csv`, `pdf`
- `include`: Comma-separated list of data types to include

**Response:** `200 OK`
```json
{
  "exportId": "uuid",
  "format": "json",
  "downloadUrl": "https://api.debtpathfinder.com/downloads/uuid.json",
  "expiresAt": "2024-01-16T10:30:00Z",
  "data": {
    "profile": { },
    "debts": [ ],
    "scenarios": [ ]
  }
}
```

---

### Export Scenario Comparison
**Endpoint:** `POST /export/comparison`

**Description:** Exports a scenario comparison report.

**Request Body:**
```json
{
  "scenarioIds": ["uuid-1", "uuid-2", "uuid-3"],
  "format": "pdf",
  "includeCharts": true
}
```

**Response:** `200 OK`
```json
{
  "exportId": "uuid",
  "downloadUrl": "https://api.debtpathfinder.com/downloads/comparison-uuid.pdf",
  "expiresAt": "2024-01-16T10:30:00Z"
}
```

---

### Import Session Data
**Endpoint:** `POST /import/session`

**Description:** Imports previously exported session data.

**Request Body:**
```json
{
  "data": {
    "profile": { },
    "debts": [ ],
    "scenarios": [ ]
  },
  "overwrite": false
}
```

**Response:** `200 OK`
```json
{
  "imported": {
    "profile": true,
    "debts": 5,
    "scenarios": 3
  },
  "conflicts": [],
  "warnings": []
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Monthly payment must be at least the minimum payment",
    "details": {
      "field": "monthlyPayment",
      "minimumRequired": 150,
      "provided": 100
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "uuid"
  }
}
```

### Common Error Codes
- `INVALID_INPUT` - Invalid request data
- `UNAUTHORIZED` - Invalid or missing authentication
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVER_ERROR` - Internal server error
- `VALIDATION_ERROR` - Data validation failed
- `INSUFFICIENT_DATA` - Not enough data for operation

---

## Rate Limiting

All endpoints are rate-limited:
- **Anonymous**: 100 requests per hour
- **Authenticated**: 1000 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705320600
```

---

## Webhooks (Future)

For real-time updates, the backend can send webhooks to registered endpoints:

###Events:
- `profile.updated`
- `debt.created`
- `debt.updated`
- `debt.deleted`
- `scenario.created`
- `recommendation.generated`

---

## API Versioning

The API uses URL versioning:
- Current version: `v1`
- Base URL: `https://api.debtpathfinder.com/v1`

Breaking changes will result in a new version (v2, v3, etc.).

---

## Testing

### Test Endpoints
All endpoints have corresponding test endpoints with `/test` prefix:
```
POST /test/scenarios/simulate
```

Test endpoints:
- Don't persist data
- Return mock data
- Don't count toward rate limits
- Useful for frontend development

---

## SDK Support

Official SDKs available for:
- JavaScript/TypeScript
- Python
- Ruby
- PHP

Example (JavaScript):
```javascript
import { DebtPathFinderClient } from '@debtpathfinder/sdk';

const client = new DebtPathFinderClient({
  apiKey: 'your-api-key',
  environment: 'production'
});

const recommendation = await client.recommendations.getStrategy({
  debts: [...],
  financialContext: {...}
});
```

---

## Support

For API support:
- Documentation: https://docs.debtpathfinder.com
- Email: api-support@debtpathfinder.com
- Status: https://status.debtpathfinder.com