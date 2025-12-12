import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PayoffScenario } from '@/types/debt';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceDot,
} from 'recharts';
import { Zap, Link2 } from 'lucide-react';

interface PayoffTrajectoryChartProps {
  scenarios: PayoffScenario[];
  selectedStrategyId?: string;
  onStrategySelected?: (id: string) => void;
  height?: number;
  showLegend?: boolean;
}

// Strategy color mapping - Pathlight design system
const STRATEGY_COLORS: Record<string, string> = {
  snowball: '#3B82F6',      // Blue
  avalanche: '#EF4444',     // Red  
  custom: '#10B981',        // Green
  consolidation: '#8B5CF6', // Purple
  settlement: '#F97316',    // Orange
};

interface ChartDataPoint {
  month: number;
  date: string;
  [key: string]: number | string; // Dynamic strategy total balances
}

const PayoffTrajectoryChart = ({
  scenarios,
  selectedStrategyId,
  onStrategySelected,
  height = 400,
  showLegend = true,
}: PayoffTrajectoryChartProps) => {
  const [hoveredStrategy, setHoveredStrategy] = useState<string | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Limit to 3 strategies as per spec
  const displayScenarios = scenarios.slice(0, 3);

  // Transform data for multi-line chart (total balance only)
  const chartData = useMemo(() => {
    const maxMonths = Math.max(...displayScenarios.map(s => s.totalMonths));
    const dataPoints: ChartDataPoint[] = [];

    for (let month = 0; month <= maxMonths; month++) {
      const point: ChartDataPoint = {
        month,
        date: new Date(new Date().setMonth(new Date().getMonth() + month)).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
      };

      displayScenarios.forEach(scenario => {
        // Calculate total remaining balance for this strategy at this month
        const monthEntries = scenario.schedule.filter(item => item.month === month);
        const totalBalance = monthEntries.reduce((sum, entry) => sum + entry.remainingBalance, 0);
        point[scenario.id] = totalBalance;
      });

      dataPoints.push(point);
    }

    return dataPoints;
  }, [displayScenarios]);

  // Generate event markers
  const eventMarkers = useMemo(() => {
    const markers: Array<{
      month: number;
      value: number;
      type: 'settlement' | 'consolidation';
      scenarioId: string;
      data: any;
    }> = [];

    displayScenarios.forEach(scenario => {
      // Settlement events
      if (scenario.settlementEvents) {
        scenario.settlementEvents.forEach(event => {
          const dataPoint = chartData.find(d => d.month === event.month);
          if (dataPoint) {
            markers.push({
              month: event.month,
              value: dataPoint[scenario.id] as number,
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
          markers.push({
            month: event.month,
            value: dataPoint[scenario.id] as number,
            type: 'consolidation',
            scenarioId: scenario.id,
            data: event,
          });
        }
      }
    });

    return markers;
  }, [displayScenarios, chartData]);

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
        <p className="font-semibold text-[#002B45] mb-3">
          Month {month}
        </p>
        <p className="text-xs text-[#4F6A7A] mb-3">{date}</p>
        
        {displayScenarios.map(scenario => {
          const strategyColor = STRATEGY_COLORS[scenario.strategy] || '#6B7280';
          const balance = payload.find((p: any) => p.dataKey === scenario.id)?.value || 0;

          // Check for events at this month
          const settlementEvent = scenario.settlementEvents?.find(e => e.month === month);
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
              <div className="ml-5 space-y-1">
                <p className="text-xs text-[#3A4F61]">
                  Remaining: {formatCurrency(balance)}
                </p>
                
                {settlementEvent && (
                  <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                    <p className="font-medium text-orange-800 flex items-center gap-1 text-xs">
                      <Zap className="w-3 h-3" /> Settlement Event
                    </p>
                    <p className="text-xs text-orange-700">Forgiven: {formatCurrency(settlementEvent.forgivenAmount)}</p>
                  </div>
                )}
                
                {consolidationEvent && (
                  <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
                    <p className="font-medium text-purple-800 flex items-center gap-1 text-xs">
                      <Link2 className="w-3 h-3" /> Consolidation
                    </p>
                    <p className="text-xs text-purple-700">New APR: {consolidationEvent.newAPR.toFixed(2)}%</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleLineClick = (scenarioId: string) => {
    if (onStrategySelected) {
      onStrategySelected(scenarioId);
    }
  };

  const handleLegendClick = (data: any) => {
    const scenarioId = data.dataKey;
    if (onStrategySelected) {
      onStrategySelected(scenarioId);
    }
  };

  // Calculate dynamic x-axis interval
  const maxMonths = Math.max(...displayScenarios.map(s => s.totalMonths));
  const xAxisInterval = maxMonths <= 12 ? 0 :
                        maxMonths <= 24 ? 1 :
                        maxMonths <= 36 ? 2 :
                        maxMonths <= 60 ? 4 :
                        Math.floor(maxMonths / 12);

  return (
    <>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={chartData}
            onMouseMove={(e: any) => {
              if (e && e.activeTooltipIndex !== undefined) {
                setHoveredMonth(e.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => {
              setHoveredMonth(null);
              setHoveredStrategy(null);
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
                value: 'Remaining Balance',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fill: '#6B7280', textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="square"
                onClick={handleLegendClick}
                onMouseEnter={(data: any) => setHoveredStrategy(data.dataKey)}
                onMouseLeave={() => setHoveredStrategy(null)}
              />
            )}

            {/* Strategy lines */}
            {displayScenarios.map(scenario => {
              const strategyColor = STRATEGY_COLORS[scenario.strategy] || '#6B7280';
              const isSelected = selectedStrategyId === scenario.id;
              const isHovered = hoveredStrategy === scenario.id;
              const isDimmed = hoveredStrategy && hoveredStrategy !== scenario.id;

              return (
                <Line
                  key={scenario.id}
                  type="monotone"
                  dataKey={scenario.id}
                  name={scenario.name}
                  stroke={strategyColor}
                  strokeWidth={isSelected || isHovered ? 3 : 2}
                  opacity={isDimmed ? 0.4 : 1}
                  dot={false}
                  activeDot={{
                    r: 6,
                    onClick: () => handleLineClick(scenario.id),
                    style: { cursor: 'pointer' }
                  }}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleLineClick(scenario.id)}
                  onMouseEnter={() => setHoveredStrategy(scenario.id)}
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
                  r={markerSize}
                  fill={markerColor}
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </>
  );
};

export default PayoffTrajectoryChart;