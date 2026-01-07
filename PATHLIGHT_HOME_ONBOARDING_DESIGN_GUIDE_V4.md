# Pathlight Home Page & Onboarding Experience - Design Guide
**Version:** 4.0  
**Last Updated:** 2026-01-04  
**Status:** 🔄 Updated with Conversational Principles

---

## 🎯 Governing Principles

### Core Philosophy
**"Clara does not feel like a feature the user activates; she feels like someone who joins them."**

### North Star Principles

1. **"User responses should feel like something they said, not something they submitted."**
   - Prevents regression into chat UI, lead forms, or modal thinking
   - Creates a north star for future iterations
   - Everything flows from this principle

2. **Clara is a companion, not a feature**
   - She joins the user's journey
   - She doesn't take over the screen
   - She doesn't block or interrupt

3. **Inputs are temporary. Responses are permanent.**
   - Input fields disappear after submission
   - User responses appear as spoken utterances
   - History shows what was said, not what was filled in

---

## 🏠 Home Page Design

### Layout Behavior (UPDATED)

**Clara onboarding pushes home content downward**

The conversation is **inline** and **non-blocking**:

✅ **Home content remains:**
- Visible
- Scrollable
- Interactive (unless explicitly disabled for a specific reason)

❌ **REMOVED:**
- Opacity reduction of background content
- Modal overlays
- Screen takeovers
- Disabled or faded background states

✅ **REPLACED WITH:**
- Vertical layout shift to accommodate conversation content
- No perceived modal or blocking state
- Natural content flow

### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│  [PathLight Logo] PathLight                                 │
└─────────────────────────────────────────────────────────────┘
│                                                              │
│                      HERO SECTION                            │
│  "See your clearest path out of debt."                      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                   MEET CLARA CARD                            │
│  [Avatar] "Meet Clara, Your AI Money Advisor"               │
├─────────────────────────────────────────────────────────────┤
│                   PRIMARY CTA                                │
│      [Let's take the next step together →]                  │
├─────────────────────────────────────────────────────────────┤
│                    TRUST BAR                                 │
└─────────────────────────────────────────────────────────────┘
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ CLARA'S CONVERSATION (Inline, Full-Width)             │  │
│  │ [Subtle background tint or thin divider]              │  │
│  │                                                        │  │
│  │ [Clara Avatar] Clara's message...                     │  │
│  │                                                        │  │
│  │ [Choice chips or input field]                         │  │
│  │                                                        │  │
│  │                    [User response bubble] →           │  │
│  │                                                        │  │
│  │ [Clara Avatar] Clara's reaction...                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│                   HOW IT WORKS                               │
│  (Remains visible and scrollable)                           │
│                                                              │
│                   FINAL CTA                                  │
│  (Remains visible and scrollable)                           │
└─────────────────────────────────────────────────────────────┘
```

### Conversation Container (UPDATED)

**The conversation is NOT a containerized modal**

✅ **Conversation is:**
- Inline
- Full-width within the home layout
- Anchored at the top of visible content
- Part of the natural page flow

✅ **Optional visual boundary (recommended):**
- Thin divider line
- Soft background tint behind conversation content
- Non-interactive label ("Clara is helping you")

❌ **REMOVED:**
- Heavy container borders
- Elevated z-index language
- Focus-trapping semantics
- Modal-like appearance

---

## 💬 Conversational Onboarding Flow

### Design Principles

**What This Is:**
✅ A natural conversation where Clara joins the user  
✅ Responses feel like spoken utterances  
✅ Warm, supportive, judgment-free experience  
✅ Inline content that flows with the page  

**What This Is NOT:**
❌ A chatbot interface  
❌ A modal or overlay  
❌ A form with chat styling  
❌ A feature that takes over the screen  

### Response Input Philosophy

**"Response options should feel like things the user might say out loud—not choices they are selecting from a form."**

Everything flows from this principle.

---

## 🎨 Input & Response Design

### Input Type Hierarchy (Order of Preference)

1. **Free-form input** (text / number)
2. **Conversational choice chips** (when bounded)
3. **Hybrid** (chips + "something else")

❌ **DO NOT USE:**
- Traditional form controls (radio, dropdown, checkbox)
- Required asterisks
- Tables or grids
- Persistent selections
- Disabled states that feel punitive

### Choice Chips (Primary Pattern)

**Visual Treatment:**

Choice chips should:
- Look **tappable**, not selectable
- Use **rounded pill shapes**
- Have **light borders**
- Avoid checkboxes, radio icons, or selection markers

```css
/* Choice Chip Styling */
.choice-chip {
  display: inline-block;
  padding: 12px 20px;
  border: 1.5px solid #D4DFE4;
  border-radius: 24px;
  background: white;
  color: #002B45;
  font-size: 16px;
  cursor: pointer;
  transition: all 200ms ease;
}

.choice-chip:hover {
  border-color: #009A8C;
  background: #E7F7F4;
}

.choice-chip:active {
  transform: scale(0.98);
}
```

**Content Guidelines:**
- Use **first-person language**
- Phrase as **spoken intent**
- Keep options **short and human**

**Examples:**
✅ "Pay off debt faster"  
✅ "I'm feeling pretty stressed"  
✅ "Around $3,000 a month"  

❌ "Option A: Debt Reduction"  
❌ "Stress Level: High"  
❌ "Monthly Income: $3000"  

### Layout Rules (Prevents Form Vibes)

**Placement:**
- Display options **directly below Clara's question**
- **Never** in a separate card or section
- **Never** inline with labels
- **Generous vertical spacing**
- **No grid alignment** that suggests comparison
- **Left-aligned** with Clara's question
- **Not centered** (centered feels promotional or CTA-like)

```
[Clara Avatar] What's your biggest money goal right now?

[Pay off debt faster]
[Reduce my interest]
[Reduce my monthly payment]
[Avoid falling behind]
```

### Behavior Rules

**Single-Selection:**
1. **Single tap** selects and submits
2. **No "Submit" button**
3. Selected chip **animates into a user response bubble**
4. Chips **disappear immediately** after selection

**Multiple-Selection (Use Sparingly):**
1. Chips **toggle selection**
2. Clara **explicitly invites** multiple answers:
   - "You can pick more than one if it applies."
3. Single **"Continue"** action
4. Selected chips **collapse into a single user response bubble**:
   - "Pay down debt faster, build savings"

---

## 🔄 Interaction Flow

### What Happens After User Input (CRITICAL)

**The Transition Matters More Than the Choice**

**Correct sequence:**
1. User taps option
2. **Micro-pause (200–400ms)**
3. Option **animates into a right-aligned response bubble**
4. Clara **reacts emotionally**
5. Next question appears

**This reinforces:**
✅ "I said something"  
❌ NOT "I selected something"

### Visual Flow Example

```
Step 1: User sees options
┌─────────────────────────────────────────────────────────────┐
│ [Clara Avatar] What's your biggest money goal right now?    │
│                                                              │
│ [Pay off debt faster]                                       │
│ [Reduce my interest]                                        │
│ [Reduce my monthly payment]                                 │
└─────────────────────────────────────────────────────────────┘

Step 2: User taps "Pay off debt faster"
┌─────────────────────────────────────────────────────────────┐
│ [Clara Avatar] What's your biggest money goal right now?    │
│                                                              │
│ [Pay off debt faster] ← (highlighted, 200ms pause)          │
└─────────────────────────────────────────────────────────────┘

Step 3: Options disappear, response bubble appears
┌─────────────────────────────────────────────────────────────┐
│ [Clara Avatar] What's your biggest money goal right now?    │
│                                                              │
│                              [Pay off debt faster] →         │
└─────────────────────────────────────────────────────────────┘

Step 4: Clara reacts
┌─────────────────────────────────────────────────────────────┐
│ [Clara Avatar] What's your biggest money goal right now?    │
│                                                              │
│                              [Pay off debt faster] →         │
│                                                              │
│ [Clara Avatar] Great—taking steps to speed things up can    │
│ create real momentum. You're off to a strong start.         │
└─────────────────────────────────────────────────────────────┘

Step 5: Next question appears immediately
```

### Input Field Lifecycle (HIGH PRIORITY)

**Clarify Input Lifecycle:**

✅ **Input appears** only while answering  
✅ **Input disappears** immediately after submission  
✅ **Response bubble replaces** input in history  

❌ **REMOVED:**
- Labels that restate the question
- Persistent validation states

**"Inputs are temporary. Responses are permanent."**

---

## 👤 User Response Presentation (CRITICAL)

### Visual Requirements

User response bubbles must:
- Be **right-aligned**
- Have **no avatar**
- Use **lighter visual weight** than Clara's
- Appear **only after submission**
- Represent **"utterances," not entries**

### Recommended Visual Traits

```css
/* User Response Bubble */
.user-response {
  margin-left: auto;
  max-width: 75%;
  padding: 12px 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  color: #002B45;
  font-size: 15px;
  text-align: left;
}
```

**Characteristics:**
- **Rounded corners** (more than input fields)
- **Light border or no border**
- **Slightly smaller padding** than Clara's responses
- **No checkmark icon** (feels like form submission)

---

## 📊 Progress Indicators (REMOVED)

### What to Remove Entirely

❌ **Remove:**
- "Question X of Y"
- Visual progress bars
- Step counts
- Completion percentages

### Replace With: Emotional Progress Signaling

✅ **Clara may say:**
- "This is really helpful."
- "I'm starting to get a clear picture."
- "Just one more thing that'll help me guide you."

**WHY:**
- Prevents lead-form framing
- Reduces anxiety
- Preserves conversational illusion

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

#### Clara's Avatar
```css
width: 40px;
height: 40px;
border-radius: 50%;
object-fit: cover;
margin-right: 12px;
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
```

### Animations

```css
/* Chip to Response Bubble Transition */
@keyframes chip-to-bubble {
  0% {
    transform: scale(1) translateX(0);
    opacity: 1;
  }
  50% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) translateX(40%);
    opacity: 1;
  }
}

/* Clara's Message Fade-In */
@keyframes clara-message-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Timing */
chip-selection: 200-400ms;
bubble-appearance: 300ms;
clara-reaction: 300ms;
```

---

## ⚠️ Error Handling & Validation (CRITICAL)

### Explicitly Prohibit

❌ **DO NOT USE:**
- Red text
- Error icons
- Toasts or banners
- "Required" language
- Blocking error modals

### 3-Tier Error Strategy

**Tier 1: Inline clarification (default)**
```
[Input field]
↓
"Just need a number here—like 3000 or 5000"
```
- Neutral color (#4F6A7A)
- Helper-text style
- Below input

**Tier 2: Clara-assisted clarification**
```
[Clara Avatar] "I need a number to work with—what's your 
best estimate for monthly income?"
```
- Triggered after repeated errors
- Empathetic language
- Non-judgmental tone

**Tier 3: Soft blocking (rare)**
```
[Clara Avatar] "I really need this to create a plan that 
works for you. Take your time—there's no rush."

[Input field remains active, no red UI]
```
- Disable continue
- No red UI
- Clara explains why input is needed

### Guiding Principle

**"Errors should feel like clarification, not correction."**

---

## 💬 Clara Response Behavior

### Response Guidelines

Clara:
- **Always reacts emotionally** to user responses
- **Keeps reactions to 1–2 sentences**
- **Never summarizes inputs mechanically**
- **Never references "steps" or "progress"**

### Emotional Progress Reinforcement

✅ **Clara should reinforce emotional progress** instead of task completion

**Examples:**
- "This is really helpful."
- "I'm starting to get a clear picture."
- "That makes sense—thanks for sharing that."

❌ **Avoid:**
- "Step 3 of 9 complete"
- "75% done"
- "Almost there!"

---

## ✅ Completion & Handoff State

### Language Framing (UPDATED)

❌ **REMOVE:**
- "You've completed onboarding"
- "All steps finished"
- "Onboarding complete"

✅ **REPLACE WITH:**
- "Thanks for walking through that with me…"
- "Based on what you shared, here's what I'm seeing…"
- Summarize information provided by the user

### Completion Example

```
┌─────────────────────────────────────────────────────────────┐
│ [Clara Avatar]                                              │
│                                                              │
│ Thanks for walking through that with me. Based on what you  │
│ shared, I can see you're focused on paying down debt faster │
│ while managing some stress around your finances.            │
│                                                              │
│ Let me show you what I'm thinking...                        │
│                                                              │
│ [Let's see your plan →]                                     │
└─────────────────────────────────────────────────────────────┘
```

**WHY:**
- Maintains continuity
- Reinforces Clara's role as guide, not gate
- Feels like a natural conversation transition

---

## 🚪 Escape & Interruption Handling

### Expected Behavior

**On exit:**
- ✅ State is preserved
- ✅ No confirmation modal
- ✅ Clara gently resumes later

**On resume:**
```
[Clara Avatar] "Welcome back! We were just talking about 
your monthly expenses. Want to pick up where we left off?"
```

❌ **REMOVED:**
- Hard cancellation language
- "Are you sure you want to leave?"
- Data loss warnings (unless truly necessary)

---

## ♿ Accessibility

### Choice Chips

**Keyboard Navigation:**
- Chips must be keyboard navigable
- Tab to navigate between chips
- Enter/Space to select

**Screen Reader Announcements:**
```
"Response option: Pay down debt faster. Press Enter to respond."
```

**Selected State:**
- Conveyed via text change, not color alone
- "Selected: Pay down debt faster"

### ARIA Labels

```html
<div role="region" aria-label="Conversation with Clara">
  <div role="log" aria-live="polite">
    <!-- Clara's messages appear here -->
  </div>
</div>
```

### Guiding Principle

**"Response options should behave like spoken replies that happen to be tappable."**

---

## 📱 Mobile Responsiveness

### Touch Targets

- **Minimum size:** 44x44px for all interactive elements
- **Choice chips:** 48px height minimum
- **Spacing:** 12px between chips

### Layout Adjustments

```css
/* Mobile */
@media (max-width: 640px) {
  .choice-chip {
    display: block;
    width: 100%;
    margin: 8px 0;
  }
  
  .user-response {
    max-width: 85%;
  }
}
```

---

## 🚫 Explicit Prohibitions

### DO NOT Use

❌ **Form Controls:**
- Radio buttons
- Checkboxes
- Dropdowns
- Select menus

❌ **Form Language:**
- "Required" asterisks
- "Submit" buttons
- "Form validation"
- "Field errors"

❌ **UI Patterns:**
- Tables or grids
- Persistent selections
- Disabled states that feel punitive
- Modal overlays
- Screen takeovers

❌ **Progress Indicators:**
- "Question X of Y"
- Progress bars
- Step counters
- Completion percentages

❌ **Error Patterns:**
- Red text
- Error icons
- Toasts or banners
- Blocking modals

---

## 🔧 Technical Implementation

### File Structure

```
frontend/src/
├── pages/
│   └── Index.tsx                    # Home page (inline conversation)
├── components/
│   ├── ConversationalContainer.tsx  # Conversation UI (inline, not modal)
│   └── onboarding/
│       ├── ChoiceChips.tsx         # NEW: Choice chip component
│       ├── QuestionNumber.tsx       # Free-form number input
│       └── QuestionText.tsx         # Free-form text input
├── hooks/
│   └── useConversationalFlow.ts     # Conversation state
└── lib/
    └── onboardingQuestions.ts       # Question definitions
```

### State Management

```typescript
// Conversation State
interface ConversationState {
  currentStep: number;
  currentQuestion: OnboardingQuestion | null;
  userAnswers: Record<string, any>;
  history: ConversationHistoryItem[];
  isComplete: boolean;
  isLoadingClara: boolean;
  showInput: boolean; // NEW: Controls input visibility
}

// Input Lifecycle
const handleAnswer = (answer: any) => {
  setShowInput(false); // Hide input immediately
  // Animate chip to response bubble (200-400ms)
  setTimeout(() => {
    addToHistory(answer); // Show response bubble
    fetchClaraReaction(); // Get Clara's reaction
  }, 300);
};
```

---

## 📊 Success Metrics

### User Experience
- **Completion rate** of onboarding flow
- **Time to complete** (target: 3-5 minutes)
- **Emotional sentiment** in feedback
- **Return rate** for incomplete sessions

### Conversational Quality
- **Response naturalness** (user testing)
- **Perceived effort** (should feel effortless)
- **Clara's helpfulness** rating
- **Anxiety reduction** (pre/post survey)

---

## 🚀 Future Enhancements

### Potential Improvements
1. **Voice Input:** Allow users to speak responses
2. **Hybrid Inputs:** "Something else" option for bounded choices
3. **Contextual Help:** Clara offers examples when user hesitates
4. **Adaptive Pacing:** Adjust timing based on user behavior
5. **Multi-language:** Support for Spanish, Chinese, etc.

---

## 📝 Change Log

### Version 4.0 (2026-01-04) - MAJOR UPDATE
- ✅ Added governing principle: "User responses should feel like something they said"
- ✅ Removed modal/overlay language and opacity reduction
- ✅ Clarified inline, non-blocking conversation layout
- ✅ Removed all progress indicators (replaced with emotional signaling)
- ✅ Added choice chips as primary input pattern
- ✅ Prohibited traditional form controls
- ✅ Added 3-tier error handling strategy
- ✅ Updated completion language to maintain conversational continuity
- ✅ Added explicit prohibitions section
- ✅ Refined input lifecycle and transition animations

### Version 3.0 (2026-01-04)
- Fixed question duplication issue
- Removed redundant Clara message bubble for current question
- Updated documentation to reflect current implementation

### Version 2.0 (2026-01-04)
- State-transition model implemented
- Conversational container embedded in homepage
- 9-question flow with AI reactions

---

## 📚 Related Documentation

- [`ONBOARDING_DESIGN_INTERACTION_SYSTEM_V2.md`](ONBOARDING_DESIGN_INTERACTION_SYSTEM_V2.md) - Original interaction model
- [`CLARA_ONBOARDING_FLOW_V2.md`](CLARA_ONBOARDING_FLOW_V2.md) - Complete question flow
- [`CLARA_DESIGN_SYSTEM.md`](CLARA_DESIGN_SYSTEM.md) - Clara's personality guidelines

---

**Last Updated:** January 4, 2026  
**Maintained By:** Pathlight Design Team  
**Status:** 🔄 Updated with Conversational Principles  
**Version:** 4.0