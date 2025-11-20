import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface NextActionCardProps {
  priority: number;
  title: string;
  description: string;
  impact: string;
  cta: string;
  onAction: () => void;
  progress?: number;
  confidence?: 'high' | 'medium' | 'low';
  completed?: boolean;
  className?: string;
}

const NextActionCard: React.FC<NextActionCardProps> = ({
  priority,
  title,
  description,
  impact,
  cta,
  onAction,
  progress = 0,
  confidence = 'high',
  completed = false,
  className
}) => {
  const confidenceColors = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500',
    low: 'bg-red-500'
  };

  const confidenceLabels = {
    high: 'High confidence',
    medium: 'Medium confidence',
    low: 'Low confidence'
  };

  return (
    <Card
      className={cn(
        'relative border-2 transition-all hover:shadow-md',
        completed ? 'border-green-500 bg-green-50/50' : 'border-[#009A8C]',
        className
      )}
    >
      <Badge
        className="absolute -top-3 left-6 bg-[#009A8C] text-white border-0 px-3 py-1"
      >
        Priority #{priority}
      </Badge>
      
      <CardContent className="pt-8 pb-6 px-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#002B45] mb-2 flex items-center gap-2">
              {completed && <CheckCircle className="w-5 h-5 text-green-600" />}
              {title}
            </h3>
            <p className="text-sm text-[#3A4F61] mb-3 leading-relaxed">
              {description}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-[#002B45]">Impact:</span>
              <span className="text-[#009A8C]">{impact}</span>
            </div>
          </div>
        </div>

        {progress > 0 && !completed && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#4F6A7A]">Progress</span>
              <span className="text-xs font-medium text-[#002B45]">
                {Math.round(progress * 100)}%
              </span>
            </div>
            <Progress value={progress * 100} className="h-1 [&>div]:bg-[#009A8C]" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', confidenceColors[confidence])} />
            <span className="text-xs text-[#4F6A7A]">{confidenceLabels[confidence]}</span>
          </div>
          
          {!completed && (
            <Button
              onClick={onAction}
              className="bg-[#009A8C] hover:bg-[#007F74] text-white rounded-lg"
              size="sm"
            >
              {cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NextActionCard;