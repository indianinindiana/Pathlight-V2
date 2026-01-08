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
  options?: { value: string; label: string; icon?: string }[];
  sliderConfig?: { min: number; max: number; labels: string[]; emojis?: string[] };
  placeholder?: string;
  icon?: string;
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
      { value: "pay-faster", label: "Pay off debt faster", icon: "⚡" },
      { value: "reduce-interest", label: "Reduce my interest", icon: "📉" },
      { value: "lower-payment", label: "Reduce my monthly payment", icon: "💰" },
      { value: "avoid-default", label: "Avoid falling behind", icon: "🛡️" },
    ],
    validation: { required: true },
  },

  // 2. Stress Level
  {
    id: "stressLevel",
    label: "How are you feeling about your money situation right now?",
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
      emojis: ["😌", "🙂", "😐", "😟", "😰"],
    },
    validation: { required: true },
  },

  // 3. Life Events (Optional)
  {
    id: "lifeEvents",
    label: "Are there any big life changes coming up in the next 6-12 months that we should plan for?",
    type: "optional-multiple-choice",
    options: [
      { value: "income-increase", label: "I expect my income to increase", icon: "📈" },
      { value: "income-decrease", label: "I expect my income to decrease", icon: "📉" },
      { value: "major-expense", label: "I plan to take on a major expense or new loan", icon: "🏠" },
      { value: "family-changes", label: "I expect household/family changes", icon: "👨‍👩‍👧‍👦" },
      { value: "other-goals", label: "I have other financial goals or priorities", icon: "🎯" },
    ],
    validation: { required: false },
  },

  // 4. Age Range
  {
    id: "ageRange",
    label: "To better tailor my guidance, I'd like to understand where you are in life. Which age range fits you best?",
    helper: "Different life stages come with different financial patterns.",
    type: "multiple-choice",
    options: [
      { value: "18-24", label: "18-24", icon: "🎓" },
      { value: "25-34", label: "25-34", icon: "💼" },
      { value: "35-44", label: "35-44", icon: "🏠" },
      { value: "45-59", label: "45-59", icon: "👔" },
      { value: "60+", label: "60+", icon: "🌅" },
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
      { value: "full-time", label: "Full-time", icon: "💼" },
      { value: "part-time", label: "Part-time", icon: "⏰" },
      { value: "self-employed", label: "Self-employed", icon: "🚀" },
      { value: "unemployed", label: "Unemployed", icon: "🔍" },
      { value: "retired", label: "Retired", icon: "🌴" },
      { value: "student", label: "Student", icon: "📚" },
    ],
    validation: { required: true },
  },

  // 6. Monthly Income
  {
    id: "monthlyIncome",
    label: "Let's look at your cash flow together. About how much do you take home each month?",
    helper: "This is the amount you receive after taxes and deductions.",
    type: "number",
    placeholder: "3500",
    icon: "💵",
    validation: { required: true, isNumeric: true },
  },

  // 7. Monthly Expenses
  {
    id: "monthlyExpenses",
    label: "And how much do you typically spend each month?",
    helper: "Include rent, utilities, groceries, subscriptions, etc. - but not debt payments",
    type: "number",
    placeholder: "2500",
    icon: "🛒",
    validation: { required: true, isNumeric: true },
  },

  // 8. Liquid Savings
  {
    id: "liquidSavings",
    label: "About how much do you have set aside for emergencies or unexpected expenses?",
    helper: "This helps me understand your financial cushion.",
    type: "number",
    placeholder: "1000",
    icon: "🏦",
    validation: { required: true, isNumeric: true },
  },

  // 9. Credit Score
  {
    id: "creditScore",
    label: "Last thing — about where does your credit score fall?",
    helper: "This helps me suggest options that are realistic for you.",
    type: "multiple-choice",
    options: [
      { value: "300-579", label: "300-579 (Poor)", icon: "📊" },
      { value: "580-669", label: "580-669 (Fair)", icon: "📈" },
      { value: "670-739", label: "670-739 (Good)", icon: "✅" },
      { value: "740-799", label: "740-799 (Very Good)", icon: "⭐" },
      { value: "800-850", label: "800-850 (Excellent)", icon: "🏆" },
    ],
    validation: { required: true },
  },
];