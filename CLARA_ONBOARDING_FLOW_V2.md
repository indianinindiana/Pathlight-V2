# Clara AI Onboarding Flow - Complete Documentation v2.0

This document provides a comprehensive guide to the Clara AI onboarding experience, including all questions, **context-aware fallback responses**, design guidelines, and timing details.

---

## Overview

Clara uses AI-powered responses (Claude/Gemini) with **intelligent fallback messages** when AI is unavailable. All fallback responses are:
- ✅ Context-aware based on user's specific answer
- ✅ Conversational and empathetic (1-2 sentences)
- ✅ Emotionally intelligent without advice
- ✅ Indistinguishable from AI responses to users

---

## Complete Question Flow with Fallback Responses

### Question 1: Money Goal
**Type:** Multiple Choice  
**Question:** "What's your biggest money goal right now?"

**Options & Fallback Messages:**
- **Pay off debt faster** → "Great—taking steps to speed things up can create real momentum. You're off to a strong start."
- **Reduce my interest** → "Got it. Reducing interest can make things feel a lot more manageable over time."
- **Reduce my monthly payment** → "Thanks for sharing—easing the monthly pressure can make a big difference in your day-to-day."
- **Avoid falling behind** → "You're doing the right thing by getting ahead of this. We'll take it one step at a time."

---

### Question 2: Stress Level
**Type:** Slider (1-5)  
**Question:** "How stressful does your money situation feel right now?"

**Scale & Fallback Messages:**
- **1-2 (Low stress)** → "Good to hear—feeling steady gives you a solid foundation to build from."
- **3 (Medium)** → "I hear you. Money can feel complicated, but we'll make this simpler together."
- **4-5 (High stress)** → "Thanks for sharing that—talking about this can be tough. You're not alone here."

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

**Fallback Messages:**
- **Selected at least one event** → "Life can get overwhelming at times. What matters is that you're taking steps forward now."
- **Skipped** → "No problem at all—let's keep going."

---

### Question 4: Age Range
**Type:** Multiple Choice  
**Question:** "What's your age range?"

**Options & Fallback Messages:**
- **18-24** → "It's great that you're taking control early. These habits really add up over time."
- **25-34** → "You're at a strong stage to build momentum and shape your financial future."
- **35-44** → "This is a meaningful time to make decisions that can set you up long-term."
- **45-54** → "It's never too late to find a plan that fits your needs."
- **55-64** → "Smart planning at this stage can make a big difference moving forward."
- **65+** → "Your experience really comes through—let's make things as clear and simple as possible."

---

### Question 5: Employment Status
**Type:** Multiple Choice  
**Question:** "What's your current employment status?"

**Options & Fallback Messages:**
- **Full-time / Part-time / Self-employed** → "Thanks for sharing—knowing your work situation helps keep things realistic and grounded."
- **Unemployed** → "I know that can be a stressful place to be. We'll work with where you are today."
- **Retired** → "Thanks—that helps us keep your situation front and center as we go."
- **Student** → "Balancing expenses in school is tough. You're doing the right thing by planning ahead."

---

### Question 6: Monthly Income
**Type:** Number Input  
**Question:** "What's your total monthly income (after taxes)?"

**Fallback Messages (Context-Aware):**
- **Low income (< $2000)** → "Every dollar matters right now, and it's okay. We'll keep things practical."
- **General (valid input)** → "Thanks—that gives a clearer picture of what's possible for you."

---

### Question 7: Monthly Expenses
**Type:** Number Input  
**Question:** "What are your total monthly expenses?"

**Fallback Messages (Context-Aware):**
- **Positive cash flow (income > expenses)** → "Good news—you've got a little room to work with."
- **Break-even** → "Thanks—this helps us understand where things feel tight and where we can create space."
- **Negative cash flow** → "It's okay to be in a tight spot. You're taking an important step by looking at this now."

---

### Question 8: Liquid Savings
**Type:** Number Input  
**Question:** "How much do you have in liquid savings?"

**Fallback Messages (Context-Aware):**
- **> $5000** → "That's a great safety cushion. It gives you some breathing room."
- **< $1000** → "A lot of people are in this spot. You're starting from a good place—awareness."
- **$0** → "Thanks for being honest—many people start here. We'll take things one step at a time."

---

### Question 9: Credit Score Range
**Type:** Multiple Choice  
**Question:** "What's your approximate credit score range?"

**Options & Fallback Messages:**
- **Excellent / Good (740+)** → "Nice—your score gives you some helpful flexibility as you move forward."
- **Fair (670-739)** → "Thanks—there's room to grow, and taking action now can help over time."
- **Poor (< 670)** → "You're not alone—many people begin here. What matters is that you're starting."
- **I don't know** → "Totally fine—we can still move forward without it."

---

## Timing & Display

### Clara's Response Display
- **Display Duration**: Clara's messages are displayed **PERMANENTLY** in the conversation history
- **No Timeout**: Messages stay visible as the user scrolls through the conversation
- **Next Question**: Appears **immediately** after Clara's response is displayed
- **Loading State**: Shows for **800ms-1500ms** (randomized for natural feel) while waiting for AI response
- **Micro-Timing Variation**: Random delays between 800ms-1500ms make interactions feel less robotic

### Conversation Flow
1. User selects/enters answer
2. Answer is validated and displayed **right-aligned with checkmark**
3. Loading state appears (Clara's avatar with "thinking" indicator)
4. AI generates response (800ms-1500ms with random variation)
5. Clara's message **fades in from left** with slide animation
6. Next question appears immediately
7. Process repeats

**Fallback Behavior:**
- If AI fails, context-aware fallback message is used instantly
- Fallback messages are indistinguishable from AI responses to user
- System logs error but user experience remains seamless

---

## Design System

### Colors & Styling

- **Primary Teal**: `#009A8C` (buttons, borders, accents)
- **Light Teal**: `#E7F7F4` (Clara's message background)
- **Dark Blue**: `#002B45` (headings, primary text)
- **Medium Blue-Gray**: `#3A4F61` (Clara's text)
- **Light Gray**: `#4F6A7A` (helper text)
- **Border Gray**: `#D4DFE4` (card borders)

### Typography

- **Headings**: 24-36px, bold, `#002B45`
- **Question Text**: 16px, medium weight, `#002B45`
- **Answer Text**: 16px, medium weight, `#002B45`
- **Clara's Text**: 14px, regular (not italic), `#3A4F61`
- **Helper Text**: 14px, regular, `#4F6A7A`

### Layout
- **Container**: Single scrollable container, no nested scrolling
- **Vertical Flow**: Questions and answers stack vertically
- **Spacing**: Generous vertical spacing (16px-24px between items)
- **Max Width**: 600px for optimal readability
- **Padding**: 24px horizontal padding on mobile, 32px on desktop
- **Message Alignment**: 
  - User answers: **Right-aligned**, max 85% width
  - Clara messages: **Left-aligned** with avatar, max 85% width

### Clara's Avatar
- **Size**: 32px × 32px circular (8 × 8 in Tailwind)
- **Position**: Left of Clara's messages
- **Image**: `/clara-avatar.png`
- **Loading State**: Pulse animation during thinking
- **Spacing**: 12px gap between avatar and message bubble

### Message Bubbles
- **Clara's Messages**: 
  - Background: `#E7F7F4` (light teal)
  - Text: `#3A4F61` (dark blue-gray)
  - Padding: 16px
  - Border Radius: 12px
  - Font Size: 14px
  - Line Height: 1.5
  - Animation: **Fade-in with slide-in-from-left** (300ms)
  - Max Width: 85% of container
  
- **User's Answers**:
  - Background: White
  - Border: 2px solid `#D4DFE4`
  - Hover: Border color changes to `#009A8C`
  - Padding: 24px
  - Border Radius: 8px
  - Alignment: **Right-aligned**
  - Max Width: 85% of container
  - Checkmark: Right side, `#009A8C` color

### Animations
- **Message Appearance**: 
  - Clara messages: **Fade-in with slide-in-from-left-2** (300ms)
  - User answers: Fade-in with slide-in-from-bottom-4 (300ms)
- **Loading State**: Gentle pulse on Clara's avatar
- **Progress Bar**: Smooth width transition (300ms)
- **Button Hover**: Subtle color shift (200ms)
- **Completion State**: Fade-in with slide-in-from-bottom-4 (500ms)

---

## Quality Improvements

Compared to generic AI responses, Clara's fallback messages feature:

✅ **More conversational tone** - Short, natural, human-like phrasing  
✅ **Emotionally intelligent** - Uses phrases like "I hear you," "You're not alone"  
✅ **No advice or instructions** - Simply reacts, acknowledges, and supports  
✅ **Tuned for emotional safety** - Extra care for high-stress and low-cash-flow situations  
✅ **1-2 sentence maximum** - No long paragraphs or over-explaining  
✅ **Aligned with design system** - Clara = calm, warm, supportive, guilt-free

---

## Design Recommendations Implemented

### 1. ✅ Micro-Timing Variation
- Random delays between 800ms-1500ms
- Feels less robotic, more human

### 2. ✅ Clara's Avatar Subtly Used
- 32px circular avatar
- Pulsing "thinking" indicator during loading
- Slide-in animation from left for Clara messages

### 3. ✅ User Messages Right-Aligned
- Right-aligned with checkmark confirmation
- Mimics modern chat apps
- Clear visual distinction from Clara's messages

### 4. ✅ Fade-in Animation for Clara's Messages
- Gentle opacity fade with slide-in (300ms)
- Makes messages feel warmer and more human

### 5. ✅ Generous Spacing
- Vertical space = emotional space
- 16-24px between elements
- Clara's reactions have breathing room

### 6. ✅ Clara's Name at Completion
- Final message includes "— Clara" signature
- Adds personality without overdoing it

---

## Completion State

After all 9 questions, Clara provides a final message:

```
┌─────────────────────────────────────┐
│ 👤 Clara                            │
│                                     │
│ "Thanks for sharing all that.       │
│  I'm excited to help you from here."│
│                                     │
│ — Clara                             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         ✓ All Set!                  │
│                                     │
│  Let's start building your          │
│  personalized debt payoff plan.     │
│                                     │
│  [Continue to Debt Entry] button    │
└─────────────────────────────────────┘
```

---

## Technical Implementation

### Backend (Python/FastAPI)
- **AI Service**: `backend/app/shared/ai_service.py`
  - `generate_onboarding_reaction()` method
  - Loads prompts from YAML configuration
  - Calls LLM provider (Gemini/Claude/OpenAI)
  - Sanitizes and validates responses
  - Uses context-aware fallbacks on error

- **Fallback System**: `backend/app/shared/clara_fallbacks.py`
  - `get_clara_fallback()` - Context-aware fallback messages
  - `get_resume_message()` - Session resume message
  - `get_completion_message()` - Final completion message
  - Analyzes user answers to provide appropriate responses

### Frontend (React/TypeScript)
- **Hook**: `frontend/src/hooks/useConversationalFlow.ts`
  - Manages conversation state
  - Handles answer validation
  - Calls AI service for reactions
  - Implements **micro-timing variation** (800ms-1500ms)
  - Manages session persistence
  
- **Page**: `frontend/src/pages/OnboardingClara.tsx`
  - Renders conversation UI with **chat-like layout**
  - User answers **right-aligned** with checkmarks
  - Clara messages **left-aligned** with avatar
  - **Fade-in animations** for natural feel
  - Shows loading states with pulsing avatar
  - Handles completion flow with **Clara's signature**

### Session Management
- **Storage**: `sessionStorage` (24-hour timeout)
- **Resume**: Detects existing session, welcomes user back
- **Reset**: Available via "Go Back" or page refresh

---

## Mobile Responsiveness

- **Single scroll container**: Browser viewport only
- **Touch-friendly**: Large tap targets (min 44x44px)
- **Readable text**: 14-16px font sizes
- **Proper spacing**: 16-24px between elements
- **Auto-scroll**: Smooth scroll to new content
- **Max width constraints**: 85% for messages prevents edge-to-edge text

---

## Accessibility

- **Keyboard navigation**: Full support
- **Screen readers**: Proper ARIA labels
- **Color contrast**: AA compliant
- **Focus indicators**: Visible focus states
- **Error messages**: Clear, actionable

---

## Summary

- ✅ **9 questions total**
- ✅ **Clara responds after each answer with context-aware messages**
- ✅ **Responses stay visible permanently**
- ✅ **Next question appears immediately**
- ✅ **800ms-1500ms AI response time (randomized)**
- ✅ **Chat-like layout** (user right, Clara left)
- ✅ **Fade-in animations** for natural feel
- ✅ **Intelligent fallbacks** when AI unavailable
- ✅ **Single scroll container**
- ✅ **Session persistence**

The design creates a natural, conversational feel while maintaining efficiency, clarity, and emotional safety.