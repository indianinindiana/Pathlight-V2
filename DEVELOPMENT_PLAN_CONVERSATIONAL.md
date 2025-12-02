# Development Plan: AI-Powered Conversational Onboarding

**Author:** Roo, Technical Lead
**Version:** 2.0 (Hybrid Model)
**Status:** Approved for Implementation

## 1. Executive Summary
This document outlines the development plan for implementing a revised, AI-powered conversational onboarding experience featuring the "Clara" persona. This plan supersedes any previous onboarding implementation.

The core strategy is a **hybrid UX model** that prioritizes a fast, responsive user interface while enriching the experience with asynchronous AI-generated personalization. This approach mitigates latency risks and delivers a modern, seamless flow.

## 2. Sprints & Key Tasks

The project is broken down into three logical sprints:
1.  **Sprint 1: Frontend Foundation & Structure**
2.  **Sprint 2: Backend AI Adaptation**
3.  **Sprint 3: Full-Stack Integration & Testing**

---

### **Sprint 1: Frontend Foundation & Structure (Est. 1-2 days)**
*Goal: Build the non-AI, instant-response version of the onboarding flow. At the end of this sprint, a user can click through all 9 questions, but without Clara's personalized messages.*

| Task ID | Description                                                                                             | Mode      | Specification Document                       |
| :------ | :------------------------------------------------------------------------------------------------------ | :-------- | :------------------------------------------- |
| `FE-01` | **Create Canonical Question Set:** Implement `frontend/src/lib/onboardingQuestions.ts`.                   | `Code`    | `specs/onboardingQuestions.md`               |
| `FE-02` | **Implement Conversational Layout:** Create the `ConversationalPageLayout.tsx` component.                 | `Code`    | `specs/conversationalComponents.md`          |
| `FE-03` | **Build State Management Logic:** Create the `useConversationalFlow.ts` custom hook.                        | `Code`    | `specs/conversationalComponents.md`          |
| `FE-04` | **Develop UI Components:** Create components to render each question type (multiple-choice, slider, number). | `Code`    | `REVISED_CLARA_AI_ONBOARDING_IMPLEMENTATION.md` |
| `FE-05` | **Assemble the Static Flow:** Rewrite `OnboardingClara.tsx` to use the new hooks and components to display the static 9-question sequence. | `Code`    | `specs/conversationalComponents.md`          |
| `FE-06` | **Implement Client-Side Validation:** Add basic, instant validation for numeric and required fields.         | `Code`    | `REVISED_CLARA_AI_ONBOARDING_IMPLEMENTATION.md` |

**Sprint 1 Deliverable:** A fully functional, clickable onboarding prototype with the exact 9 questions, but no AI interaction.

---

### **Sprint 2: Backend AI Adaptation (Est. 1 day)**
*Goal: Reconfigure the backend AI service to provide asynchronous, empathetic reactions instead of driving the conversation.*

| Task ID | Description                                                                                             | Mode      | Specification Document                       |
| :------ | :------------------------------------------------------------------------------------------------------ | :-------- | :------------------------------------------- |
| `BE-01` | **Update AI Models:** Create `OnboardingReactionRequest` and `OnboardingReactionResponse` Pydantic models.  | `Code`    | `specs/backendOnboarding.md`                 |
| `BE-02` | **Revise AI Prompt:** Update `backend/config/ai_prompts.yaml` with the new `onboarding_reaction` prompt.   | `Code`    | `specs/backendOnboarding.md`                 |
| `BE-03` | **Modify Onboarding Endpoint:** Refactor the `onboarding_conversation` function in `ai_services/routes.py` to use the new prompt and models. | `Code`    | `specs/backendOnboarding.md`                 |
| `BE-04` | **Unit Test the Endpoint:** Write a test to ensure the endpoint returns an empathetic message based on sample user answers. | `Debug`   | `specs/backendOnboarding.md`                 |

**Sprint 2 Deliverable:** A fully functional and tested `/api/v1/ai/onboarding` endpoint that accepts user answers and returns a personalized `clara_message`.

---

### **Sprint 3: Full-Stack Integration & Testing (Est. 1-2 days)**
*Goal: Connect the frontend and backend, bringing the full, AI-enriched experience to life.*

| Task ID | Description                                                                                             | Mode      | Specification Document                       |
| :------ | :------------------------------------------------------------------------------------------------------ | :-------- | :------------------------------------------- |
| `INT-01`| **Create Empathetic Message Component:** Implement `ClaraEmpatheticMessage.tsx` to fetch and display AI responses. | `Code`    | `specs/conversationalComponents.md`          |
| `INT-02`| **Integrate AI Calls:** In `useConversationalFlow.ts`, add the asynchronous call to the backend API inside the `handleAnswer` function. | `Code`    | `specs/conversationalComponents.md`          |
| `INT-03`| **Render AI Messages:** In `OnboardingClara.tsx`, render the `ClaraEmpatheticMessage` component for each step in the history. | `Code`    | `specs/conversationalComponents.md`          |
| `QA-01` | **End-to-End Testing:** Perform comprehensive testing of the entire flow on desktop and mobile.         | `Debug`   | `REVISED_CLARA_AI_ONBOARDING_IMPLEMENTATION.md` |
| `QA-02` | **UX Polish:** Refine animations, loading states, and scrolling behavior based on testing feedback.          | `Code`    | `REVISED_CLARA_AI_ONBOARDING_IMPLEMENTATION.md` |

**Sprint 3 Deliverable:** The final, polished, and fully functional AI-powered conversational onboarding experience.

## 3. Roles & Responsibilities
*   **Architect (You):** The plan is now complete. Your role is to oversee the implementation and provide guidance.
*   **Code Mode:** Will be responsible for executing all `FE-`, `BE-`, and `INT-` tasks.
*   **Debug Mode:** Will be responsible for `BE-04` and all `QA-` tasks.

## 4. Next Step
The next action is to hand this plan off to the implementation team (i.e., switch to "Code" mode) and begin **Sprint 1, Task `FE-01`**.

I am ready to proceed. Please approve this plan, and I will request a switch to **Code Mode** to begin the implementation.