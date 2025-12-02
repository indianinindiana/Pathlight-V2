// frontend/src/components/onboarding/QuestionNumber.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OnboardingQuestion } from '@/lib/onboardingQuestions';

interface QuestionNumberProps {
  question: OnboardingQuestion;
  onAnswer: (value: number) => void;
}

/**
 * QuestionNumber
 * 
 * Renders a numeric input question with validation.
 * Mobile-first design with immediate feedback.
 */
export const QuestionNumber: React.FC<QuestionNumberProps> = ({
  question,
  onAnswer
}) => {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Clear error on change
    if (error) {
      setError('');
    }
  };

  const handleSubmit = () => {
    // Validate
    if (!value.trim()) {
      setError('This field is required');
      return;
    }

    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }

    if (numValue < 0) {
      setError('Please enter a positive number');
      return;
    }

    // Submit
    onAnswer(numValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
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

      <div className="space-y-4 bg-white rounded-lg p-6 border-2 border-[#D4DFE4]">
        <div className="space-y-2">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6A7A] text-[18px]">
              $
            </span>
            <Input
              type="number"
              value={value}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder={question.placeholder || '0'}
              className={`pl-8 text-[18px] h-14 ${error ? 'border-red-500' : ''}`}
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <Button
          className="w-full bg-[#009A8C] hover:bg-[#007F74] text-white py-6 text-[16px]"
          onClick={handleSubmit}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};