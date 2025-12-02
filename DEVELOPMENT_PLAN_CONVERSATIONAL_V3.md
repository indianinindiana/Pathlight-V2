# Development Plan: AI-Powered Conversational Onboarding

**Author:** Roo, Technical Lead
**Version:** 3.0 (Hybrid Model with NFRs)
**Status:** Finalized & Approved for Implementation

## 1. Executive Summary
This document outlines the development plan for a revised, AI-powered conversational onboarding experience featuring the "Clara" persona. The core strategy is a **hybrid UX model** that prioritizes a fast, responsive interface while enriching the experience with asynchronous AI-generated personalization. This version incorporates critical non-functional requirements (NFRs) and detailed implementation notes to ensure a robust and polished final product.

## 2. Non-Functional Requirements (NFRs) - **NEW**

### Performance
*   **Instant UI:** Next question must appear in **<50ms** after submission.
*   **Async AI:** AI responses can appear asynchronously up to **4 seconds** later. A loading shimmer/typing indicator must be shown during this time.
*   **Streaming Preferred:** AI responses should be streamed token-by-token if the backend supports it, otherwise fall back to a full response.

### UX & Behavior
*   **Single Scroll Container:** The browser viewport is the *only* scrollable container. No nested scrolling is permitted.
*   **Mobile First:** All UI elements, spacing, and animations must be validated on a mobile viewport first. The soft keyboard must not break the layout.
*   **Empathetic Message Placement:** Clara's AI-generated messages **always appear above** the *next* question, never blocking input.
*   **Graceful Error Handling:** If an AI message fails to load, a non-blocking fallback message will appear (e.g., "Hmm, I couldn’t load my message. Let’s keep going—everything is saved.").
*   **Session Resume:** Sessions expire after 24 hours. If a user returns within that window, they will resume at their last completed question with a welcome-back message from Clara.
*   **Rapid Input Handling:** AI reactions must be tied to the `step_id`, not timestamps, to prevent race conditions and misplaced messages.

### AI Constraints
*   **Concise Responses:** AI messages must be a maximum of **2 sentences**.
*   **Controlled Persona:** The AI must not use emojis unless contextually appropriate, ask unassigned questions, contradict fixed options, or alter the onboarding flow. The tone is empathetic but concise.

## 3. Sprints & Key Tasks

### **Sprint 1: Frontend Foundation & Structure (Est. 1-2 days)**
*Goal: Build the non-AI, instant-response version of the onboarding flow.*

| Task ID | Description                                                                                             | Notes                                                      |
| :------ | :------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------- |
| `FE-01` | **Create Canonical Question Set:** Implement `frontend/src/lib/onboardingQuestions.ts`.                   | As per `specs/onboardingQuestions.md`.                     |
| `FE-02` | **Implement Conversational Layout:** Create `ConversationalPageLayout.tsx`.                               | Must enforce single-scroll container NFR.                  |
| `FE-03` | **Build State Management Logic:** Create `useConversationalFlow.ts` custom hook.                        | Will manage session resume logic.                          |
| `FE-04` | **Develop UI Components:** Create components for each question type (multiple-choice, slider, number). | Mobile-first and accessible.                               |
| `FE-05` | **Assemble the Static Flow:** Rewrite `OnboardingClara.tsx` to display the static 9-question sequence.    | Will use the new hooks and layout.                         |
| `FE-06` | **Implement Client-Side Validation:** Add instant validation for numeric and required fields.            | Provides immediate feedback.                               |

---

### **Sprint 2: Backend AI Adaptation (Est. 1 day)**
*Goal: Reconfigure the backend to provide asynchronous, empathetic reactions.*

| Task ID | Description                                                                                             | Notes                                                      |
| :------ | :------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------- |
| `BE-01` | **Update AI Models:** Create `OnboardingReactionRequest` and `OnboardingReactionResponse` Pydantic models.  | As per `specs/backendOnboarding.md`.                       |
| `BE-02` | **Revise AI Prompt:** Update `ai_prompts.yaml` with the `onboarding_reaction` prompt.                     | **Add constraints:** Max 2 sentences, no questions, etc.   |
| `BE-03` | **Modify Onboarding Endpoint:** Refactor `onboarding_conversation` function to be reactive.                | Implement session resume logic ("welcome back").           |
| `BE-04` | **Unit Test the Endpoint:** Test for persona constraints, empathetic responses, and session logic.        | Essential for quality control.                             |

---

### **Sprint 3: Full-Stack Integration & Testing (Est. 1-2 days)**
*Goal: Connect the frontend and backend and polish the final experience.*

| Task ID | Description                                                                                             | Notes                                                      |
| :------ | :------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------- |
| `INT-01`| **Create Empathetic Message Component:** Implement `ClaraEmpatheticMessage.tsx`.                          | Will handle loading shimmer, streaming, and error states.  |
| `INT-02`| **Integrate AI Calls:** Add async API calls in `useConversationalFlow.ts`.                                | Tie requests to `step_id` to prevent race conditions.      |
| `INT-03`| **Render AI Messages:** Display `ClaraEmpatheticMessage` above each new question.                         | As per the explicit placement requirement.                 |
| `INT-04`| **Add Analytics Tracking:** Implement basic analytics events (`onboarding_question_viewed`, `onboarding_answer_submitted`, etc.). | Recommended for funnel optimization.                       |
| `QA-01` | **End-to-End Testing:** Perform comprehensive testing, focusing on all NFRs.                              | Test on various mobile devices and network conditions.     |
| `QA-02` | **UX Polish:** Refine animations, loading states, and scrolling behavior.                                 | Final polish based on testing.                             |

## 4. Next Step
This finalized plan is robust and addresses the critical details needed for a successful launch. The architectural phase is complete.

I will now request a switch to **Code Mode** to begin implementation of **Sprint 1, Task `FE-01`**.