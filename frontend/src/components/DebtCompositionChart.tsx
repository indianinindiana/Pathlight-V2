import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Debt } from '@/types/debt';

interface DebtCompositionChartProps {
  debts: Debt[];
}

const DebtCompositionChart = ({ debts }: DebtCompositionChartProps) => {
  const COLORS = {
    'credit-card': '#3B82F6',
    'personal-loan': '#8B5CF6',
    'student-loan': '#10B981',
    'auto-loan': '#F59E0B'
  };

  const data = debts.reduce((acc, debt) => {
    const existing = acc.find(item => item.type === debt.type);
    if (existing) {
      existing.value += debt.balance;
    } else {
      acc.push({
        type: debt.type,
        value: debt.balance,
        name: debt.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      });
    }
    return acc;
  }, [] as Array<{ type: string; value: number; name: string }>);

  return (
    <Card className="border-[1.5px] border-[#D4DFE4]">
      <CardHeader>
        <CardTitle className="text-[#002B45]">Debt Composition</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.type as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DebtCompositionChart;