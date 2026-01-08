// frontend/src/components/onboarding/QuestionNumber.tsx

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { OnboardingQuestion } from '@/lib/onboardingQuestions';

interface QuestionNumberProps {
  question: OnboardingQuestion;
  onAnswer: (value: number) => void;
}

/**
 * QuestionNumber
 *
 * Conversational number input with send-style affordance.
 * Feels like messaging, not form-filling.
 *
 * 3-tier error handling:
 * Tier 1: Inline clarification (neutral, helper-text style)
 * Tier 2: Clara-assisted clarification (after repeated errors)
 * Tier 3: Soft blocking (rare, no red UI)
 */
export const QuestionNumber: React.FC<QuestionNumberProps> = ({
  question,
  onAnswer
}) => {
  const [value, setValue] = useState<string>('');
  const [helperText, setHelperText] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Clear helper text on change
    if (helperText) {
      setHelperText('');
    }
  };

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    
    // Tier 1: Inline clarification (neutral)
    if (!trimmedValue) {
      setHelperText('Just need a number here—like 3000 or 5000');
      setAttemptCount(prev => prev + 1);
      return;
    }

    const numValue = parseFloat(trimmedValue);
    
    if (isNaN(numValue)) {
      setHelperText('Just need a number here—like 3000 or 5000');
      setAttemptCount(prev => prev + 1);
      return;
    }

    if (numValue < 0) {
      setHelperText('Looking for a positive number—your best estimate is fine');
      setAttemptCount(prev => prev + 1);
      return;
    }

    // Submit
    onAnswer(numValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Tier 2: Clara-assisted clarification (after 2 attempts)
  const showClaraHelp = attemptCount >= 2;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          {question.icon && (
            <span className="text-3xl flex-shrink-0" role="img" aria-hidden="true">
              {question.icon}
            </span>
          )}
          <div className="flex-1">
            <h3 className="text-[20px] md:text-[24px] font-semibold text-[#002B45]">
              {question.label}
            </h3>
            {question.helper && (
              <p className="text-[14px] md:text-[16px] text-[#4F6A7A] mt-1">
                {question.helper}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tier 2: Clara's empathetic clarification */}
      {showClaraHelp && (
        <div className="bg-[#E7F7F4] rounded-2xl p-4 border-l-4 border-[#009A8C]">
          <p className="text-[14px] text-[#3A4F61] leading-relaxed">
            I need a number to work with—what's your best estimate? Even a rough number helps me create a plan that works for you.
          </p>
        </div>
      )}

      {/* Conversational input surface */}
      <div className="space-y-2">
        <div className="relative bg-white rounded-2xl border border-[#D4DFE4] focus-within:border-[#009A8C] transition-colors shadow-sm">
          <div className="flex items-center gap-2 p-4">
            <span className="text-[#4F6A7A] text-[18px] font-medium">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder={question.placeholder || 'Your answer...'}
              className="flex-1 text-[18px] text-[#002B45] bg-transparent border-none outline-none placeholder:text-[#9CA3AF]"
              autoFocus
              style={{
                // Remove number input arrows
                MozAppearance: 'textfield',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!value.trim()}
              className={`
                flex items-center justify-center w-10 h-10 rounded-full transition-all
                ${value.trim()
                  ? 'bg-[#009A8C] hover:bg-[#007F74] text-white cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
              aria-label="Send response"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Tier 1: Inline clarification (neutral color) */}
        {helperText && (
          <p className="text-[14px] text-[#4F6A7A] leading-relaxed px-2">
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
};