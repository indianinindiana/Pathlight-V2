// frontend/src/components/onboarding/QuestionMultipleChoice.tsx

import { Button } from '@/components/ui/button';
import { OnboardingQuestion } from '@/lib/onboardingQuestions';

interface QuestionMultipleChoiceProps {
  question: OnboardingQuestion;
  onAnswer: (value: string) => void;
}

/**
 * QuestionMultipleChoice
 * 
 * Renders a multiple-choice question with button options.
 * Mobile-first design with accessible interactions.
 */
export const QuestionMultipleChoice: React.FC<QuestionMultipleChoiceProps> = ({
  question,
  onAnswer
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-[20px] md:text-[24px] font-semibold text-[#002B45]">
          {question.label}
        </h3>
        {question.helper && (
          <p className="text-[14px] md:text-[16px] text-[#4F6A7A]">
            {question.helper}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {question.options?.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            className="w-full justify-start text-left h-auto py-4 px-5 border-2 border-[#D4DFE4] hover:border-[#009A8C] hover:bg-[#E7F7F4] transition-all"
            onClick={() => onAnswer(option.value)}
          >
            <span className="text-[16px] text-[#002B45]">{option.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};