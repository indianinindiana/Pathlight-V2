import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Calendar, TrendingDown, PiggyBank, TrendingUp } from 'lucide-react';
import MetricsCard from '@/components/MetricsCard';
import DebtCompositionChart from '@/components/DebtCompositionChart';
import DebtListTable from '@/components/DebtListTable';
import DebtEntryForm from '@/components/DebtEntryForm';
import { ExportDialog } from '@/components/ExportDialog';
import { FinancialAssessment } from '@/components/FinancialAssessment';
import { Debt } from '@/types/debt';
import { calculateTotalDebt, calculateTotalMinimumPayment, calculateDebtToIncome } from '@/utils/debtCalculations';
import { showSuccess } from '@/utils/toast';
import { useFinancialAssessment } from '@/hooks/useFinancialAssessment';
import { trackPageView } from '@/services/analyticsApi';
import { getSessionId } from '@/services/sessionManager';
import { Goal, StressLevel, EmploymentStatus, LifeEvent, AgeRange } from '@/types/financialAssessment';

const Dashboard = () => {
  const navigate = useNavigate();
  const { debts, financialContext, addDebt, updateDebt, deleteDebt, profileId, journeyState } = useDebt();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  // Use financial assessment hook
  const { data: assessmentData, loading: assessmentLoading, error: assessmentError } = useFinancialAssessment({
    profileId: profileId || '',
    debts: debts.map(debt => ({
      balance: debt.balance,
      apr: debt.apr,
      is_delinquent: false, // You may want to add this field to your Debt type
    })),
    userContext: {
      goal: Goal.BECOME_DEBT_FREE, // Default, could be from user profile
      stress_level: StressLevel.MEDIUM, // Default, could be from user profile
      employment_status: EmploymentStatus.STABLE, // Default, could be from user profile
      life_events: LifeEvent.NONE, // Default, could be from user profile
      age_range: AgeRange.AGE_35_44, // Default, could be from user profile
    },
    enabled: !!profileId && debts.length > 0,
  });

  // Track page view on mount
  useEffect(() => {
    if (profileId) {
      trackPageView(profileId, 'Dashboard', getSessionId());
    }
  }, [profileId]);

  if (debts.length === 0 && !showAddForm) {
    navigate('/debt-entry');
    return null;
  }

  const totalDebt = calculateTotalDebt(debts);
  const totalMinPayment = calculateTotalMinimumPayment(debts);
  const debtToIncome = financialContext ? calculateDebtToIncome(totalDebt, financialContext.monthlyIncome) : 0;
  
  const netCashFlow = financialContext 
    ? financialContext.monthlyIncome - financialContext.monthlyExpenses - totalMinPayment
    : 0;
  
  const emergencySavingsRatio = financialContext && financialContext.monthlyExpenses > 0
    ? financialContext.liquidSavings / financialContext.monthlyExpenses
    : 0;

  const handleAddDebt = async (debt: Omit<Debt, 'id'>) => {
    await addDebt(debt);
    setShowAddForm(false);
  };

  const handleUpdateDebt = async (id: string, updates: Partial<Debt>) => {
    await updateDebt(id, updates);
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

  const handleActionClick = (action: string) => {
    console.log('Dashboard handleActionClick called with:', action);
    switch (action) {
      case 'emergency-savings':
        console.log('Navigating to savings plan');
        // Navigate to savings plan
        break;
      case 'high-interest-focus':
        console.log('Navigating to scenarios (high-interest-focus)');
        navigate('/scenarios');
        break;
      case 'budget-review':
        console.log('Navigating to budget review');
        // Navigate to budget review
        break;
      case 'consolidation':
      case 'consolidate-debts':
        console.log('Navigating to what-if');
        navigate('/what-if');
        break;
      case 'address-delinquency':
        console.log('Handling delinquency');
        // Could navigate to a help page or show guidance
        break;
      case 'review-strategy':
        console.log('Navigating to scenarios (review-strategy)');
        navigate('/scenarios');
        break;
      default:
        console.log('Unknown action:', action);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-5 md:py-6">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img src="/pathlight-logo.png" alt="PathLight" className="w-8 h-8 md:w-10 md:h-10 mr-2.5" />
              <h1 className="text-[20px] md:text-[24px] font-bold text-[#002B45] tracking-tight" style={{ letterSpacing: '-0.5%' }}>
                PathLight
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {profileId && <ExportDialog profileId={profileId} />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#002B45] mb-3">
            {journeyState === 'snapshot_generated' ? 'Your Debt Snapshot' : 'Dashboard'}
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#3A4F61]">
            {journeyState === 'snapshot_generated'
              ? "Here's an overview of your current debt situation"
              : "Manage your debts and track your progress"}
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

        {/* Metrics Grid */}
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
        <div className="mb-8">
          <DebtCompositionChart debts={debts} />
        </div>

        {/* Consolidated Financial Assessment with Clara Q&A */}
        {profileId && debts.length > 0 && (
          <div className="mb-8">
            <FinancialAssessment
              data={assessmentData}
              loading={assessmentLoading}
              error={assessmentError}
              profileId={profileId}
              context={{
                total_debt: totalDebt,
                debt_count: debts.length,
                net_cash_flow: netCashFlow,
                monthly_income: financialContext?.monthlyIncome,
                monthly_expenses: financialContext?.monthlyExpenses
              }}
              onActionClick={handleActionClick}
            />
          </div>
        )}

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
      </div>
    </div>
  );
};

export default Dashboard;