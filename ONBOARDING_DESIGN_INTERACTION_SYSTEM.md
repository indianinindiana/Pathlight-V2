
# PathLight Onboarding Design & Interaction System
## Homepage → Onboarding → Debt Entry Flow

**Version:** 1.0  
**Last Updated:** 2026-01-04  
**Scope:** Complete user journey from landing to debt entry

---

## Table of Contents

1. [Overview](#overview)
2. [User Journey Map](#user-journey-map)
3. [Homepage (Index)](#homepage-index)
4. [Goal Selection](#goal-selection)
5. [Onboarding Flow (Two Paths)](#onboarding-flow-two-paths)
6. [Design System](#design-system)
7. [Interaction Patterns](#interaction-patterns)
8. [Responsive Behavior](#responsive-behavior)
9. [State Management](#state-management)
10. [Accessibility](#accessibility)

---

## Overview

PathLight's onboarding system guides users through a carefully designed journey that:
- **Reduces friction** - Minimal steps, clear progress
- **Builds trust** - Transparent, judgment-free, secure
- **Personalizes** - Adapts to user's goals and situation
- **Empowers** - Provides clarity and actionable insights

### Two Onboarding Paths

1. **Traditional Form Path** ([`Onboarding.tsx`](frontend/src/pages/Onboarding.tsx:1))
   - 5-step wizard with progress bar
   - Structured data collection
   - Empathetic messaging at each step

2. **Conversational Clara Path** ([`OnboardingClara.tsx`](frontend/src/pages/OnboardingClara.tsx:1))
   - AI-powered chat interface
   - 9 questions with dynamic reactions
   - Natural, supportive conversation

---

## User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOMEPAGE (/)                             │
│  • Hero message: "See your clearest path out of debt"          │
│  • Meet Clara introduction                                      │
│  • Goal selection (4 options)                                   │
│  • Trust indicators                                             │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
         [User selects goal]
                 │
                 ▼
┌────────────────┴────────────────────────────────────────────────┐
│                    ONBOARDING PATH CHOICE                        │
│  • Traditional: /onboarding (5 steps)                           │
│  • Conversational: /onboarding-clara (9 questions)              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
         [Complete onboarding]
                 │
                 ▼
┌────────────────┴────────────────────────────────────────────────┐
│                      DEBT ENTRY (/debt-entry)                    │
│  • Add debts manually or via CSV                                │
│  • View personalized recommendations                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Homepage (Index)

### File: [`frontend/src/pages/Index.tsx`](frontend/src/pages/Index.tsx:1)

### Layout Structure

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
│  "I'll ask you a few quick questions..."                    │
├─────────────────────────────────────────────────────────────┤
│                   GOAL SELECTION                             │
│  "What's your biggest money goal right now?"                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ ⚡ Pay off   │  │ 📅 Reduce    │                        │
│  │ debt faster  │  │ payment      │                        │
│  └──────────────┘  └──────────────┘                        │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ % Reduce     │  │ 🛡️ Avoid     │                        │
│  │ interest     │  │ falling behind│                        │
│  └──────────────┘  └──────────────┘                        │
│                                                              │
│         [Show me my path forward →]                         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    TRUST BAR                                 │
│  🔒 No PII  ⏰ Few minutes  ❤️ Judgment-free  💰 Save money │
├─────────────────────────────────────────────────────────────┤
│                  HOW IT WORKS                                │
│  1. Share Your Situation                                     │
│  2. See Your Options                                         │
│  3. Take Action                                              │
├─────────────────────────────────────────────────────────────┤
│                   FINAL CTA                                  │
│  "Ready to find your path?"                                  │
│  [Get Started Now →]                                         │
└─────────────────────────────────────────────────────────────┘
```

### Design Specifications

**Colors:**
- Background: `bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20`
- Header: `bg-white/80 backdrop-blur-sm`
- Primary CTA: `bg-[#009A8C] hover:bg-[#007F74]`
- Text: `text-[#002B45]` (headers), `text-[#3A4F61]` (body)

**Typography:**
- Hero H2: `text-[26px] md:text-[40px]` - Bold, Navy
- Body: `text-[16px] md:text-[18px]` - Regular, Secondary
- CTA Button: `text-[16px] md:text-[18px]` - Semibold, White

**Spacing:**
- Container: `max-w-[650px]` (hero), `max-w-3xl` (goals)
- Section gaps: `mb-6 md:mb-10`
- Card padding: `p-4 md:p-6`

### Goal Selection Cards

**States:**
1. **Default:** 
   - Border: `border-[#D4DFE4]`
   - Background: `bg-white`
   - Hover: `hover:border-[#009A8C] hover:shadow-sm hover:-translate-y-0.5`

2. **Selected:**
   - Border: `border-[#009A8C]`
   - Background: `bg-[#E7F7F4]`
   - Checkmark: `<Check className="w-5 h-5 text-[#009A8C]" />`

**Interaction:**
```typescript
const [selectedGoal, setSelectedGoal] = useState<PayoffGoal | null>(null);

// On click
onClick={() => setSelectedGoal(value)}

// Button enabled only when goal selected
disabled={!selectedGoal}
```

### Trust Indicators

**Grid Layout:**
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
  {/* 4 trust indicators */}
</div>
```

**Each Indicator:**
- Icon: `w-4 h-4 md:w-5 md:h-5 text-[#4F6A7A]`
- Text: `text-[11px] md:text-[13px] text-[#4F6A7A]`

---

## Goal Selection

### Available Goals

| Value | Label | Icon | Description |
|-------|-------|------|-------------|
| `pay-faster` | Pay off debt faster | ⚡ Zap | Get debt-free as quickly as possible |
| `lower-payment` | Reduce my monthly payment | 📅 Calendar | Lower your monthly obligations |
| `reduce-interest` | Reduce my interest | % Percent | Save money on interest charges |
| `avoid-default` | Avoid falling behind | 🛡️ Shield | Stay current and protect your credit |

### Goal State Management

**Storage:**
```typescript
// Passed via navigation state
navigate('/onboarding-clara', { state: { selectedGoal } });

// Retrieved in onboarding
const selectedGoal = (location.state as any)?.selectedGoal as PayoffGoal || 'pay-faster';
```

---

## Onboarding Flow (Two Paths)

### Path 1: Traditional Form Onboarding

**File:** [`frontend/src/pages/Onboarding.tsx`](frontend/src/pages/Onboarding.tsx:1)

#### 5-Step Wizard

```
Step 1: Stress & Life Events
├─ Stress Level (1-5 slider with emojis)
└─ Life Events (optional multi-select badges)

Step 2: Age & Employment
├─ Age Range (dropdown)
└─ Employment Status (dropdown)

Step 3: Income & Expenses
├─ Monthly Take-Home Income (number input)
├─ Monthly Expenses (number input)
└─ Available Cash Flow (calculated display)

Step 4: Savings & Credit
├─ Liquid Savings (number input)
└─ Credit Score Range (dropdown)

Step 5: Summary & Confirmation
└─ Review all collected data with insights
```

#### Progress Indicator

```tsx
<Progress 
  value={(step / totalSteps) * 100} 
  className="mb-8 [&>div]:bg-[#009A8C]" 
/>
```

#### Step Navigation

```tsx
<div className="flex justify-between pt-6">
  <Button variant="outline" onClick={handleBack}>
    <ArrowLeft className="w-4 h-4 mr-2" />
    Back
  </Button>
  <Button onClick={handleNext} disabled={!isStepValid()}>
    {step === totalSteps ? 'Add My Debts' : 'Next'}
    <ArrowRight className="w-4 h-4 ml-2" />
  </Button>
</div>
```

#### Empathetic Messaging

Each step includes contextual, empathetic messages:

**Step 1 (Stress Level):**
```typescript
const stressMessages = [
  "That's great that you're feeling confident!",
  "We hear you — let's build a plan that works.",
  "We understand the pressure you're feeling.",
  "We know debt can feel heavy — you're not alone.",
  "We're here to help you through this difficult time."
];
```

**Step 3 (Cash Flow):**
```typescript
if (available > 0) {
  return `You have $${available.toLocaleString()} available each month — let's make it work for you.`;
} else {
  return "Money feels tight right now — we'll help you find breathing room.";
}
```

#### Stress Level Slider

**Visual Design:**
- Emoji display: `text-6xl` with drop shadow
- Slider: Tailwind `<Slider>` component
- Labels: 1-5 scale with descriptions
- Color-coded feedback box

```tsx
<div className="text-6xl transition-all duration-300">
  {stressEmojis[formData.stressLevel - 1]}
</div>

<Slider
  value={[formData.stressLevel]}
  onValueChange={(value) => setFormData({ ...formData, stressLevel: value[0] })}
  min={1}
  max={5}
  step={1}
/>

<div className="p-4 rounded-lg" style={{ 
  backgroundColor: `${stressColors[formData.stressLevel - 1]}15`,
  borderLeft: `4px solid ${stressColors[formData.stressLevel - 1]}`
}}>
  <p>{stressLabels[formData.stressLevel - 1]}</p>
</div>
```

#### Life Events Selection

**Badge System:**
```tsx
<Badge
  variant={formData.lifeEvents.includes(option.value) ? 'default' : 'outline'}
  className={`cursor-pointer ${
    formData.lifeEvents.includes(option.value)
      ? 'bg-[#009A8C] text-white'
      : 'border-[#D4DFE4] text-[#3A4F61]'
  }`}
  onClick={() => toggleLifeEvent(option.value)}
>
  {formData.lifeEvents.includes(option.value) && (
    <CheckCircle2 className="w-3 h-3 mr-1" />
  )}
  {option.label}
</Badge>
```

#### Summary Page (Step 5)

**Layout:**
```
┌─────────────────────────────────────────┐
│         ✓ Checkmark Icon                │
│   "Here's what we know so far"          │
├─────────────────────────────────────────┤
│  [Your goal]                            │
│  Focus on paying off debt faster        │
│  → Insight about goal                   │
├─────────────────────────────────────────┤
│  [How you're feeling]                   │
│  Stress level description               │
│  → Empathetic insight                   │
├─────────────────────────────────────────┤
│  [Life events to consider]              │
│  Badge, Badge, Badge                    │
│  → Context about events                 │
├─────────────────────────────────────────┤
│  [Your situation]                       │
│  25-34 • Full-time                      │
│  → Age/employment insight               │
├─────────────────────────────────────────┤
│  [Monthly cash flow]                    │
│  $5,000 income • $3,000 expenses        │
│  Available: $2,000/month                │
│  → Cash flow insight                    │
├─────────────────────────────────────────┤
│  [Savings & credit]                     │
│  $1,000 savings • Good credit score     │
└─────────────────────────────────────────┘
```

---

### Path 2: Conversational Clara Onboarding

**File:** [`frontend/src/pages/OnboardingClara.tsx`](frontend/src/pages/OnboardingClara.tsx:1)

#### Layout Component

**File:** [`frontend/src/components/onboarding/ConversationalPageLayout.tsx`](frontend/src/components/onboarding/ConversationalPageLayout.tsx:1)

**Key Features:**
- No nested scrolling (page-level scroll only)
- Auto-scroll to bottom on new content
- Sticky header
- Gradient background

```tsx
<div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20">
  <header className="sticky top-0 z-10">
    {/* PathLight logo */}
  </header>
  <main className="container mx-auto px-4 py-8">
    <div className="max-w-4xl mx-auto space-y-6">
      {children}
    </div>
  </main>
</div>
```

#### 9-Question Flow

**Questions:** (from [`onboardingQuestions.ts`](frontend/src/lib/onboardingQuestions.ts:1))

1. **Money Goal** - Multiple choice (4 options)
2. **Stress Level** - Slider (1-5)
3. **Life Events** - Optional multiple choice
4. **Age Range** - Multiple choice (5 options)
5. **Employment** - Multiple choice (6 options)
6. **Monthly Income** - Number input
7. **Monthly Expenses** - Number input
8. **Liquid Savings** - Number input
9. **Credit Score** - Multiple choice (5 ranges)

#### Question Components

**Multiple Choice:**
```tsx
<QuestionMultipleChoice
  question={currentQuestion}
  onAnswer={handleQuestionAnswer}
/>
```

**Slider:**
```tsx
<QuestionSlider
  question={currentQuestion}
  onAnswer={handleQuestionAnswer}
/>
```

**Number Input:**
```tsx
<QuestionNumber
  question={currentQuestion}
  onAnswer={handleQuestionAnswer}
/>
```

**Optional Multiple Choice:**
```tsx
<QuestionOptionalMultipleChoice
  question={currentQuestion}
  onAnswer={handleQuestionAnswer}
/>
```

#### Conversation History Display

**User Answer (Right-aligned):**
```tsx
<div className="flex justify-end">
  <Card className="border-2 border-[#D4DFE4] max-w-[85%]">
    <CardContent className="p-6">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-[14px] text-[#4F6A7A]">{question.label}</p>
          <p className="text-[16px] font-medium text-[#002B45]">{displayAnswer}</p>
        </div>
        <CheckCircle2 className="w-5 h-5 text-[#009A8C]" />
      </div>
    </CardContent>
  </Card>
</div>
```

**Clara's Reaction (Left-aligned):**
```tsx
<div className="flex items-start gap-3 max-w-[85%]">
  <img src="/clara-avatar.png" className="w-8 h-8 rounded-full" />
  <div className="flex-1 bg-[#E7F7F4] rounded-lg p-4">
    <p className="text-[14px] text-[#3A4F61] whitespace-pre-wrap break-words">
      {claraMessage}
    </p>
  </div>
</div>
```

#### Loading State

```tsx
{isLoadingClara && (
  <Card className="border-2 border-[#009A8C] bg-[#E7F7F4]">
    <CardContent className="p-6">
      <div className="flex items-center gap-3">
        <img src="/clara-avatar.png" className="w-8 h-8 animate-pulse" />
        <p className="text-[14px] text-[#3A4F61] italic">
          Clara is thinking...
        </p>
      </div>
    </CardContent>
  </Card>
)}
```

#### Progress Indicator

```tsx
<div className="mt-8 text-center">
  <p className="text-sm text-[#4F6A7A]">
    Question {currentStep + 1} of 9
  </p>
  <div className="mt-2 w-full max-w-xs mx-auto h-2 bg-gray-200 rounded-full">
    <div 
      className="h-full bg-[#009A8C] transition-all duration-300"
      style={{ width: `${((currentStep + 1) / 9) * 100}%` }}
    />
  </div>
</div>
```

#### Completion State

```tsx
{isComplete && (
  <div className="space-y-4">
    {/* Clara's final message */}
    <div className="flex items-start gap-3 max-w-[85%]">
      <img src="/clara-avatar.png" className="w-8 h-8 rounded-full" />
      <div className="flex-1 bg-[#E7F7F4] rounded-lg p-4">
        <p>Thanks for sharing all that. I'm excited to help you from here.</p>
        <p className="text-[12px] text-[#4F6A7A] mt-2 italic">— Clara</p>
      </div>
    </div>
    
    {/* Completion card */}
    <Card className="border-2 border-[#009A8C] bg-[#E7F7F4]">
      <CardContent className="p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-[#009A8C] mx-auto" />
        <h3 className="text-[24px] font-bold text-[#002B45] mt-4">
          All Set!
        </h3>
        <p className="text-[16px] text-[#3A4F61] mt-2">
          Let's start building your personalized debt payoff plan.
        </p>
        <Button onClick={handleComplete} className="mt-6">
          Continue to Debt Entry
        </Button>
      </CardContent>
    </Card>
  </div>
)}
```

---

## Design System

### Color Palette

**Primary Colors:**
```css
Navy (Headers):     #002B45
Teal (Actions):     #009A8C
Teal Hover:         #007F74
Teal Background:    #E7F7F4
```

**Text Colors:**
```css
Primary:    #002B45 (Headers)
Secondary:  #3A4F61 (Body)
Tertiary:   #4F6A7A (Helper text)
```

**Border Colors:**
```css
Default:    #D4DFE4
Focus:      #009A8C
```

**Background Colors:**
```css
Primary:    #FFFFFF (Cards)
Secondary:  #F7F9FA (Sections)
Gradient:   from-white via-blue-50/30 to-teal-50/20
```

### Typography Scale

```css
/* Headers */
H1: 28px (mobile) / 44px (desktop) - Bold
H2: 24px (mobile) / 36px (desktop) - Bold
H3: 18px / 20px - Semibold
H4: 16px - Semibold

/* Body */
Large:   18px / 20px - Regular
Regular: 14px / 16px - Regular
Small:   12px / 14px - Regular

/* Buttons */
Primary: 16px / 18px - Semibold
```

### Spacing System

```css
/* Component Spacing */
Card padding:     p-4 md:p-6 (16px / 24px)
Section gaps:     space-y-6 (24px)
Message gaps:     space-y-4 (16px)
Button padding:   py-4 px-6 (16px / 24px)
```

### Border Radius

```css
Cards:           rounded-lg (8px)
Buttons:         rounded-xl (12px)
Message bubbles: rounded-2xl (16px)
Badges:          rounded-md (6px)
```

### Shadows

```css
Cards:          shadow-sm
Buttons:        shadow-md (hover: shadow-lg)
Message bubbles: shadow-sm
```

---

## Interaction Patterns

### Button States

**Primary CTA:**
```tsx
// Default
className="bg-[#009A8C] text-white"

// Hover
className="hover:bg-[#007F74] hover:shadow-lg hover:scale-[1.02]"

// Disabled
className="disabled:opacity-40 disabled:cursor-not-allowed"

// Transition
className="transition-all duration-200"
```

### Card Interactions

**Selectable Cards:**
```tsx
// Default
className="border-[#D4DFE4] bg-white"

// Hover
className="hover:border-[#009A8C] hover:shadow-sm hover:-translate-y-0.5"

// Selected
className="border-[#009A8C] bg-[#E7F7F4] shadow-sm"

// Transition
className="transition-all duration-200"
```

### Form Validation

**Visual Feedback:**
```tsx
// Valid input
<Input className="border-[#D4DFE4] focus:border-[#009A8C]" />

// Invalid input
<Input className="border-red-500 focus:border-red-500" />

// Success message
<div className="p-4 bg-green-50 border-l-4 border-green-500">
  <CheckCircle2 className="text-green-600" />
  <p>Success message</p>
</div>

// Error message
<div className="p-4 bg-red-50 border-l-4 border-red-500">
  <AlertCircle className="text-red-600" />
  <p>Error message</p>
</div>
```

### Loading States

**Skeleton Loaders:**
```tsx
<Skeleton className="h-20 w-full" />
```

**Spinners:**
```tsx
<Loader2 className="w-4 h-4 animate-spin" />
```

**Clara Thinking:**
```tsx
<div className="flex items-center gap-3">
  <img src="/clara-avatar.png" className="animate-pulse" />
  <p className="italic">Clara is thinking...</p>
</div>
```

### Animations

**Fade In:**
```tsx
className="animate-in fade-in duration-300"
```

**Slide In:**
```tsx
className="animate-in slide-in-from-bottom-4 duration-300"
```

**Scale on Hover:**
```tsx
className="hover:scale-[1.02] transition-transform duration-200"
```

---

## Responsive Behavior

### Breakpoints

```css
Mobile:  < 768px
Tablet:  768px - 1024px
Desktop: > 1024px
```

### Layout Adjustments

**Container Width:**
```tsx
// Hero section
className="max-w-[650px] mx-auto"

// Goal selection
className="max-w-3xl mx-auto"

// Onboarding
className="max-w-4xl mx-auto"
```

**Grid Layouts:**
```tsx
// Goal cards: 1 column mobile, 2 columns desktop
className="grid md:grid-cols-2 gap-3 md:gap-4"

// Trust bar: 2 columns mobile, 4 columns desktop
className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
```

**Typography:**
```tsx
// Hero heading
className="text-[26px] md:text-[40px]"

// Body text
className="text-[16px] md:text-[18px]"

// Button text
className="text-[16px] md:text-[18px]"
```

**Spacing:**
```tsx
// Section margins
className="mb-6 md:mb-10"

// Card padding
className="p-4 md:p-6"

// Button padding
className="py-4 md:py-5 px-6 md:px-8"
```

**Button Width:**
```tsx
// Full width mobile, auto desktop
className="w-full md:w-auto"
```

---

## State Management

### Session Storage

**Keys:**
```typescript
const STORAGE_KEY_ANSWERS = 'onboarding_answers';
const STORAGE_KEY_STEP = 'onboarding_step';
const STORAGE_KEY_TIMESTAMP = 'onboarding_timestamp';
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
```

**Save Progress:**
```typescript
sessionStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(userAnswers));
sessionStorage.setItem(STORAGE_KEY_STEP, currentStep.toString());
sessionStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
```

**Resume Session:**
```typescript
const savedAnswers = sessionStorage.getItem(STORAGE_KEY_ANSWERS);
const savedStep = sessionStorage.getItem(STORAGE_KEY_STEP);
const savedTimestamp = sessionStorage.getItem(STORAGE_KEY_TIMESTAMP);

if (savedAnswers && savedStep && savedTimestamp) {
  const timestamp = parseInt(savedTimestamp, 10);
  const now = Date.now();
  
  if (now - timestamp < SESSION_TIMEOUT_MS) {
    // Resume session
    setUserAnswers(JSON.parse(savedAnswers));
    setCurrentStep(parseInt(savedStep, 10));
  }
}
```

### Context Management

**DebtContext:**
```typescript
const {
  setFinancialContext,
  setOnboardingComplete,
  setProfileId
} = useDebt();
```

**Profile Creation:**
```typescript
const newProfile = await createProfile({
  user_id: userId,
  primary_goal: selectedGoal
});
setProfileId(newProfile.id);
```

### Navigation State

**Pass Goal to Onboarding:**
```typescript
navigate('/onboarding-clara', { 
  state: { selectedGoal } 
});
```

**Retrieve in Onboarding:**
```typescript
const location = useLocation();
const selectedGoal = (location.state as any)?.selectedGoal as PayoffGoal || 'pay-faster';
```

---

## Accessibility

### Keyboard Navigation

**Tab Order:**
1. Header logo
2. Goal selection cards
3. Primary CTA button
4. Trust indicators
5. Secondary CTAs

**Focus States:**
```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009A8C] focus-visible:ring-offset-2"
```

### Screen Reader Support

**ARIA Labels:**
```tsx
<button aria-label="Select pay off debt faster goal">
  <Zap className="w-5 h-5" />
  Pay off debt faster
</button>
```

**Hidden Text:**
```tsx
<span className="sr-only">
  Progress: Step {currentStep} of {totalSteps}
</span>
```

**Semantic HTML:**
```tsx
<header>
  <nav aria-label="Main navigation">
    {/* Navigation items */}
  </nav>
</header>

<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">See your clearest path out of debt</h1>
  </section>
</main>
```

### Color Contrast

All text meets WCAG AA standards:
- Navy (#002B45) on White: 14.8:1 ✓
- Secondary (#3A4F61) on White: 9.2:1 ✓
- Tertiary (#4F6A7A) on White: 6.8:1 ✓
- White on Teal (#009A8C): 3.5:1 ✓ (large text)

### Form Accessibility

**Labels:**
```tsx
<Label htmlFor="monthlyIncome">
  Monthly Take-Home Income
</Label>
<Input id="monthlyIncome" type="number" />
```

**Helper Text:**
```tsx
<p className="text-sm text-[#4F6A7A]" id="income-helper">
  How much money comes in each month
</p>
<Input aria-describedby="income-helper" />
```

**Error Messages:**
```tsx
<Input aria-invalid="true" aria-describedby="income-error" />
<p id="income-error" role="alert" className="text-red-600">
  Please enter a valid amount
</p>
```

---

## Summary

PathLight's onboarding system provides:

✅ **Two paths** - Traditional form or conversational Clara  
✅ **Progressive disclosure** - Information collected step-by-step  
