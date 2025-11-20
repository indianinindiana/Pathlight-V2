import React from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface ScenarioSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  impact?: {
    label: string;
    value: string | number;
  }[];
  formatValue?: (value: number) => string;
  className?: string;
}

const ScenarioSlider: React.FC<ScenarioSliderProps> = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
  unit = '',
  impact = [],
  formatValue,
  className
}) => {
  const displayValue = formatValue ? formatValue(value) : `${unit}${value.toLocaleString()}`;

  return (
    <div className={cn('p-6 bg-[#F7F9FA] rounded-xl border border-[#D4DFE4]', className)}>
      <div className="mb-4">
        <label className="text-sm font-semibold text-[#002B45] mb-2 block">
          {label}
        </label>
        <div className="text-3xl font-bold text-[#002B45] text-center my-4">
          {displayValue}
        </div>
      </div>

      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="mb-4"
      />

      <div className="flex justify-between text-xs text-[#4F6A7A] mb-4">
        <span>{unit}{min.toLocaleString()}</span>
        <span>{unit}{max.toLocaleString()}</span>
      </div>

      {impact.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {impact.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 text-center border border-[#D4DFE4]"
            >
              <div className="text-xs text-[#4F6A7A] mb-1">{item.label}</div>
              <div className="text-lg font-semibold text-[#009A8C]">{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScenarioSlider;