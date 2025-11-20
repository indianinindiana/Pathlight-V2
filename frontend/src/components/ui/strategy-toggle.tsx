import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface StrategyOption {
  value: string;
  label: string;
  metrics?: {
    months: number;
    interest: number;
    description?: string;
  };
}

export interface StrategyToggleProps {
  options: StrategyOption[];
  selected: string;
  onChange: (value: string) => void;
  showComparison?: boolean;
  className?: string;
}

const StrategyToggle: React.FC<StrategyToggleProps> = ({
  options,
  selected,
  onChange,
  showComparison = true,
  className
}) => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  return (
    <div className={cn('relative', className)}>
      <div className="flex gap-2 p-1 bg-[#F7F9FA] rounded-xl border border-[#D4DFE4]">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            onMouseEnter={() => setHoveredOption(option.value)}
            onMouseLeave={() => setHoveredOption(null)}
            className={cn(
              'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all',
              'border border-transparent',
              selected === option.value
                ? 'bg-white text-[#002B45] border-[#009A8C] shadow-sm font-semibold'
                : 'text-[#3A4F61] hover:bg-white hover:border-[#D4DFE4]'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {showComparison && hoveredOption && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#D4DFE4] rounded-lg p-4 shadow-lg z-10">
          <div className="grid grid-cols-3 gap-4">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'text-center p-3 rounded-lg',
                  option.value === hoveredOption ? 'bg-[#E7F7F4]' : 'bg-[#F7F9FA]'
                )}
              >
                <div className="text-xs font-medium text-[#4F6A7A] mb-1">
                  {option.label}
                </div>
                {option.metrics && (
                  <>
                    <div className="text-sm font-semibold text-[#002B45]">
                      {option.metrics.months} months
                    </div>
                    <div className="text-xs text-[#3A4F61]">
                      ${option.metrics.interest.toLocaleString()} interest
                    </div>
                    {option.metrics.description && (
                      <div className="text-xs text-[#4F6A7A] mt-1">
                        {option.metrics.description}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyToggle;