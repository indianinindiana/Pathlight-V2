# Personalization API

Deliver dynamic, context-aware content including personalized alerts, hints, and next best actions.

---

## Overview

The Personalization API provides endpoints for generating personalized microcopy, contextual alerts, and actionable recommendations based on the user's financial situation, stress level, and goals.

**Base Path:** `/personalization`

---

## Endpoints

### Get Personalized Microcopy

Returns personalized alerts, hints, and messages based on user context.

**Endpoint:** `POST /personalization/microcopy`

**Authentication:** Required

**Request Body:**
```json
{
  "context": {
    "page": "dashboard",
    "stressLevel": 4,
    "cashFlow": -200,
    "debtCount": 5,
    "goal": "pay-faster",
    "hasEmergencyFund": false,
    "delinquentDebts": 1
  }
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `page` | string | Current page/context |
| `stressLevel` | number | User's stress level (1-5) |
| `cashFlow` | number | Available monthly cash flow |
| `debtCount` | number | Number of debts |
| `goal` | string | User's primary goal |
| `hasEmergencyFund` | boolean | Whether user has emergency savings |
| `delinquentDebts` | number | Number of delinquent debts |

**Response:** `200 OK`
```json
{
  "alerts": [
    {
      "type": "warning",
      "message": "We notice you're feeling stressed. Let's focus on creating breathing room first.",
      "condition": true,
      "priority": 1,
      "dismissible": false,
      "actionable": true,
      "action": {
        "label": "Review Budget",
        "endpoint": "/budget-review"
      }
    },
    {
      "type": "error",
      "message": "Your expenses exceed income. Let's explore ways to free up cash flow.",
      "condition": true,
      "priority": 2,
      "dismissible": false
    },
    {
      "type": "warning",
      "message": "You have 1 delinquent debt. Addressing this should be your top priority.",
      "condition": true,
      "priority": 3,
      "dismissible": true
    }
  ],
  "hints": [
    {
      "location": "scenarios",
      "message": "Given your stress level, the Snowball method might provide the motivation you need through quick wins.",
      "trigger": "strategy-selection",
      "dismissible": true
    },
    {
      "location": "debt-entry",
      "message": "Consider building a small emergency fund before aggressive debt payoff to prevent new debt.",
      "trigger": "low-savings",
      "dismissible": true
    }
  ],
  "motivationalMessage": "You're taking the right steps by seeking help. Every journey starts with a single step, and you've already taken it.",
  "tone": "empathetic"
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/personalization/microcopy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "page": "dashboard",
      "stressLevel": 4,
      "cashFlow": -200,
      "debtCount": 5,
      "goal": "pay-faster"
    }
  }'
```

---

### Get Next Best Actions

Returns prioritized, actionable recommendations based on user's current situation.

**Endpoint:** `POST /personalization/actions`

**Authentication:** Required

**Request Body:**
```json
{
  "debts": [
    {
      "id": "debt-1",
      "type": "credit-card",
      "balance": 5000,
      "apr": 22.99,
      "minimumPayment": 150
    }
  ],
  "financialContext": {
    "monthlyIncome": 5000,
    "monthlyExpenses": 3500,
    "liquidSavings": 500,
    "creditScoreRange": "670-739",
    "stressLevel": 4
  },
  "cashFlow": 1500
}
```

**Response:** `200 OK`
```json
{
  "actions": [
    {
      "priority": 1,
      "title": "Build Emergency Buffer",
      "description": "Save $500 more to reach $1,000 emergency fund before aggressive debt payoff",
      "impact": "Prevents falling behind on payments during unexpected expenses",
      "cta": "Start Saving Plan",
      "action": "emergency-savings",
      "progress": 0.5,
      "confidence": "high",
      "estimatedTimeToComplete": "2-3 months",
      "potentialSavings": null,
      "reasoning": [
        "Your current savings ($500) is below recommended minimum",
        "Emergency fund prevents new debt from unexpected expenses",
        "High stress level indicates need for financial cushion"
      ]
    },
    {
      "priority": 2,
      "title": "Attack High-Interest Debt",
      "description": "Pay extra $200/month on credit card (22.99% APR)",
      "impact": "Save $1,200 in interest over 2 years",
      "cta": "Start Avalanche Plan",
      "action": "high-interest-focus",
      "progress": 0,
      "confidence": "high",
      "estimatedTimeToComplete": "18 months",
      "potentialSavings": 1200,
      "reasoning": [
        "22.99% APR is significantly above average",
        "You have $1,500 available monthly cash flow",
        "Targeting high-interest debt saves the most money"
      ]
    },
    {
      "priority": 3,
      "title": "Explore Debt Consolidation",
      "description": "With your 670-739 credit score, you may qualify for 10-12% APR consolidation loan",
      "impact": "Could save $800/year in interest",
      "cta": "See Options",
      "action": "consolidation",
      "progress": 0,
      "confidence": "medium",
      "estimatedTimeToComplete": "1-2 months to apply",
      "potentialSavings": 800,
      "reasoning": [
        "Your credit score qualifies for better rates",
        "Current weighted APR is 22.99%",
        "Consolidation could simplify payments and reduce interest"
      ]
    }
  ],
  "summary": {
    "totalActions": 3,
    "highPriority": 2,
    "estimatedTotalSavings": 2000,
    "recommendedFocus": "Build emergency fund first, then attack high-interest debt"
  }
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/personalization/actions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [...],
    "financialContext": {...},
    "cashFlow": 1500
  }'
```

---

### Get Contextual Guidance

Returns situation-specific guidance and tips.

**Endpoint:** `POST /personalization/guidance`

**Authentication:** Required

**Request Body:**
```json
{
  "situation": "negative-cash-flow",
  "context": {
    "cashFlow": -200,
    "stressLevel": 4,
    "debtCount": 5,
    "hasEmergencyFund": false
  }
}
```

**Situation Types:**
- `negative-cash-flow` - Expenses exceed income
- `high-stress` - Stress level 4-5
- `delinquent-debt` - Has past-due debts
- `low-savings` - Insufficient emergency fund
- `high-interest` - Debts with APR > 20%
- `multiple-debts` - 5+ separate debts

**Response:** `200 OK`
```json
{
  "guidance": {
    "title": "Managing Negative Cash Flow",
    "summary": "When expenses exceed income, the priority is creating breathing room before aggressive debt payoff.",
    "steps": [
      {
        "order": 1,
        "title": "Review and Reduce Expenses",
        "description": "Look for areas to cut spending temporarily",
        "examples": [
          "Pause subscriptions you don't use regularly",
          "Reduce dining out and entertainment",
          "Shop for better rates on insurance and utilities"
        ]
      },
      {
        "order": 2,
        "title": "Explore Income Opportunities",
        "description": "Consider ways to increase income",
        "examples": [
          "Ask for overtime at current job",
          "Take on freelance or gig work",
          "Sell items you no longer need"
        ]
      },
      {
        "order": 3,
        "title": "Contact Creditors",
        "description": "Many creditors offer hardship programs",
        "examples": [
          "Request temporary payment reduction",
          "Ask about hardship programs",
          "Negotiate lower interest rates"
        ]
      }
    ],
    "warnings": [
      "Avoid taking on new debt to cover expenses",
      "Don't ignore bills - contact creditors proactively",
      "Be cautious of debt settlement companies with high fees"
    ],
    "resources": [
      {
        "title": "Budget Calculator",
        "url": "/tools/budget-calculator"
      },
      {
        "title": "Creditor Contact Guide",
        "url": "/guides/contacting-creditors"
      }
    ]
  }
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/personalization/guidance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "situation": "negative-cash-flow",
    "context": {
      "cashFlow": -200,
      "stressLevel": 4
    }
  }'
```

---

### Get Motivational Message

Returns a personalized motivational message based on user's situation and progress.

**Endpoint:** `POST /personalization/motivation`

**Authentication:** Required

**Request Body:**
```json
{
  "context": {
    "stressLevel": 4,
    "progress": 0.15,
    "milestone": "first-debt-paid",
    "daysActive": 30,
    "goal": "pay-faster"
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "You've paid off your first debt! That's a huge accomplishment. You're 15% of the way to being debt-free.",
  "tone": "celebratory",
  "encouragement": "Keep this momentum going. Each debt you eliminate makes the next one easier.",
  "nextMilestone": {
    "name": "25% debt-free",
    "progress": 0.25,
    "estimatedDate": "2024-06-15"
  }
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/personalization/motivation \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "stressLevel": 3,
      "progress": 0.15,
      "milestone": "first-debt-paid"
    }
  }'
```

---

### Get Page-Specific Content

Returns personalized content for a specific page or view.

**Endpoint:** `GET /personalization/page/{pageName}`

**Authentication:** Required

**Path Parameters:**
- `pageName` (string, required) - Page identifier: `dashboard`, `scenarios`, `debt-entry`, `what-if`

**Query Parameters:**
- `includeAlerts` (boolean) - Include alerts (default: true)
- `includeHints` (boolean) - Include hints (default: true)
- `includeActions` (boolean) - Include next actions (default: false)

**Response:** `200 OK`
```json
{
  "page": "dashboard",
  "headline": "Your Debt Snapshot",
  "subheadline": "Here's an overview of your current debt situation",
  "alerts": [...],
  "hints": [...],
  "callToAction": {
    "primary": {
      "text": "Explore Payoff Scenarios",
      "action": "/scenarios",
      "reasoning": "You have positive cash flow - see how quickly you can become debt-free"
    },
    "secondary": {
      "text": "Build Emergency Fund",
      "action": "/savings-plan",
      "reasoning": "Protect yourself from unexpected expenses"
    }
  }
}
```

**Example:**
```bash
curl -X GET "https://api.debtpathfinder.com/v1/personalization/page/dashboard?includeActions=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Personalization Rules

### Stress-Based Messaging

**High Stress (4-5):**
- Empathetic, supportive tone
- Focus on immediate relief
- Suggest Snowball method for quick wins
- Emphasize small, achievable steps

**Medium Stress (3):**
- Balanced, encouraging tone
- Mix of short and long-term strategies
- Provide options and flexibility

**Low Stress (1-2):**
- Confident, optimistic tone
- Focus on optimization
- Suggest Avalanche method for savings
- Emphasize long-term benefits

### Cash Flow-Based Actions

**Negative Cash Flow:**
- Priority: Budget review and expense reduction
- Suggest contacting creditors
- Focus on avoiding delinquency

**Low Cash Flow ($0-$100):**
- Priority: Find ways to increase available funds
- Suggest minimum payments only
- Focus on stability

**Moderate Cash Flow ($100-$500):**
- Priority: Build emergency fund
- Suggest modest extra payments
- Balance savings and debt payoff

**High Cash Flow ($500+):**
- Priority: Aggressive debt payoff
- Suggest significant extra payments
- Focus on interest savings

### Goal-Based Recommendations

**Pay Faster:**
- Recommend Avalanche method
- Suggest maximum extra payments
- Focus on timeline reduction

**Lower Payment:**
- Recommend consolidation options
- Suggest refinancing opportunities
- Focus on monthly budget relief

**Reduce Interest:**
- Recommend Avalanche method
- Suggest balance transfers
- Focus on total cost savings

**Avoid Default:**
- Recommend minimum payments
- Suggest hardship programs
- Focus on staying current

---

## Best Practices

### 1. Request Personalization on Page Load

```javascript
async function loadPageContent(pageName) {
  const content = await fetch(
    `/api/v1/personalization/page/${pageName}?includeActions=true`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  ).then(r => r.json());
  
  displayAlerts(content.alerts);
  displayHints(content.hints);
  updateCTA(content.callToAction);
}
```

### 2. Update Actions Based on User Changes

```javascript
async function updateNextActions() {
  const debts = await getDebts();
  const profile = await getProfile();
  const cashFlow = profile.monthlyIncome - profile.monthlyExpenses;
  
  const actions = await fetch('/api/v1/personalization/actions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      debts,
      financialContext: profile,
      cashFlow
    })
  }).then(r => r.json());
  
  displayActions(actions.actions);
}
```

### 3. Show Contextual Guidance

```javascript
async function showGuidance(situation) {
  const guidance = await fetch('/api/v1/personalization/guidance', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      situation,
      context: getUserContext()
    })
  }).then(r => r.json());
  
  displayGuidanceModal(guidance.guidance);
}
```

### 4. Celebrate Milestones

```javascript
async function checkMilestones() {
  const progress = calculateProgress();
  
  if (progress.milestoneReached) {
    const motivation = await fetch('/api/v1/personalization/motivation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        context: {
          stressLevel: profile.stressLevel,
          progress: progress.percentage,
          milestone: progress.milestone,
          daysActive: progress.daysActive
        }
      })
    }).then(r => r.json());
    
    showCelebration(motivation);
  }
}
```

---

## Alert Types and Priorities

### Alert Types

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| `error` | Red | ⚠️ | Critical issues requiring immediate attention |
| `warning` | Orange | ⚡ | Important issues that should be addressed soon |
| `info` | Blue | ℹ️ | Helpful information and tips |
| `success` | Green | ✓ | Positive feedback and achievements |

### Priority Levels

1. **Critical (Priority 1)** - Delinquent debts, negative cash flow
2. **High (Priority 2)** - High stress, low emergency fund
3. **Medium (Priority 3)** - Optimization opportunities
4. **Low (Priority 4)** - General tips and suggestions

---

## Related Documentation

- [Profile API](./profile.md) - User financial context
- [Debts API](./debts.md) - Debt management
- [Recommendations API](./recommendations.md) - Strategy recommendations
- [AI Services API](./ai-services.md) - AI-powered insights
- [Data Models](./data-models.md) - Complete type definitions