// frontend/src/components/onboarding/QuestionSlider.tsx

import { useState, useEffect, useRef } from 'react';
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
  const [hasInteracted, setHasInteracted] = useState(false);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentLabel = sliderConfig.labels[value - sliderConfig.min];
  const currentEmoji = sliderConfig.emojis?.[value - sliderConfig.min];

  // Auto-submit after user releases the slider (2000ms / 2 second delay)
  useEffect(() => {
    if (hasInteracted) {
      // Clear any existing timeout
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }

      // Set new timeout to auto-submit (2 seconds gives user time to explore)
      submitTimeoutRef.current = setTimeout(() => {
        onAnswer(value);
      }, 2000);
    }

    // Cleanup on unmount
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, [value, hasInteracted, onAnswer]);

  const handleValueChange = (newValue: number[]) => {
    setValue(newValue[0]);
    setHasInteracted(true);
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

      <div className="space-y-6 bg-white rounded-lg p-6 border-2 border-[#D4DFE4]">
        {/* Current Selection Display with Emoji */}
        <div className="text-center min-h-[80px] flex flex-col items-center justify-center gap-3">
          {currentEmoji && (
            <div className="text-5xl" role="img" aria-hidden="true">
              {currentEmoji}
            </div>
          )}
          <p className="text-[16px] md:text-[18px] text-[#002B45] font-medium">
            {currentLabel}
          </p>
        </div>

        {/* Slider */}
        <div className="space-y-4">
          <Slider
            value={[value]}
            onValueChange={handleValueChange}
            min={sliderConfig.min}
            max={sliderConfig.max}
            step={1}
            className="w-full"
          />
          
          {/* Emoji or Numeric Labels */}
          <div className="flex justify-between text-xs text-[#4F6A7A] px-1">
            {Array.from(
              { length: sliderConfig.max - sliderConfig.min + 1 },
              (_, i) => i + sliderConfig.min
            ).map((num, idx) => (
              <span
                key={num}
                className={`flex flex-col items-center gap-1 ${value === num ? 'font-bold text-[#009A8C]' : ''}`}
              >
                {sliderConfig.emojis ? (
                  <span className="text-xl" role="img" aria-hidden="true">
                    {sliderConfig.emojis[idx]}
                  </span>
                ) : (
                  <span>{num}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Auto-submit indicator */}
        {hasInteracted && (
          <div className="text-center">
            <p className="text-sm text-[#4F6A7A] italic">
              Submitting your response...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};