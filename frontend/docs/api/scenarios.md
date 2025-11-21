# Scenarios API

Simulate and optimize debt payoff scenarios with detailed payment schedules and projections.

---

## Overview

The Scenarios API provides powerful simulation capabilities for modeling different debt payoff strategies. It generates detailed payment schedules, calculates total costs, and supports what-if analysis.

**Base Path:** `/scenarios`

---

## Endpoints

### Simulate Scenario

Simulates a debt payoff scenario with a specific strategy and monthly payment.

**Endpoint:** `POST /scenarios/simulate`

**Authentication:** Required

**Request Body:**
```json
{
  "debts": [
    {
      "id": "debt-1",
      "type": "credit-card",
      "balance": 5000,
      "apr": 18.99,
      "minimumPayment": 150
    },
    {
      "id": "debt-2",
      "type": "auto-loan",
      "balance": 15000,
      "apr": 5.99,
      "minimumPayment": 350
    }
  ],
  "strategy": "avalanche",
  "monthlyPayment": 800,
  "startDate": "2024-02-01",
  "includeSchedule": true
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `debts` | array | Yes | Array of debt objects |
| `strategy` | enum | Yes | Strategy: `snowball`, `avalanche`, `custom` |
| `monthlyPayment` | number | Yes | Total monthly payment amount |
| `startDate` | string | No | Start date (ISO 8601, default: today) |
| `includeSchedule` | boolean | No | Include detailed payment schedule (default: false) |

**Response:** `200 OK`
```json
{
  "scenario": {
    "id": "scenario-550e8400",
    "name": "Avalanche Strategy",
    "strategy": "avalanche",
    "monthlyPayment": 800,
    "totalMonths": 36,
    "totalInterest": 3200,
    "totalPaid": 23200,
    "payoffDate": "2027-02-01T00:00:00Z",
    "startDate": "2024-02-01T00:00:00Z",
    "debtOrder": [
      {
        "debtId": "debt-1",
        "debtName": "Credit Card",
        "priority": 1,
        "reason": "Highest APR (18.99%)"
      },
      {
        "debtId": "debt-2",
        "debtName": "Auto Loan",
        "priority": 2,
        "reason": "Lower APR (5.99%)"
      }
    ],
    "milestones": [
      {
        "month": 12,
        "date": "2025-02-01T00:00:00Z",
        "event": "First debt paid off",
        "debtName": "Credit Card",
        "remainingDebts": 1
      },
      {
        "month": 36,
        "date": "2027-02-01T00:00:00Z",
        "event": "Debt-free!",
        "debtName": "Auto Loan",
        "remainingDebts": 0
      }
    ]
  },
  "schedule": [
    {
      "month": 1,
      "date": "2024-02-01T00:00:00Z",
      "payments": [
        {
          "debtId": "debt-1",
          "debtName": "Credit Card",
          "payment": 450,
          "principal": 370.87,
          "interest": 79.13,
          "remainingBalance": 4629.13
        },
        {
          "debtId": "debt-2",
          "debtName": "Auto Loan",
          "payment": 350,
          "principal": 275.13,
          "interest": 74.87,
          "remainingBalance": 14724.87
        }
      ],
      "totalPayment": 800,
      "totalPrincipal": 646,
      "totalInterest": 154,
      "totalRemainingBalance": 19354
    }
  ],
  "comparison": {
    "vsMinimumPayments": {
      "monthsSaved": 24,
      "interestSaved": 4800,
      "percentageSaved": 60
    }
  }
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/scenarios/simulate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [...],
    "strategy": "avalanche",
    "monthlyPayment": 800,
    "includeSchedule": true
  }'
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Invalid or expired token
- `422 Unprocessable Entity` - Monthly payment below minimum

---

### Optimize Payment Amount

Finds the optimal monthly payment based on user's goals and constraints.

**Endpoint:** `POST /scenarios/optimize`

**Authentication:** Required

**Request Body:**
```json
{
  "debts": [...],
  "strategy": "avalanche",
  "constraints": {
    "maxMonthlyPayment": 1000,
    "minMonthlyPayment": 500,
    "targetPayoffMonths": 36,
    "maxTotalInterest": 3000
  },
  "goal": "minimize-interest"
}
```

**Goal Options:**
- `minimize-interest` - Lowest total interest
- `minimize-time` - Fastest payoff
- `balance` - Balance between time and cost
- `target-date` - Hit specific payoff date

**Response:** `200 OK`
```json
{
  "optimized": {
    "monthlyPayment": 850,
    "totalMonths": 34,
    "totalInterest": 2950,
    "payoffDate": "2026-12-01T00:00:00Z",
    "meetsConstraints": true
  },
  "alternatives": [
    {
      "monthlyPayment": 800,
      "totalMonths": 36,
      "totalInterest": 3200,
      "tradeoff": "Save $50/month but pay $250 more interest"
    },
    {
      "monthlyPayment": 900,
      "totalMonths": 32,
      "totalInterest": 2700,
      "tradeoff": "Pay $50 more/month to save $250 interest"
    }
  ],
  "reasoning": "Monthly payment of $850 minimizes interest while staying within your budget constraints"
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/scenarios/optimize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [...],
    "strategy": "avalanche",
    "constraints": {
      "maxMonthlyPayment": 1000
    },
    "goal": "minimize-interest"
  }'
```

---

### Compare Scenarios

Compares multiple scenarios side-by-side with detailed analysis.

**Endpoint:** `POST /scenarios/compare`

**Authentication:** Required

**Request Body:**
```json
{
  "scenarios": [
    {
      "name": "Minimum Payments",
      "debts": [...],
      "strategy": "snowball",
      "monthlyPayment": 500
    },
    {
      "name": "Aggressive Payoff",
      "debts": [...],
      "strategy": "avalanche",
      "monthlyPayment": 800
    },
    {
      "name": "Moderate Approach",
      "debts": [...],
      "strategy": "hybrid",
      "monthlyPayment": 650
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "comparison": [
    {
      "name": "Minimum Payments",
      "strategy": "snowball",
      "monthlyPayment": 500,
      "totalMonths": 60,
      "totalInterest": 8000,
      "totalPaid": 28000,
      "payoffDate": "2029-02-01T00:00:00Z"
    },
    {
      "name": "Aggressive Payoff",
      "strategy": "avalanche",
      "monthlyPayment": 800,
      "totalMonths": 36,
      "totalInterest": 3200,
      "totalPaid": 23200,
      "payoffDate": "2027-02-01T00:00:00Z"
    },
    {
      "name": "Moderate Approach",
      "strategy": "hybrid",
      "monthlyPayment": 650,
      "totalMonths": 45,
      "totalInterest": 5100,
      "totalPaid": 25100,
      "payoffDate": "2027-11-01T00:00:00Z"
    }
  ],
  "analysis": {
    "fastest": "Aggressive Payoff",
    "cheapest": "Aggressive Payoff",
    "lowestPayment": "Minimum Payments",
    "bestValue": "Aggressive Payoff",
    "insights": [
      "Aggressive Payoff saves $4,800 in interest compared to Minimum Payments",
      "Aggressive Payoff gets you debt-free 24 months faster",
      "Moderate Approach offers middle ground with $150 extra monthly payment"
    ]
  },
  "visualizations": {
    "interestComparison": {
      "labels": ["Minimum Payments", "Aggressive Payoff", "Moderate Approach"],
      "values": [8000, 3200, 5100]
    },
    "timelineComparison": {
      "labels": ["Minimum Payments", "Aggressive Payoff", "Moderate Approach"],
      "values": [60, 36, 45]
    }
  }
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/scenarios/compare \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenarios": [...]
  }'
```

---

### What-If Analysis

Simulates changes to debts or financial situation.

**Endpoint:** `POST /scenarios/what-if`

**Authentication:** Required

**Request Body:**
```json
{
  "baseScenario": {
    "debts": [...],
    "strategy": "avalanche",
    "monthlyPayment": 800
  },
  "modifications": {
    "type": "extra-payment",
    "changes": {
      "extraMonthlyPayment": 200
    }
  }
}
```

**Modification Types:**

1. **Extra Payment**
```json
{
  "type": "extra-payment",
  "changes": {
    "extraMonthlyPayment": 200
  }
}
```

2. **Income Change**
```json
{
  "type": "income-change",
  "changes": {
    "newMonthlyIncome": 6000,
    "effectiveDate": "2024-06-01"
  }
}
```

3. **APR Change**
```json
{
  "type": "apr-change",
  "changes": {
    "debtId": "debt-1",
    "newAPR": 10.5,
    "reason": "Refinanced"
  }
}
```

4. **Consolidation**
```json
{
  "type": "consolidation",
  "changes": {
    "debtIds": ["debt-1", "debt-2"],
    "newAPR": 8.5,
    "originationFee": 500
  }
}
```

5. **Balance Transfer**
```json
{
  "type": "balance-transfer",
  "changes": {
    "debtId": "debt-1",
    "promoAPR": 0,
    "promoMonths": 18,
    "transferFee": 3,
    "postPromoAPR": 15.99
  }
}
```

6. **Windfall**
```json
{
  "type": "windfall",
  "changes": {
    "amount": 5000,
    "applyToDebtId": "debt-1",
    "date": "2024-04-15"
  }
}
```

**Response:** `200 OK`
```json
{
  "baseScenario": {
    "totalMonths": 36,
    "totalInterest": 3200,
    "monthlyPayment": 800,
    "payoffDate": "2027-02-01T00:00:00Z"
  },
  "whatIfScenario": {
    "totalMonths": 28,
    "totalInterest": 2400,
    "monthlyPayment": 1000,
    "payoffDate": "2026-06-01T00:00:00Z"
  },
  "impact": {
    "monthsSaved": 8,
    "interestSaved": 800,
    "percentageSaved": 25,
    "additionalMonthlyPayment": 200,
    "totalAdditionalPayment": 5600
  },
  "recommendation": "Paying an extra $200/month would save you $800 in interest and get you debt-free 8 months faster. This is a great option if your budget allows.",
  "breakeven": {
    "months": 7,
    "description": "After 7 months, your interest savings exceed the extra payments"
  }
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/scenarios/what-if \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "baseScenario": {...},
    "modifications": {
      "type": "extra-payment",
      "changes": {
        "extraMonthlyPayment": 200
      }
    }
  }'
```

---

### Get Payment Schedule

Retrieves detailed payment schedule for a scenario.

**Endpoint:** `GET /scenarios/{scenarioId}/schedule`

**Authentication:** Required

**Path Parameters:**
- `scenarioId` (string, required) - The scenario ID

**Query Parameters:**
- `startMonth` (number) - Start month (default: 1)
- `endMonth` (number) - End month (default: all)
- `format` (string) - Format: `json`, `csv` (default: json)

**Response:** `200 OK`
```json
{
  "scenarioId": "scenario-550e8400",
  "schedule": [
    {
      "month": 1,
      "date": "2024-02-01T00:00:00Z",
      "payments": [
        {
          "debtId": "debt-1",
          "debtName": "Credit Card",
          "payment": 450,
          "principal": 370.87,
          "interest": 79.13,
          "remainingBalance": 4629.13,
          "percentPaid": 7.4
        },
        {
          "debtId": "debt-2",
          "debtName": "Auto Loan",
          "payment": 350,
          "principal": 275.13,
          "interest": 74.87,
          "remainingBalance": 14724.87,
          "percentPaid": 1.8
        }
      ],
      "totalPayment": 800,
      "totalPrincipal": 646,
      "totalInterest": 154,
      "totalRemainingBalance": 19354,
      "cumulativeInterest": 154,
      "cumulativePrincipal": 646
    }
  ],
  "summary": {
    "totalMonths": 36,
    "totalPayments": 28800,
    "totalPrincipal": 20000,
    "totalInterest": 3200,
    "averageMonthlyInterest": 88.89
  }
}
```

**Example:**
```bash
curl -X GET "https://api.debtpathfinder.com/v1/scenarios/scenario-550e8400/schedule?startMonth=1&endMonth=12" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Calculate Payoff Date

Calculates when a specific debt or all debts will be paid off.

**Endpoint:** `POST /scenarios/payoff-date`

**Authentication:** Required

**Request Body:**
```json
{
  "debts": [...],
  "monthlyPayment": 800,
  "strategy": "avalanche",
  "targetDebtId": "debt-1"
}
```

**Response:** `200 OK`
```json
{
  "targetDebt": {
    "debtId": "debt-1",
    "debtName": "Credit Card",
    "payoffDate": "2025-02-01T00:00:00Z",
    "monthsToPayoff": 12,
    "totalInterestPaid": 450,
    "totalPaid": 5450
  },
  "allDebts": {
    "payoffDate": "2027-02-01T00:00:00Z",
    "monthsToPayoff": 36,
    "totalInterestPaid": 3200,
    "totalPaid": 23200
  },
  "milestones": [
    {
      "month": 12,
      "date": "2025-02-01T00:00:00Z",
      "event": "Credit Card paid off",
      "remainingDebts": 1,
      "remainingBalance": 14500
    },
    {
      "month": 36,
      "date": "2027-02-01T00:00:00Z",
      "event": "All debts paid off",
      "remainingDebts": 0,
      "remainingBalance": 0
    }
  ]
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/scenarios/payoff-date \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [...],
    "monthlyPayment": 800,
    "strategy": "avalanche"
  }'
```

---

### Validate Scenario

Validates scenario parameters before simulation.

**Endpoint:** `POST /scenarios/validate`

**Authentication:** Required

**Request Body:**
```json
{
  "debts": [...],
  "strategy": "avalanche",
  "monthlyPayment": 400
}
```

**Response:** `200 OK`
```json
{
  "valid": false,
  "errors": [
    {
      "field": "monthlyPayment",
      "message": "Monthly payment must be at least the sum of minimum payments",
      "severity": "error",
      "details": {
        "provided": 400,
        "minimumRequired": 500,
        "totalMinimumPayments": 500
      }
    }
  ],
  "warnings": [
    {
      "field": "strategy",
      "message": "Avalanche method may take longer to see first debt paid off",
      "severity": "warning",
      "suggestion": "Consider Snowball method for quicker wins"
    }
  ],
  "suggestions": [
    {
      "field": "monthlyPayment",
      "message": "Increase to $650 to pay off debt in 3 years",
      "suggestedValue": 650
    }
  ]
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/scenarios/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [...],
    "monthlyPayment": 400
  }'
```

---

## Calculation Algorithms

### Snowball Method

```
1. Sort debts by balance (smallest first)
2. For each month:
   a. Pay minimum on all debts
   b. Apply extra payment to smallest debt
   c. When debt is paid off, move to next smallest
3. Continue until all debts paid
```

### Avalanche Method

```
1. Sort debts by APR (highest first)
2. For each month:
   a. Pay minimum on all debts
   b. Apply extra payment to highest APR debt
   c. When debt is paid off, move to next highest APR
3. Continue until all debts paid
```

### Hybrid Method

```
1. Identify quick wins (debts < $1000 or < 6 months payoff)
2. Pay off quick wins first (motivation)
3. Then switch to Avalanche for remaining debts
4. Balance psychological wins with mathematical optimization
```

### Interest Calculation

```
Monthly Interest = (Balance * APR / 100) / 12
Principal Payment = Total Payment - Monthly Interest
New Balance = Balance - Principal Payment
```

---

## Best Practices

### 1. Validate Before Simulating

```javascript
async function simulateScenario(params) {
  // Validate first
  const validation = await fetch('/api/v1/scenarios/validate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  }).then(r => r.json());
  
  if (!validation.valid) {
    showErrors(validation.errors);
    return;
  }
  
  // Simulate if valid
  return fetch('/api/v1/scenarios/simulate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
}
```

### 2. Use What-If for Exploration

```javascript
async function exploreOptions() {
  const base = await simulateScenario({
    debts,
    strategy: 'avalanche',
    monthlyPayment: 800
  });
  
  // Try extra payment
  const extraPayment = await fetch('/api/v1/scenarios/what-if', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      baseScenario: base,
      modifications: {
        type: 'extra-payment',
        changes: { extraMonthlyPayment: 200 }
      }
    })
  }).then(r => r.json());
  
  displayComparison(base, extraPayment);
}
```

### 3. Optimize for User Goals

```javascript
async function findOptimalPayment(goal) {
  const optimized = await fetch('/api/v1/scenarios/optimize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      debts,
      strategy: 'avalanche',
      constraints: {
        maxMonthlyPayment: availableCashFlow
      },
      goal
    })
  }).then(r => r.json());
  
  return optimized.monthlyPayment;
}
```

### 4. Cache Scenarios

```javascript
const scenarioCache = new Map();

async function getOrSimulateScenario(params) {
  const cacheKey = JSON.stringify(params);
  
  if (scenarioCache.has(cacheKey)) {
    return scenarioCache.get(cacheKey);
  }
  
  const scenario = await simulateScenario(params);
  scenarioCache.set(cacheKey, scenario);
  
  return scenario;
}
```

---

## Performance Considerations

### Schedule Generation
- Full schedules can be large (36+ months × multiple debts)
- Use `includeSchedule: false` for quick comparisons
- Request specific month ranges when needed

### Optimization
- Optimization may take 2-5 seconds for complex scenarios
- Consider showing loading indicator
- Cache optimization results

### What-If Analysis
- Each what-if creates a new simulation
- Limit concurrent what-if requests
- Consider debouncing user input

---

## Related Documentation

- [Recommendations API](./recommendations.md) - Strategy recommendations
- [Debts API](./debts.md) - Debt management
- [Export API](./export.md) - Export scenarios
- [Data Models](./data-models.md) - Complete type definitions