import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface MetricsCardProps {
  title: string;
  value: string;
  subtitle?: string | ReactNode;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const MetricsCard = ({ title, value, subtitle, icon: Icon, iconColor = '#009A8C', trend }: MetricsCardProps) => {
  return (
    <Card className="border-[1.5px] border-[#D4DFE4] hover:border-[#009A8C] transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-[#E7F7F4] rounded-lg">
            <Icon className="w-6 h-6" style={{ color: iconColor }} strokeWidth={2} />
          </div>
          {trend && (
            <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </span>
          )}
        </div>
        <h3 className="text-sm font-medium text-[#4F6A7A] mb-1">{title}</h3>
        <p className="text-2xl md:text-3xl font-bold text-[#002B45] mb-1">{value}</p>
        {subtitle && <p className="text-sm text-[#3A4F61]">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;