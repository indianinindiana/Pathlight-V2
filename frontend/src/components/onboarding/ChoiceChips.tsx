// frontend/src/components/onboarding/ChoiceChips.tsx

import { useState } from 'react';
import { OnboardingQuestion } from '@/lib/onboardingQuestions';

interface ChoiceChipsProps {
  question: OnboardingQuestion;
  onAnswer: (value: string | string[]) => void;
  multiSelect?: boolean;
}

/**
 * ChoiceChips
 * 
 * Conversational choice chips that feel like spoken responses.
 * Single tap selects and submits (no Submit button).
 * Chips animate into user response bubbles.
 */
export const ChoiceChips: React.FC<ChoiceChipsProps> = ({
  question,
  onAnswer,
  multiSelect = false
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleChipClick = (value: string) => {
    if (isAnimating) return;

    if (multiSelect) {
      // Toggle selection for multi-select
      const newSelection = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      setSelectedValues(newSelection);
    } else {
      // Single select - animate and submit
      setIsAnimating(true);
      
      // Micro-pause before submission (200-400ms)
      const delay = 200 + Math.random() * 200;
      setTimeout(() => {
        onAnswer(value);
      }, delay);
    }
  };

  const handleContinue = () => {
    if (selectedValues.length > 0) {
      setIsAnimating(true);
      const delay = 200 + Math.random() * 200;
      setTimeout(() => {
        onAnswer(selectedValues);
      }, delay);
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Text */}
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

      {/* Choice Chips - Chat Style */}
      <div className="flex flex-col gap-2.5">
        {question.options?.map((option) => {
          const isSelected = multiSelect && selectedValues.includes(option.value);
          
          return (
            <button
              key={option.value}
              onClick={() => handleChipClick(option.value)}
              disabled={isAnimating}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl
                transition-all duration-200
                shadow-sm hover:shadow-md
                ${isSelected
                  ? 'border-2 border-[#009A8C] bg-[#E7F7F4] text-[#002B45]'
                  : 'border border-gray-200 bg-white text-[#002B45] hover:border-[#009A8C] hover:bg-[#F7F9FA]'
                }
                ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
                focus:outline-none focus:ring-2 focus:ring-[#009A8C] focus:ring-offset-2
              `}
              aria-label={`Response option: ${option.label}. Press Enter to respond.`}
            >
              {option.icon && (
                <span className="text-2xl flex-shrink-0" role="img" aria-hidden="true">
                  {option.icon}
                </span>
              )}
              <span className="text-[15px] flex-1 text-left">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Send-style affordance for Multi-Select */}
      {multiSelect && selectedValues.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleContinue}
            disabled={isAnimating}
            className="flex items-center gap-2 px-6 py-3 bg-[#009A8C] text-white font-medium rounded-full hover:bg-[#007F74] transition-all disabled:opacity-50 hover:scale-[1.02]"
            aria-label="Send selected responses"
          >
            <span>Send {selectedValues.length > 1 ? `${selectedValues.length} responses` : 'response'}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};