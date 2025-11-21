# AI Services API

AI-powered insights, explanations, and personalized guidance for debt management.

---

## Overview

The AI Services API provides intelligent analysis and natural language explanations of debt situations, recommendations, and calculations. It helps users understand complex financial concepts in simple terms.

**Base Path:** `/ai`

---

## Endpoints

### Get AI Insights

Generates comprehensive AI-powered insights about user's debt situation.

**Endpoint:** `POST /ai/insights`

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
    "liquidSavings": 2000,
    "creditScoreRange": "670-739",
    "primaryGoal": "pay-faster",
    "stressLevel": 3
  },
  "scenarios": [
    {
      "strategy": "avalanche",
      "monthlyPayment": 800,
      "totalMonths": 36,
      "totalInterest": 3200
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "summary": "You have $20,000 in debt across 2 accounts with an average APR of 14.5%. Based on your financial situation, you have several paths to becoming debt-free.",
  "keyInsights": [
    "Your highest-interest debt (22.99% APR credit card) is costing you the most",
    "With your current minimum payments, you'll pay $8,000 in interest over 5 years",
    "Paying an extra $300/month could save you $4,800 and 24 months",
    "Your available cash flow of $1,500/month gives you flexibility for aggressive payoff"
  ],
  "strengths": [
    "You have positive cash flow of $1,500/month",
    "Your credit score (670-739) qualifies you for better rates",
    "You have $2,000 in emergency savings",
    "Your debt-to-income ratio (40%) is manageable"
  ],
  "concerns": [
    "High-interest credit card debt is accumulating quickly",
    "Emergency fund is below recommended 3 months of expenses",
    "One debt is currently delinquent"
  ],
  "opportunities": [
    "Refinance credit card to personal loan at ~10% APR",
    "Balance transfer to 0% APR card for 18 months",
    "Increase monthly payment by $200 to save $2,400 in interest"
  ],
  "recommendations": [
    "Focus on your 22.99% APR credit card first using Avalanche method",
    "Build emergency fund to $3,500 (1 month expenses) before aggressive payoff",
    "Consider balance transfer for credit card debt to save on interest",
    "Set up automatic extra payments of $100-200/month"
  ],
  "motivationalMessage": "You're in a strong position to tackle this debt. With your available cash flow and moderate stress level, you can become debt-free in 3 years while building financial security.",
  "nextSteps": [
    "Review and optimize your budget to free up more cash flow",
    "Set up automatic payments to ensure you never miss a due date",
    "Explore balance transfer options for your credit card",
    "Create a plan to build your emergency fund to 3 months of expenses"
  ]
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/ai/insights \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [...],
    "financialContext": {...},
    "scenarios": [...]
  }'
```

---

### Explain Calculation

Provides natural language explanation of how a calculation was performed.

**Endpoint:** `POST /ai/explain`

**Authentication:** Required

**Request Body:**
```json
{
  "calculationType": "monthly-interest",
  "inputs": {
    "balance": 5000,
    "apr": 18.99
  },
  "result": 79.13
}
```

**Calculation Types:**
- `monthly-interest` - Monthly interest calculation
- `minimum-payment` - Minimum payment suggestion
- `payoff-time` - Time to pay off debt
- `total-interest` - Total interest over loan term
- `debt-to-income` - Debt-to-income ratio
- `weighted-apr` - Weighted average APR
- `avalanche-order` - Why debts are ordered this way
- `snowball-order` - Why debts are ordered this way

**Response:** `200 OK`
```json
{
  "explanation": "Your monthly interest is calculated by taking your balance ($5,000) and multiplying it by your APR (18.99%), then dividing by 12 months. This gives you $79.13 in interest charges each month.",
  "formula": "Monthly Interest = (Balance × APR ÷ 100) ÷ 12",
  "breakdown": [
    {
      "step": 1,
      "description": "Convert APR to decimal",
      "calculation": "18.99% ÷ 100 = 0.1899"
    },
    {
      "step": 2,
      "description": "Multiply balance by APR",
      "calculation": "$5,000 × 0.1899 = $949.50"
    },
    {
      "step": 3,
      "description": "Divide by 12 months",
      "calculation": "$949.50 ÷ 12 = $79.13"
    }
  ],
  "context": "This means that if you only pay the minimum payment of $150, only $70.87 goes toward reducing your actual debt. The rest ($79.13) is just covering the interest charges.",
  "implications": [
    "At this rate, it would take 48 months to pay off this debt",
    "You would pay $2,200 in total interest",
    "Paying just $50 more per month would save you $800 in interest"
  ],
  "visualAnalogy": "Think of interest like rent on borrowed money. Each month, you're paying $79.13 just to 'rent' the $5,000 you owe. The faster you pay it back, the less rent you pay overall."
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/ai/explain \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "calculationType": "monthly-interest",
    "inputs": {
      "balance": 5000,
      "apr": 18.99
    },
    "result": 79.13
  }'
```

---

### Get Personalized Guidance

Provides situation-specific guidance and coaching.

**Endpoint:** `POST /ai/guide`

**Authentication:** Required

**Request Body:**
```json
{
  "situation": "high-stress-negative-cashflow",
  "context": {
    "debts": [...],
    "financialContext": {...},
    "recentEvents": [
      "missed-payment",
      "income-decrease"
    ]
  }
}
```

**Situation Types:**
- `high-stress-negative-cashflow` - Stressed with negative cash flow
- `first-time-debt-management` - New to debt management
- `multiple-debts-overwhelmed` - Overwhelmed by multiple debts
- `considering-bankruptcy` - Considering bankruptcy
- `debt-consolidation-question` - Questions about consolidation
- `balance-transfer-question` - Questions about balance transfers
- `settlement-question` - Questions about debt settlement

**Response:** `200 OK`
```json
{
  "guidance": {
    "opening": "I understand you're feeling stressed about your debt situation, especially with your recent income decrease. Let's focus on creating stability first, then work toward long-term solutions.",
    "immediateActions": [
      {
        "priority": 1,
        "action": "Contact your creditors today",
        "why": "Many creditors offer hardship programs that can temporarily reduce payments or interest rates",
        "howTo": "Call the number on the back of your card, explain your situation, and ask about hardship programs",
        "expectedOutcome": "Possible payment reduction of 25-50% for 3-6 months"
      },
      {
        "priority": 2,
        "action": "Review your budget for immediate cuts",
        "why": "Finding even $100-200 in savings can prevent missed payments",
        "howTo": "List all subscriptions and recurring charges. Cancel anything non-essential for the next 3 months",
        "expectedOutcome": "Free up $100-300/month in cash flow"
      },
      {
        "priority": 3,
        "action": "Prioritize which debts to pay",
        "why": "When money is tight, strategic payment prevents the most damage",
        "howTo": "Pay minimums on all debts, but prioritize: 1) Secured debts (car, house), 2) Delinquent debts, 3) Highest interest debts",
        "expectedOutcome": "Avoid repossession and minimize credit damage"
      }
    ],
    "shortTermPlan": {
      "timeframe": "Next 3 months",
      "goals": [
        "Stabilize cash flow to cover minimum payments",
        "Prevent any new delinquencies",
        "Build small emergency buffer ($500)"
      ],
      "strategies": [
        "Negotiate with creditors for temporary relief",
        "Find ways to increase income (overtime, side gig)",
        "Cut non-essential expenses temporarily",
        "Use any windfalls (tax refund) for emergency fund"
      ]
    },
    "longTermPlan": {
      "timeframe": "Months 4-12",
      "goals": [
        "Return to positive cash flow",
        "Start making progress on debt principal",
        "Build 1 month emergency fund"
      ],
      "strategies": [
        "Once income stabilizes, increase debt payments gradually",
        "Consider debt consolidation if credit score allows",
        "Focus on highest-interest debt first",
        "Build emergency fund to prevent future setbacks"
      ]
    },
    "emotionalSupport": "Financial stress is real and valid. Remember that this situation is temporary, and you're taking the right steps by seeking help. Many people have been where you are and successfully worked their way out. Focus on one day at a time, and celebrate small wins.",
    "warningSigns": [
      "If you're considering payday loans - these make things worse",
      "If creditors threaten legal action - know your rights",
      "If stress is affecting your health - seek support"
    ],
    "resources": [
      {
        "name": "National Foundation for Credit Counseling",
        "type": "Non-profit credit counseling",
        "url": "https://www.nfcc.org",
        "description": "Free or low-cost credit counseling and debt management plans"
      },
      {
        "name": "211 Helpline",
        "type": "Community resources",
        "phone": "211",
        "description": "Connect with local assistance programs for food, utilities, etc."
      }
    ]
  }
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/ai/guide \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "situation": "high-stress-negative-cashflow",
    "context": {...}
  }'
```

---

### Summarize Scenario

Generates a concise, user-friendly summary of a scenario.

**Endpoint:** `POST /ai/summarize`

**Authentication:** Required

**Request Body:**
```json
{
  "scenario": {
    "strategy": "avalanche",
    "monthlyPayment": 800,
    "totalMonths": 36,
    "totalInterest": 3200,
    "payoffDate": "2027-02-01"
  },
  "context": {
    "debts": [...],
    "financialContext": {...}
  },
  "audience": "non-technical"
}
```

**Audience Options:**
- `non-technical` - Simple, everyday language
- `technical` - Include financial terminology
- `motivational` - Focus on positive framing
- `analytical` - Focus on numbers and data

**Response:** `200 OK`
```json
{
  "summary": {
    "headline": "You could be debt-free in 3 years",
    "overview": "By paying $800 per month using the Avalanche method, you'll eliminate all your debt by February 2027. This approach saves you the most money on interest.",
    "keyPoints": [
      "Monthly payment: $800 (you have $1,500 available)",
      "Time to debt freedom: 3 years",
      "Total interest paid: $3,200",
      "Interest saved vs. minimum payments: $4,800"
    ],
    "whatThisMeans": "You'll pay off your highest-interest debts first, which minimizes the total amount you pay. Your first debt will be paid off in 12 months, giving you momentum to tackle the rest.",
    "tradeoffs": "This requires discipline to stick with the plan for 3 years. You won't see your first debt disappear as quickly as with other methods, but you'll save the most money overall.",
    "isThisRightForYou": "This strategy works well because you have good cash flow ($1,500/month available) and moderate stress levels. You can handle the delayed gratification for bigger savings.",
    "nextSteps": [
      "Set up automatic payment of $800/month",
      "Track your progress monthly",
      "Celebrate when you pay off your first debt in 12 months"
    ]
  },
  "comparison": {
    "vsMinimumPayments": "Compared to just paying minimums, you'll be debt-free 24 months faster and save $4,800 in interest.",
    "vsOtherStrategies": "The Snowball method would cost $400 more in interest but might feel more motivating with quicker wins."
  },
  "confidence": "high",
  "confidenceExplanation": "We're very confident in this recommendation because we have complete information about your debts and financial situation."
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/ai/summarize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": {...},
    "context": {...},
    "audience": "non-technical"
  }'
```

---

### Answer Question

Answers user questions about debt management using AI.

**Endpoint:** `POST /ai/ask`

**Authentication:** Required

**Request Body:**
```json
{
  "question": "Should I pay off my credit card or build my emergency fund first?",
  "context": {
    "debts": [...],
    "financialContext": {...}
  }
}
```

**Response:** `200 OK`
```json
{
  "answer": "Based on your situation, I recommend building a small emergency fund first, then focusing on your credit card debt. Here's why:",
  "reasoning": [
    "Your emergency fund ($500) is below the recommended minimum of $1,000",
    "Without an emergency buffer, unexpected expenses could force you to use your credit card again",
    "Your credit card APR (22.99%) is very high, but preventing new debt is more important than paying off existing debt quickly"
  ],
  "recommendation": {
    "step1": {
      "action": "Build emergency fund to $1,000",
      "timeline": "2-3 months",
      "howTo": "Save $200-250/month from your available cash flow"
    },
    "step2": {
      "action": "Attack credit card debt aggressively",
      "timeline": "12-18 months",
      "howTo": "Once emergency fund is set, put all extra money ($1,200/month) toward credit card"
    }
  },
  "alternatives": [
    {
      "approach": "Split the difference",
      "description": "Save $100/month for emergency fund while paying $1,100/month on credit card",
      "pros": "Makes progress on both goals simultaneously",
      "cons": "Takes longer to build adequate emergency fund"
    }
  ],
  "relatedQuestions": [
    "How much should I have in my emergency fund?",
    "What if I have an emergency before my fund is built?",
    "Should I stop contributing to retirement while paying off debt?"
  ]
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/ai/ask \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Should I pay off my credit card or build my emergency fund first?",
    "context": {...}
  }'
```

---

### Generate Progress Report

Creates a personalized progress report with insights and encouragement.

**Endpoint:** `POST /ai/progress-report`

**Authentication:** Required

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "currentDate": "2024-06-01",
  "initialDebts": [...],
  "currentDebts": [...],
  "payments": [
    {
      "date": "2024-01-15",
      "amount": 800,
      "debtId": "debt-1"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "report": {
    "period": "January 2024 - June 2024 (6 months)",
    "headline": "You've made incredible progress! You're 25% of the way to debt freedom.",
    "achievements": [
      {
        "milestone": "Paid off first debt",
        "date": "2024-04-15",
        "impact": "Eliminated $5,000 credit card debt",
        "celebration": "🎉 This is a huge win! You proved you can do this."
      },
      {
        "milestone": "Reduced total debt by 25%",
        "date": "2024-06-01",
        "impact": "From $20,000 to $15,000",
        "celebration": "You're a quarter of the way there!"
      },
      {
        "milestone": "Saved $1,200 in interest",
        "date": "2024-06-01",
        "impact": "Compared to minimum payments",
        "celebration": "That's money in your pocket, not the bank's"
      }
    ],
    "progress": {
      "debtReduction": {
        "amount": 5000,
        "percentage": 25,
        "onTrack": true
      },
      "interestSaved": {
        "amount": 1200,
        "vsProjected": 1150,
        "ahead": true
      },
      "timelineProgress": {
        "monthsCompleted": 6,
        "totalMonths": 36,
        "percentage": 16.7,
        "onTrack": true,
        "projectedCompletion": "2027-01-01"
      }
    },
    "insights": [
      "You're paying off debt faster than projected - great job!",
      "Your consistent $800 monthly payments are making a real difference",
      "You've avoided $1,200 in interest charges by staying on track"
    ],
    "momentum": {
      "trend": "accelerating",
      "description": "Your debt is decreasing faster each month as more of your payment goes to principal",
      "nextMilestone": {
        "name": "50% debt-free",
        "estimatedDate": "2025-06-01",
        "monthsAway": 12
      }
    },
    "encouragement": "Six months ago, you had $20,000 in debt. Today, you have $15,000. That's real progress! You're proving that you can stick to your plan and achieve your goals. Keep up this momentum - you're doing great!",
    "recommendations": [
      "Consider increasing your payment by $100/month to accelerate progress",
      "You're ahead of schedule - this is a great time to build your emergency fund",
      "Celebrate this milestone! You've earned it."
    ]
  }
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/ai/progress-report \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "currentDate": "2024-06-01",
    "initialDebts": [...],
    "currentDebts": [...]
  }'
```

---

## AI Model Information

### Language Model
- **Model**: GPT-4 (or equivalent)
- **Temperature**: 0.7 for creative responses, 0.3 for calculations
- **Max Tokens**: 1000-2000 depending on endpoint
- **Context Window**: Includes user's full financial context

### Personalization
- Adapts tone based on stress level
- Uses appropriate complexity for audience
- Considers cultural and regional factors
- Maintains empathetic, non-judgmental tone

### Safety & Privacy
- No PII is stored in AI logs
- Responses are generated in real-time
- No training on user data
- Content filtering for harmful advice

---

## Best Practices

### 1. Provide Full Context

```javascript
async function getInsights() {
  const debts = await getDebts();
  const profile = await getProfile();
  const scenarios = await getScenarios();
  
  const insights = await fetch('/api/v1/ai/insights', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      debts,
      financialContext: profile,
      scenarios
    })
  }).then(r => r.json());
  
  return insights;
}
```

### 2. Use Explanations for Education

```javascript
async function explainCalculation(type, inputs, result) {
  const explanation = await fetch('/api/v1/ai/explain', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      calculationType: type,
      inputs,
      result
    })
  }).then(r => r.json());
  
  // Show in tooltip or modal
  showExplanationModal(explanation);
}
```

### 3. Summarize for Clarity

```javascript
async function presentScenario(scenario) {
  const summary = await fetch('/api/v1/ai/summarize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      scenario,
      context: { debts, financialContext },
      audience: 'non-technical'
    })
  }).then(r => r.json());
  
  // Show user-friendly summary instead of raw numbers
  displaySummary(summary);
}
```

### 4. Enable Q&A

```javascript
async function askQuestion(question) {
  const answer = await fetch('/api/v1/ai/ask', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question,
      context: { debts, financialContext }
    })
  }).then(r => r.json());
  
  displayAnswer(answer);
  
  // Show related questions
  if (answer.relatedQuestions) {
    displayRelatedQuestions(answer.relatedQuestions);
  }
}
```

---

## Rate Limits

AI endpoints have special rate limits due to computational cost:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /ai/insights` | 10 | 1 hour |
| `POST /ai/explain` | 50 | 1 hour |
| `POST /ai/guide` | 5 | 1 hour |
| `POST /ai/summarize` | 20 | 1 hour |
| `POST /ai/ask` | 20 | 1 hour |
| `POST /ai/progress-report` | 5 | 1 hour |

---

## Related Documentation

- [Personalization API](./personalization.md) - Dynamic content
- [Recommendations API](./recommendations.md) - Strategy recommendations
- [Scenarios API](./scenarios.md) - Scenario modeling
- [Data Models](./data-models.md) - Complete type definitions