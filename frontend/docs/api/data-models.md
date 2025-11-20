# Data Models

Complete type definitions for all data structures used in the Debt PathFinder API.

---

## Core Types

### Debt

Represents a single debt account.

```typescript
interface Debt {
  id: string;                    // Unique identifier (UUID)
  type: DebtType;                // Type of debt
  name: string;                  // User-friendly name
  balance: number;               // Current balance (USD)
  apr: number;                   // Annual Percentage Rate (0-100)
  minimumPayment: number;        // Minimum monthly payment (USD)
  nextPaymentDate: Date;         // Next payment due date
  customOrder?: number;          // Custom priority order (1-n)
  isDelinquent?: boolean;        // Whether debt is past due
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

**DebtType Enum:**
```typescript
type DebtType = 
  | 'credit-card'
  | 'personal-loan'
  | 'student-loan'
  | 'auto-loan';
```

---

### Financial Context

User's financial situation and goals.

```typescript
interface FinancialContext {
  ageRange: AgeRange;
  employmentStatus: EmploymentStatus;
  zipCode?: string;
  monthlyIncome: number;         // Monthly take-home income (USD)
  monthlyExpenses: number;       // Monthly expenses (USD)
  liquidSavings: number;         // Available savings (USD)
  creditScoreRange: CreditScoreRange;
  primaryGoal: PayoffGoal;
  payoffPriority?: PayoffPriority;
  stressLevel: StressLevel;      // 1-5 scale
  lifeEvents?: LifeEvent[];
}
```

**Related Enums:**
```typescript
type AgeRange = '18-24' | '25-34' | '35-44' | '45-59' | '60+';

type EmploymentStatus = 
  | 'full-time'
  | 'part-time'
  | 'self-employed'
  | 'unemployed'
  | 'retired'
  | 'student';

type CreditScoreRange = 
  | '300-579'  // Poor
  | '580-669'  // Fair
  | '670-739'  // Good
  | '740-799'  // Very Good
  | '800-850'; // Excellent

type PayoffGoal = 
  | 'lower-payment'
  | 'pay-faster'
  | 'reduce-interest'
  | 'avoid-default';

type PayoffPriority = 
  | 'aggressive-freedom'
  | 'minimize-interest'
  | 'balance-savings'
  | 'cash-flow-relief';

type StressLevel = 1 | 2 | 3 | 4 | 5;

type LifeEvent = 
  | 'income-increase'
  | 'income-decrease'
  | 'major-expense'
  | 'household-changes'
  | 'other-goals';
```

---

### Payoff Scenario

A debt payoff plan with timeline and costs.

```typescript
interface PayoffScenario {
  id: string;
  name: string;
  strategy: PayoffStrategy;
  monthlyPayment: number;        // Total monthly payment (USD)
  totalMonths: number;           // Months to debt freedom
  totalInterest: number;         // Total interest paid (USD)
  payoffDate: Date;              // Projected debt-free date
  schedule: PayoffScheduleItem[];
}
```

**PayoffStrategy Enum:**
```typescript
type PayoffStrategy = 
  | 'snowball'   // Smallest balance first
  | 'avalanche'  // Highest APR first
  | 'custom';    // User-defined order
```

**PayoffScheduleItem:**
```typescript
interface PayoffScheduleItem {
  month: number;                 // Month number (1-n)
  date: Date;                    // Payment date
  debtId: string;                // Debt being paid
  debtName: string;              // Debt name
  payment: number;               // Total payment (USD)
  principal: number;             // Principal portion (USD)
  interest: number;              // Interest portion (USD)
  remainingBalance: number;      // Remaining balance (USD)
}
```

---

### What-If Scenario

Explores alternative payoff strategies.

```typescript
interface WhatIfScenario {
  id: string;
  type: WhatIfType;
  name: string;
  baseScenarioId: string;        // Reference scenario
  parameters: Record<string, any>;
  result: PayoffScenario;
}
```

**WhatIfType Enum:**
```typescript
type WhatIfType = 
  | 'extra-payment'
  | 'consolidation'
  | 'settlement'
  | 'balance-transfer';
```

---

### Product Recommendation

Suggested financial products.

```typescript
interface ProductRecommendation {
  id: string;
  type: RecommendationType;
  name: string;
  newAPR: number;
  monthlyPaymentChange: number;  // Change in monthly payment
  interestSavings: number;       // Total interest saved
  payoffTimeChange: number;      // Change in months
  fitScore: FitScore;
  eligibilityCriteria: string[];
  tradeoffs: string[];
}
```

**Related Enums:**
```typescript
type RecommendationType = 
  | 'consolidation'
  | 'settlement'
  | 'balance-transfer';

type FitScore = 'low' | 'medium' | 'high';
```

---

### AI Guidance

AI-generated insights and recommendations.

```typescript
interface AIGuidance {
  id: string;
  trigger: GuidanceTrigger;
  context: string;
  message: string;
  helpful?: boolean;             // User feedback
}
```

**GuidanceTrigger Enum:**
```typescript
type GuidanceTrigger = 
  | 'debt-entry-complete'
  | 'inconsistent-data'
  | 'recommendation-view'
  | 'scenario-view'
  | 'user-request';
```

---

## API Request/Response Types

### Personalization

**Microcopy Request:**
```typescript
interface MicrocopyRequest {
  context: {
    page: string;
    stressLevel: number;
    cashFlow: number;
    debtCount: number;
    goal: string;
  };
}
```

**Microcopy Response:**
```typescript
interface MicrocopyResponse {
  alerts: Alert[];
  hints: Hint[];
  motivationalMessage?: string;
}

interface Alert {
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  condition: boolean;
  priority: number;
}

interface Hint {
  location: string;
  message: string;
  trigger?: string;
  dismissible?: boolean;
}
```

---

### Next Best Actions

**Actions Request:**
```typescript
interface ActionsRequest {
  debts: Debt[];
  financialContext: FinancialContext | null;
  cashFlow: number;
}
```

**Actions Response:**
```typescript
interface ActionsResponse {
  actions: NextAction[];
}

interface NextAction {
  priority: number;
  title: string;
  description: string;
  impact: string;
  cta: string;
  action: string;
  progress: number;              // 0-1
  confidence: 'high' | 'medium' | 'low';
  estimatedTimeToComplete?: string;
  potentialSavings?: number;
}
```

---

### Recommendations

**Strategy Recommendation Request:**
```typescript
interface StrategyRecommendationRequest {
  debts: Debt[];
  financialContext: FinancialContext | null;
  currentStrategy?: PayoffStrategy;
}
```

**Strategy Recommendation Response:**
```typescript
interface StrategyRecommendationResponse {
  recommendedStrategy: PayoffStrategy;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number;       // 0-1
  factors: ConfidenceFactor[];
  explanation: string;
  alternatives: AlternativeStrategy[];
  reasoning: ReasoningFactor[];
}

interface ConfidenceFactor {
  name: string;
  met: boolean;
  weight: number;
  description?: string;
}

interface AlternativeStrategy {
  strategy: string;
  reason: string;
  potentialSavings?: number;
  tradeoff?: string;
}

interface ReasoningFactor {
  factor: string;
  value: string;
  impact: string;
}
```

---

### Scenario Simulation

**Simulation Request:**
```typescript
interface SimulationRequest {
  debts: Debt[];
  strategy: PayoffStrategy;
  monthlyPayment: number;
  startDate?: Date;
  modifications?: {
    incomeChange?: number;
    expenseChange?: number;
    aprChanges?: APRChange[];
  };
}

interface APRChange {
  debtId: string;
  newAPR: number;
}
```

**Simulation Response:**
```typescript
interface SimulationResponse {
  scenario: PayoffScenario;
  comparison?: {
    vsMinimumPayments: {
      monthsSaved: number;
      interestSaved: number;
    };
  };
}
```

---

### AI Insights

**Insights Request:**
```typescript
interface InsightsRequest {
  debts: Debt[];
  financialContext: FinancialContext | null;
  scenarios: PayoffScenario[];
}
```

**Insights Response:**
```typescript
interface InsightsResponse {
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  motivationalMessage: string;
  personalizedGuidance?: string;
}
```

---

## Validation Rules

### Debt Validation

```typescript
const debtValidation = {
  balance: {
    min: 0,
    max: 1000000,
    required: true
  },
  apr: {
    min: 0,
    max: 100,
    required: true
  },
  minimumPayment: {
    min: 0,
    max: 100000,
    required: true,
    custom: (payment, balance, apr) => {
      const monthlyInterest = (balance * (apr / 100)) / 12;
      return payment >= monthlyInterest;
    }
  },
  name: {
    minLength: 1,
    maxLength: 100,
    required: true
  }
};
```

### Financial Context Validation

```typescript
const financialContextValidation = {
  monthlyIncome: {
    min: 0,
    max: 1000000,
    required: true
  },
  monthlyExpenses: {
    min: 0,
    max: 1000000,
    required: true
  },
  liquidSavings: {
    min: 0,
    max: 10000000,
    required: true
  },
  stressLevel: {
    min: 1,
    max: 5,
    required: true
  }
};
```

---

## Example Data

### Sample Debt
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "credit-card",
  "name": "Chase Visa",
  "balance": 5000,
  "apr": 18.99,
  "minimumPayment": 150,
  "nextPaymentDate": "2024-02-01T00:00:00Z",
  "isDelinquent": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Sample Financial Context
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
  "lifeEvents": ["income-increase"]
}
```

### Sample Payoff Scenario
```json
{
  "id": "scenario-123",
  "name": "Avalanche Strategy",
  "strategy": "avalanche",
  "monthlyPayment": 800,
  "totalMonths": 36,
  "totalInterest": 3200,
  "payoffDate": "2027-02-01T00:00:00Z",
  "schedule": [
    {
      "month": 1,
      "date": "2024-02-01T00:00:00Z",
      "debtId": "550e8400-e29b-41d4-a716-446655440000",
      "debtName": "Chase Visa",
      "payment": 800,
      "principal": 720,
      "interest": 80,
      "remainingBalance": 4280
    }
  ]
}
```

---

## Type Utilities

### TypeScript Helpers

```typescript
// Partial update type
type DebtUpdate = Partial<Omit<Debt, 'id' | 'createdAt'>>;

// Required fields for creation
type DebtCreate = Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>;

// API response wrapper
type ApiResponse<T> = {
  data: T;
  meta?: {
    timestamp: Date;
    requestId: string;
  };
};

// Paginated response
type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};
```

---

## Related Documentation

- [Debts API](./debts.md) - Debt management endpoints
- [Profile API](./profile.md) - Financial context endpoints
- [Scenarios API](./scenarios.md) - Scenario modeling endpoints
- [Common Patterns](./common-patterns.md) - Validation and error handling