// frontend/src/components/onboarding/QuestionOptionalMultipleChoice.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingQuestion } from '@/lib/onboardingQuestions';

interface QuestionOptionalMultipleChoiceProps {
  question: OnboardingQuestion;
  onAnswer: (values: string[]) => void;
}

/**
 * QuestionOptionalMultipleChoice
 * 
 * Renders an optional multiple-choice question where users can select multiple options.
 * Includes a "Skip" option for truly optional questions.
 */
export const QuestionOptionalMultipleChoice: React.FC<QuestionOptionalMultipleChoiceProps> = ({
  question,
  onAnswer
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleToggle = (value: string) => {
    setSelectedValues(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleContinue = () => {
    onAnswer(selectedValues);
  };

  const handleSkip = () => {
    onAnswer([]);
  };

  return (
    <div className="space-y-6">
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

      <div className="space-y-3">
        {question.options?.map((option) => (
          <div
            key={option.value}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedValues.includes(option.value)
                ? 'border-[#009A8C] bg-[#E7F7F4]'
                : 'border-[#D4DFE4] hover:border-[#009A8C]/50'
            }`}
            onClick={() => handleToggle(option.value)}
          >
            <Checkbox
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
              className="mt-0.5"
            />
            <label className="flex-1 text-[16px] text-[#002B45] cursor-pointer">
              {option.label}
            </label>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 py-6 text-[16px] border-2"
          onClick={handleSkip}
        >
          Skip
        </Button>
        <Button
          className="flex-1 bg-[#009A8C] hover:bg-[#007F74] text-white py-6 text-[16px]"
          onClick={handleContinue}
          disabled={selectedValues.length === 0}
        >
          Continue {selectedValues.length > 0 && `(${selectedValues.length})`}
        </Button>
      </div>
    </div>
  );
};