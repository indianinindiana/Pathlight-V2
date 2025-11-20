import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { Compass, ArrowRight, DollarSign, Calendar, TrendingDown, PiggyBank, TrendingUp } from 'lucide-react';
import MetricsCard from '@/components/MetricsCard';
import DebtCompositionChart from '@/components/DebtCompositionChart';
import DebtListTable from '@/components/DebtListTable';
import DebtEntryForm from '@/components/DebtEntryForm';
import { Debt } from '@/types/debt';
import { calculateTotalDebt, calculateTotalMinimumPayment, calculateDebtToIncome } from '@/utils/debtCalculations';
import { showSuccess } from '@/utils/toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { debts, financialContext, addDebt, updateDebt, deleteDebt } = useDebt();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  if (debts.length === 0 && !showAddForm) {
    navigate('/debt-entry');
    return null;
  }

  const totalDebt = calculateTotalDebt(debts);
  const totalMinPayment = calculateTotalMinimumPayment(debts);
  const debtToIncome = financialContext ? calculateDebtToIncome(totalDebt, financialContext.monthlyIncome) : 0;
  
  // Calculate net cash flow
  const netCashFlow = financialContext 
    ? financialContext.monthlyIncome - financialContext.monthlyExpenses - totalMinPayment
    : 0;
  
  // Calculate emergency savings ratio (months of expenses covered)
  const emergencySavingsRatio = financialContext && financialContext.monthlyExpenses > 0
    ? financialContext.liquidSavings / financialContext.monthlyExpenses
    : 0;

  const handleAddDebt = (debt: Debt) => {
    addDebt(debt);
    setShowAddForm(false);
  };

  const handleUpdateDebt = (id: string, updates: Partial<Debt>) => {
    updateDebt(id, updates);
    setEditingDebt(null);
  };

  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdatePriority = (debtId: string, priority: number) => {
    updateDebt(debtId, { customOrder: priority });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-5 md:py-6">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <Compass className="w-6 h-6 md:w-7 md:h-7 text-[#009A8C] mr-2.5" strokeWidth={2.5} />
              <h1 className="text-[20px] md:text-[24px] font-bold text-[#002B45] tracking-tight" style={{ letterSpacing: '-0.5%' }}>
                Debt PathFinder
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#002B45] mb-3">
            Your Debt Snapshot
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#3A4F61]">
            Here's an overview of your current debt situation
          </p>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-8">
            <DebtEntryForm
              onAdd={handleAddDebt}
              onCancel={() => {
                setShowAddForm(false);
                setEditingDebt(null);
              }}
              editingDebt={editingDebt}
              onUpdate={handleUpdateDebt}
            />
          </div>
        )}

        {/* Metrics Grid - 2 columns on medium+, 3 on large+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricsCard
            title="Total Debt"
            value={`$${totalDebt.toLocaleString()}`}
            subtitle={`Across ${debts.length} ${debts.length === 1 ? 'debt' : 'debts'}`}
            icon={DollarSign}
          />
          
          <MetricsCard
            title="Monthly Minimum Payments"
            value={`$${totalMinPayment.toLocaleString()}`}
            subtitle="Required each month"
            icon={Calendar}
          />
          
          <MetricsCard
            title="Net Cash Flow"
            value={`${netCashFlow >= 0 ? '+' : ''}$${Math.abs(netCashFlow).toLocaleString()}`}
            subtitle={netCashFlow >= 0 ? 'Additional payments possible' : 'Cannot make additional payments'}
            icon={netCashFlow >= 0 ? TrendingUp : TrendingDown}
            iconColor={netCashFlow >= 0 ? '#10B981' : '#EF4444'}
          />
          
          <MetricsCard
            title="Debt-to-Income Ratio"
            value={`${debtToIncome.toFixed(1)}%`}
            subtitle={debtToIncome > 43 ? 'High ratio' : 'Manageable ratio'}
            icon={TrendingDown}
            iconColor={debtToIncome > 43 ? '#EF4444' : '#10B981'}
          />
          
          <MetricsCard
            title="Emergency Savings Ratio"
            value={`${emergencySavingsRatio.toFixed(1)}x`}
            subtitle={`${emergencySavingsRatio >= 3 ? 'Strong' : emergencySavingsRatio >= 1 ? 'Building' : 'Low'} emergency fund`}
            icon={PiggyBank}
            iconColor={emergencySavingsRatio >= 3 ? '#10B981' : emergencySavingsRatio >= 1 ? '#EAB308' : '#EF4444'}
          />
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DebtCompositionChart debts={debts} />
          
          <div className="bg-white border-[1.5px] border-[#D4DFE4] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#002B45] mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#E7F7F4] rounded-lg">
                <p className="text-sm font-medium text-[#002B45] mb-1">Highest Interest Debt</p>
                <p className="text-lg font-semibold text-[#009A8C]">
                  {debts.reduce((max, debt) => debt.apr > max.apr ? debt : max).name} ({debts.reduce((max, debt) => debt.apr > max.apr ? debt : max).apr}%)
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-[#002B45] mb-1">Largest Balance</p>
                <p className="text-lg font-semibold text-blue-600">
                  {debts.reduce((max, debt) => debt.balance > max.balance ? debt : max).name} (${debts.reduce((max, debt) => debt.balance > max.balance ? debt : max).balance.toLocaleString()})
                </p>
              </div>
              
              {financialContext && netCashFlow > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-[#002B45] mb-1">Available for Extra Payments</p>
                  <p className="text-lg font-semibold text-green-600">
                    ${netCashFlow.toLocaleString()}/month
                  </p>
                </div>
              )}
              
              {financialContext && netCashFlow <= 0 && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-[#002B45] mb-1">Budget Adjustment Needed</p>
                  <p className="text-sm text-orange-700">
                    Your current expenses exceed income after minimum payments. Consider reviewing your budget or exploring debt relief options.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Debt List Table */}
        <div className="mb-8">
          <DebtListTable
            debts={debts}
            onEdit={handleEditDebt}
            onDelete={deleteDebt}
            onAddNew={() => {
              setShowAddForm(true);
              setEditingDebt(null);
            }}
            onUpdatePriority={handleUpdatePriority}
          />
        </div>

        {/* CTA Section */}
        <div className="bg-white border-[1.5px] border-[#D4DFE4] rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-[#002B45] mb-3">
            Ready to see your payoff options?
          </h3>
          <p className="text-[#3A4F61] mb-6 max-w-2xl mx-auto">
            Compare different strategies and see how quickly you can become debt-free
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/scenarios')}
            className="bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold text-[18px] py-5 px-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            Explore Payoff Scenarios
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;