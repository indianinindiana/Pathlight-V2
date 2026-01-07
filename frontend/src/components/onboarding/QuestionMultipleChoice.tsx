// frontend/src/components/onboarding/QuestionMultipleChoice.tsx

import { ChoiceChips } from './ChoiceChips';
import { OnboardingQuestion } from '@/lib/onboardingQuestions';

interface QuestionMultipleChoiceProps {
  question: OnboardingQuestion;
  onAnswer: (value: string) => void;
}

/**
 * QuestionMultipleChoice
 *
 * Renders a multiple-choice question with conversational choice chips.
 * Single tap selects and submits - no Submit button needed.
 */
export const QuestionMultipleChoice: React.FC<QuestionMultipleChoiceProps> = ({
  question,
  onAnswer
}) => {
  return (
    <ChoiceChips
      question={question}
      onAnswer={(value) => onAnswer(value as string)}
      multiSelect={false}
    />
  );
};