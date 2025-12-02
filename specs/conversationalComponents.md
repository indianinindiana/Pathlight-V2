# Specification for: Conversational UI Components

This document outlines the architecture for the new components and hooks required to build the hybrid, AI-powered conversational onboarding flow.

---

## 1. Layout Component: `ConversationalPageLayout.tsx`

**Filename:** `frontend/src/components/onboarding/ConversationalPageLayout.tsx`

**Purpose:** To provide a container that strictly enforces the "no nested scrolling" rule. It ensures a smooth, single-page scrolling experience and manages auto-scrolling as new content is added.

**DOM Structure:**
```tsx
// Simplified structure
<div id="onboarding-page" className="min-h-screen">
  <Header />
  <main className="container mx-auto py-8">
    <div id="onboarding-feed" ref={feedRef}>
      {children}
    </div>
  </main>
</div>
```

**Props:**
```typescript
interface ConversationalPageLayoutProps {
  children: React.ReactNode;
}
```

**Responsibilities:**
*   **No Internal Scroll:** The main content area (`onboarding-feed`) must have `overflow: visible`.
*   **Page-level Scroll:** The `<body>` or the top-level page `<div>` will be the only scrollable element.
*   **Auto-Scroll:** It must expose a function or use a mechanism to smoothly scroll to the bottom of the feed whenever new children are added. A `ref` passed to the feed `div` is a good approach.
*   **Styling:** Should handle the basic flex-column layout and gap between conversational items.

**Developer Notes:**
*   Implement an effect that triggers `window.scrollTo` or `feedRef.current.scrollIntoView` when the `children` prop changes.
*   Ensure all parent containers allow this component to grow vertically without restriction (no `height` or `max-height`).

---

## 2. Custom Hook: `useConversationalFlow.ts`

**Filename:** `frontend/src/hooks/useConversationalFlow.ts`

**Purpose:** To encapsulate the entire state management and business logic for the onboarding conversation. This keeps the main page component clean and focused on rendering.

**Hook Signature & State:**
```typescript
interface UseConversationalFlowReturn {
  currentStep: number;
  currentQuestion: OnboardingQuestion;
  userAnswers: Record<string, any>;
  history: Array<{ question: OnboardingQuestion; answer: any }>;
  isComplete: boolean;
  handleAnswer: (questionId: string, answer: any) => void;
}

function useConversationalFlow(): UseConversationalFlowReturn;
```

**Responsibilities:**
*   **State Management:**
    *   `currentStep`: The index of the current question in the `onboardingQuestions` array.
    *   `userAnswers`: A key-value map of `question.id` to the user's answer.
    *   `history`: An array of `{ question, answer }` objects to track the conversation.
*   **Logic:**
    *   `handleAnswer`:
        1.  Validates the answer against the question's `validation` rules (client-side).
        2.  Updates the `userAnswers` and `history` state.
        3.  Advances `currentStep` to the next question.
        4.  Triggers the asynchronous call to the AI service with the latest answer.
*   **Data Source:** It should import `onboardingQuestions` from `onboardingQuestions.ts` as its source of truth.

**Developer Notes:**
*   This hook will be the brain of the operation.
*   The `handleAnswer` function is where the async call to `claraAiApi.ts` will be made. The result of this call (the empathetic message) should be stored in a separate state, perhaps managed within this hook as well, or in the component that uses this hook.

---

## 3. AI Message Component: `ClaraEmpatheticMessage.tsx`

**Filename:** `frontend/src/components/onboarding/ClaraEmpatheticMessage.tsx`

**Purpose:** A dedicated component to display the AI-generated empathetic response for a given conversation step. It handles its own loading (typing indicator) and data fetching.

**Props:**
```typescript
interface ClaraEmpatheticMessageProps {
  step: number;
  userAnswers: Record<string, any>;
}
```

**Responsibilities:**
*   **Data Fetching:** When the component mounts or its `step` prop changes, it should:
    1.  Immediately show a typing indicator.
    2.  Make an API call to the `/api/v1/ai/onboarding` endpoint, sending the `userAnswers`.
*   **State Management:**
    *   `isLoading`: A boolean to control the display of the typing indicator.
    *   `message`: A string to hold the AI's response.
    *   `error`: To handle API call failures gracefully.
*   **Rendering:**
    *   While `isLoading`, it renders the Clara avatar and a typing animation.
    *   Once `message` is received, it renders the Clara avatar and the personalized, empathetic text.
    *   If an `error` occurs, it can render a fallback message like "..." or a subtle error indicator.

**Developer Notes:**
*   This component will be rendered for each step of the conversation *before* the question itself.
*   Example Usage in `OnboardingClara.tsx`:
    ```tsx
    history.map((item, index) => (
      <React.Fragment key={item.question.id}>
        <ClaraEmpatheticMessage step={index} userAnswers={userAnswers} />
        {/* Component to display the question and user's answer */}
      </React.Fragment>
    ))
    ```

This component architecture effectively separates concerns, promotes reusability, and directly supports the hybrid, UX-first model we've designed.