import React, { useState } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExplanationPoint {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ExplainabilitySectionProps {
  title: string;
  defaultOpen?: boolean;
  explanations: ExplanationPoint[];
  className?: string;
}

const ExplainabilitySection: React.FC<ExplainabilitySectionProps> = ({
  title,
  defaultOpen = false,
  explanations,
  className
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border border-[#D4DFE4] rounded-xl bg-white', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#F7F9FA] transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[#002B45]">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-[#4F6A7A] transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5">
          <div className="space-y-4">
            {explanations.map((explanation, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-4 pb-4',
                  index < explanations.length - 1 && 'border-b border-[#E5E7EB]'
                )}
              >
                <div className="flex-shrink-0 w-10 h-10 bg-[#E7F7F4] rounded-lg flex items-center justify-center">
                  <explanation.icon className="w-5 h-5 text-[#009A8C]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-[#002B45] mb-1">
                    {explanation.title}
                  </h4>
                  <p className="text-sm text-[#3A4F61] leading-relaxed">
                    {explanation.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplainabilitySection;