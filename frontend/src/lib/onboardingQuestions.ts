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
    label: "Let's start with what matters most to you right now. What's your biggest money goal?",
    type: "multiple-choice",
    options: [
      { value: "pay-faster", label: "Pay off debt faster" },
      { value: "reduce-interest", label: "Reduce my interest" },
      { value: "lower-payment", label: "Reduce my monthly payment" },
      { value: "avoid-default", label: "Avoid falling behind" },
    ],
    validation: { required: true },
  },

  // 2. Stress Level
  {
    id: "stressLevel",
    label: "How are we feeling about your money situation right now?",
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
    label: "Are there any big life changes coming up in the next 6-12 months that we should plan for?",
    helper: "This is optional, but it helps us create a plan that adapts to your life.",
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
    label: "Let's talk about where you are in life. What's your age range?",
    helper: "Different life stages come with different financial patterns.",
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
    label: "And what's your work situation like right now?",
    helper: "This helps us understand your income stability.",
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
    label: "Let's look at your cash flow. What's your monthly take-home income?",
    helper: "How much money comes in each month after taxes and deductions",
    type: "number",
    placeholder: "3500",
    validation: { required: true, isNumeric: true },
  },

  // 7. Monthly Expenses
  {
    id: "monthlyExpenses",
    label: "And how much do you typically spend each month?",
    helper: "Include rent, utilities, groceries, subscriptions, etc. - but not debt payments",
    type: "number",
    placeholder: "2500",
    validation: { required: true, isNumeric: true },
  },

  // 8. Liquid Savings
  {
    id: "liquidSavings",
    label: "How much do you have saved up that you could use for emergencies or debt?",
    helper: "This helps us understand your financial cushion.",
    type: "number",
    placeholder: "1000",
    validation: { required: true, isNumeric: true },
  },

  // 9. Credit Score
  {
    id: "creditScore",
    label: "Last thing—what's your credit score range?",
    helper: "This helps us suggest the best strategies for your situation.",
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