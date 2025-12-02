# Specification for: `frontend/src/lib/onboardingQuestions.ts`

This file will serve as the canonical source of truth for the onboarding question flow. It ensures the exact wording, helpers, and options are always presented to the user, as required by the product specification.

## Implementation Details

**Filename:** `frontend/src/lib/onboardingQuestions.ts`

**Purpose:**
*   To define the static structure and content of the 9-step onboarding flow.
*   To export a typed array of question objects for the frontend to consume.
*   To decouple the question content from the conversational/AI logic.

## Code

```typescript
// frontend/src/lib/onboardingQuestions.ts

import { AgeRange, CreditScoreRange, EmploymentStatus } from "@/types/debt";

// ============================================================================
// Type Definitions
// ============================================================================

export type OnboardingQuestionType =
  | "multiple-choice"
  | "slider"
  | "number"
  | "optional-multiple-choice";

export interface OnboardingQuestion {
  id: string;
  label: string;
  helper?: string;
  type: OnboardingQuestionType;
  options?: { value: string; label: string }[];
  sliderConfig?: { min: number; max: number; labels: string[] };
  placeholder?: string;
  validation: {
    required: boolean;
    isNumeric?: boolean;
  };
}

// ============================================================================
// Canonical Question Bank
// ============================================================================

export const onboardingQuestions: OnboardingQuestion[] = [
  // 1. Money Goal
  {
    id: "moneyGoal",
    label: "What's your biggest money goal right now?",
    type: "multiple-choice",
    options: [
      { value: "pay-faster", label: "Pay off Debt Faster" },
      { value: "reduce-interest", label: "Reduce my interest" },
      { value: "lower-payment", label: "Reduce my monthly payment" },
      { value: "avoid-default", label: "Avoid falling behind" },
    ],
    validation: { required: true },
  },

  // 2. Stress Level
  {
    id: "stressLevel",
    label: "How stressful does your money situation feel right now?",
    type: "slider",
    sliderConfig: {
      min: 1,
      max: 5,
      labels: [
        "I feel confident managing my debt.",
        "Manageable, but could be better.",
        "Starting to feel the pressure.",
        "Debt is weighing on me daily.",
        "Debt is causing me significant stress; I need help ASAP.",
      ],
    },
    validation: { required: true },
  },

  // 3. Life Events (Optional)
  {
    id: "lifeEvents",
    label: "Any major life events coming up in the next 6–12 months? (Optional)",
    helper: "Life events can affect your cash flow. Sharing helps us design a plan that adapts.",
    type: "optional-multiple-choice",
    options: [
      { value: "income-increase", label: "I expect my income to increase" },
      { value: "income-decrease", label: "I expect my income to decrease" },
      { value: "major-expense", label: "I plan to take on a major expense or new loan" },
      { value: "family-changes", label: "I expect household/family changes" },
      { value: "other-goals", label: "I have other financial goals or priorities" },
    ],
    validation: { required: false },
  },

  // 4. Age Range
  {
    id: "ageRange",
    label: "What's your age range?",
    helper: "Different life stages come with different financial patterns — your answer guides smarter recommendations.",
    type: "multiple-choice",
    options: [
      { value: "18-24", label: "18-24" },
      { value: "25-34", label: "25-34" },
      { value: "35-44", label: "35-44" },
      { value: "45-59", label: "45-59" },
      { value: "60+", label: "60+" },
    ],
    validation: { required: true },
  },

  // 5. Employment
  {
    id: "employmentStatus",
    label: "What's your employment situation?",
    helper: "This helps us understand income stability and tailor your monthly plan.",
    type: "multiple-choice",
    options: [
      { value: "full-time", label: "Full-time" },
      { value: "part-time", label: "Part-time" },
      { value: "self-employed", label: "Self-employed" },
      { value: "unemployed", label: "Unemployed" },
      { value: "retired", label: "Retired" },
      { value: "student", label: "Student" },
    ],
    validation: { required: true },
  },

  // 6. Monthly Income
  {
    id: "monthlyIncome",
    label: "Monthly Take-Home Income",
    helper: "How much money comes in each month for your household (after taxes and deductions)",
    type: "number",
    placeholder: "3500",
    validation: { required: true, isNumeric: true },
  },

  // 7. Monthly Expenses
  {
    id: "monthlyExpenses",
    label: "Monthly Expenses",
    helper: "Typical spending each month (rent, utilities, groceries, subscriptions, etc. - excluding debt payments)",
    type: "number",
    placeholder: "2500",
    validation: { required: true, isNumeric: true },
  },

  // 8. Liquid Savings
  {
    id: "liquidSavings",
    label: "Liquid Savings",
    helper: "How much do you have saved that could help with debt or emergencies",
    type: "number",
    placeholder: "1000",
    validation: { required: true, isNumeric: true },
  },

  // 9. Credit Score
  {
    id: "creditScore",
    label: "Credit Score Range",
    helper: "Sharing this helps us suggest the best repaying strategies for your situation",
    type: "multiple-choice",
    options: [
      { value: "300-579", label: "300-579 (Poor)" },
      { value: "580-669", label: "580-669 (Fair)" },
      { value: "670-739", label: "670-739 (Good)" },
      { value: "740-799", label: "740-799 (Very Good)" },
      { value: "800-850", label: "800-850 (Excellent)" },
    ],
    validation: { required: true },
  },
];
```
## Notes for Developer
*   Ensure the ` "@/types/debt"` import path is correct.
*   The `id` field for each question should be used as the key when storing the user's answers.
*   The `validation` object should be used to drive the client-side validation logic.

This specification should be used to create the corresponding TypeScript file in the `frontend/src/lib/` directory.
