# Clara AI-Powered Conversational Onboarding - Implementation Plan

## Overview
Implement a fully AI-powered conversational onboarding experience where Clara (via backend AI) presents exact questions with personalized, empathetic transitions.

## Key Requirements

### 1. Core Rules
- **DO NOT CHANGE**: Question labels, helpers, or response options
- **Clara CAN**: Add empathetic lead-ins, reflect previous answers, validate inputs
- **Clara CANNOT**: Modify questions, provide financial advice, add/remove choices

### 2. Architecture Change
**Current (Hardcoded):**
```
Frontend → Static Questions Array → Predefined Reactions
```

**New (AI-Powered):**
```
Frontend → Backend AI API → Gemini LLM → Personalized Clara Response
```

### 3. Exact Question Set (Canonical)

#### Question 1: Money Goal
- **Label**: "What's your biggest money goal right now?"
- **Options**:
  - Pay off Debt Faster
  - Reduce my interest
  - Reduce my monthly payment
  - Avoid falling behind

#### Question 2: Stress Level
- **Label**: "How stressful does your money situation feel right now?"
- **Options** (1-5 scale):
  1. "I feel confident managing my debt."
  2. "Manageable, but could be better."
  3. "Starting to feel the pressure."
  4. "Debt is weighing on me daily."
  5. "Debt is causing me significant stress; I need help ASAP."

#### Question 3: Life Events (Optional)
- **Label**: "Any major life events coming up in the next 6–12 months? (Optional)"
- **Helper**: "Life events can affect your cash flow. Sharing helps us design a plan that adapts."
- **Options**:
  - "I expect my income to increase"
  - "I expect my income to decrease"
  - "I plan to take on a major expense or new loan"
  - "I expect household/family changes"
  - "I have other financial goals or priorities"

#### Question 4: Age Range
- **Label**: "What's your age range?"
- **Helper**: "Different life stages come with different financial patterns — your answer guides smarter recommendations."
- **Options**: 18-24, 25-34, 35-44, 45-59, 60+

#### Question 5: Employment
- **Label**: "What's your employment situation?"
- **Helper**: "This helps us understand income stability and tailor your monthly plan."
- **Options**: Full-time, Part-time, Self-employed, Unemployed, Retired, Student

#### Question 6: Monthly Take-Home Income
- **Label**: "Monthly Take-Home Income"
- **Helper**: "How much money comes in each month for your household (after taxes and deductions)"
- **Type**: Number input

#### Question 7: Monthly Expenses
- **Label**: "Monthly Expenses"
- **Helper**: "Typical spending each month (rent, utilities, groceries, subscriptions, etc. - excluding debt payments)"
- **Type**: Number input
- **Note**: Calculate cash-flow indicator (income - expenses)

#### Question 8: Liquid Savings
- **Label**: "Liquid Savings"
- **Helper**: "How much do you have saved that could help with debt or emergencies"
- **Type**: Number input
- **Placeholder**: "1000"

#### Question 9: Credit Score
- **Label**: "Credit Score Range"
- **Helper**: "Sharing this helps us suggest the best repaying strategies for your situation"
- **Options**:
  - "300-579 (Poor)"
  - "580-669 (Fair)"
  - "670-739 (Good)"
  - "740-799 (Very Good)"
  - "800-850 (Excellent)"

### 4. UI/UX Requirements

#### No Nested Scrolling
- **Primary scroll**: Page body only
- **Chat container**: `overflow: visible`, `height: auto`
- **Auto-scroll**: After each message, scroll to bottom of page
- **Layout**: Messages expand vertically in page flow

#### Message Structure
```
[ Clara's empathetic message ]
[ Question card with label + helper ]
[ Input/options UI ]
[ Auto-scroll to next message ]
```

#### Mobile-Friendly
- No fixed-position chat widgets
- 16px+ tap targets
- Vertically stacked inputs
- Auto-scroll input into view when keyboard opens

### 5. AI Service Integration

#### Backend Endpoint
`POST /api/v1/ai/onboarding`

#### Request Format
```json
{
  "session_id": "uuid",
  "step": "question_1",
  "user_input": "Pay off Debt Faster",
  "collected_data": {
    "money_goal": "pay-faster"
  }
}
```

#### Response Format
```json
{
  "schema_version": "1.0",
  "request_id": "uuid",
  "timestamp": "2025-11-28T...",
  "response": {
    "clara_message": "Great choice! Paying off debt faster...",
    "question": {
      "id": "stress_level",
      "label": "How stressful does your money situation feel right now?",
      "helper": null,
      "type": "choice",
      "options": [...]
    },
    "validation_error": null,
    "is_complete": false
  }
}
```

### 6. Validation Requirements

#### Numeric Fields
- Validate: Monthly income, expenses, savings
- Error: "Looks like that wasn't a valid number — could you enter it like '3500' or '2400.50'?"

#### Required Selections
- Error: "Just choose one of the options above so I can keep tailoring your plan."

#### Optional Fields
- Acknowledge and move on

### 7. Personalization Logic

Clara should adapt based on:
- **Stress level 4-5**: "Thanks for sharing that — I know talking about debt can be stressful."
- **Negative cash flow**: "It's okay to be in a tight spot. You're taking the right steps."
- **Age 18-24**: "You're starting strong — building good habits early makes a huge difference."
- **Goal: Pay faster**: "Great — we'll focus on creating the fastest path possible."

### 8. Implementation Steps

1. **Update Backend AI Prompts** (`backend/config/ai_prompts.yaml`)
   - Add Clara persona system prompt
   - Add onboarding question templates
   - Add validation rules

2. **Create Question Bank** (Frontend)
   - Define all 9 questions with exact wording
   - Store as canonical source

3. **Rewrite ClaraChat Component**
   - Remove hardcoded flow
   - Call AI API for each step
   - Display Clara's response + exact question
   - Handle validation errors
   - Implement page-level scrolling

4. **Update AI Service** (Backend)
   - Implement Clara persona logic
   - Generate empathetic transitions
   - Validate user inputs
   - Track conversation state

5. **Test End-to-End**
   - Verify exact question wording
   - Test personalization
   - Validate error handling
   - Check mobile UX

## Success Criteria

✅ All 9 questions appear with exact wording
✅ Clara provides personalized, empathetic transitions
✅ Validation works for all input types
✅ No nested scrolling issues
✅ Mobile-friendly experience
✅ AI-powered responses feel natural
✅ Conversation state persists correctly