# Financial Health Assessment - Complete Engineering Specification
## Version 1.0.0

This document provides complete engineering specifications for implementing the Financial Health Assessment module, including all constraints, data types, LLM boundaries, and file structure.

---

## Table of Contents

1. [Data Types & Constraints](#1-data-types--constraints)
2. [Deterministic Scoring Formula](#2-deterministic-scoring-formula)
3. [LLM Boundaries](#3-llm-boundaries)
4. [LLM Prompting Contract](#4-llm-prompting-contract)
5. [NBA Merging Rules](#5-nba-merging-rules)
6. [File Structure](#6-file-structure)
7. [API Contracts](#7-api-contracts)
8. [Implementation Checklist](#8-implementation-checklist)

---

## 1. Data Types & Constraints

### 1.1 Constants

```python
# Configuration constants
HIGH_RATE_APR_THRESHOLD = 20.0  # APR threshold for high-rate debt (percent)
COMPLEXITY_BASE = 3              # Baseline number of debts (no penalty)
COMPLEXITY_RANGE = 7             # Range for complexity calculation (3 to 10 debts)
```

### 1.2 Enums

#### RiskBand
```python
from enum import Enum

class RiskBand(str, Enum):
    """Risk band classifications"""
    EXCELLENT = "excellent"
    LOW_MODERATE = "low_moderate"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"
```

#### DriverType
```python
class DriverType(str, Enum):
    """Risk driver types"""
    DELINQUENCY = "delinquency"
    HIGH_RATE = "high_rate"
    COMPLEXITY = "complexity"
```

#### RecommendationCategory
```python
class RecommendationCategory(str, Enum):
    """Recommendation categories for NBA mapping"""
    CASH_FLOW = "cash_flow"
    STRESS_REDUCTION = "stress_reduction"
    DELINQUENCY = "delinquency"
    INTEREST_COST = "interest_cost"
    COMPLEXITY = "complexity"
```

### 1.3 Input Models

#### DebtInput
```python
from pydantic import BaseModel, Field

class DebtInput(BaseModel):
    """Individual debt for risk calculation"""
    balance: float = Field(
        ge=0,
        description="Current balance in dollars"
    )
    apr: float = Field(
        ge=0,
        le=100,
        description="Annual percentage rate (0-100)"
    )
    is_delinquent: bool = Field(
        default=False,
        description="Whether debt is currently delinquent"
    )
```

**Constraints:**
- `balance` ≥ 0 (cannot be negative)
- `apr` between 0–100 (percentage)
- `is_delinquent` is boolean (true/false)

#### UserContext
```python
from enum import Enum

class Goal(str, Enum):
    """User's primary financial goal"""
    REDUCE_STRESS = "reduce_stress"
    LOWER_PAYMENTS = "lower_payments"
    BECOME_DEBT_FREE = "become_debt_free"
    BUILD_SAVINGS = "build_savings"
    IMPROVE_CREDIT = "improve_credit"

class StressLevel(str, Enum):
    """User's self-reported stress level"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class EmploymentStatus(str, Enum):
    """User's employment situation"""
    STABLE = "stable"
    VARIABLE = "variable"
    TRANSITIONING = "transitioning"
    UNEMPLOYED = "unemployed"

class LifeEvent(str, Enum):
    """Current major life events"""
    NONE = "none"
    BABY = "baby"
    MOVE = "move"
    JOB_CHANGE = "job_change"
    MARRIAGE = "marriage"
    DIVORCE = "divorce"
    MEDICAL = "medical"
    EDUCATION = "education"

class AgeRange(str, Enum):
    """User's age bracket"""
    UNDER_25 = "under_25"
    AGE_25_34 = "25_34"
    AGE_35_44 = "35_44"
    AGE_45_54 = "45_54"
    AGE_55_64 = "55_64"
    AGE_65_PLUS = "65_plus"

class UserContext(BaseModel):
    """User context for personalized UX copy"""
    goal: Goal = Field(description="User's primary financial goal")
    stress_level: StressLevel = Field(description="User's stress level")
    employment_status: EmploymentStatus = Field(description="Employment situation")
    life_events: LifeEvent = Field(description="Current major life events")
    age_range: AgeRange = Field(description="User's age bracket")
```

**Why Enums?**
- Prevents malformed prompts to LLM
- Ensures consistent categorization
- Enables type-safe code
- Simplifies validation

### 1.2 Output Models

#### RiskDrivers
```python
class RiskDrivers(BaseModel):
    """Individual risk factor components (0-1 normalized)"""
    delinquency_factor: float = Field(
        ge=0,
        le=1,
        description="Delinquency factor (D): 0 = no delinquent debts, 1 = all delinquent"
    )
    high_rate_factor: float = Field(
        ge=0,
        le=1,
        description="High-rate debt factor (H): 0 = no high-rate debt, 1 = all high-rate"
    )
    complexity_factor: float = Field(
        ge=0,
        le=1,
        description="Complexity factor (C): 0 = simple (1-3 debts), 1 = complex (10+ debts)"
    )
```

#### RecommendationItem
```python
class RecommendationItem(BaseModel):
    """Single recommendation with metadata"""
    text: str = Field(
        min_length=10,
        max_length=500,
        description="Recommendation text (10-500 chars)"
    )
    category: RecommendationCategory = Field(
        description="Category for NBA mapping"
    )
    priority: int = Field(
        ge=1,
        le=5,
        description="Priority 1-5 (1 = highest)"
    )
    action_id: Optional[str] = Field(
        None,
        description="Maps to NBA action if applicable"
    )
```

### 1.4 Output Models

#### DeterministicRiskOutput
```python
class DeterministicRiskOutput(BaseModel):
    """Complete output from deterministic calculation layer"""
    risk_score: float = Field(
        ge=0,
        le=100,
        description="Debt composition risk score (0-100, lower is better)"
    )
    risk_band: RiskBand = Field(
        description="Risk classification band"
    )
    debt_count: int = Field(
        gt=0,
        description="Total number of debts"
    )
    primary_driver: DriverType = Field(
        description="Single most impactful driver"
    )
    drivers: RiskDrivers = Field(
        description="Individual risk factors (0-1 normalized)"
    )
    driver_severity: List[DriverType] = Field(
        description="Drivers sorted by weighted score impact"
    )
```

**Note:** This is the canonical payload that feeds into the LLM prompt.

#### FinancialInterpretation
```python
class FinancialInterpretation(BaseModel):
    """Structured financial interpretation (deterministic)"""
    summary: str = Field(
        min_length=50,
        max_length=500,
        description="What the score means financially"
    )
    key_drivers: List[str] = Field(
        description="Ranked list of risk drivers with impact percentages"
    )
    interpretation_points: List[str] = Field(
        min_items=2,
        max_items=4,
        description="2-4 specific interpretation points (1 per significant driver)"
    )
```

**Interpretation Points Rule:**
The interpreter always generates **2-4 interpretation points**:
- 1 point per driver with meaningful impact (≥10 points contribution)
- Points are data-grounded with actual numbers/percentages
- If fewer than 2 drivers meet threshold, add context about risk band

**Example:**
- D contributes 10 points → Include delinquency point
- H contributes 20 points → Include high-rate point
- C contributes 5.7 points → Skip (below 10-point threshold)
- Result: 2 interpretation points

---

## 2. Deterministic Scoring Formula

### 2.1 Complete Formula

```
Risk Score = (D × 50) + (H × 30) + (C × 20)
```

**Range:** 0–100 (lower is better)

### 2.2 Factor Calculations

#### Delinquency Factor (D)
```python
D = min(1.0, delinquent_count / total_debts)
```

**Where:**
- `delinquent_count` = number of debts with `is_delinquent = True`
- `total_debts` = total number of debts
- Result is clamped to [0, 1]

**Examples:**
- 0 delinquent out of 5 debts → D = 0.0
- 1 delinquent out of 5 debts → D = 0.2
- 5 delinquent out of 5 debts → D = 1.0

#### High-Rate Factor (H)
```python
H = high_rate_balance / total_balance
```

**Where:**
- `high_rate_balance` = sum of balances where `apr ≥ HIGH_RATE_APR_THRESHOLD` (20%)
- `total_balance` = sum of all balances
- Result is naturally in [0, 1]

**Examples:**
- $0 at ≥20% APR out of $10,000 total → H = 0.0
- $5,000 at ≥20% APR out of $10,000 total → H = 0.5
- $10,000 at ≥20% APR out of $10,000 total → H = 1.0

**Note:** The 20% threshold is defined by `HIGH_RATE_APR_THRESHOLD` constant.

#### Complexity Factor (C)
```python
C = min(1.0, max(0.0, (debt_count - COMPLEXITY_BASE) / COMPLEXITY_RANGE))
```

**Where:**
- `debt_count` = total number of debts
- `COMPLEXITY_BASE` = 3 debts (no complexity penalty)
- `COMPLEXITY_RANGE` = 7 debts (from 3 to 10)
- Result is clamped to [0, 1]

**Examples:**
- 1 debt → C = max(0, (1-3)/7) = 0.0
- 3 debts → C = max(0, (3-3)/7) = 0.0
- 5 debts → C = (5-3)/7 = 0.286
- 10 debts → C = (10-3)/7 = 1.0
- 15 debts → C = min(1, (15-3)/7) = 1.0

### 2.3 Risk Band Mapping

```python
def determine_risk_band(risk_score: float) -> RiskBand:
    if risk_score <= 14:
        return RiskBand.EXCELLENT      # 0-14
    elif risk_score <= 29:
        return RiskBand.LOW_MODERATE   # 15-29
    elif risk_score <= 49:
        return RiskBand.MODERATE       # 30-49
    elif risk_score <= 69:
        return RiskBand.HIGH           # 50-69
    else:
        return RiskBand.CRITICAL       # 70-100
```

### 2.4 Driver Severity Ranking

**Sort by weighted contribution (not raw factor value):**

```python
driver_impacts = [
    (DriverType.DELINQUENCY, delinquency_factor * 50),
    (DriverType.HIGH_RATE, high_rate_factor * 30),
    (DriverType.COMPLEXITY, complexity_factor * 20)
]

# Sort descending by impact
sorted_drivers = sorted(driver_impacts, key=lambda x: x[1], reverse=True)
```

**Example:**
- D = 0.4 → contributes 20 points
- H = 0.8 → contributes 24 points
- C = 0.6 → contributes 12 points

**Ranking:** [HIGH_RATE, DELINQUENCY, COMPLEXITY]

---

## 3. LLM Boundaries

### 3.1 What the LLM Generates

The LLM **ONLY** generates these fields:

1. **`user_friendly_summary`** (string, 2-3 sentences, 100-300 chars)
   - Plain language explanation of what the score means
   - Personalized to user's context
   - No technical jargon

2. **`personalized_recommendations`** (array of RecommendationItem)
   - 3-5 actionable recommendations
   - **Text only** - category, priority, action_id are pre-determined
   - Tailored to user's goal, stress level, life events

3. **`closing_message`** (string, 1-2 sentences, 50-150 chars)
   - Encouraging, goal-aligned closing
   - Motivational tone
   - No questions or calls-to-action

### 3.2 What the LLM Does NOT Generate

The LLM **NEVER** generates:

❌ `risk_score` (deterministic calculation)
❌ `risk_band` (deterministic mapping)
❌ `drivers` (deterministic calculations)
❌ `driver_severity` (deterministic ranking)
❌ `primary_driver` (deterministic selection)
❌ `debt_count` (raw data)
❌ `interpretation_points` (deterministic rules)
❌ Recommendation categories (pre-determined)
❌ Recommendation priorities (pre-determined)
❌ Recommendation action_ids (pre-determined)

### 3.3 Why This Boundary?

**Accuracy:** Math and logic are deterministic - no drift
**Safety:** LLM cannot hallucinate numbers that break UI
**Reliability:** Fallback UX copy always available
**Transparency:** Users can verify calculations

---

## 4. LLM Prompting Contract

### 4.1 Input to LLM

```json
{
  "system_role": "You are a financial coach. Your tone is calm, encouraging, accurate, and non-judgmental. Explain financial risk clearly and simply. Avoid legal or tax instructions.",
  
  "deterministic_context": {
    "risk_score": 35.71,
    "risk_band": "moderate",
    "debt_count": 5,
    "primary_driver": "high_rate",
    "drivers": {
      "delinquency_factor": 0.20,
      "high_rate_factor": 0.67,
      "complexity_factor": 0.29
    },
    "driver_severity": ["high_rate", "delinquency", "complexity"],
    "interpretation_points": [
      "About 67% of your total debt carries interest rates ≥20% (2 accounts), which adds significant monthly cost",
      "1 of your 5 debts is currently delinquent, indicating missed payments",
      "Managing 5 separate debt accounts increases administrative burden and the chance of missed payments"
    ]
  },
  
  "user_context": {
    "goal": "reduce_stress",
    "stress_level": "high",
    "employment_status": "stable",
    "life_events": "baby",
    "age_range": "35_44"
  },
  
  "recommendation_templates": [
    {
      "category": "interest_cost",
      "priority": 1,
      "action_id": "high-interest-focus",
      "prompt": "Generate recommendation about tackling high-interest debt first"
    },
    {
      "category": "delinquency",
      "priority": 2,
      "action_id": "emergency-savings",
      "prompt": "Generate recommendation about addressing delinquent debt"
    },
    {
      "category": "stress_reduction",
      "priority": 3,
      "action_id": null,
      "prompt": "Generate recommendation about reducing stress given high stress level and new baby"
    }
  ],
  
  "backup_ux_copy": {
    "risk_band_context": "Multiple risk factors are emerging, such as interest burden or complexity.",
    "stress_level_context": "Let's reduce overwhelm step-by-step so this feels manageable.",
    "life_events_context": "Stabilizing your debt now can help you plan confidently for your growing family."
  },
  
  "task": "Generate: 1) A 2-3 sentence user-friendly summary, 2) Recommendation text for each template (3-5 items), 3) An encouraging closing message (1-2 sentences)."
}
```

### 4.2 Expected Output from LLM

```json
{
  "user_friendly_summary": "Your debt composition shows moderate risk with a score of 36 out of 100. The main challenge is that about two-thirds of your debt carries high interest rates, which means a large portion of your payments goes toward interest rather than reducing the principal. With a new baby on the way, getting this under control now will give you more financial breathing room.",
  
  "personalized_recommendations": [
    {
      "text": "Focus on paying down your two highest-interest debts first. Even small extra payments on these accounts will save you significant money over time and reduce your monthly interest burden.",
      "category": "interest_cost",
      "priority": 1,
      "action_id": "high-interest-focus"
    },
    {
      "text": "Address your delinquent account as soon as possible to prevent further damage to your credit and avoid additional fees. Consider setting up automatic payments to stay current going forward.",
      "category": "delinquency",
      "priority": 2,
      "action_id": "emergency-savings"
    },
    {
      "text": "With a new baby coming, simplify where you can. Consider consolidating some of your five accounts to reduce the mental load of tracking multiple payments each month.",
      "category": "stress_reduction",
      "priority": 3,
      "action_id": null
    }
  ],
  
  "closing_message": "You're taking the right steps by understanding your debt situation. With your stable employment and clear focus, you can make meaningful progress while preparing for your growing family."
}
```

### 4.3 LLM Response Validation

```python
def validate_llm_response(response: dict) -> bool:
    """Validate LLM response before using"""
    
    # Check required fields
    if not all(k in response for k in ['user_friendly_summary', 'personalized_recommendations', 'closing_message']):
        return False
    
    # Validate summary length
    summary = response['user_friendly_summary']
    if not (100 <= len(summary) <= 300):
        return False
    
    # Validate recommendations
    recs = response['personalized_recommendations']
    if not (3 <= len(recs) <= 5):
        return False
    
    for rec in recs:
        if not all(k in rec for k in ['text', 'category', 'priority', 'action_id']):
            return False
        if not (10 <= len(rec['text']) <= 500):
            return False
        if not (1 <= rec['priority'] <= 5):
            return False
    
    # Validate closing message length
    closing = response['closing_message']
    if not (50 <= len(closing) <= 150):
        return False
    
    return True
```

---

## 5. NBA Merging Rules

### 5.1 Priority Tiebreaking

When merging recommendations from Assessment and NBA:

```python
def merge_recommendations(
    nba_actions: List[NextBestAction],
    health_recs: List[RecommendationItem]
) -> List[Action]:
    """
    Merge NBA and Health Assessment recommendations.
    
    Rules:
    1. Filter out NBA actions covered by health assessment
    2. If priorities are equal, Assessment comes first
    3. Sort by priority ascending (1 = highest)
    """
    
    # Get action IDs from health assessment
    health_action_ids = {
        rec.action_id for rec in health_recs 
        if rec.action_id is not None
    }
    
    # Filter NBA actions not covered by health assessment
    filtered_nba = [
        action for action in nba_actions 
        if action.action not in health_action_ids
    ]
    
    # Combine all actions
    all_actions = []
    
    # Add health recommendations
    for rec in health_recs:
        all_actions.append({
            'source': 'health_assessment',
            'priority': rec.priority,
            'category': rec.category,
            'text': rec.text,
            'action_id': rec.action_id
        })
    
    # Add filtered NBA actions
    for action in filtered_nba:
        all_actions.append({
            'source': 'nba',
            'priority': action.priority,
            'category': action.category,
            'text': action.description,
            'action_id': action.action
        })
    
    # Sort by priority, with health_assessment first on ties
    sorted_actions = sorted(
        all_actions,
        key=lambda x: (x['priority'], 0 if x['source'] == 'health_assessment' else 1)
    )
    
    return sorted_actions
```

### 5.2 Example Merge

**Input:**
- NBA Action: `{priority: 2, action: "high-interest-focus"}`
- Health Rec: `{priority: 1, action_id: "high-interest-focus"}`
- Health Rec: `{priority: 3, action_id: null}`
- NBA Action: `{priority: 3, action: "budget-review"}`

**Output (sorted):**
1. Health Rec (priority 1, high-interest-focus)
2. Health Rec (priority 3, null) ← comes before NBA due to tiebreak
3. NBA Action (priority 3, budget-review)

---

## 6. File Structure

### 6.1 Backend Structure

```
/backend/app/shared/
├── financial_assessment.py          # Main module (already created)
│   ├── DeterministicCalculator      # Layer 1: Scoring
│   ├── FinancialInterpreter         # Layer 2: Interpretation
│   ├── UXCopyGenerator              # Layer 3: LLM integration
│   └── assess_financial_health()    # Main entry point
│
└── financial_assessment_models.py   # Pydantic models (if separated)
    ├── DebtInput
    ├── UserContext
    ├── RiskDrivers
    ├── DeterministicRiskOutput
    ├── FinancialInterpretation
    ├── RecommendationItem
    ├── PersonalizedUXCopy
    └── FinancialAssessmentResult

/backend/app/personalization/
└── routes.py                        # API endpoints
    └── POST /api/v1/financial-assessment

/backend/tests/
└── test_financial_assessment.py     # Test suite (already created)
```

### 6.2 Frontend Structure

```
/frontend/src/components/FinancialHealthAssessment/
├── index.tsx                        # Main component
├── CollapsibleSection.tsx           # Reusable collapsible UI
├── RiskBandIndicator.tsx            # Score gauge visual
├── FactorCard.tsx                   # Individual factor display
├── CalculationModal.tsx             # "How was this calculated?"
├── InsightItem.tsx                  # Single insight display
├── RecommendationItem.tsx           # Single recommendation display
├── HealthAssessmentSkeleton.tsx     # Loading state
└── ErrorState.tsx                   # Error handling UI

/frontend/src/hooks/
└── useFinancialAssessment.ts        # Data fetching hook

/frontend/src/types/
└── financialAssessment.ts           # TypeScript types
    ├── DebtInput
    ├── UserContext
    ├── RiskDrivers
    ├── DeterministicRiskOutput
    ├── FinancialInterpretation
    ├── RecommendationItem
    ├── PersonalizedUXCopy
    └── FinancialAssessmentResult

/frontend/src/utils/
└── recommendationMerger.ts          # NBA merging logic
```

---

## 7. API Contracts

### 7.1 Request

```typescript
POST /api/v1/financial-assessment

{
  "profile_id": "user_123",
  "debts": [
    {
      "balance": 10000.00,
      "apr": 24.99,
      "is_delinquent": false
    },
    {
      "balance": 5000.00,
      "apr": 21.50,
      "is_delinquent": true
    }
  ],
  "user_context": {
    "goal": "reduce_stress",
    "stress_level": "high",
    "employment_status": "stable",
    "life_events": "baby",
    "age_range": "35_44"
  }
}
```

### 7.2 Response (Success)

```typescript
200 OK

{
  "assessment_version": "1.0.0",
  "generated_at": "2025-12-04T23:00:00Z",
  "deterministic_output": {
    "risk_score": 35.71,
    "risk_band": "moderate",
    "debt_count": 2,
    "primary_driver": "high_rate",
    "drivers": {
      "delinquency_factor": 0.50,
      "high_rate_factor": 1.00,
      "complexity_factor": 0.00
    },
    "driver_severity": ["high_rate", "delinquency", "complexity"]
  },
  "financial_interpretation": {
    "summary": "Your debt composition indicates multiple emerging risks...",
    "key_drivers": [
      "High Rate (100% impact)",
      "Delinquency (50% impact)"
    ],
    "interpretation_points": [
      "About 100% of your total debt carries interest rates ≥20% (2 accounts)...",
      "1 of your 2 debts is currently delinquent..."
    ]
  },
  "personalized_ux": {
    "user_friendly_summary": "Your debt composition shows moderate risk...",
    "personalized_recommendations": [
      {
        "text": "Focus on paying down your highest-interest debts first...",
        "category": "interest_cost",
        "priority": 1,
        "action_id": "high-interest-focus"
      }
    ],
    "closing_message": "You're taking the right steps..."
  }
}
```

### 7.3 Response (Error)

```typescript
500 Internal Server Error

{
  "detail": "Failed to generate financial assessment",
  "error_code": "ASSESSMENT_GENERATION_FAILED",
  "fallback_available": true
}
```

---

## 8. Implementation Checklist

### Phase 1: Backend Core (2-3 hours)
- [ ] Add enum types to `financial_assessment.py`
- [ ] Update `UserContext` with enums
- [ ] Update `RecommendationItem` with category enum
- [ ] Add input validation with constraints
- [ ] Add LLM response validation
- [ ] Test with various inputs

### Phase 2: Backend API (1-2 hours)
- [ ] Create `/api/v1/financial-assessment` endpoint
- [ ] Add request/response models with versioning
- [ ] Implement error handling
- [ ] Add logging
- [ ] Test API with Postman/curl

### Phase 3: Frontend Components (4-5 hours)
- [ ] Create component file structure
- [ ] Build `FinancialHealthAssessment` main component
- [ ] Build `CollapsibleSection` component
- [ ] Build `CalculationModal` component
- [ ] Build `RiskBandIndicator` component
- [ ] Add skeleton loading states
- [ ] Add error states

### Phase 4: Frontend Integration (2-3 hours)
- [ ] Create `useFinancialAssessment` hook with debouncing
- [ ] Add TypeScript types
- [ ] Integrate into Dashboard
- [ ] Add analytics tracking
- [ ] Implement NBA merging logic
- [ ] Test responsive design

### Phase 5: Testing & Polish (2-3 hours)
- [ ] Unit tests for calculations
- [ ] Integration tests for API
- [ ] E2E tests for Dashboard
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] Documentation updates

**Total Estimated Time: 11-16 hours**

---

## Appendix A: Example Calculations

### Example 1: Low Risk
**Input:**
- 2 debts: $5,000 @ 6.5%, $3,000 @ 4.2%
- No delinquencies

**Calculation:**
- D = 0/2 = 0.0
- H = 0/8000 = 0.0 (no debt ≥20%)
- C = max(0, (2-3)/7) = 0.0
- Score = (0×50) + (0×30) + (0×20) = 0.0
- Band = EXCELLENT

### Example 2: High Risk
**Input:**
- 5 debts: $8k@24.99%, $5k@22.5%, $3k@19.9%, $2k@15%, $1.5k@12.5%
- 1 delinquent

**Calculation:**
- D = 1/5 = 0.2
- H = (8000+5000)/19500 = 0.667
- C = (5-3)/7 = 0.286
- Score = (0.2×50) + (0.667×30) + (0.286×20) = 35.71
- Band = MODERATE

### Example 3: Critical Risk
**Input:**
- 12 debts, all ≥20% APR, 3 delinquent

**Calculation:**
- D = 3/12 = 0.25
- H = 1.0 (all high-rate)
- C = min(1, (12-3)/7) = 1.0
- Score = (0.25×50) + (1.0×30) + (1.0×20) = 62.5
- Band = HIGH

---

## Version History

- **1.0.0** (2025-12-04): Initial specification with complete constraints, LLM boundaries, and file structure
