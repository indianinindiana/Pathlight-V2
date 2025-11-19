import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface WhatIfTemplateCardProps {
  template: {
    type: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    iconBg: string;
  };
  onClick: () => void;
}

const WhatIfTemplateCard = ({ template, onClick }: WhatIfTemplateCardProps) => {
  const Icon = template.icon;

  return (
    <Card
      className="border-[1.5px] border-[#D4DFE4] hover:border-[#009A8C] transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${template.iconBg}`}>
            <Icon className="w-6 h-6 text-[#009A8C]" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#002B45] text-lg mb-2">{template.title}</h3>
            <p className="text-sm text-[#3A4F61]">{template.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatIfTemplateCard;