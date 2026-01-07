# Pathlight Home Page & Onboarding Experience - Design Guide
**Version:** 3.0  
**Last Updated:** 2026-01-04  
**Status:** ✅ Implemented & Running

---

## 🎯 Design Philosophy

**Core Principle:** "Build this so it feels like the home screen turns into a guided conversation—not like we added a chat feature."

The experience uses a **state-transition model** where the user never leaves the homepage. Instead, the UI smoothly transitions through states, creating a seamless, guided journey with Clara.

---

## 🏠 Home Page Design

### UI States

The homepage operates in three distinct states:

#### 1. **`idle`** - Default Landing State
The welcoming homepage that introduces Pathlight and Clara.

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│  [PathLight Logo] PathLight                                 │
└─────────────────────────────────────────────────────────────┘
│                                                              │
│                      HERO SECTION                            │
│  "See your clearest path out of debt."                      │
│  "Get your instant debt snapshot with AI-powered            │
│   personalized guidance"                                     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                   MEET CLARA CARD                            │
│  [Avatar] "Meet Clara, Your AI Money Advisor"               │
│  "I'll ask you a few quick questions to personalize your    │
│   experience—no pressure, just supportive guidance."        │
├─────────────────────────────────────────────────────────────┤
│                   PRIMARY CTA                                │
│                                                              │
│      [Let's take the next step together →]                  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    TRUST BAR                                 │
│  [Lock] No PII, no risk                                     │
│  [Clock] Takes a few minutes                                │
│  [Heart] Judgment-free                                      │
│  [Dollar] Save money                                        │
└─────────────────────────────────────────────────────────────┘
│                                                              │
│                   HOW IT WORKS                               │
│  1. Share Your Situation                                    │
│  2. See Your Options                                        │
│  3. Take Action                                             │
│                                                              │
│                   FINAL CTA                                  │
│  "Ready to find your path?"                                 │
│  [Get Started Now →]                                        │
└─────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Single Primary CTA:** "Let's take the next step together" (no "chat" language)
- **Clara Introduction Card:** Compact, left-bordered card with avatar
- **Trust Bar:** 4 key value propositions with icons
- **No Goal Selection:** Removed from initial view (handled in onboarding)

#### 2. **`transitioning`** - Animation State (300ms)
Brief, elegant transition that shifts focus to the conversation.

**Animation Specs:**
- **Duration:** 300ms
- **Easing:** ease-in-out
- **Home Content:** Opacity reduces to 90% (subtle de-emphasis)
- **Conversational Container:** Slides in from bottom, fades in

**CSS Transform:**
```css
/* Home content */
opacity: 0.9;
transition: opacity 300ms ease-in-out;

/* Conversational container */
transform: translateY(0);
opacity: 1;
transition: all 300ms ease-in-out;
```

#### 3. **`conversation_active`** - Conversational Interface
The home content remains subtly visible while the conversational container takes focus.

**Layout:**
- Home content stays at 90% opacity in background
- Conversational container becomes primary focus
- Single scroll container (no nested scrolling)
- Auto-scroll to new content as conversation progresses

---

## 💬 Conversational Onboarding Flow

### Design Principles

**What This Is:**
✅ A guided conversation with Clara's voice  
✅ System-controlled questions with AI-generated reactions  
✅ Warm, supportive, judgment-free experience  

**What This Is NOT:**
❌ A chatbot interface  
❌ A live chat with typing indicators  
❌ A form with chat styling  

### Conversation Architecture

The system intelligently separates **question-asking** from **AI reactions**:

#### System-Controlled Questions
- **Source:** [`frontend/src/lib/onboardingQuestions.ts`](frontend/src/lib/onboardingQuestions.ts)
- **Voice:** First-person plural ("Let's...", "How are we feeling...")
- **Rendering:** Sequential, frontend-controlled
- **Feel:** Like Clara is asking them

#### AI-Generated Reactions
- **Source:** `POST /api/v1/ai/onboarding-reaction` endpoint
- **Content:** Empathetic, non-questioning statements
- **Timing:** 800ms-1500ms randomized delay (natural feel)
- **Fallback:** Context-aware messages when AI unavailable

### Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│  [Clara Avatar] Clara's Intro Message                       │
│  "Hi! I'm Clara. I'm here to help you take control of your  │
│   debt and build a plan that actually works for you."       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Question Input Card (with border highlight)                │
│                                                              │
│  What's your biggest money goal right now?                  │
│                                                              │
│  [Pay off debt faster]                                      │
│  [Reduce my interest]                                       │
│  [Reduce my monthly payment]                                │
│  [Avoid falling behind]                                     │
└─────────────────────────────────────────────────────────────┘

                                    ┌─────────────────────────┐
                                    │ ✓ Pay off debt faster   │
                                    └─────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  [Clara Avatar] [Thinking dots animation...]                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  [Clara Avatar] Clara's Empathetic Reaction                 │
│  "Great—taking steps to speed things up can create real     │
│   momentum. You're off to a strong start."                  │
└─────────────────────────────────────────────────────────────┘

[Next question appears immediately...]
```

### 9-Question Flow

1. **Money Goal** (Multiple Choice)
   - Pay off debt faster
   - Reduce my interest
   - Reduce my monthly payment
   - Avoid falling behind

2. **Stress Level** (Slider 1-5)
   - Scale from "Not stressful" to "Very stressful"

3. **Life Events** (Optional Multiple Choice)
   - Job loss, medical expenses, family changes, etc.
   - Can skip

4. **Age Range** (Multiple Choice)
   - 18-24, 25-34, 35-44, 45-54, 55-64, 65+

5. **Employment Status** (Multiple Choice)
   - Full-time, Part-time, Self-employed, Unemployed, Retired, Student

6. **Monthly Income** (Number Input)
   - After-tax monthly income

7. **Monthly Expenses** (Number Input)
   - Total monthly expenses

8. **Liquid Savings** (Number Input)
   - Available savings amount

9. **Credit Score Range** (Multiple Choice)
   - Excellent (740+), Good (670-739), Fair (< 670), I don't know

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--primary-teal: #009A8C;        /* Buttons, borders, accents */
--light-teal: #E7F7F4;          /* Clara's message background */

/* Text Colors */
--dark-blue: #002B45;           /* Headings, primary text */
--medium-blue-gray: #3A4F61;    /* Clara's text */
--light-gray: #4F6A7A;          /* Helper text */

/* UI Colors */
--border-gray: #D4DFE4;         /* Card borders */
--white: #FFFFFF;               /* Backgrounds */
```

### Typography

```css
/* Headings */
font-size: 24-36px;
font-weight: bold;
color: var(--dark-blue);

/* Question Text */
font-size: 20-24px;
font-weight: 600;
color: var(--dark-blue);

/* Body Text */
font-size: 14-16px;
font-weight: 400;
color: var(--medium-blue-gray);

/* Helper Text */
font-size: 14px;
font-weight: 400;
color: var(--light-gray);
```

### Component Specifications

#### Clara's Avatar
```css
width: 32px (mobile) / 40px (desktop);
height: 32px (mobile) / 40px (desktop);
border-radius: 50%;
object-fit: cover;
```

#### Message Bubbles

**Clara's Messages:**
```css
background: linear-gradient(to-br, #E7F7F4, white);
padding: 24px;
border-radius: 12px;
max-width: 85%;
align: left;
animation: fade-in slide-in-from-left 300ms;
```

**User's Answers:**
```css
background: white;
border: 2px solid #D4DFE4;
padding: 16px;
border-radius: 8px;
max-width: 85%;
align: right;
```

#### Question Input Card
```css
background: white;
border: 2px solid #009A8C;
padding: 24px;
border-radius: 12px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

#### Loading State
```css
/* Bouncing dots */
.dot {
  width: 8px;
  height: 8px;
  background: #009A8C;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: 0ms; }
.dot:nth-child(2) { animation-delay: 150ms; }
.dot:nth-child(3) { animation-delay: 300ms; }
```

### Spacing & Layout

```css
/* Vertical Spacing */
--space-between-messages: 16-24px;
--space-within-card: 16-24px;

/* Container */
max-width: 768px;
margin: 0 auto;
padding: 24px (mobile) / 32px (desktop);

/* Message Alignment */
clara-messages: left-aligned, max 85% width;
user-answers: right-aligned, max 85% width;
```

### Animations

```css
/* Message Appearance */
@keyframes fade-in-slide-left {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* User Answer */
@keyframes fade-in-slide-bottom {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Timing */
duration: 300ms;
easing: ease-in-out;
```

---

## 🔄 Interaction Patterns

### Question Display (UPDATED)

**Previous Implementation (Redundant):**
- ❌ Clara message bubble with question text
- ❌ Question input component with same question text
- ❌ Result: Question appeared twice

**Current Implementation (Fixed):**
- ✅ Question input component displays question once
- ✅ Question styled as heading within input card
- ✅ No redundant Clara message bubble
- ✅ Cleaner, less repetitive experience

### Answer Flow

1. **User selects/enters answer**
   - Input validates immediately
   - Answer displays right-aligned with checkmark

2. **Loading state appears**
   - Clara's avatar with bouncing dots
   - Duration: 800-1500ms (randomized)

3. **Clara's reaction appears**
   - Fades in from left with slide animation
   - Empathetic, context-aware message
   - 1-2 sentences maximum

4. **Next question appears immediately**
   - No delay between reaction and next question
   - Smooth auto-scroll to new content

### Progress Indication

```
Question 3 of 9
[████████░░░░░░░░░░░░] 33%
```

- Text indicator: "Question X of 9"
- Visual progress bar
- Smooth width transition (300ms)

### Completion State

```
┌─────────────────────────────────────────────────────────────┐
│  [Clara Avatar]                                             │
│  "You did it! Thanks for sharing all that with me. I've got │
│   everything I need to create a personalized plan that      │
│   actually works for you."                                  │
│                                                              │
│  [Let's see your plan →]                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile Responsiveness

### Breakpoints
```css
/* Mobile First */
base: 320px+
sm: 640px+
md: 768px+
lg: 1024px+
```

### Mobile Optimizations

- **Single scroll container:** Browser viewport only (no nested scrolling)
- **Touch targets:** Minimum 44x44px for all interactive elements
- **Font sizes:** 14-16px body, 20-24px headings
- **Spacing:** 16px between elements (mobile), 24px (desktop)
- **Avatar size:** 32px (mobile), 40px (desktop)
- **Max width:** 85% for messages prevents edge-to-edge text

---

## ♿ Accessibility

### ARIA Labels
```html
<div role="region" aria-label="Clara guiding you">
  <!-- Conversational container -->
</div>
```

### Keyboard Navigation
- Full keyboard support for all interactions
- Tab order follows visual flow
- Enter/Space to select options
- Escape to cancel (if applicable)

### Screen Readers
- Proper semantic HTML
- ARIA labels for dynamic content
- Status announcements for loading states
- Clear focus indicators

### Color Contrast
- All text meets WCAG AA standards
- Minimum 4.5:1 contrast ratio for body text
- Minimum 3:1 for large text and UI components

---

## 🔧 Technical Implementation

### File Structure

```
frontend/src/
├── pages/
│   └── Index.tsx                    # Home page with state management
├── components/
│   ├── ConversationalContainer.tsx  # Main conversation UI
│   └── onboarding/
│       ├── QuestionMultipleChoice.tsx
│       ├── QuestionSlider.tsx
│       ├── QuestionNumber.tsx
│       └── QuestionOptionalMultipleChoice.tsx
├── hooks/
│   └── useConversationalFlow.ts     # Conversation state management
└── lib/
    └── onboardingQuestions.ts       # Question definitions
```

### State Management

```typescript
// Home UI State
type HomeUIState = 'idle' | 'transitioning' | 'conversation_active';

// Conversation State
interface ConversationState {
  currentStep: number;
  currentQuestion: OnboardingQuestion | null;
  userAnswers: Record<string, any>;
  history: ConversationHistoryItem[];
  isComplete: boolean;
  isLoadingClara: boolean;
}
```

### Session Persistence

```typescript
// Storage: sessionStorage
// Timeout: 24 hours
// Keys:
sessionStorage.setItem('onboarding_answers', JSON.stringify(answers));
sessionStorage.setItem('onboarding_step', currentStep.toString());
sessionStorage.setItem('onboarding_timestamp', Date.now().toString());
```

---

## 🎯 Key Design Decisions

### 1. No Route Changes
Everything happens within `Index.tsx` using state management. This creates a seamless, single-page experience.

### 2. No Chat Chrome
- No "Chat with Clara" header
- No typing indicators
- No timestamps
- No speech bubble icons
- Result: Feels like guided conversation, not a chatbot

### 3. Question Display (Fixed)
- Questions appear once in the input component
- No redundant Clara message bubble
- Cleaner, less repetitive experience

### 4. Emotional Safety
- Context-aware fallback messages
- Extra care for high-stress situations
- Judgment-free language throughout
- 1-2 sentence reactions (no long paragraphs)

### 5. Natural Timing
- Randomized 800-1500ms delays
- Prevents robotic feel
- Mimics human response time

### 6. Single Scroll Container
- No nested scrolling
- Browser viewport only
- Better mobile experience
- Smoother auto-scroll

---

## 📊 Success Metrics

### User Experience
- Completion rate of onboarding flow
- Time to complete (target: 3-5 minutes)
- Drop-off points in question sequence
- User satisfaction scores

### Technical Performance
- Page load time < 2 seconds
- Animation frame rate 60fps
- API response time < 1 second
- Mobile performance score > 90

---

## 🚀 Future Enhancements

### Potential Improvements
1. **Voice Input:** Allow users to speak answers
2. **Progress Save:** Email link to resume later
3. **Skip Questions:** Allow skipping non-critical questions
4. **Personalized Intro:** Customize Clara's intro based on referral source
5. **Multi-language:** Support for Spanish, Chinese, etc.

---

## 📝 Change Log

### Version 3.0 (2026-01-04)
- ✅ Fixed question duplication issue
- ✅ Removed redundant Clara message bubble for current question
- ✅ Updated documentation to reflect current implementation
- ✅ Clarified interaction patterns

### Version 2.0 (2026-01-04)
- State-transition model implemented
- Conversational container embedded in homepage
- 9-question flow with AI reactions
- Context-aware fallback messages

### Version 1.0 (Initial)
- Basic onboarding flow
- Separate route for Clara chat
- Goal selection on homepage

---

## 📚 Related Documentation

- [`ONBOARDING_DESIGN_INTERACTION_SYSTEM_V2.md`](ONBOARDING_DESIGN_INTERACTION_SYSTEM_V2.md) - Detailed interaction model
- [`CLARA_ONBOARDING_FLOW_V2.md`](CLARA_ONBOARDING_FLOW_V2.md) - Complete question flow with fallbacks
- [`CLARA_DESIGN_SYSTEM.md`](CLARA_DESIGN_SYSTEM.md) - Clara's personality and voice guidelines

---

**Last Updated:** January 4, 2026  
**Maintained By:** Pathlight Design Team  
**Status:** ✅ Live & Implemented