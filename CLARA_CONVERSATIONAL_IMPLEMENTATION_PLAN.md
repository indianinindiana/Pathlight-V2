# Clara Conversational Onboarding - Implementation Plan

**Version:** 1.0  
**Created:** 2026-01-04  
**Status:** Ready for Implementation  
**North Star:** "Build this so it feels like the home screen turns into a guided conversation—not like we added a chat feature."

---

## Implementation Overview

This document provides a step-by-step implementation plan for transforming the PathLight homepage into a conversational onboarding experience with Clara. The implementation is broken down into 6 major steps, each with specific technical requirements and acceptance criteria.

---

## Step 1: Refactor `Index.tsx` for State Transitions

### Current State Analysis

The current [`Index.tsx`](frontend/src/pages/Index.tsx:1) has:
- Goal selection cards (4 options)
- Navigation to `/onboarding-clara` route
- Separate "returning user" section

### Required Changes

#### 1.1 Add UI State Management

```typescript
type HomeUIState = 'idle' | 'transitioning' | 'conversation_active';

const [uiState, setUiState] = useState<HomeUIState>('idle');
```

#### 1.2 Simplify Homepage Layout (idle state)

**Remove:**
- Goal selection cards section
- Navigation to separate onboarding routes
- "Start Over" functionality (will be handled differently)

**Keep:**
- Header with PathLight logo
- Hero section with main headline
- "Meet Clara" introduction card
- Trust indicators bar
- "How It Works" section
- Final CTA section

**Add:**
- Single primary CTA button with new copy: "Let's take the next step together"

#### 1.3 Update Primary CTA

```typescript
<Button
  size="lg"
  onClick={() => setUiState('transitioning')}
  className="w-full md:w-auto md:min-w-[300px] mx-auto flex items-center justify-center bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold text-[16px] md:text-[18px] py-4 md:py-5 px-6 md:px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
>
  Let's take the next step together
  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
</Button>
```

#### 1.4 Add Transition Animation

```typescript
// When uiState changes to 'transitioning'
useEffect(() => {
  if (uiState === 'transitioning') {
    // Wait for animation to complete
    const timer = setTimeout(() => {
      setUiState('conversation_active');
    }, 300);
    return () => clearTimeout(timer);
  }
}, [uiState]);
```

#### 1.5 Conditional Rendering Based on State

```typescript
return (
  <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20">
    <header>...</header>
    
    {/* Home Content - visible in idle and transitioning states */}
    <div 
      className={`transition-all duration-300 ${
        uiState === 'conversation_active' 
          ? 'opacity-20 blur-sm pointer-events-none' 
          : 'opacity-100'
      }`}
    >
      {/* Existing home content */}
    </div>
    
    {/* Conversational Container - visible in transitioning and active states */}
    {(uiState === 'transitioning' || uiState === 'conversation_active') && (
      <ConversationalContainer 
        isActive={uiState === 'conversation_active'}
        onComplete={handleConversationComplete}
      />
    )}
  </div>
);
```

### Acceptance Criteria

- [ ] Homepage displays single primary CTA with supportive copy
- [ ] No "chat" or "AI" language in UI
- [ ] CTA click triggers state change (no navigation)
- [ ] Home content fades and blurs during transition
- [ ] Transition completes in 300ms
- [ ] No route changes occur

---

## Step 2: Create the Conversational Container

### File: `frontend/src/components/ConversationalContainer.tsx` (NEW)

This is a new component that will be embedded within `Index.tsx`.

### Component Structure

```typescript
interface ConversationalContainerProps {
  isActive: boolean;
  onComplete: (data: Record<string, any>) => void;
}

export const ConversationalContainer: React.FC<ConversationalContainerProps> = ({
  isActive,
  onComplete
}) => {
  const {
    currentStep,
    currentQuestion,
    userAnswers,
    history,
    isComplete,
    isLoadingClara,
    handleAnswer,
    canGoBack,
    handleBack
  } = useConversationalFlow();

  // Handle completion
  useEffect(() => {
    if (isComplete) {
      onComplete(userAnswers);
    }
  }, [isComplete, userAnswers, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isActive 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-full pointer-events-none'
      }`}
    >
      <div className="w-full max-w-4xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Conversation Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Clara's intro message */}
          {currentStep === 0 && (
            <ClaraIntroMessage />
          )}
          
          {/* History of answered questions */}
          {history.map((item, index) => (
            <ConversationHistoryItem key={index} item={item} />
          ))}
          
          {/* Current question */}
          {!isComplete && currentQuestion && (
            <CurrentQuestionDisplay 
              question={currentQuestion}
              onAnswer={handleAnswer}
              isLoading={isLoadingClara}
            />
          )}
          
          {/* Completion state */}
          {isComplete && (
            <CompletionMessage />
          )}
        </div>
        
        {/* Progress indicator */}
        {!isComplete && (
          <div className="border-t border-gray-200 p-4">
            <ProgressIndicator current={currentStep} total={9} />
          </div>
        )}
      </div>
    </div>
  );
};
```

### Key Design Requirements

**NO Chat Chrome:**
- No header with "Chat with Clara"
- No avatars in v1
- No timestamps
- No typing indicators
- No message input field (questions are system-rendered)

**Visual Hierarchy:**
- Clara's intro: Warm, welcoming message
- Questions: Visually distinct but not form-like (subtle indentation or background)
- User answers: Right-aligned, confirmed with checkmark
- Clara's reactions: Left-aligned, empathetic responses

### Acceptance Criteria

- [ ] Container emerges from bottom during transition
- [ ] No chat-like UI elements (header, avatars, timestamps)
- [ ] Vertically stacked message layout
- [ ] Questions feel like Clara is asking them
- [ ] Smooth animations between states
- [ ] Progress indicator shows current position

---

## Step 3: Adapt `useConversationalFlow` Hook

### Current State

The existing [`useConversationalFlow.ts`](frontend/src/hooks/useConversationalFlow.ts:1) is tied to the `OnboardingClara` page.

### Required Changes

#### 3.1 Make Hook Page-Agnostic

Remove any page-specific logic and make it a pure state management hook.

#### 3.2 Add Intro State

```typescript
type ConversationState = 'intro' | 'question' | 'user_answer' | 'ai_reaction';

const [conversationState, setConversationState] = useState<ConversationState>('intro');
```

#### 3.3 Update Flow Logic

```typescript
const handleAnswer = useCallback(async (questionId: string, answer: any) => {
  // 1. Validate answer
  if (!validateAnswer(question, answer)) return;
  
  // 2. Set state to user_answer
  setConversationState('user_answer');
  
  // 3. Update answers
  const updatedAnswers = { ...userAnswers, [questionId]: answer };
  setUserAnswers(updatedAnswers);
  
  // 4. Get Clara's reaction (set state to ai_reaction)
  setConversationState('ai_reaction');
  setIsLoadingClara(true);
  
  try {
    const reaction = await getOnboardingReaction({
      session_id: sessionId,
      step_id: questionId,
      user_answers: updatedAnswers,
      is_resume: false
    });
    
    claraMessage = reaction.clara_message;
  } catch (error) {
    claraMessage = "Thank you for sharing that. Let's keep going.";
  } finally {
    setIsLoadingClara(false);
  }
  
  // 5. Add to history
  setHistory(prev => [...prev, { question, answer, claraMessage }]);
  
  // 6. Advance to next question
  setCurrentStep(prev => prev + 1);
  setConversationState('question');
}, [userAnswers, currentStep, sessionId]);
```

### Acceptance Criteria

- [ ] Hook is decoupled from specific page
- [ ] Manages intro, question, answer, reaction states
- [ ] Persists state to sessionStorage
- [ ] Handles session resume with `is_resume` flag
- [ ] Provides clear API for container component

---

## Step 4: Update Onboarding Questions

### File: `frontend/src/lib/onboardingQuestions.ts`

### Current State

Questions are written in a neutral, form-like style.

### Required Changes

Rewrite all questions in Clara's voice using first-person plural ("Let's...", "How are we feeling...").

#### Example Transformations

**Before:**
```typescript
{
  id: "moneyGoal",
  label: "What's your biggest money goal right now?",
  type: "multiple-choice",
  // ...
}
```

**After:**
```typescript
{
  id: "moneyGoal",
  label: "Let's start with what matters most to you right now. What's your biggest money goal?",
  type: "multiple-choice",
  // ...
}
```

**Before:**
```typescript
{
  id: "stressLevel",
  label: "How stressful does your money situation feel right now?",
  type: "slider",
  // ...
}
```

**After:**
```typescript
{
  id: "stressLevel",
  label: "How are we feeling about your money situation right now?",
  type: "slider",
  // ...
}
```

### Full Question Rewrites

1. **Money Goal:** "Let's start with what matters most to you right now. What's your biggest money goal?"
2. **Stress Level:** "How are we feeling about your money situation right now?"
3. **Life Events:** "Are there any big life changes coming up in the next 6-12 months that we should plan for?"
4. **Age Range:** "Let's talk about where you are in life. What's your age range?"
5. **Employment:** "And what's your work situation like right now?"
6. **Monthly Income:** "Let's look at your cash flow. What's your monthly take-home income?"
7. **Monthly Expenses:** "And how much do you typically spend each month?"
8. **Liquid Savings:** "How much do you have saved up that you could use for emergencies or debt?"
9. **Credit Score:** "Last thing—what's your credit score range?"

### Acceptance Criteria

- [ ] All questions use first-person plural
- [ ] Tone is warm and conversational
- [ ] Questions feel like Clara is asking them
- [ ] No question marks in AI-generated reactions (backend)

---

## Step 5: Ensure Backend Compliance

### Files to Review

- [`backend/app/shared/ai_service.py`](backend/app/shared/ai_service.py:389)
- [`backend/config/ai_prompts.yaml`](backend/config/ai_prompts.yaml:206)

### Required Verification

#### 5.1 Check AI Service Method

The `generate_onboarding_reaction` method must:
- Generate empathetic statements only
- Never ask questions
- Be limited to 1-2 sentences

#### 5.2 Review Prompt Template

The `onboarding_reaction` template in `ai_prompts.yaml` must:
- Explicitly forbid questions in the system prompt
- Include examples of good reactions (no question marks)
- Emphasize empathy and brevity

#### 5.3 Update System Prompt (if needed)

```yaml
onboarding_reaction:
  role: "You are Clara, an empathetic AI guide. Provide warm, brief (1-2 sentences) reactions to user answers. NEVER ask questions. NEVER use question marks."
  guidelines:
    - "DO NOT ASK QUESTIONS - The frontend handles all questions"
    - "Keep responses to 1-2 sentences maximum"
    - "Be conversational and supportive"
    - "React to the user's answer, don't prompt for more"
    - "Use statements, not questions"
```

### Acceptance Criteria

- [ ] Backend prompt explicitly forbids questions
- [ ] System prompt emphasizes empathy and brevity
- [ ] Max tokens set appropriately (500 is good)
- [ ] No sentence truncation logic
- [ ] Fallback messages are also non-questioning

---

## Step 6: Implement Session Resume Logic

### Files to Modify

- [`frontend/src/pages/Index.tsx`](frontend/src/pages/Index.tsx:1)
- [`frontend/src/hooks/useConversationalFlow.ts`](frontend/src/hooks/useConversationalFlow.ts:1)

### Required Changes

#### 6.1 Check Session on Mount (Index.tsx)

```typescript
useEffect(() => {
  const savedAnswers = sessionStorage.getItem('onboarding_answers');
  const savedStep = sessionStorage.getItem('onboarding_step');
  const savedTimestamp = sessionStorage.getItem('onboarding_timestamp');
  
  if (savedAnswers && savedStep && savedTimestamp) {
    const timestamp = parseInt(savedTimestamp, 10);
    const now = Date.now();
    const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
    
    if (now - timestamp < SESSION_TIMEOUT_MS) {
      // Resume conversation
      setUiState('conversation_active');
    } else {
      // Clear expired session
      sessionStorage.removeItem('onboarding_answers');
      sessionStorage.removeItem('onboarding_step');
      sessionStorage.removeItem('onboarding_timestamp');
    }
  }
}, []);
```

#### 6.2 Set Resume Flag (useConversationalFlow.ts)

```typescript
const handleAnswer = useCallback(async (questionId: string, answer: any) => {
  // ...
  
  const isResume = currentStep === 0 && Object.keys(userAnswers).length > 0;
  
  const reaction = await getOnboardingReaction({
    session_id: sessionId,
    step_id: questionId,
    user_answers: updatedAnswers,
    is_resume: isResume
  });
  
  // ...
}, [userAnswers, currentStep, sessionId]);
```

#### 6.3 Backend Resume Message

The backend already handles `is_resume` flag and provides "Welcome back!" messages via the `get_resume_message()` function in [`clara_fallbacks.py`](backend/app/shared/clara_fallbacks.py:1).

### Acceptance Criteria

- [ ] Session state persists to sessionStorage
- [ ] On app load, check for active session
- [ ] If valid session exists, restore to conversation_active state
- [ ] First API call after resume sets is_resume flag
- [ ] Clara provides "Welcome back!" reaction
- [ ] Expired sessions (>24h) are cleared

---

## Implementation Order

1. **Step 1:** Refactor `Index.tsx` (Foundation)
2. **Step 4:** Update onboarding questions (Content)
3. **Step 5:** Verify backend compliance (Safety)
4. **Step 2:** Create conversational container (UI)
5. **Step 3:** Adapt hook (Logic)
6. **Step 6:** Add session resume (Polish)

This order ensures we have the foundation and content ready before building the complex UI and state management.

---

## Testing Checklist

### Functional Testing

- [ ] CTA click triggers state transition (no navigation)
- [ ] Home content fades and blurs smoothly
- [ ] Conversational container emerges from bottom
- [ ] Clara's intro message appears first
- [ ] Questions appear one at a time
- [ ] User can select answers
- [ ] Clara's reactions appear after each answer
- [ ] Progress indicator updates correctly
- [ ] Completion message appears at end
- [ ] Session persists across page refresh
- [ ] Session resume works correctly
- [ ] Expired sessions are cleared

### Visual Testing

- [ ] No chat-like UI elements
- [ ] Questions feel like Clara is asking them
- [ ] Animations are smooth (300ms)
- [ ] Layout is responsive (mobile, tablet, desktop)
- [ ] Colors match design system
- [ ] Typography is consistent
- [ ] Spacing is appropriate

### Accessibility Testing

- [ ] Focus moves to container after transition
- [ ] Screen reader announces transition
- [ ] All interactive elements are keyboard accessible
- [ ] Color contrast meets WCAG AA
- [ ] Reduced motion preferences respected

### Performance Testing

- [ ] Background blur performs well on mobile
- [ ] No layout shifts during transition
- [ ] API calls are optimized
- [ ] Session storage doesn't grow unbounded

---

## Rollback Plan

If issues arise during implementation:

1. **Preserve Old Routes:** Keep `/onboarding-clara` route functional as fallback
2. **Feature Flag:** Add environment variable to toggle new experience
3. **Gradual Rollout:** Test with small percentage of users first
4. **Monitoring:** Track completion rates and error rates

---

## Success Metrics

- **Completion Rate:** % of users who complete onboarding
- **Time to Complete:** Average time from CTA click to completion
- **Drop-off Points:** Where users abandon the flow
- **User Feedback:** Qualitative feedback on experience
- **Technical Metrics:** Error rates, API latency, performance

---

## Next Steps

After implementation is complete:

1. **Sample Question Copy:** Provide more examples of Clara-voiced questions
2. **Component Responsibility Map:** Document which component owns what
3. **Design QA Checklist:** Create checklist to prevent chat-pattern regressions
4. **User Testing:** Conduct usability testing with real users
5. **Iteration:** Refine based on feedback and metrics

---

**Status:** Ready for implementation  
**Estimated Effort:** 3-5 days for full implementation and testing  
**Risk Level:** Medium (significant UI/UX changes, but well-defined requirements)