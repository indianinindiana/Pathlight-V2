# Pathlight Home Page & Onboarding Experience - Design Guide
**Version:** 5.0  
**Last Updated:** 2026-01-05  
**Status:** ✅ Production Ready - Outcome-Focused CTAs & State Management

---

## 🎯 Governing Principles

### Core Philosophy
**"Clara is a guide, not a gate. She joins the user's journey with warmth, then steps back during structured tasks."**

### North Star Principles

1. **Outcome-first CTAs**
   - Buttons promise what the user gets, not just emotional reassurance
   - "Get my debt snapshot" > "Let's take the next step together"

2. **Clara as guide, not gate**
   - Clara orients and reassures during 9 conversational questions
   - She explicitly closes conversational mode before debt entry
   - She steps back during structured tasks (debt entry form)
   - She reappears for celebration and contextual help

3. **One clear primary action per state**
   - CTA text adapts to where the user is in their journey
   - No competing primary CTAs on Home

4. **Marketing → Task mode shift is explicit**
   - Users should feel when they move from learning to doing
   - Conversational onboarding → Structured debt entry

5. **Speed beats conversation during data entry**
   - No one-field-at-a-time chat flows for debt collection
   - Full form with validation for efficient data entry

---

## 🧠 User Journey States

### State Model

```typescript
type UserJourneyState = 
  | 'new'                    // Anonymous/new user, no debts
  | 'debt_entry_started'     // Onboarding complete, debts being entered
  | 'snapshot_generated';    // Debts entered, snapshot available
```

### State Transitions

```
[new]
  ↓ Click "Get my debt snapshot"
[9 Clara Questions - Conversational]
  ↓ Complete Question 9
[Clara Closing Message]
  ↓ Navigate to DebtEntry.tsx
[debt_entry_started]
  ↓ Submit ≥1 debt
[Clara Snapshot Ready Message]
  ↓ Navigate to Dashboard
[snapshot_generated]
```

### State Persistence

- **Storage**: localStorage (cross-session continuity)
- **Location**: DebtContext
- **Clear on**: "Start Over" action
- **Purpose**: UI-driving only (CTAs, routing), not analytics

---

## 🏠 Home Page Design

### Complete User Flow

#### **New User Flow**
```
[Home Page]
  ├─ Hero: "See your clearest path out of debt"
  ├─ Meet Clara Card (introduction)
  ├─ Primary CTA: "Get my debt snapshot"
  └─ Trust Bar: "No SSN required" | "Takes just a few minutes" | etc.
  
  ↓ Click CTA
  
[9 Conversational Questions - Inline]
  ├─ Clara asks questions with choice chips
  ├─ User responds (feels like conversation)
  ├─ Clara reacts emotionally to each response
  └─ No progress indicators, emotional signaling only
  
  ↓ After Question 9
  
[Clara Closing Message]
  "Thanks — that helps me understand what matters most to you.
   Next, you'll enter your debts all at once so I can create your snapshot."
  
  ↓ Navigate to DebtEntry.tsx
  
[Debt Entry Page - Structured Form]
  ├─ Full form with validation
  ├─ Clara avatar + tooltip (passive helper)
  ├─ No conversational prompts per field
  └─ CSV import option
  
  ↓ Submit ≥1 debt
  
[Clara Snapshot Ready Message]
  "Your snapshot is ready — let me show you what I found."
  (≤1.5s pause, non-blocking)
  
  ↓ Navigate to Dashboard
  
[Dashboard: "Your Debt Snapshot"]
  ├─ Summary card with totals
  ├─ Key insights
  └─ Recommended strategies
```

#### **Returning User Flow**

**State: debt_entry_started**
```
[Home Page]
  └─ Primary CTA: "Continue mapping my debts"
  
  ↓ Click CTA
  
[DebtEntry.tsx]
  └─ Resume where left off
```

**State: snapshot_generated**
```
[Home Page]
  └─ Primary CTA: "See my plan"
  
  ↓ Click CTA
  
[Dashboard]
  └─ View existing snapshot
```

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│  [PathLight Logo] PathLight                                 │
└─────────────────────────────────────────────────────────────┘
│                                                              │
│                      HERO SECTION                            │
│  "See your clearest path out of debt."                      │
│  "Get an instant debt snapshot with AI-powered,             │
│   judgment-free guidance."                                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                   MEET CLARA CARD                            │
│  [Avatar] "Meet Clara, Your AI Money Advisor"               │
│  "Clara helps you organize your debts, spot opportunities,  │
│   and understand your options — without judgment or         │
│   pressure."                                                 │
├─────────────────────────────────────────────────────────────┤
│                   PRIMARY CTA (State-Aware)                  │
│      [Get my debt snapshot →]                               │
│      Subtext: "Guided by Clara • Takes ~3 minutes"          │
├─────────────────────────────────────────────────────────────┤
│                    TRUST BAR                                 │
│  🔒 No SSN required  |  ⏱ Takes just a few minutes         │
│  ❤️ Judgment-free guidance  |  💰 Find ways to save money   │
└─────────────────────────────────────────────────────────────┘
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ CLARA'S 9 QUESTIONS (Inline, Conversational)          │  │
│  │ [Appears after CTA click]                             │  │
│  │                                                        │  │
│  │ [Clara Avatar] Clara's question...                    │  │
│  │                                                        │  │
│  │ [Choice chips or input field]                         │  │
│  │                                                        │  │
│  │                    [User response bubble] →           │  │
│  │                                                        │  │
│  │ [Clara Avatar] Clara's reaction...                    │  │
│  │                                                        │  │
│  │ [Next question appears]                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│                   HOW IT WORKS                               │
│  1. Share Your Situation                                    │
│  2. See Your Options                                        │
│  3. Take Action                                             │
│                                                              │
│                   FINAL CTA (State-Aware)                    │
│  [Get my debt snapshot / Continue / See my plan]            │
└─────────────────────────────────────────────────────────────┘
```

---

## 💬 Conversational Onboarding (9 Questions)

### Design Principles

**What This Is:**
✅ Emotional onboarding and context gathering  
✅ Natural conversation with Clara  
✅ Choice chips and empathetic responses  
✅ Builds trust before structured data entry  

**What This Is NOT:**
❌ Debt data collection (no balances, rates, creditors)  
❌ Field-by-field form disguised as chat  
❌ A feature that blocks or takes over  

### Question Flow

The 9 questions cover:
1. Primary money goal
2. Stress level about finances
3. Monthly income (estimate)
4. Monthly expenses (estimate)
5. Available extra payment amount
6. Preferred payoff strategy
7. Timeline preference
8. Risk tolerance
9. Additional context/concerns

**See [`CLARA_ONBOARDING_FLOW_V2.md`](CLARA_ONBOARDING_FLOW_V2.md) for complete question details.**

### Clara's Closing Message (Critical)

After Question 9, Clara **must** explicitly close conversational mode:

```
[Clara Avatar]
"Thanks — that helps me understand what matters most to you.
Next, you'll enter your debts all at once so I can create your snapshot."

[Pause 1-2 seconds]
[Navigate to DebtEntry.tsx]
```

**Purpose:**
- Sets expectations for mode shift
- Prevents confusion about what comes next
- Maintains trust through transparency

---

## 📝 Debt Entry (Structured Task Mode)

### Design Principles

**Clara's Role:**
- ✅ Passive helper (avatar + tooltip)
- ✅ Appears for validation errors (empathetic)
- ✅ Reappears after submission (celebration)
- ❌ No conversational prompts per field
- ❌ No one-field-at-a-time flow

### Zero-Debt Validation

**Requirement:**
- Disable "Continue to Dashboard" if `debts.length === 0`
- Show inline message: "Add at least one debt so I can create your snapshot."
- Clara-flavored, non-blocking

### Debt Entry Form

**Location:** [`DebtEntry.tsx`](frontend/src/pages/DebtEntry.tsx)

**Features:**
- Full structured form with all fields visible
- Real-time validation
- CSV import option
- Edit/delete existing debts
- "Continue to Dashboard" button (enabled when ≥1 debt)

---

## 🎉 Snapshot Completion Moment

### Flow

```
[User submits debt(s) in DebtEntry.tsx]
  ↓
[Clara inline message appears]
  "Your snapshot is ready — let me show you what I found."
  
  ↓ (≤1.5s pause, non-blocking)
  
[Navigate to Dashboard]
  ↓
[Dashboard heading: "Your Debt Snapshot"]
```

### Implementation Notes

- Clara message should **not** block navigation if user clicks through quickly
- No loading screen required — this is emotional framing, not async work
- Pause is for emotional impact, not technical necessity
- Message appears inline in DebtEntry page, not as modal

---

## 🎨 CTA Copy & Behavior

### State-Aware Primary CTA

| User State | CTA Text | Subtext | Action |
|------------|----------|---------|--------|
| `new` | Get my debt snapshot | Guided by Clara • Takes ~3 minutes | Start 9 questions |
| `debt_entry_started` | Continue mapping my debts | - | Navigate to DebtEntry.tsx |
| `snapshot_generated` | See my plan | - | Navigate to Dashboard |

### Trust Bar Messages

Updated for specificity:
- 🔒 **No SSN required** (concrete security promise)
- ⏱ **Takes just a few minutes** (time-bound expectation)
- ❤️ **Judgment-free guidance** (emotional safety)
- 💰 **Find ways to save money** (outcome promise)

### Secondary Actions

**"Start Over" Button:**
- Appears for returning users
- Confirmation dialog: "Are you sure? This will clear all your data."
- Clears:
  - `UserJourneyState` → `'new'`
  - All debts
  - Conversational session storage
  - Profile data

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--primary-teal: #009A8C;        /* Buttons, accents */
--light-teal: #E7F7F4;          /* Clara's message background */

/* Text Colors */
--dark-blue: #002B45;           /* Primary text */
--medium-blue-gray: #3A4F61;    /* Clara's text */
--light-gray: #4F6A7A;          /* Helper text */

/* UI Colors */
--border-gray: #D4DFE4;         /* Chip borders */
--light-border: #E5E7EB;        /* User response borders */
--white: #FFFFFF;               /* Backgrounds */
```

### Typography

```css
/* Clara's Messages */
font-size: 16px;
font-weight: 400;
line-height: 1.5;
color: var(--medium-blue-gray);

/* User Responses */
font-size: 15px;
font-weight: 400;
color: var(--dark-blue);

/* Choice Chips */
font-size: 16px;
font-weight: 400;
color: var(--dark-blue);
```

### Component Specifications

#### Primary CTA Button
```css
background: #009A8C;
hover: #007F74;
color: white;
font-size: 18px (16px mobile);
padding: 20px 32px (16px 24px mobile);
border-radius: 12px;
box-shadow: 0 4px 6px rgba(0,0,0,0.1);
transition: all 200ms;
hover: scale(1.02), shadow-lg;
```

#### Choice Chips
```css
display: inline-block;
padding: 12px 20px;
border: 1.5px solid #D4DFE4;
border-radius: 24px;
background: white;
margin: 6px 8px 6px 0;
cursor: pointer;
transition: all 200ms ease;

hover:
  border-color: #009A8C;
  background: #E7F7F4;
```

#### Clara's Message Bubble
```css
background: linear-gradient(to-br, #E7F7F4, white);
padding: 16px 20px;
border-radius: 16px;
max-width: 85%;
margin-bottom: 16px;
```

#### User Response Bubble
```css
background: white;
border: 1px solid #E5E7EB;
padding: 12px 16px;
border-radius: 16px;
max-width: 75%;
margin-left: auto;
margin-bottom: 16px;
```

---

## 🔧 Technical Implementation

### State Management

```typescript
// DebtContext additions
interface DebtContextType {
  // Existing...
  journeyState: UserJourneyState;
  setJourneyState: (state: UserJourneyState) => void;
}

// State persistence
useEffect(() => {
  localStorage.setItem('journey_state', journeyState);
}, [journeyState]);

// State transitions
const handleCTAClick = () => {
  if (journeyState === 'new') {
    setJourneyState('debt_entry_started');
    // Start 9 questions
  } else if (journeyState === 'debt_entry_started') {
    navigate('/debt-entry');
  } else if (journeyState === 'snapshot_generated') {
    navigate('/dashboard');
  }
};

const handleDebtSubmit = () => {
  setJourneyState('snapshot_generated');
  // Show Clara message, then navigate
};

const handleStartOver = () => {
  if (confirm('Are you sure? This will clear all your data.')) {
    setJourneyState('new');
    clearAllData();
  }
};
```

### File Structure

```
frontend/src/
├── pages/
│   ├── Index.tsx                    # Home page with state-aware CTAs
│   ├── DebtEntry.tsx                # Structured debt entry form
│   └── Dashboard.tsx                # "Your Debt Snapshot"
├── components/
│   ├── ConversationalContainer.tsx  # 9 questions UI
│   └── onboarding/
│       ├── ChoiceChips.tsx         # Choice chip component
│       ├── QuestionNumber.tsx       # Free-form number input
│       └── QuestionText.tsx         # Free-form text input
├── hooks/
│   └── useConversationalFlow.ts     # Conversation state
└── context/
    └── DebtContext.tsx              # Add UserJourneyState
```

---

## 📊 Success Metrics

### Funnel Metrics
1. **Home → Q1**: CTA click-through rate
2. **Q1 → Q9**: Conversational completion rate
3. **Q9 → Debt Entry**: Transition success rate
4. **Debt Entry → Dashboard**: Submission rate
5. **Overall**: End-to-end completion rate

### Quality Metrics
6. **Time to Snapshot**: Median time from CTA to Dashboard
7. **Debt Count**: Average debts entered per user
8. **Return Rate**: % who return after partial completion
9. **State Distribution**: % in each `UserJourneyState`

### Sentiment Metrics
10. **Post-Snapshot Survey**: "How helpful was this experience?" (1-5)
11. **Clara Perception**: "Did Clara make this easier?" (Yes/No)

---

## 🚫 Explicit Prohibitions

### DO NOT Implement

❌ **Conversational debt entry** - No one-field-at-a-time chat for debt data  
❌ **Clara field-by-field guidance** - No conversational prompts in forms  
❌ **New snapshot artifact** - Dashboard is the snapshot, no new route  
❌ **Progress indicators** - No "Question X of Y" during 9 questions  
❌ **Competing primary CTAs** - One clear action per state  
❌ **Modal overlays** - Conversation is inline, not blocking  

---

## ♿ Accessibility

### Choice Chips

**Keyboard Navigation:**
- Tab to navigate between chips
- Enter/Space to select
- Focus visible with ring

**Screen Reader:**
```
"Response option: Pay off debt faster. Press Enter to respond."
```

### ARIA Labels

```html
<div role="region" aria-label="Conversation with Clara">
  <div role="log" aria-live="polite">
    <!-- Clara's messages -->
  </div>
</div>
```

---

## 📱 Mobile Responsiveness

### Touch Targets
- Minimum size: 44x44px for all interactive elements
- Choice chips: 48px height minimum
- Spacing: 12px between chips

### Layout Adjustments

```css
@media (max-width: 640px) {
  .choice-chip {
    display: block;
    width: 100%;
    margin: 8px 0;
  }
  
  .user-response {
    max-width: 85%;
  }
  
  .primary-cta {
    width: 100%;
  }
}
```

---

## 📝 Change Log

### Version 5.0 (2026-01-05) - PRODUCTION READY
- ✅ Added outcome-focused CTA strategy ("Get my debt snapshot")
- ✅ Implemented `UserJourneyState` model (new → debt_entry_started → snapshot_generated)
- ✅ Clarified complete user journey flow
- ✅ Added Clara closing message after Question 9
- ✅ Specified snapshot completion moment
- ✅ Updated trust bar messages for specificity
- ✅ Added zero-debt validation requirement
- ✅ Clarified Clara's role in each phase
- ✅ Added state-aware CTA copy table
- ✅ Specified localStorage persistence
- ✅ Added explicit prohibitions for v1 scope
- ✅ Removed InlineDebtMapping from primary flow

### Version 4.0 (2026-01-04)
- Added governing principle: "User responses should feel like something they said"
- Removed modal/overlay language
- Added choice chips as primary input pattern
- Prohibited traditional form controls

---

## 📚 Related Documentation

- [`IMPLEMENTATION_GUIDE.md`](IMPLEMENTATION_GUIDE.md) - Step-by-step implementation plan
- [`CLARA_DESIGN_SYSTEM.md`](CLARA_DESIGN_SYSTEM.md) - Clara's personality & appearance guidelines
- [`CLARA_ONBOARDING_FLOW_V2.md`](CLARA_ONBOARDING_FLOW_V2.md) - Complete 9-question flow

---

**Last Updated:** January 5, 2026  
**Maintained By:** Pathlight Design Team  
**Status:** ✅ Production Ready  
**Version:** 5.0