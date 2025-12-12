import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PayoffScenario } from '@/types/debt';
import { Calendar, DollarSign, TrendingDown, Clock, Star, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface ScenarioCardProps {
  scenario: PayoffScenario;
  isSelected?: boolean;
  onClick?: () => void;
  isRecommended?: boolean;
  recommendationReason?: string;
}

const ScenarioCard = ({
  scenario,
  isSelected = false,
  onClick,
  isRecommended = false,
  recommendationReason
}: ScenarioCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const getStrategyBadge = () => {
    const badges = {
      snowball: { label: 'Snowball', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
      avalanche: { label: 'Avalanche', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
      custom: { label: 'Hybrid', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
      consolidation: { label: 'Consolidation', color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' },
      settlement: { label: 'Settlement', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
    };
    return badges[scenario.strategy] || badges.custom;
  };

  const getStrategyInfo = () => {
    const info = {
      snowball: 'Pays off smallest debts first for quick wins and motivation',
      avalanche: 'Targets highest interest rates first to save the most money',
      custom: 'Balanced approach combining elements of both strategies',
      consolidation: 'Combines multiple debts into a single loan with lower interest',
      settlement: 'Negotiates reduced payoff amounts with creditors',
    };
    return info[scenario.strategy] || 'Custom payment strategy';
  };

  const badge = getStrategyBadge();

  return (
    <Card
      className={`relative border-[1.5px] transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'border-[#009A8C] bg-[#E7F7F4] shadow-lg scale-[1.02]'
          : 'border-[#D4DFE4] hover:border-[#009A8C] hover:shadow-lg hover:scale-[1.02]'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-[#002B45] text-lg flex-1">{scenario.name}</CardTitle>
          <div className="flex flex-col gap-1.5 items-end">
            {isRecommended && (
              <Popover>
                <PopoverTrigger asChild>
                  <Badge className="bg-[#009A8C] text-white hover:bg-[#007F74] cursor-help border-0 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Recommended
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-[#002B45]">Why This Strategy?</h4>
                    <p className="text-sm text-[#3A4F61]">
                      {recommendationReason || 'This strategy best matches your financial situation and goals.'}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Badge className={`${badge.color} border-0 cursor-help flex items-center gap-1`}>
                  {badge.label}
                  <Info className="w-3 h-3" />
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-[#002B45]">{badge.label} Strategy</h4>
                  <p className="text-sm text-[#3A4F61]">{getStrategyInfo()}</p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-[#4F6A7A] mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-[#4F6A7A]">Monthly Payment</p>
              <p className="font-semibold text-[#002B45] truncate">{formatCurrency(scenario.monthlyPayment)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-[#4F6A7A] mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-[#4F6A7A]">Time to Payoff</p>
              <p className="font-semibold text-[#002B45]">{scenario.totalMonths} months</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <TrendingDown className="w-4 h-4 text-[#4F6A7A] mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-[#4F6A7A]">Total Interest</p>
              <p className="font-semibold text-[#002B45] truncate">{formatCurrency(scenario.totalInterest)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-[#4F6A7A] mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-[#4F6A7A]">Debt-Free Date</p>
              <p className="font-semibold text-[#002B45] truncate">{formatDate(scenario.payoffDate)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioCard;