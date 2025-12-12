import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PayoffScenario, Debt } from '@/types/debt';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';
import { Zap, Link2 } from 'lucide-react';

interface StrategyBreakdownChartProps {
  scenario: PayoffScenario;
  debts: Debt[];
  viewMode?: 'stacked' | 'small-multiples' | 'pre-post-consolidation';
  onViewModeChange?: (mode: string) => void;
  height?: number;
}

// Debt colors - distinct palette
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
  [key: string]: number | string;
}

const StrategyBreakdownChart = ({
  scenario,
  debts,
  viewMode = 'stacked',
  onViewModeChange,
  height = 400,
}: StrategyBreakdownChartProps) => {
  const [highlightedDebt, setHighlightedDebt] = useState<string | null>(null);
  const [isolatedDebtId, setIsolatedDebtId] = useState<string | null>(null);

  // Transform data for stacked area chart
  const chartData = useMemo(() => {
    const dataPoints: ChartDataPoint[] = [];

    for (let month = 0; month <= scenario.totalMonths; month++) {
      const point: ChartDataPoint = {
        month,
        date: new Date(new Date().setMonth(new Date().getMonth() + month)).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
      };

      debts.forEach(debt => {
        const monthEntry = scenario.schedule.find(
          item => item.debtId === debt.id && item.month === month
        );
        
        if (monthEntry) {
          point[debt.id] = monthEntry.remainingBalance;
          
          // Add forgiven amount for settlement visualization
          const settlementEvent = scenario.settlementEvents?.find(
            e => e.debtId === debt.id && e.month === month
          );
          if (settlementEvent) {
            point[`${debt.id}_forgiven`] = settlementEvent.forgivenAmount;
          }
        } else if (month === 0) {
          point[debt.id] = debt.balance;
        } else {
          point[debt.id] = 0;
        }
      });

      dataPoints.push(point);
    }

    return dataPoints;
  }, [scenario, debts]);

  // Generate per-debt data for small multiples
  const debtChartData = useMemo(() => {
    return debts.map(debt => {
      const data: ChartDataPoint[] = [];
      
      for (let month = 0; month <= scenario.totalMonths; month++) {
        const monthEntry = scenario.schedule.find(
          item => item.debtId === debt.id && item.month === month
        );
        
        data.push({
          month,
          date: new Date(new Date().setMonth(new Date().getMonth() + month)).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
          balance: monthEntry ? monthEntry.remainingBalance : (month === 0 ? debt.balance : 0),
        });
      }
      
      return { debt, data };
    });
  }, [scenario, debts]);

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
          Month {month}
        </p>
        <p className="text-xs text-[#4F6A7A] mb-3">{date}</p>
        
        {debts.map((debt, index) => {
          const balance = payload.find((p: any) => p.dataKey === debt.id)?.value || 0;
          if (balance === 0 && month > 0) return null;

          const debtColor = DEBT_COLORS[index % DEBT_COLORS.length];
          const settlementEvent = scenario.settlementEvents?.find(
            e => e.debtId === debt.id && e.month === month
          );

          return (
            <div key={debt.id} className="mb-2 pb-2 border-b border-[#D4DFE4] last:border-b-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: debtColor }}
                />
                <p className="font-medium text-[#002B45] text-sm">{debt.name}</p>
              </div>
              <div className="ml-5">
                <p className="text-xs text-[#3A4F61]">
                  Balance: {formatCurrency(balance)}
                </p>
                {settlementEvent && (
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    ⚡ Forgiven: {formatCurrency(settlementEvent.forgivenAmount)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleLegendClick = (data: any) => {
    const debtId = data.dataKey;
    setIsolatedDebtId(isolatedDebtId === debtId ? null : debtId);
  };

  // Calculate dynamic x-axis interval
  const xAxisInterval = scenario.totalMonths <= 12 ? 0 :
                        scenario.totalMonths <= 24 ? 1 :
                        scenario.totalMonths <= 36 ? 2 :
                        scenario.totalMonths <= 60 ? 4 :
                        Math.floor(scenario.totalMonths / 12);

  // Filter debts if one is isolated
  const visibleDebts = isolatedDebtId ? debts.filter(d => d.id === isolatedDebtId) : debts;

  // Determine if we should show pre/post consolidation tab
  const showConsolidationTab = scenario.strategy === 'consolidation' && scenario.consolidationEvent;

  return (
    <Card className="border-[1.5px] border-[#D4DFE4]">
      <CardHeader>
        <CardTitle className="text-[#002B45]">Strategy Breakdown: {scenario.name}</CardTitle>
        <CardDescription className="text-[#3A4F61]">
          Detailed view of how individual debts are paid down over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={onViewModeChange} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: showConsolidationTab ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)' }}>
            <TabsTrigger value="stacked">Stacked View</TabsTrigger>
            <TabsTrigger value="small-multiples">Individual Debts</TabsTrigger>
            {showConsolidationTab && (
              <TabsTrigger value="pre-post-consolidation">Pre/Post Consolidation</TabsTrigger>
            )}
          </TabsList>

          {/* Stacked Area View */}
          <TabsContent value="stacked" className="mt-6">
            <ResponsiveContainer width="100%" height={height}>
              <AreaChart
                data={chartData}
                onMouseMove={(e: any) => {
                  if (e && e.activeLabel) {
                    // Handle hover
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickMargin={10}
                  interval={xAxisInterval}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  label={{
                    value: 'Debt Balance',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    style: { fill: '#6B7280', textAnchor: 'middle' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                  onClick={handleLegendClick}
                  onMouseEnter={(data: any) => setHighlightedDebt(data.dataKey)}
                  onMouseLeave={() => setHighlightedDebt(null)}
                />

                {/* Consolidation marker */}
                {scenario.consolidationEvent && (
                  <ReferenceLine
                    x={scenario.consolidationEvent.month}
                    stroke="#8B5CF6"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Consolidation',
                      position: 'top',
                      fill: '#8B5CF6',
                      fontSize: 12
                    }}
                  />
                )}

                {/* Stacked areas for each debt */}
                {visibleDebts.map((debt, index) => {
                  const debtColor = DEBT_COLORS[index % DEBT_COLORS.length];
                  const isHighlighted = highlightedDebt === debt.id;
                  const isDimmed = highlightedDebt && highlightedDebt !== debt.id;

                  return (
                    <Area
                      key={debt.id}
                      type="monotone"
                      dataKey={debt.id}
                      name={debt.name}
                      stackId="1"
                      stroke={debtColor}
                      fill={debtColor}
                      fillOpacity={isDimmed ? 0.35 : isHighlighted ? 1.0 : 0.7}
                      strokeWidth={isHighlighted ? 2 : 1}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>

            {isolatedDebtId && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Isolated view:</span>{' '}
                  {debts.find(d => d.id === isolatedDebtId)?.name}. Click the legend again to restore all debts.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Small Multiples View */}
          <TabsContent value="small-multiples" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {debtChartData.map(({ debt, data }, index) => {
                const debtColor = DEBT_COLORS[index % DEBT_COLORS.length];
                const settlementMonth = scenario.settlementEvents?.find(e => e.debtId === debt.id)?.month;

                return (
                  <Card key={debt.id} className="border border-[#D4DFE4]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-[#002B45] flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: debtColor }}
                        />
                        {debt.name}
                        {settlementMonth !== undefined && (
                          <span className="text-xs text-orange-600">⚡ Settled</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            labelFormatter={(month) => `Month ${month}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="balance"
                            stroke={debtColor}
                            strokeWidth={2}
                            dot={false}
                          />
                          {settlementMonth !== undefined && (
                            <ReferenceLine
                              x={settlementMonth}
                              stroke="#F97316"
                              strokeDasharray="3 3"
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Pre/Post Consolidation View */}
          {showConsolidationTab && (
            <TabsContent value="pre-post-consolidation" className="mt-6">
              <div className="space-y-6">
                {/* Pre-consolidation chart */}
                <div>
                  <h4 className="text-sm font-semibold text-[#002B45] mb-3">
                    Before Consolidation
                  </h4>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800 mb-4">
                      <Link2 className="w-4 h-4 inline mr-1" />
                      Original debts before consolidation at month {scenario.consolidationEvent?.month || 0}
                    </p>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={chartData.slice(0, (scenario.consolidationEvent?.month || 0) + 1)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          tickMargin={10}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="square" />

                        {debts.map((debt, index) => {
                          const debtColor = DEBT_COLORS[index % DEBT_COLORS.length];
                          return (
                            <Area
                              key={debt.id}
                              type="monotone"
                              dataKey={debt.id}
                              name={debt.name}
                              stackId="1"
                              stroke={debtColor}
                              fill={debtColor}
                              fillOpacity={0.7}
                            />
                          );
                        })}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Post-consolidation chart */}
                <div>
                  <h4 className="text-sm font-semibold text-[#002B45] mb-3">
                    After Consolidation
                  </h4>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 mb-4">
                      Single consolidated loan at {scenario.consolidationEvent?.newAPR.toFixed(2)}% APR
                    </p>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={chartData.slice(scenario.consolidationEvent?.month || 0)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          tickMargin={10}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        
                        {/* Show only the consolidated loan */}
                        <Area
                          type="monotone"
                          dataKey={debts[0]?.id}
                          name="Consolidated Loan"
                          stackId="1"
                          stroke="#8B5CF6"
                          fill="#8B5CF6"
                          fillOpacity={0.7}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StrategyBreakdownChart;