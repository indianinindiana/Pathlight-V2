import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PayoffScenario } from '@/types/debt';
import { Calendar, DollarSign, TrendingDown, Clock } from 'lucide-react';

interface ScenarioCardProps {
  scenario: PayoffScenario;
  isSelected?: boolean;
  onClick?: () => void;
}

const ScenarioCard = ({ scenario, isSelected = false, onClick }: ScenarioCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getStrategyBadge = () => {
    const badges = {
      snowball: { label: 'Snowball', color: 'bg-blue-100 text-blue-800' },
      avalanche: { label: 'Avalanche', color: 'bg-purple-100 text-purple-800' },
      custom: { label: 'Custom', color: 'bg-green-100 text-green-800' },
    };
    return badges[scenario.strategy] || badges.custom;
  };

  const badge = getStrategyBadge();

  return (
    <Card
      className={`border-[1.5px] transition-all cursor-pointer hover:shadow-md ${
        isSelected
          ? 'border-[#009A8C] bg-[#E7F7F4] shadow-sm'
          : 'border-[#D4DFE4] hover:border-[#009A8C]'
      }`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#002B45] text-lg">{scenario.name}</CardTitle>
          <Badge className={`${badge.color} border-0`}>{badge.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-[#4F6A7A] mt-1" />
            <div>
              <p className="text-xs text-[#4F6A7A]">Monthly Payment</p>
              <p className="font-semibold text-[#002B45]">{formatCurrency(scenario.monthlyPayment)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-[#4F6A7A] mt-1" />
            <div>
              <p className="text-xs text-[#4F6A7A]">Time to Payoff</p>
              <p className="font-semibold text-[#002B45]">{scenario.totalMonths} months</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <TrendingDown className="w-4 h-4 text-[#4F6A7A] mt-1" />
            <div>
              <p className="text-xs text-[#4F6A7A]">Total Interest</p>
              <p className="font-semibold text-[#002B45]">{formatCurrency(scenario.totalInterest)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-[#4F6A7A] mt-1" />
            <div>
              <p className="text-xs text-[#4F6A7A]">Debt-Free Date</p>
              <p className="font-semibold text-[#002B45]">{formatDate(scenario.payoffDate)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioCard;