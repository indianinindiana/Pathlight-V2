import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WhatIfScenario, PayoffScenario } from '@/types/debt';
import { ArrowDown, ArrowUp, X, TrendingDown, Clock, DollarSign } from 'lucide-react';

interface WhatIfComparisonProps {
  baseScenario: PayoffScenario;
  whatIfScenarios: WhatIfScenario[];
  onRemove: (id: string) => void;
}

const WhatIfComparison = ({ baseScenario, whatIfScenarios, onRemove }: WhatIfComparisonProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDelta = (whatIfValue: number, baseValue: number) => {
    const delta = whatIfValue - baseValue;
    const percentage = ((delta / baseValue) * 100).toFixed(1);
    return { delta, percentage };
  };

  const DeltaIndicator = ({ delta, isImprovement, label }: { delta: number; isImprovement: boolean; label: string }) => {
    const Icon = delta < 0 ? ArrowDown : ArrowUp;
    const color = isImprovement ? 'text-green-600' : 'text-red-600';
    const bgColor = isImprovement ? 'bg-green-50' : 'bg-red-50';

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded ${bgColor}`}>
        <Icon className={`w-3 h-3 ${color}`} />
        <span className={`text-xs font-medium ${color}`}>
          {Math.abs(delta).toFixed(0)} {label}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {whatIfScenarios.map((whatIf) => {
        const interestDelta = calculateDelta(whatIf.result.totalInterest, baseScenario.totalInterest);
        const timeDelta = calculateDelta(whatIf.result.totalMonths, baseScenario.totalMonths);
        const paymentDelta = calculateDelta(whatIf.result.monthlyPayment, baseScenario.monthlyPayment);

        return (
          <Card key={whatIf.id} className="border-[1.5px] border-[#D4DFE4]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-[#002B45]">{whatIf.name}</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 border-0">
                    {whatIf.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(whatIf.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Monthly Payment Comparison */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#4F6A7A]">
                    <DollarSign className="w-4 h-4" />
                    <span>Monthly Payment</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#002B45]">
                        {formatCurrency(whatIf.result.monthlyPayment)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#4F6A7A]">
                        vs {formatCurrency(baseScenario.monthlyPayment)}
                      </span>
                      {paymentDelta.delta !== 0 && (
                        <DeltaIndicator
                          delta={paymentDelta.delta}
                          isImprovement={false}
                          label={`(${paymentDelta.percentage}%)`}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Time to Payoff Comparison */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#4F6A7A]">
                    <Clock className="w-4 h-4" />
                    <span>Time to Payoff</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#002B45]">
                        {whatIf.result.totalMonths}
                      </span>
                      <span className="text-sm text-[#4F6A7A]">months</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#4F6A7A]">
                        vs {baseScenario.totalMonths} months
                      </span>
                      {timeDelta.delta !== 0 && (
                        <DeltaIndicator
                          delta={timeDelta.delta}
                          isImprovement={timeDelta.delta < 0}
                          label="months"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Interest Savings Comparison */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#4F6A7A]">
                    <TrendingDown className="w-4 h-4" />
                    <span>Total Interest</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#002B45]">
                        {formatCurrency(whatIf.result.totalInterest)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#4F6A7A]">
                        vs {formatCurrency(baseScenario.totalInterest)}
                      </span>
                      {interestDelta.delta !== 0 && (
                        <DeltaIndicator
                          delta={interestDelta.delta}
                          isImprovement={interestDelta.delta < 0}
                          label="saved"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-[#F7F9FA] rounded-lg">
                <p className="text-sm text-[#002B45] font-medium mb-2">Summary</p>
                <p className="text-sm text-[#3A4F61]">
                  {timeDelta.delta < 0 && (
                    <>This scenario could help you become debt-free <strong>{Math.abs(timeDelta.delta)} months faster</strong></>
                  )}
                  {timeDelta.delta > 0 && (
                    <>This scenario would take <strong>{Math.abs(timeDelta.delta)} months longer</strong></>
                  )}
                  {interestDelta.delta < 0 && (
                    <> and save you <strong>{formatCurrency(Math.abs(interestDelta.delta))}</strong> in interest</>
                  )}
                  {interestDelta.delta > 0 && (
                    <> but would cost <strong>{formatCurrency(Math.abs(interestDelta.delta))}</strong> more in interest</>
                  )}
                  {paymentDelta.delta > 0 && (
                    <>, with a monthly payment increase of <strong>{formatCurrency(paymentDelta.delta)}</strong></>
                  )}
                  {paymentDelta.delta < 0 && (
                    <>, with a monthly payment decrease of <strong>{formatCurrency(Math.abs(paymentDelta.delta))}</strong></>
                  )}
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WhatIfComparison;