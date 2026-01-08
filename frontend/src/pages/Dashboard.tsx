import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Calendar, TrendingDown, PiggyBank, TrendingUp, Shield } from 'lucide-react';
import MetricsCard from '@/components/MetricsCard';
import DebtCompositionChart from '@/components/DebtCompositionChart';
import DebtListTable from '@/components/DebtListTable';
import DebtEntryForm from '@/components/DebtEntryForm';
import { FinancialAssessment } from '@/components/FinancialAssessment';
import { Debt, LifeEvent as DebtLifeEvent } from '@/types/debt';
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

  // Calculate financial metrics
  const totalDebt = calculateTotalDebt(debts);
  const totalMinPayment = calculateTotalMinimumPayment(debts);
  const debtToIncome = financialContext ? calculateDebtToIncome(totalMinPayment, financialContext.monthlyIncome) : 0;
  
  const netCashFlow = financialContext
    ? financialContext.monthlyIncome - financialContext.monthlyExpenses - totalMinPayment
    : 0;
  
  const emergencySavingsRatio = financialContext && financialContext.monthlyExpenses > 0
    ? financialContext.liquidSavings / financialContext.monthlyExpenses
    : 0;

  // Map frontend LifeEvent to backend LifeEvent
  const mapLifeEvent = (event?: DebtLifeEvent): LifeEvent => {
    if (!event) return LifeEvent.NONE;
    switch (event) {
      case 'income-increase': return LifeEvent.JOB_CHANGE;
      case 'income-decrease': return LifeEvent.JOB_CHANGE;
      case 'major-expense': return LifeEvent.MEDICAL;
      case 'household-changes': return LifeEvent.MARRIAGE;
      case 'other-goals': return LifeEvent.NONE;
      default: return LifeEvent.NONE;
    }
  };

  // Map frontend stress level (1-5) to backend StressLevel enum
  const mapStressLevel = (level?: number): StressLevel => {
    if (!level) return StressLevel.MEDIUM;
    if (level <= 2) return StressLevel.LOW;
    if (level <= 3) return StressLevel.MEDIUM;
    return StressLevel.HIGH;
  };

  // Map frontend age range to backend AgeRange enum
  const mapAgeRange = (range?: string): AgeRange => {
    if (!range) return AgeRange.AGE_35_44;
    switch (range) {
      case '18-24': return AgeRange.UNDER_25;
      case '25-34': return AgeRange.AGE_25_34;
      case '35-44': return AgeRange.AGE_35_44;
      case '45-59': return AgeRange.AGE_45_54;
      case '60+': return AgeRange.AGE_65_PLUS;
      default: return AgeRange.AGE_35_44;
    }
  };

  // Map frontend employment status to backend EmploymentStatus enum
  const mapEmploymentStatus = (status?: string): EmploymentStatus => {
    if (!status) return EmploymentStatus.STABLE;
    switch (status) {
      case 'full-time': return EmploymentStatus.STABLE;
      case 'part-time': return EmploymentStatus.VARIABLE;
      case 'self-employed': return EmploymentStatus.VARIABLE;
      case 'unemployed': return EmploymentStatus.UNEMPLOYED;
      case 'retired': return EmploymentStatus.STABLE;
      case 'student': return EmploymentStatus.TRANSITIONING;
      default: return EmploymentStatus.STABLE;
    }
  };

  // Map frontend goal to backend Goal enum
  const mapGoal = (goal?: string): Goal => {
    if (!goal) return Goal.BECOME_DEBT_FREE;
    switch (goal) {
      case 'lower-payment': return Goal.LOWER_PAYMENTS;
      case 'pay-faster': return Goal.BECOME_DEBT_FREE;
      case 'reduce-interest': return Goal.BECOME_DEBT_FREE;
      case 'avoid-default': return Goal.REDUCE_STRESS;
      default: return Goal.BECOME_DEBT_FREE;
    }
  };

  // Use financial assessment hook
  const { data: assessmentData, loading: assessmentLoading, error: assessmentError } = useFinancialAssessment({
    profileId: profileId || '',
    debts: debts.map(debt => ({
      balance: debt.balance,
      apr: debt.apr,
      is_delinquent: debt.isDelinquent || false,
    })),
    userContext: {
      goal: mapGoal(financialContext?.primaryGoal),
      stress_level: mapStressLevel(financialContext?.stressLevel),
      employment_status: mapEmploymentStatus(financialContext?.employmentStatus),
      life_events:
        financialContext?.lifeEvents && financialContext.lifeEvents.length > 0
          ? mapLifeEvent(financialContext.lifeEvents[0] as DebtLifeEvent)
          : LifeEvent.NONE,
      age_range: mapAgeRange(financialContext?.ageRange),
    },
    financialMetrics: {
      monthly_income: financialContext?.monthlyIncome || 0,
      monthly_expenses: financialContext?.monthlyExpenses || 0,
      liquid_savings: financialContext?.liquidSavings || 0,
      total_minimum_payments: totalMinPayment,
    },
    enabled: !!profileId && debts.length > 0 && !!financialContext,
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#002B45] mb-3">
            {journeyState === 'snapshot_generated' ? 'Your Debt Snapshot' : 'Dashboard'}
          </h2>
          <div className="flex items-center gap-2">
            <img
              src="/clara-avatar.png"
              alt="Clara"
              className="w-6 h-6 rounded-full object-cover"
            />
            <p className="text-[16px] md:text-[18px] text-[#3A4F61]">
              {journeyState === 'snapshot_generated'
                ? "Here's a clear picture of where things stand — based on what you shared."
                : "Manage your debts and track your progress"}
            </p>
          </div>
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
            subtitle={(() => {
              const delinquentDebts = debts.filter(d => d.isDelinquent);
              const delinquentCount = delinquentDebts.length;
              const delinquentBalance = delinquentDebts.reduce((sum, d) => sum + d.balance, 0);
              
              if (delinquentCount > 0) {
                return (
                  <>
                    Across {debts.length} {debts.length === 1 ? 'account' : 'accounts'}
                    <br />
                    <span className="text-red-600">🔴 {delinquentCount} {delinquentCount === 1 ? 'account' : 'accounts'} past due (${delinquentBalance.toLocaleString()})</span>
                  </>
                );
              }
              return `Across ${debts.length} ${debts.length === 1 ? 'account' : 'accounts'}`;
            })()}
            icon={DollarSign}
          />
          
          <MetricsCard
            title="Minimum Monthly Debt Payments"
            value={`$${totalMinPayment.toLocaleString()}`}
            subtitle="Required every month to stay current"
            icon={Calendar}
          />
          
          <MetricsCard
            title="Net Cash Flow"
            value={`${netCashFlow >= 0 ? '+' : '-'}$${Math.abs(netCashFlow).toLocaleString()}`}
            subtitle={
              netCashFlow >= 0
                ? 'Room to make extra payments'
                : netCashFlow >= -100
                  ? 'Very tight budget'
                  : `Short about $${Math.round(Math.abs(netCashFlow) / 50) * 50} each month`
            }
            icon={netCashFlow >= 0 ? TrendingUp : TrendingDown}
            iconColor={netCashFlow >= 0 ? '#10B981' : '#EF4444'}
          />
          
          <MetricsCard
            title="Debt-to-Income Ratio"
            value={`${debtToIncome.toFixed(1)}%`}
            subtitle={debtToIncome > 43 ? 'Payments take up a large share of income' : 'Payments are within a manageable range'}
            icon={TrendingDown}
            iconColor={debtToIncome > 43 ? '#EF4444' : '#10B981'}
          />
          
          <MetricsCard
            title="Emergency Savings Ratio"
            value={`${emergencySavingsRatio.toFixed(1)}x`}
            subtitle={
              emergencySavingsRatio >= 3
                ? 'Strong emergency cushion'
                : emergencySavingsRatio >= 1
                  ? 'Some emergency cushion'
                  : emergencySavingsRatio === 0
                    ? 'No emergency cushion'
                    : 'Limited emergency cushion'
            }
            icon={PiggyBank}
            iconColor={emergencySavingsRatio >= 3 ? '#10B981' : emergencySavingsRatio >= 1 ? '#EAB308' : '#EF4444'}
          />
          
          {assessmentData && (
            <MetricsCard
              title="Debt Composition Risk"
              value={`${Math.round(assessmentData.deterministic_output.risk_score)}/100`}
              subtitle={
                assessmentData.deterministic_output.risk_score >= 70 ? 'Debt mix is creating severe financial strain' :
                assessmentData.deterministic_output.risk_score >= 50 ? 'Debt mix is putting significant pressure on finances' :
                assessmentData.deterministic_output.risk_score >= 30 ? 'Debt mix is manageable but limiting flexibility' :
                'Debt mix is low risk'
              }
              icon={Shield}
              iconColor={
                assessmentData.deterministic_output.risk_score >= 70 ? '#EF4444' :
                assessmentData.deterministic_output.risk_score >= 50 ? '#F97316' :
                assessmentData.deterministic_output.risk_score >= 30 ? '#EAB308' :
                '#10B981'
              }
            />
          )}
          
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
              userContext={{
                goal: financialContext?.primaryGoal,
                stress_level: financialContext?.stressLevel,
                monthly_income: financialContext?.monthlyIncome,
                monthly_expenses: financialContext?.monthlyExpenses,
                liquid_savings: financialContext?.liquidSavings,
                age_range: financialContext?.ageRange,
                employment_status: financialContext?.employmentStatus,
                life_events: financialContext?.lifeEvents
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

        {/* Bottom CTA - See Personalized Plan */}
        <div className="flex flex-col items-center gap-2 py-8">
          <Button
            size="lg"
            onClick={() => navigate('/scenarios')}
            className="w-full md:w-auto md:min-w-[300px] mx-auto flex items-center justify-center bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold text-[16px] md:text-[18px] py-4 md:py-5 px-6 md:px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            See my Personalized Plan
            <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <p className="text-sm text-[#4F6A7A] text-center">
            Clara will guide you out of debt step by step—no surprises
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;