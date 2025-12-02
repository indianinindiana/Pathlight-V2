# Clara Onboarding Flow - Complete Guide

## Overview

The onboarding flow consists of 9 questions that collect user information. After each answer, Clara provides an empathetic 1-2 sentence reaction before immediately showing the next question.

---

## Timing & Display

### Clara's Response Display Duration

**Clara's message is displayed PERMANENTLY** - it stays visible in the conversation history as the user scrolls down. There is NO automatic timeout or delay before showing the next question.

**Flow:**
1. User answers question → **Instant UI update** (answer appears with checkmark)
2. **"Clara is thinking..."** loading state appears (with animated avatar)
3. AI response received (typically 1-3 seconds)
4. **Clara's message appears** below the answered question
5. **Next question appears immediately** below Clara's message
6. User scrolls down naturally to see the new question

**Key Design Decision:** The conversation builds vertically, with all previous Q&A pairs and Clara's reactions remaining visible as context.

---

## Design System

### Visual Hierarchy

```
┌─────────────────────────────────────┐
│ ✓ Question 1                        │
│   User's Answer                     │
└─────────────────────────────────────┘
  ┌───────────────────────────────────┐
  │ 👤 Clara's empathetic reaction    │
  │    (teal background, italic text) │
  └───────────────────────────────────┘

┌─────────────────────────────────────┐
│ Question 2 (current)                │
│ [Answer options or input]           │
└─────────────────────────────────────┘
```

### Colors & Styling

- **Answered Questions:** White card with teal border (#009A8C), checkmark icon
- **Clara's Messages:** Light teal background (#E7F7F4), italic text (#3A4F61)
- **Clara's Avatar:** `/clara-avatar.png` (8x8 rounded)
- **Current Question:** White card, standard styling
- **Loading State:** Teal background with pulsing avatar

### Typography

- **Question Text:** 16px, medium weight, #002B45
- **Answer Text:** 16px, medium weight, #002B45
- **Clara's Text:** 14px, italic, #3A4F61
- **Helper Text:** 14px, regular, #4F6A7A

---

## Complete Question Flow

### Question 1: Money Goal
**Type:** Multiple Choice  
**Question:** "What's your biggest money goal right now?"

**Options:**
- Pay off Debt Faster
- Reduce my interest
- Reduce my monthly payment
- Avoid falling behind

**Clara's Potential Responses:**
- **Pay Faster:** "Great! We'll focus on finding the fastest path forward for you."
- **Save Money:** "Perfect! We'll help you minimize interest and keep more money in your pocket."
- **Reduce Stress:** "I understand—let's create a plan that brings you peace of mind."
- **Avoid Behind:** "You're taking the right step by getting ahead of this. Let's build a plan together."

---

### Question 2: Stress Level
**Type:** Slider (1-5)  
**Question:** "How stressful does your money situation feel right now?"

**Scale:**
- 1: "I feel confident managing my debt"
- 2: (no label)
- 3: (no label)
- 4: (no label)
- 5: "I feel overwhelmed by my debt"

**Clara's Potential Responses:**
- **Low Stress (1-2):** "That's great to hear. Having confidence makes all the difference."
- **Medium Stress (3):** "I hear you. Let's work together to make this more manageable."
- **High Stress (4-5):** "Thanks for sharing that—I know talking about debt can be stressful. I'm here with you every step of the way."

---

### Question 3: Life Events (Optional)
**Type:** Optional Multiple Choice  
**Question:** "Have any of these life events affected your finances recently?"

**Options:**
- Job loss or income change
- Medical expenses
- Family changes (marriage, divorce, new child)
- Home purchase or move
- Education expenses
- Other major expense

**Can Skip:** Yes (Skip button available)

**Clara's Potential Responses:**
- **Selected Events:** "Life throws curveballs sometimes. What matters is you're taking action now."
- **Skipped:** "No problem. Let's keep moving forward."

---

### Question 4: Age Range
**Type:** Multiple Choice  
**Question:** "What's your age range?"

**Options:**
- 18-24
- 25-34
- 35-44
- 45-54
- 55-64
- 65+

**Clara's Potential Responses:**
- **18-24:** "It's fantastic that you're building these healthy financial habits early on. It makes a huge difference."
- **25-34:** "You're at a great point to take control of your financial future."
- **35-44:** "Taking action now will set you up for long-term success."
- **45-54:** "It's never too late to optimize your debt strategy."
- **55-64:** "Smart planning now can make a big difference for your future."
- **65+:** "Your experience and wisdom will serve you well in this journey."

---

### Question 5: Employment Status
**Type:** Multiple Choice  
**Question:** "What's your current employment status?"

**Options:**
- Full-time employed
- Part-time employed
- Self-employed
- Unemployed
- Retired
- Student

**Clara's Potential Responses:**
- **Employed:** "Understanding your income situation helps us create a realistic plan."
- **Unemployed:** "I know this can be a challenging time. We'll work with what you have."
- **Retired:** "Let's make sure your plan fits your current situation."
- **Student:** "Balancing debt while in school is tough. We'll find a manageable approach."

---

### Question 6: Monthly Income
**Type:** Number Input  
**Question:** "What's your total monthly income (after taxes)?"

**Format:** Dollar amount ($)  
**Validation:** Must be ≥ 0

**Clara's Potential Responses:**
- **General:** "Thanks for sharing. This helps us understand what's realistic for your situation."
- **Low Income:** "Every dollar counts. We'll make sure your plan is sustainable."

---

### Question 7: Monthly Expenses
**Type:** Number Input  
**Question:** "What are your total monthly expenses (rent, utilities, food, etc.)?"

**Format:** Dollar amount ($)  
**Validation:** Must be ≥ 0

**Clara's Potential Responses:**
- **Positive Cash Flow:** "Good news—you have some breathing room in your budget."
- **Negative Cash Flow:** "It's okay to be in a tight spot right now. You're taking the right first step by creating a plan."
- **Break Even:** "We'll work together to find opportunities to free up some cash for debt payments."

---

### Question 8: Liquid Savings
**Type:** Number Input  
**Question:** "How much do you have in liquid savings (emergency fund, checking, savings)?"

**Format:** Dollar amount ($)  
**Validation:** Must be ≥ 0

**Clara's Potential Responses:**
- **Good Savings (>$5000):** "Having an emergency fund is smart. It gives you a safety net."
- **Low Savings (<$1000):** "Building savings while managing debt is challenging, but you're on the right track."
- **No Savings:** "That's okay. We'll help you build a plan that works for where you are now."

---

### Question 9: Credit Score Range
**Type:** Multiple Choice  
**Question:** "What's your approximate credit score range?"

**Options:**
- Excellent (740+)
- Good (670-739)
- Fair (580-669)
- Poor (below 580)
- I don't know

**Clara's Potential Responses:**
- **Excellent/Good:** "Your credit score gives you good options. We'll help you make the most of them."
- **Fair:** "There's room to improve, and paying down debt will help."
- **Poor:** "Don't worry—taking action now will help improve your score over time."
- **Don't Know:** "No problem. We can still create a great plan for you."

---

## Completion State

After all 9 questions:

```
┌─────────────────────────────────────┐
│         ✓ All Set!                  │
│                                     │
│  Thanks for sharing! I'm excited    │
│  to help you on your debt-free      │
│  journey.                           │
│                                     │
│  [Continue to Debt Entry] button    │
└─────────────────────────────────────┘
```

**Progress Indicator:** Shows "Question X of 9" throughout

---

## AI Response Guidelines

### Response Characteristics

1. **Length:** 1-2 sentences maximum (typically 10-25 words)
2. **Tone:** Warm, calm, guilt-free, emotionally intelligent
3. **Style:** Conversational, chat-like, not formal
4. **Content:** Reactive, not directive (no questions)
5. **Timing:** Appears within 1-3 seconds of answer submission

### Response Patterns

**High Priority Triggers:**
- High stress (≥4) → Acknowledge stress, offer support
- Negative cash flow → Validate situation, emphasize first step
- Young user (18-24) → Encourage proactive behavior
- Specific goals → Align with their stated goal

**Fallback:**
- Generic encouraging reaction based on last answer
- Always supportive and forward-looking

### What Clara NEVER Does

❌ Ask questions (frontend handles all questions)  
❌ Use emojis (unless contextually appropriate)  
❌ Contradict answer options  
❌ Alter the onboarding flow  
❌ Provide financial advice  
❌ Make promises or guarantees  

---

## Technical Implementation

### Frontend Flow

1. User answers question
2. `handleAnswer()` called in `useConversationalFlow.ts`
3. Answer validated client-side
4. `setIsLoadingClara(true)` - show loading state
5. API call to `/api/v1/ai/onboarding-reaction`
6. Response received
7. `setIsLoadingClara(false)` - hide loading
8. Clara's message added to history
9. Next question appears immediately
10. Auto-scroll to new content

### Backend Processing

1. Receive request with `step_id`, `user_answers`, `is_resume`
2. Load prompt template from `ai_prompts.yaml`
3. Fill template with user data
4. Call LLM provider (Claude/Gemini/OpenAI)
5. Sanitize response
6. Return plain text (no JSON)
7. Fallback to generic message on error

### Session Management

- **Storage:** `sessionStorage` (24-hour timeout)
- **Resume:** Detects existing session, welcomes user back
- **Reset:** Available via "Go Back" or page refresh

---

## Mobile Responsiveness

- **Single scroll container:** Browser viewport only
- **Touch-friendly:** Large tap targets (min 44x44px)
- **Readable text:** 14-16px font sizes
- **Proper spacing:** 16-24px between elements
- **Auto-scroll:** Smooth scroll to new content

---

## Accessibility

- **Keyboard navigation:** Full support
- **Screen readers:** Proper ARIA labels
- **Color contrast:** AA compliant
- **Focus indicators:** Visible focus states
- **Error messages:** Clear, actionable

---

## Summary

- **9 questions total**
- **Clara responds after each answer**
- **Responses stay visible permanently**
- **Next question appears immediately**
- **1-3 second AI response time**
- **Vertical conversation flow**
- **Single scroll container**
- **Session persistence**

The design creates a natural, conversational feel while maintaining efficiency and clarity.