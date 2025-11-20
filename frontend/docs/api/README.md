# Debt PathFinder API Documentation

Welcome to the Debt PathFinder API documentation. This API enables you to build personalized debt management and payoff planning applications.

## 📚 Documentation Structure

### Core Documentation
- **[Getting Started](./getting-started.md)** - Quick start guide, authentication, and basic concepts
- **[Common Patterns](./common-patterns.md)** - Shared patterns, error handling, and rate limiting

### API Modules
1. **[Sessions API](./sessions.md)** - Session management and authentication
2. **[Profile API](./profile.md)** - User financial profile management
3. **[Debts API](./debts.md)** - Debt CRUD operations and bulk import
4. **[Personalization API](./personalization.md)** - Dynamic content and contextual messaging
5. **[Recommendations API](./recommendations.md)** - Strategy recommendations and confidence scoring
6. **[Scenarios API](./scenarios.md)** - Payoff scenario modeling and optimization
7. **[AI Services API](./ai-services.md)** - AI-powered insights and guidance
8. **[Analytics API](./analytics.md)** - Event logging and user insights
9. **[Export API](./export.md)** - Data export and import functionality

### Additional Resources
- **[Data Models](./data-models.md)** - Complete data type definitions
- **[Webhooks](./webhooks.md)** - Real-time event notifications (coming soon)
- **[SDKs](./sdks.md)** - Official client libraries
- **[Changelog](./changelog.md)** - API version history

---

## 🚀 Quick Start

### Base URL
```
Production: https://api.debtpathfinder.com/v1
Development: http://localhost:3000/api/v1
```

### Authentication
All API requests require a session token:
```http
Authorization: Bearer {session_token}
```

### Example Request
```bash
curl -X POST https://api.debtpathfinder.com/v1/debts \
  -H "Authorization: Bearer your_token_here" \
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

---

## 📊 API Overview

### Sessions & Authentication
Manage user sessions and authentication tokens.
- Create/delete sessions
- Token refresh
- Session validation

### User Profile
Store and manage user financial context.
- Demographics and employment
- Income and expenses
- Financial goals and stress levels
- Life events

### Debt Management
CRUD operations for user debts.
- Add/update/delete debts
- Bulk CSV import
- Debt prioritization
- Validation and suggestions

### Personalization
Dynamic, context-aware content delivery.
- Personalized alerts and hints
- Next best actions
- Contextual microcopy
- Motivational messaging

### Recommendations
Intelligent strategy recommendations.
- Payoff strategy selection
- Confidence scoring
- Alternative strategies
- Detailed explanations

### Scenario Modeling
Simulate and optimize debt payoff plans.
- Strategy simulation
- What-if analysis
- Scenario comparison
- Optimization algorithms

### AI Services
AI-powered insights and guidance.
- Situation analysis
- Personalized guidance
- Calculation explanations
- Natural language insights

### Analytics
Track user behavior and engagement.
- Event logging
- Session analytics
- User insights
- Milestone tracking

### Export/Import
Data portability and backup.
- Export to JSON/CSV/PDF
- Import session data
- Scenario reports
- Comparison exports

---

## 🔑 Key Concepts

### Session-Based Architecture
The API uses session-based authentication. Each user session is independent and stores all user data temporarily. Sessions expire after 30 days of inactivity.

### Frontend-First Design
The API is designed to support a frontend-only application with optional backend integration. All calculations can be performed client-side using the provided algorithms.

### Personalization Engine
The API includes a sophisticated personalization engine that adapts content based on:
- User stress levels
- Financial situation
- Goals and priorities
- Life events
- Behavioral patterns

### Confidence Scoring
All recommendations include confidence scores based on data completeness and quality. This helps users understand the reliability of suggestions.

---

## 📖 Common Use Cases

### 1. Onboarding a New User
```
1. POST /sessions - Create session
2. POST /profile - Save financial context
3. POST /debts - Add debts (multiple calls or bulk import)
4. POST /recommendations/strategy - Get recommended strategy
5. POST /scenarios/simulate - Generate payoff scenarios
```

### 2. Comparing Payoff Strategies
```
1. POST /scenarios/simulate (strategy: snowball)
2. POST /scenarios/simulate (strategy: avalanche)
3. POST /scenarios/simulate (strategy: custom)
4. POST /scenarios/compare - Compare all scenarios
```

### 3. Getting Personalized Guidance
```
1. POST /personalization/microcopy - Get contextual alerts
2. POST /personalization/actions - Get next best actions
3. POST /ai/insights - Get AI-powered insights
4. POST /ai/guide - Get situation-specific guidance
```

### 4. Exploring What-If Scenarios
```
1. POST /scenarios/simulate (base scenario)
2. POST /scenarios/simulate (with modifications)
3. POST /scenarios/compare - Compare scenarios
4. POST /export/comparison - Export comparison report
```

---

## 🛠️ Development Tools

### Testing Endpoints
All endpoints have test versions with `/test` prefix:
```
POST /test/scenarios/simulate
```

Test endpoints:
- Return mock data
- Don't persist changes
- Don't count toward rate limits
- Useful for frontend development

### Mock API Service
A complete mock API service is available in the frontend codebase:
```typescript
import { mockApiService } from '@/services/mockApi';

const insights = await mockApiService.getAIInsights({
  debts: [...],
  financialContext: {...},
  scenarios: [...]
});
```

---

## 📞 Support

- **Documentation**: https://docs.debtpathfinder.com
- **API Status**: https://status.debtpathfinder.com
- **Email**: api-support@debtpathfinder.com
- **GitHub**: https://github.com/debtpathfinder/api

---

## 📄 License

This API documentation is licensed under MIT License.

---

## 🔄 Version

Current API Version: **v1**

Last Updated: January 2024