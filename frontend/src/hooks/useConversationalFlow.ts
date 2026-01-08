// frontend/src/hooks/useConversationalFlow.ts

import { useState, useCallback, useEffect } from 'react';
import { onboardingQuestions, OnboardingQuestion } from '@/lib/onboardingQuestions';
import { getOnboardingReaction } from '@/services/claraAiApi';

// ============================================================================
// Types
// ============================================================================

interface ConversationHistoryItem {
  question: OnboardingQuestion;
  answer: any;
  claraMessage?: string;
}

interface UseConversationalFlowReturn {
  currentStep: number;
  currentQuestion: OnboardingQuestion | null;
  userAnswers: Record<string, any>;
  history: ConversationHistoryItem[];
  isComplete: boolean;
  isLoadingClara: boolean;
  handleAnswer: (questionId: string, answer: any) => void;
  handleBack: () => void;
  canGoBack: boolean;
  resetFlow: () => void;
}

// ============================================================================
// Session Storage Keys
// ============================================================================

const STORAGE_KEY_ANSWERS = 'onboarding_answers';
const STORAGE_KEY_STEP = 'onboarding_step';
const STORAGE_KEY_TIMESTAMP = 'onboarding_timestamp';
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// Custom Hook
// ============================================================================

/**
 * useConversationalFlow
 * 
 * Purpose: Encapsulates the entire state management and business logic for the onboarding conversation.
 * Keeps the main page component clean and focused on rendering.
 * 
 * Features:
 * - State management for current step, answers, and history
 * - Client-side validation
 * - Session persistence and resume (24-hour timeout)
 * - Automatic progression through questions
 */
export function useConversationalFlow(): UseConversationalFlowReturn {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [history, setHistory] = useState<ConversationHistoryItem[]>([]);
  const [isLoadingClara, setIsLoadingClara] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Initialize or recover session on mount
  useEffect(() => {
    const savedAnswers = sessionStorage.getItem(STORAGE_KEY_ANSWERS);
    const savedStep = sessionStorage.getItem(STORAGE_KEY_STEP);
    const savedTimestamp = sessionStorage.getItem(STORAGE_KEY_TIMESTAMP);

    if (savedAnswers && savedStep && savedTimestamp) {
      const timestamp = parseInt(savedTimestamp, 10);
      const now = Date.now();

      // Check if session is still valid (within 24 hours)
      if (now - timestamp < SESSION_TIMEOUT_MS) {
        const answers = JSON.parse(savedAnswers);
        const step = parseInt(savedStep, 10);

        setUserAnswers(answers);
        setCurrentStep(step);

        // Rebuild history from saved answers
        const rebuiltHistory: ConversationHistoryItem[] = [];
        for (let i = 0; i < step; i++) {
          const question = onboardingQuestions[i];
          if (answers[question.id] !== undefined) {
            rebuiltHistory.push({
              question,
              answer: answers[question.id]
            });
          }
        }
        setHistory(rebuiltHistory);
      } else {
        // Session expired, clear storage
        clearSession();
      }
    }
  }, []);

  // Save to session storage whenever state changes
  useEffect(() => {
    if (currentStep > 0 || Object.keys(userAnswers).length > 0) {
      sessionStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(userAnswers));
      sessionStorage.setItem(STORAGE_KEY_STEP, currentStep.toString());
      sessionStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
    }
  }, [currentStep, userAnswers]);

  const clearSession = () => {
    sessionStorage.removeItem(STORAGE_KEY_ANSWERS);
    sessionStorage.removeItem(STORAGE_KEY_STEP);
    sessionStorage.removeItem(STORAGE_KEY_TIMESTAMP);
  };

  const currentQuestion = currentStep < onboardingQuestions.length 
    ? onboardingQuestions[currentStep] 
    : null;

  const isComplete = currentStep >= onboardingQuestions.length;

  /**
   * Validates an answer against the question's validation rules
   */
  const validateAnswer = (question: OnboardingQuestion, answer: any): boolean => {
    const { validation } = question;

    // Check required
    if (validation.required && (answer === undefined || answer === null || answer === '')) {
      return false;
    }

    // Check numeric
    if (validation.isNumeric && answer !== undefined && answer !== null && answer !== '') {
      const numValue = typeof answer === 'string' ? parseFloat(answer) : answer;
      if (isNaN(numValue) || numValue < 0) {
        return false;
      }
    }

    return true;
  };

  /**
   * Handles user's answer to the current question
   * 1. Validates the answer
   * 2. Updates userAnswers and history
   * 3. Advances to next question
   */
  const handleAnswer = useCallback(async (questionId: string, answer: any) => {
    const question = onboardingQuestions.find(q => q.id === questionId);
    
    if (!question) {
      console.error(`Question with id ${questionId} not found`);
      return;
    }

    // Validate answer
    if (!validateAnswer(question, answer)) {
      console.error(`Invalid answer for question ${questionId}`);
      return;
    }

    // Update answers
    const updatedAnswers = {
      ...userAnswers,
      [questionId]: answer
    };
    
    setUserAnswers(updatedAnswers);

    // Get Clara's empathetic reaction with micro-timing variation
    setIsLoadingClara(true);
    let claraMessage = '';
    
    try {
      const isResume = currentStep === 0 && Object.keys(userAnswers).length > 0;
      
      // Add micro-timing variation (800ms - 1500ms) to feel more natural
      const minDelay = 800;
      const maxDelay = 1500;
      const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
      
      const [reaction] = await Promise.all([
        getOnboardingReaction({
          session_id: sessionId,
          step_id: questionId,
          user_answers: updatedAnswers,
          is_resume: isResume
        }),
        new Promise(resolve => setTimeout(resolve, randomDelay))
      ]);
      
      claraMessage = reaction.clara_message;
    } catch (error) {
      console.error('Error getting Clara reaction:', error);
      // Fallback message
      claraMessage = "Thank you for sharing that 💙 Let's keep going.";
    } finally {
      setIsLoadingClara(false);
    }

    // Add to history with Clara's message
    setHistory(prev => [...prev, { question, answer, claraMessage }]);

    // Advance to next step
    setCurrentStep(prev => prev + 1);
  }, [userAnswers, currentStep, sessionId]);

  /**
   * Handles going back to the previous question
   */
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      // Remove last item from history
      setHistory(prev => prev.slice(0, -1));
      
      // Go back one step
      setCurrentStep(prev => prev - 1);
      
      // Note: We keep the answer in userAnswers so user can see their previous response
    }
  }, [currentStep]);

  const canGoBack = currentStep > 0 && !isComplete;

  /**
   * Resets the flow to start over
   */
  const resetFlow = useCallback(() => {
    setCurrentStep(0);
    setUserAnswers({});
    setHistory([]);
    clearSession();
  }, []);

  return {
    currentStep,
    currentQuestion,
    userAnswers,
    history,
    isComplete,
    isLoadingClara,
    handleAnswer,
    handleBack,
    canGoBack,
    resetFlow
  };
}