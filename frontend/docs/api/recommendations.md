# Recommendations API

Generate intelligent debt payoff strategy recommendations with confidence scoring and detailed explanations.

---

## Overview

The Recommendations API analyzes user debts and financial context to recommend optimal payoff strategies. It provides confidence scores, alternative strategies, and detailed reasoning for all recommendations.

**Base Path:** `/recommendations`

---

## Endpoints

### Get Strategy Recommendation

Recommends the best debt payoff strategy based on user's situation.

**Endpoint:** `POST /recommendations/strategy`

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
    },
    {
      "id": "debt-2",
      "type": "auto-loan",
      "balance": 15000,
      "apr": 5.99,
      "minimumPayment": 350
    }
  ],
  "financialContext": {
    "monthlyIncome": 5000,
    "monthlyExpenses": 3500,
    "liquidSavings": 2000,
    "creditScoreRange": "670-739",
    "primaryGoal": "pay-faster",
    "stressLevel": 3
  },
  "currentStrategy": "snowball"
}
```

**Response:** `200 OK`
```json
{
  "recommendedStrategy": "avalanche",
  "confidence": "high",
  "confidenceScore": 0.92,
  "explanation": "The Avalanche method will save you the most money by targeting your highest-interest debts first. With your 22.99% APR credit card, you'll save approximately $1,200 in interest compared to the Snowball method.",
  "factors": [
    {
      "name": "Complete debt information",
      "met": true,
      "weight": 0.3,
      "description": "All required debt fields are present and valid"
    },
    {
      "name": "Accurate income data",
      "met": true,
      "weight": 0.25,
      "description": "Monthly income is provided and reasonable"
    },
    {
      "name": "Recent credit score",
      "met": true,
      "weight": 0.15,
      "description": "Credit score range is provided"
    },
    {
      "name": "Clear financial goals",
      "met": true,
      "weight": 0.1,
      "description": "Primary goal is defined"
    },
    {
      "name": "Sufficient emergency fund",
      "met": false,
      "weight": 0.2,
      "description": "Emergency fund is below 3 months of expenses"
    }
  ],
  "reasoning": [
    {
      "factor": "High-interest debt",
      "value": "22.99% APR credit card",
      "impact": "Avalanche method will save $1,200 in interest"
    },
    {
      "factor": "Moderate stress level",
      "value": "3 out of 5",
      "impact": "You can handle the delayed gratification of Avalanche method"
    },
    {
      "factor": "Primary goal",
      "value": "Pay faster",
      "impact": "Avalanche aligns with minimizing total payoff time"
    },
    {
      "factor": "Available cash flow",
      "value": "$1,500/month",
      "impact": "Sufficient funds for aggressive payoff"
    }
  ],
  "alternatives": [
    {
      "strategy": "snowball",
      "reason": "Better for motivation through quick wins",
      "potentialSavings": -400,
      "tradeoff": "Will cost $400 more in interest but provides psychological benefits",
      "recommendedIf": "Stress level increases or motivation becomes an issue"
    },
    {
      "strategy": "hybrid",
      "reason": "Balances savings with motivation",
      "potentialSavings": -200,
      "tradeoff": "Moderate approach between Avalanche and Snowball",
      "recommendedIf": "You want balance between savings and quick wins"
    }
  ],
  "projections": {
    "avalanche": {
      "totalMonths": 36,
      "totalInterest": 3200,
      "monthlyPayment": 800
    },
    "snowball": {
      "totalMonths": 38,
      "totalInterest": 3600,
      "monthlyPayment": 800
    },
    "hybrid": {
      "totalMonths": 37,
      "totalInterest": 3400,
      "monthlyPayment": 800
    }
  }
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/recommendations/strategy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [...],
    "financialContext": {...}
  }'
```

---

### Get Confidence Score

Returns a detailed confidence score for recommendations based on data completeness and quality.

**Endpoint:** `POST /recommendations/confidence`

**Authentication:** Required

**Request Body:**
```json
{
  "debts": [
    {
      "id": "debt-1",
      "balance": 5000,
      "apr": 22.99,
      "minimumPayment": 150
    }
  ],
  "financialContext": {
    "monthlyIncome": 5000,
    "monthlyExpenses": 3500,
    "liquidSavings": 2000,
    "creditScoreRange": "670-739",
    "stressLevel": 3
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
      "contribution": 0.3,
      "description": "All debts have complete information"
    },
    {
      "name": "Accurate income data",
      "met": true,
      "weight": 0.25,
      "contribution": 0.25,
      "description": "Monthly income is provided"
    },
    {
      "name": "Expense tracking",
      "met": true,
      "weight": 0.2,
      "contribution": 0.2,
      "description": "Monthly expenses are tracked"
    },
    {
      "name": "Recent credit score",
      "met": true,
      "weight": 0.15,
      "contribution": 0.15,
      "description": "Credit score range is provided"
    },
    {
      "name": "Clear financial goals",
      "met": false,
      "weight": 0.1,
      "contribution": 0,
      "description": "Primary goal not specified"
    }
  ],
  "suggestions": [
    "Add your primary financial goal to improve recommendation accuracy",
    "Consider adding payoff priority preference for more personalized strategies"
  ],
  "dataQuality": {
    "completeness": 0.85,
    "accuracy": 0.9,
    "recency": 1.0
  },
  "improvementPotential": {
    "maxScore": 1.0,
    "currentGap": 0.15,
    "easyWins": [
      {
        "action": "Add primary goal",
        "scoreIncrease": 0.1,
        "effort": "low"
      },
      {
        "action": "Add payoff priority",
        "scoreIncrease": 0.05,
        "effort": "low"
      }
    ]
  }
}
```

**Confidence Levels:**
- **High (0.8-1.0)**: Very reliable recommendations
- **Medium (0.5-0.79)**: Good recommendations with some uncertainty
- **Low (0-0.49)**: Limited data, recommendations may be less accurate

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/recommendations/confidence \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [...],
    "financialContext": {...}
  }'
```

---

### Compare Strategies

Compares multiple payoff strategies side-by-side.

**Endpoint:** `POST /recommendations/compare`

**Authentication:** Required

**Request Body:**
```json
{
  "debts": [...],
  "financialContext": {...},
  "strategies": ["snowball", "avalanche", "hybrid"],
  "monthlyPayment": 800
}
```

**Response:** `200 OK`
```json
{
  "comparison": [
    {
      "strategy": "avalanche",
      "totalMonths": 36,
      "totalInterest": 3200,
      "monthlyPayment": 800,
      "payoffDate": "2027-02-01",
      "pros": [
        "Saves the most money on interest",
        "Fastest path to debt freedom",
        "Mathematically optimal"
      ],
      "cons": [
        "May take longer to see first debt paid off",
        "Requires discipline and patience"
      ],
      "bestFor": [
        "Users focused on minimizing total cost",
        "Those with moderate to low stress levels",
        "People motivated by long-term savings"
      ]
    },
    {
      "strategy": "snowball",
      "totalMonths": 38,
      "totalInterest": 3600,
      "monthlyPayment": 800,
      "payoffDate": "2027-04-01",
      "pros": [
        "Quick wins build motivation",
        "Psychological benefits",
        "Reduces number of accounts faster"
      ],
      "cons": [
        "Costs more in interest",
        "Takes slightly longer overall"
      ],
      "bestFor": [
        "Users with high stress levels",
        "Those needing motivation",
        "People who value quick wins"
      ]
    },
    {
      "strategy": "hybrid",
      "totalMonths": 37,
      "totalInterest": 3400,
      "monthlyPayment": 800,
      "payoffDate": "2027-03-01",
      "pros": [
        "Balances savings and motivation",
        "Flexible approach",
        "Moderate interest savings"
      ],
      "cons": [
        "Not optimal for either savings or motivation",
        "More complex to manage"
      ],
      "bestFor": [
        "Users wanting balance",
        "Those with moderate stress",
        "People who value flexibility"
      ]
    }
  ],
  "recommendation": {
    "strategy": "avalanche",
    "reasoning": "Based on your moderate stress level and goal to pay faster, Avalanche offers the best combination of savings and speed."
  },
  "summary": {
    "fastestPayoff": "avalanche",
    "lowestInterest": "avalanche",
    "mostMotivating": "snowball",
    "bestBalance": "hybrid"
  }
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/recommendations/compare \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type": 'application/json' \
  -d '{
    "debts": [...],
    "strategies": ["snowball", "avalanche"],
    "monthlyPayment": 800
  }'
```

---

### Get Product Recommendations

Recommends financial products (consolidation loans, balance transfers, etc.) based on user's situation.

**Endpoint:** `POST /recommendations/products`

**Authentication:** Required

**Request Body:**
```json
{
  "debts": [...],
  "financialContext": {
    "creditScoreRange": "670-739",
    "monthlyIncome": 5000,
    "employmentStatus": "full-time"
  }
}
```

**Response:** `200 OK`
```json
{
  "recommendations": [
    {
      "id": "rec-1",
      "type": "consolidation",
      "name": "Personal Consolidation Loan",
      "provider": "Generic Lender",
      "newAPR": 10.5,
      "monthlyPaymentChange": -50,
      "interestSavings": 2400,
      "payoffTimeChange": -6,
      "fitScore": "high",
      "eligibilityCriteria": [
        "Credit score 670+",
        "Stable employment",
        "Debt-to-income ratio < 40%"
      ],
      "benefits": [
        "Single monthly payment",
        "Lower interest rate",
        "Fixed repayment term"
      ],
      "tradeoffs": [
        "May require origination fee (1-5%)",
        "Closing credit cards could impact credit score",
        "Requires good credit for best rates"
      ],
      "estimatedApprovalOdds": "high",
      "nextSteps": [
        "Check your credit score",
        "Compare multiple lenders",
        "Calculate total cost including fees"
      ]
    },
    {
      "id": "rec-2",
      "type": "balance-transfer",
      "name": "0% APR Balance Transfer Card",
      "provider": "Generic Card Issuer",
      "newAPR": 0,
      "promoMonths": 18,
      "transferFee": 3,
      "monthlyPaymentChange": 0,
      "interestSavings": 1800,
      "payoffTimeChange": 0,
      "fitScore": "medium",
      "eligibilityCriteria": [
        "Credit score 700+",
        "Low credit utilization",
        "Good payment history"
      ],
      "benefits": [
        "0% interest for 18 months",
        "Potential for significant savings",
        "Can pay off faster without interest"
      ],
      "tradeoffs": [
        "3% balance transfer fee",
        "High APR after promo period",
        "Requires discipline to pay off during promo"
      ],
      "estimatedApprovalOdds": "medium",
      "nextSteps": [
        "Calculate if savings exceed transfer fee",
        "Create payoff plan for promo period",
        "Compare multiple card offers"
      ]
    }
  ],
  "notRecommended": [
    {
      "type": "debt-settlement",
      "reason": "Your credit score and income suggest you can handle current debt load",
      "risks": [
        "Severe credit score damage",
        "Potential tax implications",
        "High fees from settlement companies"
      ]
    }
  ]
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/recommendations/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [...],
    "financialContext": {...}
  }'
```

---

### Get Optimization Suggestions

Provides specific suggestions to optimize debt payoff plan.

**Endpoint:** `POST /recommendations/optimize`

**Authentication:** Required

**Request Body:**
```json
{
  "debts": [...],
  "financialContext": {...},
  "currentStrategy": "snowball",
  "monthlyPayment": 800
}
```

**Response:** `200 OK`
```json
{
  "suggestions": [
    {
      "type": "strategy-change",
      "title": "Switch to Avalanche Method",
      "description": "Switching from Snowball to Avalanche could save you $400 in interest",
      "impact": {
        "interestSavings": 400,
        "timeSavings": 2,
        "effort": "low"
      },
      "implementation": "Simply prioritize debts by APR instead of balance",
      "priority": "high"
    },
    {
      "type": "payment-increase",
      "title": "Increase Monthly Payment by $100",
      "description": "You have $1,500 available cash flow. Increasing payment to $900 could save 8 months",
      "impact": {
        "interestSavings": 600,
        "timeSavings": 8,
        "effort": "medium"
      },
      "implementation": "Set up automatic extra payment of $100/month",
      "priority": "high"
    },
    {
      "type": "refinance",
      "title": "Refinance High-Interest Credit Card",
      "description": "Your 22.99% APR credit card could be refinanced to ~10% with your credit score",
      "impact": {
        "interestSavings": 1200,
        "timeSavings": 0,
        "effort": "high"
      },
      "implementation": "Apply for personal loan or balance transfer card",
      "priority": "medium"
    }
  ],
  "quickWins": [
    {
      "action": "Round up payments",
      "description": "Round $800 payment to $850",
      "impact": "Save $200 in interest, 3 months faster",
      "effort": "very-low"
    },
    {
      "action": "Apply windfalls",
      "description": "Put tax refunds toward debt",
      "impact": "Could save 6-12 months",
      "effort": "low"
    }
  ]
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/recommendations/optimize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [...],
    "currentStrategy": "snowball",
    "monthlyPayment": 800
  }'
```

---

## Recommendation Algorithm

### Strategy Selection Logic

```
IF stress_level >= 4:
    RECOMMEND snowball  // Quick wins for motivation
ELSE IF highest_apr > 18:
    RECOMMEND avalanche  // High interest warrants focus
ELSE IF debt_count > 5:
    RECOMMEND hybrid    // Balance for multiple debts
ELSE IF goal == "pay-faster":
    RECOMMEND avalanche  // Optimal for speed
ELSE IF goal == "lower-payment":
    RECOMMEND consolidation  // Reduce monthly burden
ELSE:
    RECOMMEND avalanche  // Default to optimal
```

### Confidence Scoring

```
confidence_score = (
    debt_completeness * 0.30 +
    income_accuracy * 0.25 +
    expense_tracking * 0.20 +
    credit_score_known * 0.15 +
    goals_defined * 0.10
)

IF confidence_score >= 0.8:
    confidence_level = "high"
ELSE IF confidence_score >= 0.5:
    confidence_level = "medium"
ELSE:
    confidence_level = "low"
```

---

## Best Practices

### 1. Always Check Confidence

```javascript
async function getRecommendation() {
  // Get confidence first
  const confidence = await fetch('/api/v1/recommendations/confidence', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ debts, financialContext })
  }).then(r => r.json());
  
  // Show confidence to user
  displayConfidence(confidence);
  
  // Get recommendation
  const recommendation = await fetch('/api/v1/recommendations/strategy', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ debts, financialContext })
  }).then(r => r.json());
  
  return { confidence, recommendation };
}
```

### 2. Compare Before Committing

```javascript
async function compareStrategies() {
  const comparison = await fetch('/api/v1/recommendations/compare', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      debts,
      financialContext,
      strategies: ['snowball', 'avalanche', 'hybrid'],
      monthlyPayment: 800
    })
  }).then(r => r.json());
  
  displayComparison(comparison);
}
```

### 3. Show Product Recommendations Contextually

```javascript
async function showProductRecommendations() {
  const products = await fetch('/api/v1/recommendations/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ debts, financialContext })
  }).then(r => r.json());
  
  // Only show if fit score is medium or high
  const goodFit = products.recommendations.filter(
    p => p.fitScore === 'high' || p.fitScore === 'medium'
  );
  
  if (goodFit.length > 0) {
    displayProductRecommendations(goodFit);
  }
}
```

---

## Related Documentation

- [Scenarios API](./scenarios.md) - Simulate recommended strategies
- [Personalization API](./personalization.md) - Personalized messaging
- [AI Services API](./ai-services.md) - AI-powered insights
- [Data Models](./data-models.md) - Complete type definitions