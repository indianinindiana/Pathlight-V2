// frontend/src/components/onboarding/QuestionOptionalMultipleChoice.tsx

import { useState } from 'react';
import { ChoiceChips } from './ChoiceChips';
import { OnboardingQuestion } from '@/lib/onboardingQuestions';

interface QuestionOptionalMultipleChoiceProps {
  question: OnboardingQuestion;
  onAnswer: (values: string[]) => void;
}

/**
 * QuestionOptionalMultipleChoice
 *
 * Renders an optional multiple-choice question with conversational choice chips.
 * Users can select multiple options or skip entirely.
 */
export const QuestionOptionalMultipleChoice: React.FC<QuestionOptionalMultipleChoiceProps> = ({
  question,
  onAnswer
}) => {
  const [isSkipping, setIsSkipping] = useState(false);

  const handleSkip = () => {
    setIsSkipping(true);
    // Micro-pause before submission
    const delay = 200 + Math.random() * 200;
    setTimeout(() => {
      onAnswer([]);
    }, delay);
  };

  return (
    <div className="space-y-4">
      <ChoiceChips
        question={question}
        onAnswer={(values) => onAnswer(values as string[])}
        multiSelect={true}
      />
      
      {/* Skip option */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleSkip}
          disabled={isSkipping}
          className="text-[14px] text-[#4F6A7A] hover:text-[#002B45] underline transition-colors disabled:opacity-50"
        >
          Skip this question
        </button>
      </div>
    </div>
  );
};