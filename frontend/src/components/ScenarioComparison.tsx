import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PayoffScenario } from '@/types/debt';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScenarioComparisonProps {
  scenarios: PayoffScenario[];
}

const ScenarioComparison = ({ scenarios }: ScenarioComparisonProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const comparisonData = scenarios.map((scenario) => ({
    name: scenario.name,
    'Total Interest': scenario.totalInterest,
    'Months to Payoff': scenario.totalMonths * 100, // Scale for visibility
  }));

  const interestData = scenarios.map((scenario) => ({
    name: scenario.name,
    interest: scenario.totalInterest,
  }));

  const timeData = scenarios.map((scenario) => ({
    name: scenario.name,
    months: scenario.totalMonths,
  }));

  return (
    <div className="space-y-6">
      {/* Interest Comparison */}
      <Card className="border-[1.5px] border-[#D4DFE4]">
        <CardHeader>
          <CardTitle className="text-[#002B45]">Total Interest Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={interestData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="interest" fill="#009A8C" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Time Comparison */}
      <Card className="border-[1.5px] border-[#D4DFE4]">
        <CardHeader>
          <CardTitle className="text-[#002B45]">Payoff Timeline Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Months', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => `${value} months`} />
              <Bar dataKey="months" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      <Card className="border-[1.5px] border-[#D4DFE4]">
        <CardHeader>
          <CardTitle className="text-[#002B45]">Detailed Comparison</CardTitle>
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
                {scenarios.map((scenario, index) => (
                  <tr key={scenario.id} className={index !== scenarios.length - 1 ? 'border-b border-[#D4DFE4]' : ''}>
                    <td className="py-3 px-4 text-sm text-[#002B45] font-medium">{scenario.name}</td>
                    <td className="py-3 px-4 text-sm text-[#002B45] text-right">{formatCurrency(scenario.monthlyPayment)}</td>
                    <td className="py-3 px-4 text-sm text-[#002B45] text-right">{formatCurrency(scenario.totalInterest)}</td>
                    <td className="py-3 px-4 text-sm text-[#002B45] text-right">{scenario.totalMonths} months</td>
                    <td className="py-3 px-4 text-sm text-[#002B45] text-right">
                      {new Intl.DateFormat('en-US', { month: 'short', year: 'numeric' }).format(scenario.payoffDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioComparison;