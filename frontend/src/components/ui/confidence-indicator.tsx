import React, { useState } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface ConfidenceFactor {
  name: string;
  met: boolean;
}

export interface ConfidenceIndicatorProps {
  level: 'high' | 'medium' | 'low';
  factors: ConfidenceFactor[];
  explanation?: string;
  className?: string;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  level,
  factors,
  explanation,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const levelConfig = {
    high: {
      label: 'High-confidence assessment',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      borderColor: 'border-green-500',
      dotColor: 'bg-green-500'
    },
    medium: {
      label: 'Medium-confidence assessment',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      dotColor: 'bg-yellow-500'
    },
    low: {
      label: 'Low-confidence assessment',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-500',
      dotColor: 'bg-red-500'
    }
  };

  const config = levelConfig[level];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
            config.bgColor,
            config.textColor,
            config.borderColor,
            'hover:opacity-80',
            className
          )}
        >
          <div className={cn('w-2 h-2 rounded-full', config.dotColor)} />
          {config.label}
          <Info className="w-3 h-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div>
          <h4 className="text-sm font-semibold text-[#002B45] mb-3">
            Confidence Factors
          </h4>
          <ul className="space-y-2 mb-3">
            {factors.map((factor, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                {factor.met ? (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-[#3A4F61]">{factor.name}</span>
              </li>
            ))}
          </ul>
          {explanation && (
            <div className="pt-3 border-t border-[#E5E7EB]">
              <p className="text-xs text-[#4F6A7A]">{explanation}</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ConfidenceIndicator;