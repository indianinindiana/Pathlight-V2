# Analytics API

Track user behavior, engagement, and generate insights from usage patterns.

---

## Overview

The Analytics API provides endpoints for logging events, tracking user behavior, and generating insights about how users interact with the debt management platform.

**Base Path:** `/analytics`

---

## Endpoints

### Log Event

Records a user action or event.

**Endpoint:** `POST /analytics/events`

**Authentication:** Required

**Request Body:**
```json
{
  "event": "scenario_created",
  "properties": {
    "strategy": "avalanche",
    "monthlyPayment": 800,
    "totalDebts": 3,
    "source": "dashboard"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Event Types:**

**Session Events:**
- `session_started` - User started new session
- `session_ended` - User ended session
- `page_viewed` - User viewed a page

**Onboarding Events:**
- `onboarding_started` - User began onboarding
- `onboarding_completed` - User completed onboarding
- `onboarding_abandoned` - User left during onboarding
- `profile_created` - User created financial profile
- `profile_updated` - User updated profile

**Debt Management Events:**
- `debt_added` - User added a debt
- `debt_updated` - User updated a debt
- `debt_deleted` - User deleted a debt
- `debts_imported` - User imported debts from CSV

**Scenario Events:**
- `scenario_created` - User created a scenario
- `scenario_compared` - User compared scenarios
- `what_if_explored` - User explored what-if scenario
- `scenario_exported` - User exported a scenario

**Recommendation Events:**
- `recommendation_viewed` - User viewed recommendations
- `recommendation_accepted` - User accepted a recommendation
- `recommendation_rejected` - User rejected a recommendation
- `product_recommendation_clicked` - User clicked product recommendation

**Engagement Events:**
- `guidance_requested` - User requested AI guidance
- `question_asked` - User asked a question
- `explanation_viewed` - User viewed calculation explanation
- `milestone_reached` - User reached a milestone
- `progress_report_viewed` - User viewed progress report

**Response:** `201 Created`
```json
{
  "eventId": "event-550e8400",
  "recorded": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/analytics/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "scenario_created",
    "properties": {
      "strategy": "avalanche",
      "monthlyPayment": 800
    }
  }'
```

---

### Batch Log Events

Records multiple events in a single request.

**Endpoint:** `POST /analytics/events/batch`

**Authentication:** Required

**Request Body:**
```json
{
  "events": [
    {
      "event": "page_viewed",
      "properties": {
        "page": "dashboard"
      },
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "event": "debt_added",
      "properties": {
        "type": "credit-card",
        "balance": 5000
      },
      "timestamp": "2024-01-15T10:31:00Z"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "recorded": 2,
  "failed": 0,
  "eventIds": [
    "event-550e8400",
    "event-660e8401"
  ]
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/analytics/events/batch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [...]
  }'
```

---

### Get Session Analytics

Retrieves analytics for the current session.

**Endpoint:** `GET /analytics/session`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "sessionId": "session-550e8400",
  "startTime": "2024-01-15T10:00:00Z",
  "duration": 1800,
  "events": {
    "total": 25,
    "byType": {
      "page_viewed": 8,
      "debt_added": 3,
      "scenario_created": 2,
      "recommendation_viewed": 1
    }
  },
  "pages": {
    "visited": ["dashboard", "debt-entry", "scenarios"],
    "timeSpent": {
      "dashboard": 600,
      "debt-entry": 900,
      "scenarios": 300
    }
  },
  "engagement": {
    "level": "high",
    "score": 0.85,
    "indicators": {
      "debtsAdded": 3,
      "scenariosCreated": 2,
      "recommendationsViewed": 1,
      "questionsAsked": 2
    }
  },
  "progress": {
    "onboardingComplete": true,
    "debtsAdded": 3,
    "scenariosCreated": 2,
    "recommendationAccepted": false
  }
}
```

**Example:**
```bash
curl -X GET https://api.debtpathfinder.com/v1/analytics/session \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get User Insights

Generates insights about user behavior and patterns.

**Endpoint:** `GET /analytics/insights`

**Authentication:** Required

**Query Parameters:**
- `period` (string) - Time period: `session`, `week`, `month`, `all` (default: session)

**Response:** `200 OK`
```json
{
  "period": "session",
  "insights": [
    {
      "type": "engagement",
      "title": "High Engagement",
      "description": "You've been actively exploring different payoff strategies",
      "data": {
        "scenariosCreated": 5,
        "comparisonsViewed": 3,
        "whatIfExplored": 2
      }
    },
    {
      "type": "progress",
      "title": "Making Progress",
      "description": "You've completed all key setup steps",
      "data": {
        "onboardingComplete": true,
        "debtsAdded": 3,
        "profileComplete": 0.95
      }
    },
    {
      "type": "recommendation",
      "title": "Ready for Next Step",
      "description": "Based on your activity, you're ready to commit to a strategy",
      "data": {
        "recommendationsViewed": 3,
        "scenariosCompared": 2,
        "confidenceLevel": "high"
      }
    }
  ],
  "patterns": [
    {
      "pattern": "thorough-researcher",
      "confidence": 0.9,
      "description": "You carefully compare options before making decisions",
      "indicators": [
        "Viewed multiple scenarios",
        "Compared strategies",
        "Asked clarifying questions"
      ]
    }
  ],
  "recommendations": [
    "You've done great research - consider committing to your preferred strategy",
    "Set up automatic payments to ensure consistency",
    "Check back monthly to track your progress"
  ]
}
```

**Example:**
```bash
curl -X GET "https://api.debtpathfinder.com/v1/analytics/insights?period=session" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Track Milestone

Records when a user reaches a significant milestone.

**Endpoint:** `POST /analytics/milestones`

**Authentication:** Required

**Request Body:**
```json
{
  "milestone": "first_debt_paid",
  "data": {
    "debtName": "Credit Card",
    "amount": 5000,
    "monthsTaken": 12,
    "interestSaved": 450
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Milestone Types:**
- `onboarding_complete` - Completed onboarding
- `first_debt_added` - Added first debt
- `first_scenario_created` - Created first scenario
- `first_debt_paid` - Paid off first debt
- `25_percent_complete` - 25% of debt paid off
- `50_percent_complete` - 50% of debt paid off
- `75_percent_complete` - 75% of debt paid off
- `debt_free` - All debts paid off
- `emergency_fund_built` - Built emergency fund
- `strategy_changed` - Changed payoff strategy

**Response:** `201 Created`
```json
{
  "milestoneId": "milestone-550e8400",
  "recorded": true,
  "celebration": {
    "message": "🎉 Congratulations! You paid off your first debt!",
    "encouragement": "This is a huge accomplishment. You're proving you can do this!",
    "nextMilestone": {
      "name": "25% debt-free",
      "progress": 0.25,
      "estimatedDate": "2024-06-15"
    }
  }
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/analytics/milestones \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "milestone": "first_debt_paid",
    "data": {
      "debtName": "Credit Card",
      "amount": 5000
    }
  }'
```

---

### Get Funnel Analytics

Analyzes user progression through key workflows.

**Endpoint:** `GET /analytics/funnels/{funnelName}`

**Authentication:** Required

**Path Parameters:**
- `funnelName` (string, required) - Funnel to analyze: `onboarding`, `scenario-creation`, `recommendation-acceptance`

**Response:** `200 OK`
```json
{
  "funnel": "onboarding",
  "steps": [
    {
      "step": 1,
      "name": "Started onboarding",
      "completed": true,
      "timestamp": "2024-01-15T10:00:00Z",
      "timeSpent": 120
    },
    {
      "step": 2,
      "name": "Created profile",
      "completed": true,
      "timestamp": "2024-01-15T10:02:00Z",
      "timeSpent": 300
    },
    {
      "step": 3,
      "name": "Added debts",
      "completed": true,
      "timestamp": "2024-01-15T10:07:00Z",
      "timeSpent": 600
    },
    {
      "step": 4,
      "name": "Viewed recommendations",
      "completed": true,
      "timestamp": "2024-01-15T10:17:00Z",
      "timeSpent": 180
    }
  ],
  "completion": {
    "completed": true,
    "totalTime": 1200,
    "dropoffPoint": null
  },
  "insights": [
    "You completed onboarding faster than average (20 minutes vs 30 minutes)",
    "You spent the most time adding debts, which is normal",
    "You're ready to start creating scenarios"
  ]
}
```

**Example:**
```bash
curl -X GET https://api.debtpathfinder.com/v1/analytics/funnels/onboarding \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get Feature Usage

Tracks which features users engage with most.

**Endpoint:** `GET /analytics/features`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "features": [
    {
      "name": "Scenario Comparison",
      "used": true,
      "usageCount": 5,
      "lastUsed": "2024-01-15T10:30:00Z",
      "timeSpent": 900,
      "engagement": "high"
    },
    {
      "name": "What-If Analysis",
      "used": true,
      "usageCount": 3,
      "lastUsed": "2024-01-15T10:25:00Z",
      "timeSpent": 600,
      "engagement": "medium"
    },
    {
      "name": "AI Guidance",
      "used": true,
      "usageCount": 2,
      "lastUsed": "2024-01-15T10:20:00Z",
      "timeSpent": 300,
      "engagement": "medium"
    },
    {
      "name": "CSV Import",
      "used": false,
      "usageCount": 0,
      "lastUsed": null,
      "timeSpent": 0,
      "engagement": "none"
    }
  ],
  "mostUsed": "Scenario Comparison",
  "leastUsed": "CSV Import",
  "recommendations": [
    "You're making great use of scenario comparison",
    "Try the CSV import feature to add multiple debts quickly",
    "Explore the progress tracking feature to monitor your journey"
  ]
}
```

**Example:**
```bash
curl -X GET https://api.debtpathfinder.com/v1/analytics/features \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Event Properties

### Standard Properties

All events automatically include:
```json
{
  "sessionId": "session-550e8400",
  "userId": "user-hash",
  "timestamp": "2024-01-15T10:30:00Z",
  "userAgent": "Mozilla/5.0...",
  "platform": "web",
  "version": "1.0.0"
}
```

### Custom Properties

Add context-specific properties:
```json
{
  "event": "scenario_created",
  "properties": {
    "strategy": "avalanche",
    "monthlyPayment": 800,
    "totalDebts": 3,
    "totalBalance": 20000,
    "source": "dashboard",
    "confidence": "high"
  }
}
```

---

## Privacy & Data Retention

### Privacy
- No PII is stored in analytics
- User IDs are hashed
- IP addresses are anonymized
- Location data is aggregated to city level

### Data Retention
- Event data: 90 days
- Aggregated analytics: 2 years
- Session data: 30 days
- Milestone data: Permanent (anonymized)

### GDPR Compliance
- Users can request data deletion
- Analytics data is anonymized
- No cross-session tracking without consent

---

## Best Practices

### 1. Track Key User Actions

```javascript
// Track important events
async function trackEvent(event, properties = {}) {
  await fetch('/api/v1/analytics/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      event,
      properties,
      timestamp: new Date().toISOString()
    })
  });
}

// Usage
trackEvent('scenario_created', {
  strategy: 'avalanche',
  monthlyPayment: 800,
  source: 'dashboard'
});
```

### 2. Batch Events for Performance

```javascript
const eventQueue = [];

function queueEvent(event, properties) {
  eventQueue.push({
    event,
    properties,
    timestamp: new Date().toISOString()
  });
  
  // Flush every 10 events or 30 seconds
  if (eventQueue.length >= 10) {
    flushEvents();
  }
}

async function flushEvents() {
  if (eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  eventQueue.length = 0;
  
  await fetch('/api/v1/analytics/events/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ events })
  });
}

// Flush on page unload
window.addEventListener('beforeunload', flushEvents);
```

### 3. Track Page Views

```javascript
// Track page views automatically
function trackPageView(page) {
  trackEvent('page_viewed', {
    page,
    referrer: document.referrer,
    url: window.location.href
  });
}

// Usage with React Router
useEffect(() => {
  trackPageView(location.pathname);
}, [location]);
```

### 4. Celebrate Milestones

```javascript
async function checkAndCelebrateMilestone() {
  const progress = calculateProgress();
  
  if (progress.milestoneReached) {
    const response = await fetch('/api/v1/analytics/milestones', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        milestone: progress.milestone,
        data: progress.data
      })
    }).then(r => r.json());
    
    // Show celebration
    showCelebration(response.celebration);
  }
}
```

---

## Related Documentation

- [Sessions API](./sessions.md) - Session management
- [AI Services API](./ai-services.md) - AI-powered insights
- [Export API](./export.md) - Data export
- [Data Models](./data-models.md) - Complete type definitions