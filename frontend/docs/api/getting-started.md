# Getting Started with Debt PathFinder API

This guide will help you get up and running with the Debt PathFinder API in minutes.

## Prerequisites

- Basic understanding of REST APIs
- HTTP client (curl, Postman, or programming language HTTP library)
- (Optional) Node.js 16+ for using the official SDK

---

## Base URL

All API requests should be made to:

```
Production: https://api.debtpathfinder.com/v1
Development: http://localhost:3000/api/v1
```

---

## Authentication

### Creating a Session

The first step is to create a session. Sessions are the primary authentication mechanism.

**Request:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "optional-device-id",
    "userAgent": "MyApp/1.0"
  }'
```

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-12-31T23:59:59Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Using the Token

Include the token in all subsequent requests:

```bash
curl -X GET https://api.debtpathfinder.com/v1/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token Expiration

Tokens expire after 30 days of inactivity. When a token expires, you'll receive a `401 Unauthorized` response. Simply create a new session.

---

## Your First API Call

Let's create a complete user profile and add a debt.

### Step 1: Create a Session

```bash
curl -X POST https://api.debtpathfinder.com/v1/sessions \
  -H "Content-Type: application/json"
```

Save the `token` from the response.

### Step 2: Create a Profile

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

### Step 3: Add a Debt

```bash
curl -X POST https://api.debtpathfinder.com/v1/debts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "credit-card",
    "name": "Chase Visa",
    "balance": 5000,
    "apr": 18.99,
    "minimumPayment": 150,
    "nextPaymentDate": "2024-02-01"
  }'
```

### Step 4: Get a Recommendation

```bash
curl -X POST https://api.debtpathfinder.com/v1/recommendations/strategy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [
      {
        "id": "debt-id-from-step-3",
        "balance": 5000,
        "apr": 18.99,
        "minimumPayment": 150
      }
    ],
    "financialContext": {
      "stressLevel": 3,
      "primaryGoal": "pay-faster",
      "monthlyIncome": 5000,
      "monthlyExpenses": 3500
    }
  }'
```

**Response:**
```json
{
  "recommendedStrategy": "avalanche",
  "confidence": "high",
  "explanation": "The Avalanche method will save you the most money by targeting your high-interest debts first.",
  "alternatives": [
    {
      "strategy": "snowball",
      "reason": "Better for motivation through quick wins"
    }
  ]
}
```

---

## Using the JavaScript SDK

Install the SDK:

```bash
npm install @debtpathfinder/sdk
```

Initialize the client:

```typescript
import { DebtPathFinderClient } from '@debtpathfinder/sdk';

const client = new DebtPathFinderClient({
  apiKey: 'your-api-key',
  environment: 'production' // or 'development'
});
```

Create a session:

```typescript
const session = await client.sessions.create({
  deviceId: 'optional-device-id'
});

console.log('Session token:', session.token);
```

Add a debt:

```typescript
const debt = await client.debts.create({
  type: 'credit-card',
  name: 'Chase Visa',
  balance: 5000,
  apr: 18.99,
  minimumPayment: 150,
  nextPaymentDate: '2024-02-01'
});

console.log('Debt created:', debt.id);
```

Get recommendations:

```typescript
const recommendation = await client.recommendations.getStrategy({
  debts: [debt],
  financialContext: {
    stressLevel: 3,
    primaryGoal: 'pay-faster',
    monthlyIncome: 5000,
    monthlyExpenses: 3500
  }
});

console.log('Recommended strategy:', recommendation.recommendedStrategy);
console.log('Explanation:', recommendation.explanation);
```

---

## Testing with Mock Data

For development, use the test endpoints:

```bash
curl -X POST https://api.debtpathfinder.com/v1/test/scenarios/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [...],
    "strategy": "avalanche",
    "monthlyPayment": 800
  }'
```

Test endpoints:
- Return realistic mock data
- Don't persist changes
- Don't require authentication
- Don't count toward rate limits

---

## Common Patterns

### Error Handling

All errors follow a consistent format:

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

### Pagination

For endpoints that return lists, use pagination:

```bash
curl -X GET "https://api.debtpathfinder.com/v1/debts?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filtering and Sorting

Many endpoints support filtering and sorting:

```bash
curl -X GET "https://api.debtpathfinder.com/v1/debts?sortBy=apr&order=desc&type=credit-card" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Rate Limits

- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705320600
```

---

## Next Steps

Now that you're familiar with the basics, explore:

1. **[Profile API](./profile.md)** - Learn about user profile management
2. **[Debts API](./debts.md)** - Master debt CRUD operations
3. **[Scenarios API](./scenarios.md)** - Simulate payoff scenarios
4. **[Personalization API](./personalization.md)** - Add dynamic content
5. **[AI Services API](./ai-services.md)** - Leverage AI-powered insights

---

## Support

Need help? We're here for you:

- **Documentation**: https://docs.debtpathfinder.com
- **Email**: api-support@debtpathfinder.com
- **Status Page**: https://status.debtpathfinder.com
- **GitHub Issues**: https://github.com/debtpathfinder/api/issues