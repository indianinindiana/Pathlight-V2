// frontend/src/components/onboarding/QuestionSlider.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { OnboardingQuestion } from '@/lib/onboardingQuestions';

interface QuestionSliderProps {
  question: OnboardingQuestion;
  onAnswer: (value: number) => void;
}

/**
 * QuestionSlider
 * 
 * Renders a slider question with visual feedback and labels.
 * Mobile-first design with touch-friendly interactions.
 */
export const QuestionSlider: React.FC<QuestionSliderProps> = ({
  question,
  onAnswer
}) => {
  const { sliderConfig } = question;
  
  if (!sliderConfig) {
    console.error('QuestionSlider requires sliderConfig');
    return null;
  }

  const [value, setValue] = useState<number>(sliderConfig.min);
  const currentLabel = sliderConfig.labels[value - sliderConfig.min];

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

      <div className="space-y-6 bg-white rounded-lg p-6 border-2 border-[#D4DFE4]">
        {/* Current Selection Display */}
        <div className="text-center min-h-[60px] flex items-center justify-center">
          <p className="text-[16px] md:text-[18px] text-[#002B45] font-medium">
            {currentLabel}
          </p>
        </div>

        {/* Slider */}
        <div className="space-y-4">
          <Slider
            value={[value]}
            onValueChange={(newValue) => setValue(newValue[0])}
            min={sliderConfig.min}
            max={sliderConfig.max}
            step={1}
            className="w-full"
          />
          
          {/* Numeric Labels */}
          <div className="flex justify-between text-xs text-[#4F6A7A] px-1">
            {Array.from(
              { length: sliderConfig.max - sliderConfig.min + 1 },
              (_, i) => i + sliderConfig.min
            ).map((num) => (
              <span 
                key={num}
                className={`${value === num ? 'font-bold text-[#009A8C]' : ''}`}
              >
                {num}
              </span>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <Button
          className="w-full bg-[#009A8C] hover:bg-[#007F74] text-white py-6 text-[16px]"
          onClick={() => onAnswer(value)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};