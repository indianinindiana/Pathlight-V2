import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PayoffScenario, Debt } from '@/types/debt';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Scatter,
  ReferenceDot,
} from 'recharts';
import { Info, Zap, Link2 } from 'lucide-react';

interface InteractiveStrategyChartProps {
  scenarios: PayoffScenario[];
  debts: Debt[];
}

// Strategy color mapping
const STRATEGY_COLORS: Record<string, string> = {
  snowball: '#3B82F6', // Blue
  avalanche: '#EF4444', // Red
  custom: '#10B981', // Green
  consolidation: '#8B5CF6', // Purple
  settlement: '#F97316', // Orange
};

// Debt colors - distinct palette for better visualization
const DEBT_COLORS = [
  '#60A5FA', // Light Blue
  '#34D399', // Green
  '#FBBF24', // Amber
  '#F87171', // Red
  '#A78BFA', // Purple
  '#FB923C', // Orange
  '#2DD4BF', // Teal
  '#F472B6', // Pink
];

interface ChartDataPoint {
  month: number;
  date: string;
  [key: string]: number | string; // Dynamic debt balances and cumulative interest per strategy
}

const InteractiveStrategyChart = ({ scenarios, debts }: InteractiveStrategyChartProps) => {
  const [highlightedDebt, setHighlightedDebt] = useState<string | null>(null);
  const [focusedStrategy, setFocusedStrategy] = useState<string | null>(null);

  // Transform data for the chart
  const chartData = useMemo(() => {
    const maxMonths = Math.max(...scenarios.map(s => s.totalMonths));
    const dataPoints: ChartDataPoint[] = [];

    // Create a data point for each month
    for (let month = 0; month <= maxMonths; month++) {
      const point: ChartDataPoint = {
        month,
        date: new Date(new Date().setMonth(new Date().getMonth() + month)).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
      };

      // For each scenario, calculate balances at this month
      scenarios.forEach(scenario => {
        // Calculate remaining balance for each debt at this month
        const debtBalances: Record<string, number> = {};
        let cumulativeInterest = 0;

        debts.forEach(debt => {
          // Find the schedule entry for this exact month (should be exactly one per debt per month)
          const monthEntry = scenario.schedule.find(
            item => item.debtId === debt.id && item.month === month
          );

          if (monthEntry) {
            // Use the balance from this month's entry
            debtBalances[debt.id] = monthEntry.remainingBalance;
          } else if (month === 0) {
            // Month 0 should have entries, but fallback to original balance
            debtBalances[debt.id] = debt.balance;
          } else {
            // For months after payoff, balance is 0
            debtBalances[debt.id] = 0;
          }
        });

        // Calculate cumulative interest up to this month
        // Aggregate by (debtId, month) to avoid double-counting
        const interestByDebtMonth = new Map<string, number>();
        scenario.schedule.forEach(entry => {
          if (entry.month <= month) {
            const key = `${entry.debtId}|${entry.month}`;
            // Should only be one entry per debt per month, but use max to be safe
            interestByDebtMonth.set(key, Math.max(interestByDebtMonth.get(key) || 0, entry.interest));
          }
        });
        
        // Sum up all unique debt-month interest entries
        cumulativeInterest = Array.from(interestByDebtMonth.values()).reduce((sum, val) => sum + val, 0);

        // Add debt balances as stacked values
        debts.forEach(debt => {
          point[`${scenario.id}_${debt.id}`] = debtBalances[debt.id] || 0;
          
          // Add forgiven amount for settlement visualization
          if (scenario.settlementEvents) {
            const settlementEvent = scenario.settlementEvents.find(
              e => e.debtId === debt.id && e.month === month
            );
            if (settlementEvent) {
              point[`${scenario.id}_${debt.id}_forgiven`] = settlementEvent.forgivenAmount;
            }
          }
        });

        // Add cumulative interest as a line
        point[`${scenario.id}_interest`] = cumulativeInterest;
      });

      dataPoints.push(point);
    }

    return dataPoints;
  }, [scenarios, debts]);

  // Generate event markers for settlements and consolidations
  const eventMarkers = useMemo(() => {
    const markers: Array<{
      month: number;
      value: number;
      type: 'settlement' | 'consolidation';
      scenarioId: string;
      data: any;
    }> = [];

    scenarios.forEach(scenario => {
      // Settlement events
      if (scenario.settlementEvents) {
        scenario.settlementEvents.forEach(event => {
          const dataPoint = chartData.find(d => d.month === event.month);
          if (dataPoint) {
            const totalBalance = debts.reduce((sum, debt) => {
              return sum + (dataPoint[`${scenario.id}_${debt.id}`] as number || 0);
            }, 0);
            markers.push({
              month: event.month,
              value: totalBalance,
              type: 'settlement',
              scenarioId: scenario.id,
              data: event,
            });
          }
        });
      }

      // Consolidation events
      if (scenario.consolidationEvent) {
        const event = scenario.consolidationEvent;
        const dataPoint = chartData.find(d => d.month === event.month);
        if (dataPoint) {
          const totalBalance = debts.reduce((sum, debt) => {
            return sum + (dataPoint[`${scenario.id}_${debt.id}`] as number || 0);
          }, 0);
          markers.push({
            month: event.month,
            value: totalBalance,
            type: 'consolidation',
            scenarioId: scenario.id,
            data: event,
          });
        }
      }
    });

    return markers;
  }, [scenarios, debts, chartData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const month = payload[0]?.payload?.month || 0;
    const date = payload[0]?.payload?.date || '';

    return (
      <div className="bg-white border-2 border-[#D4DFE4] rounded-lg p-4 shadow-lg max-w-sm">
        <p className="font-semibold text-[#002B45] mb-2">
          Month {month} - {date}
        </p>
        
        {scenarios.map(scenario => {
          const strategyColor = STRATEGY_COLORS[scenario.strategy] || '#6B7280';
          const totalBalance = debts.reduce((sum, debt) => {
            const key = `${scenario.id}_${debt.id}`;
            const balance = payload.find((p: any) => p.dataKey === key)?.value || 0;
            return sum + balance;
          }, 0);

          const cumulativeInterest = payload.find(
            (p: any) => p.dataKey === `${scenario.id}_interest`
          )?.value || 0;

          // Find debts paid off this month
          const paidOffDebts = debts.filter(debt => {
            const scheduleItems = scenario.schedule.filter(
              item => item.debtId === debt.id && item.month === month
            );
            return scheduleItems.some(item => item.remainingBalance === 0);
          });

          // Check for settlement events
          const settlementEvent = scenario.settlementEvents?.find(e => e.month === month);
          
          // Check for consolidation events
          const consolidationEvent = scenario.consolidationEvent?.month === month ? scenario.consolidationEvent : null;

          return (
            <div key={scenario.id} className="mb-3 pb-3 border-b border-[#D4DFE4] last:border-b-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: strategyColor }}
                />
                <p className="font-medium text-[#002B45] text-sm">{scenario.name}</p>
              </div>
              <div className="ml-5 space-y-1 text-xs text-[#3A4F61]">
                <p>Total Balance: {formatCurrency(totalBalance)}</p>
                <p>Cumulative Interest: {formatCurrency(cumulativeInterest)}</p>
                {paidOffDebts.length > 0 && (
                  <p className="text-[#009A8C] font-medium">
                    ✓ Paid off: {paidOffDebts.map(d => d.name).join(', ')}
                  </p>
                )}
                {settlementEvent && (
                  <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                    <p className="font-medium text-orange-800 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Settlement Event
                    </p>
                    <p className="text-orange-700">Debt: {settlementEvent.debtName}</p>
                    <p className="text-orange-700">Forgiven: {formatCurrency(settlementEvent.forgivenAmount)}</p>
                    <p className="text-orange-700">Settled for: {formatCurrency(settlementEvent.settledAmount)}</p>
                  </div>
                )}
                {consolidationEvent && (
                  <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
                    <p className="font-medium text-purple-800 flex items-center gap-1">
                      <Link2 className="w-3 h-3" /> Consolidation Event
                    </p>
                    <p className="text-purple-700">Consolidated {consolidationEvent.consolidatedDebtNames.length} debts</p>
                    <p className="text-purple-700">New APR: {consolidationEvent.newAPR.toFixed(2)}%</p>
                    <p className="text-purple-700">New Balance: {formatCurrency(consolidationEvent.totalConsolidatedBalance)}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Calculate dynamic x-axis interval based on timeline length
  const maxMonths = Math.max(...scenarios.map(s => s.totalMonths));
  const xAxisInterval = maxMonths <= 12 ? 0 : // Show all months if <= 1 year
                        maxMonths <= 24 ? 1 : // Every other month if <= 2 years
                        maxMonths <= 36 ? 2 : // Every 3 months if <= 3 years
                        maxMonths <= 60 ? 4 : // Every 5 months if <= 5 years
                        Math.floor(maxMonths / 12); // Otherwise, roughly 12 labels

  return (
    <div className="space-y-6">
      {/* Main Chart */}
      <Card className="border-[1.5px] border-[#D4DFE4]">
        <CardHeader>
          <CardTitle className="text-[#002B45]">Debt Payoff Visualization</CardTitle>
          <CardDescription className="text-[#3A4F61]">
            {scenarios.length === 1
              ? 'Track how your debt decreases over time. Hover for details.'
              : 'Compare how different strategies reduce your debt over time. Hover for details.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickMargin={10}
                interval={xAxisInterval}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{
                  value: 'Outstanding Balance',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  style: {
                    fill: '#6B7280',
                    textAnchor: 'middle'
                  }
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{
                  value: 'Cumulative Interest',
                  angle: 90,
                  position: 'insideRight',
                  offset: 10,
                  style: {
                    fill: '#6B7280',
                    textAnchor: 'middle'
                  }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />

              {/* Stacked areas for each debt in each strategy */}
              {scenarios.map(scenario => {
                const strategyColor = STRATEGY_COLORS[scenario.strategy] || '#6B7280';
                
                return debts.map((debt, index) => {
                  const debtColor = DEBT_COLORS[index % DEBT_COLORS.length];
                  
                  return (
                    <Area
                      key={`${scenario.id}_${debt.id}`}
                      yAxisId="left"
                      type="monotone"
                      dataKey={`${scenario.id}_${debt.id}`}
                      stackId={scenario.id}
                      stroke={debtColor}
                      fill={debtColor}
                      fillOpacity={0.7}
                      name={`${scenario.name} - ${debt.name}`}
                      strokeWidth={highlightedDebt === debt.id ? 3 : 1}
                    />
                  );
                });
              })}

              {/* Interest overlay lines */}
              {scenarios.map(scenario => {
                const strategyColor = STRATEGY_COLORS[scenario.strategy] || '#6B7280';
                
                return (
                  <Line
                    key={`${scenario.id}_interest`}
                    yAxisId="right"
                    type="monotone"
                    dataKey={`${scenario.id}_interest`}
                    stroke={strategyColor}
                    strokeWidth={focusedStrategy === scenario.id ? 3 : 2}
                    strokeDasharray="5 5"
                    dot={false}
                    name={`${scenario.name} - Interest`}
                    opacity={focusedStrategy && focusedStrategy !== scenario.id ? 0.3 : 1}
                  />
                );
              })}

              {/* Event markers */}
              {eventMarkers.map((marker, index) => {
                const markerColor = marker.type === 'settlement' ? '#F97316' : '#8B5CF6';
                const markerSize = marker.type === 'settlement' ? 8 : 6;
                
                return (
                  <ReferenceDot
                    key={`event-${index}`}
                    x={marker.month}
                    y={marker.value}
                    yAxisId="left"
                    r={markerSize}
                    fill={markerColor}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Comparison Table */}
      <Card className="border-[1.5px] border-[#D4DFE4]">
        <CardHeader>
          <CardTitle className="text-[#002B45]">Strategy Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D4DFE4]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#002B45]">Strategy</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#002B45]">Monthly Payment</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#002B45]">Total Interest</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#002B45]">Time to Payoff</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#002B45]">Debt-Free Date</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario, index) => {
                  const strategyColor = STRATEGY_COLORS[scenario.strategy] || '#6B7280';
                  
                  return (
                    <tr
                      key={scenario.id}
                      className={index !== scenarios.length - 1 ? 'border-b border-[#D4DFE4]' : ''}
                    >
                      <td className="py-3 px-4 text-sm text-[#002B45]">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: strategyColor }}
                          />
                          <span className="font-medium">{scenario.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#002B45] text-right">
                        {formatCurrency(scenario.monthlyPayment)}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#002B45] text-right">
                        {formatCurrency(scenario.totalInterest)}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#002B45] text-right">
                        {scenario.totalMonths} months
                      </td>
                      <td className="py-3 px-4 text-sm text-[#002B45] text-right">
                        {new Date(scenario.payoffDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Insights */}
          {scenarios.length > 1 && (
            <div className="mt-6 p-4 bg-[#E7F7F4] rounded-lg border border-[#009A8C]/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#009A8C] flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#002B45]">Key Insights:</p>
                  {(() => {
                    const fastest = scenarios.reduce((min, s) =>
                      s.totalMonths < min.totalMonths ? s : min
                    );
                    const cheapest = scenarios.reduce((min, s) =>
                      s.totalInterest < min.totalInterest ? s : min
                    );
                    const interestSavings = Math.max(...scenarios.map(s => s.totalInterest)) -
                                           Math.min(...scenarios.map(s => s.totalInterest));
                    const timeSavings = Math.max(...scenarios.map(s => s.totalMonths)) -
                                       Math.min(...scenarios.map(s => s.totalMonths));

                    return (
                      <div className="space-y-1 text-sm text-[#3A4F61]">
                        <p>• <span className="font-medium">{fastest.name}</span> gets you debt-free fastest ({fastest.totalMonths} months)</p>
                        <p>• <span className="font-medium">{cheapest.name}</span> saves the most on interest ({formatCurrency(cheapest.totalInterest)})</p>
                        <p>• Choosing the optimal strategy could save you <span className="font-medium">{formatCurrency(interestSavings)}</span> and <span className="font-medium">{timeSavings} months</span></p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveStrategyChart;