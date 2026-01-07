// frontend/src/components/ConversationalContainer.tsx

import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingQuestion } from '@/lib/onboardingQuestions';
import { QuestionMultipleChoice } from '@/components/onboarding/QuestionMultipleChoice';
import { QuestionNumber } from '@/components/onboarding/QuestionNumber';
import { QuestionSlider } from '@/components/onboarding/QuestionSlider';
import { QuestionOptionalMultipleChoice } from '@/components/onboarding/QuestionOptionalMultipleChoice';

// ============================================================================
// Types
// ============================================================================

interface ConversationHistoryItem {
  question: OnboardingQuestion;
  answer: any;
  claraMessage?: string;
}

interface ConversationalContainerProps {
  currentQuestion: OnboardingQuestion | null;
  history: ConversationHistoryItem[];
  isComplete: boolean;
  isLoadingClara: boolean;
  currentStep: number;
  totalSteps: number;
  userAnswers: Record<string, any>;
  onAnswer: (questionId: string, answer: any) => void;
  onComplete: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ConversationalContainer
 * 
 * Purpose: Embedded conversational interface within the homepage.
 * No chat chrome - just vertically stacked messages with Clara's voice.
 * 
 * Key Features:
 * - Clara's intro message
 * - Question history with answers and reactions
 * - Current question with appropriate input component
 * - Progress indicator
 * - Completion state
 * - Auto-scroll to bottom as conversation progresses
 */
export const ConversationalContainer: React.FC<ConversationalContainerProps> = ({
  currentQuestion,
  history,
  isComplete,
  isLoadingClara,
  currentStep,
  totalSteps,
  userAnswers,
  onAnswer,
  onComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (endRef.current) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }, [history, currentQuestion, isLoadingClara, isComplete]);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-3xl mx-auto space-y-6 py-8 bg-gradient-to-br from-[#E7F7F4]/20 to-white/50 rounded-2xl"
      style={{ overflow: 'visible' }}
    >
      {/* Optional visual boundary label */}
      {history.length > 0 && !isComplete && (
        <div className="text-center">
          <p className="text-xs text-[#4F6A7A] uppercase tracking-wide">Clara is helping you</p>
        </div>
      )}
      {/* Clara's Intro Message */}
      {history.length === 0 && !isComplete && (
        <Card className="border-none shadow-sm bg-gradient-to-br from-[#E7F7F4] to-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <img
                src="/clara-avatar.png"
                alt="Clara"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0 object-cover"
              />
              <div className="flex-1 space-y-2">
                <p className="text-[#002B45] text-base leading-relaxed">
                  Hi! I'm Clara. I'm here to help you take control of your debt and build a plan that actually works for you.
                </p>
                <p className="text-[#4F6A7A] text-sm leading-relaxed">
                  I'll ask you a few questions to understand your situation. This should only take a few minutes, and everything you share stays private.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation History */}
      {history.map((item, index) => (
        <div key={`history-${index}`} className="space-y-4">
          {/* Clara's Question */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-[#E7F7F4] to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <img
                  src="/clara-avatar.png"
                  alt="Clara"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0 object-cover"
                />
                <div className="flex-1">
                  <p className="text-[#002B45] text-base leading-relaxed">
                    {item.question.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User's Answer - right-aligned, lighter weight */}
          <div className="flex justify-end">
            <div className="max-w-[75%] bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-[#002B45] text-[15px]">
                {formatAnswer(item.question, item.answer)}
              </p>
            </div>
          </div>

          {/* Clara's Reaction */}
          {item.claraMessage && (
            <Card className="border-none shadow-sm bg-gradient-to-br from-[#E7F7F4] to-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <img
                    src="/clara-avatar.png"
                    alt="Clara"
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-[#4F6A7A] text-base leading-relaxed whitespace-pre-wrap">
                      {item.claraMessage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ))}

      {/* Loading State (Clara is thinking) */}
      {isLoadingClara && (
        <Card className="border-none shadow-sm bg-gradient-to-br from-[#E7F7F4] to-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <img
                src="/clara-avatar.png"
                alt="Clara"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0 object-cover"
              />
              <div className="flex-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#009A8C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#009A8C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#009A8C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Question */}
      {currentQuestion && !isLoadingClara && !isComplete && (
        <div className="space-y-4">
          {/* Answer Input - Question text is displayed within the input component */}
          <Card className="border-2 border-[#009A8C] shadow-md">
            <CardContent className="p-6">
              {renderQuestionInput(currentQuestion, userAnswers, onAnswer)}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completion State - Clara's closing message */}
      {isComplete && (
        <Card className="border-none shadow-sm bg-gradient-to-br from-[#E7F7F4] to-white">
          <CardContent className="p-8">
            <div className="flex items-start gap-3">
              <img
                src="/clara-avatar.png"
                alt="Clara"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0 object-cover"
              />
              <div className="flex-1">
                <p className="text-[#002B45] text-base leading-relaxed">
                  Thanks — that helps me understand what matters most to you. Next, you'll enter your debts all at once so I can create your snapshot.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-scroll anchor */}
      <div ref={endRef} />
    </div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Renders the appropriate input component based on question type
 */
function renderQuestionInput(
  question: OnboardingQuestion,
  userAnswers: Record<string, any>,
  onAnswer: (questionId: string, answer: any) => void
) {
  const currentValue = userAnswers[question.id];

  switch (question.type) {
    case 'multiple-choice':
      return (
        <QuestionMultipleChoice
          question={question}
          onAnswer={(value) => onAnswer(question.id, value)}
        />
      );

    case 'optional-multiple-choice':
      return (
        <QuestionOptionalMultipleChoice
          question={question}
          onAnswer={(value) => onAnswer(question.id, value)}
        />
      );

    case 'number':
      return (
        <QuestionNumber
          question={question}
          onAnswer={(value) => onAnswer(question.id, value)}
        />
      );

    case 'slider':
      return (
        <QuestionSlider
          question={question}
          onAnswer={(value) => onAnswer(question.id, value)}
        />
      );

    default:
      return (
        <div className="text-red-500">
          Unknown question type: {question.type}
        </div>
      );
  }
}

/**
 * Formats the user's answer for display in history
 */
function formatAnswer(question: OnboardingQuestion, answer: any): string {
  if (answer === null || answer === undefined) {
    return 'No answer provided';
  }

  switch (question.type) {
    case 'multiple-choice':
      const option = question.options?.find(opt => opt.value === answer);
      return option?.label || answer;

    case 'optional-multiple-choice':
      if (Array.isArray(answer)) {
        if (answer.length === 0) {
          return 'None selected';
        }
        const labels = answer
          .map(val => question.options?.find(opt => opt.value === val)?.label || val)
          .join(', ');
        return labels;
      }
      return 'Invalid answer format';

    case 'number':
      return `$${Number(answer).toLocaleString()}`;

    case 'slider':
      const sliderLabel = question.sliderConfig?.labels?.[answer - 1];
      return sliderLabel || `${answer}`;

    default:
      return String(answer);
  }
}