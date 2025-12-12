import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Lightbulb, TrendingDown, Calendar, Shield, Target, Heart, Trash2, Edit2, Zap, Link2, Info, HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ScenarioCard from '@/components/ScenarioCard';
import PayoffTrajectoryChart from '@/components/PayoffTrajectoryChart';
import StrategyBreakdownChart from '@/components/StrategyBreakdownChart';
import ScenarioSlider from '@/components/ui/scenario-slider';
import StrategyToggle from '@/components/ui/strategy-toggle';
import ExplainabilitySection from '@/components/ui/explainability-section';
import { ExportDialog } from '@/components/ExportDialog';
import { AIStrategyComparison } from '@/components/AIStrategyComparison';
import { calculatePayoffScenario, calculateTotalMinimumPayment, simulateConsolidation, simulateSettlement } from '@/utils/debtCalculations';
import { PayoffScenario, PayoffStrategy } from '@/types/debt';
import { showSuccess, showError } from '@/utils/toast';
import { useFinancialAssessment } from '@/hooks/useFinancialAssessment';
import { Goal, StressLevel, EmploymentStatus, LifeEvent, AgeRange, RiskBand } from '@/types/financialAssessment';
import { trackPageView, trackEvent, checkMilestones } from '@/services/analyticsApi';
import { getSessionId } from '@/services/sessionManager';

const MAX_CUSTOM_SCENARIOS = 5;
const MAX_COMPARISON_SCENARIOS = 3;

const Scenarios = () => {
  const navigate = useNavigate();
  const { debts, financialContext, scenarios, addScenario, profileId } = useDebt();
  const [defaultScenarios, setDefaultScenarios] = useState<PayoffScenario[]>([]);
  const [customScenarios, setCustomScenarios] = useState<PayoffScenario[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<PayoffStrategy>('avalanche');
  const [customPayment, setCustomPayment] = useState(0);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [editingScenario, setEditingScenario] = useState<PayoffScenario | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [breakdownViewMode, setBreakdownViewMode] = useState<'stacked' | 'small-multiples' | 'pre-post-consolidation'>('stacked');
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showStrategyInfoModal, setShowStrategyInfoModal] = useState(false);
  const [selectedStrategyInfo, setSelectedStrategyInfo] = useState<'snowball' | 'avalanche' | 'custom' | null>(null);

  // Helper: Check if debt can be consolidated
  const canConsolidate = (debt: any) => {
    // Only credit cards, personal loans, installment loans, and student loans can be consolidated
    // Mortgages and auto loans are secured and cannot be consolidated
    return ['credit-card', 'personal-loan', 'installment-loan', 'student-loan'].includes(debt.type);
  };

  // Helper: Check if debt can be settled
  const canSettle = (debt: any) => {
    // Only credit cards, personal loans, installment loans, and PRIVATE student loans can be settled
    // Auto loans, mortgages, and federal student loans cannot be settled
    if (['credit-card', 'personal-loan', 'installment-loan'].includes(debt.type)) {
      return true;
    }
    if (debt.type === 'student-loan' && debt.loanProgram === 'private') {
      return true;
    }
    return false;
  };

  // Calculate eligibility for consolidation and settlement
  const consolidatableDebts = debts.filter(canConsolidate);
  const settlableDebts = debts.filter(canSettle);
  const totalConsolidatableBalance = consolidatableDebts.reduce((sum, d) => sum + d.balance, 0);
  const totalSettlableBalance = settlableDebts.reduce((sum, d) => sum + d.balance, 0);

  // Helper: Map FinancialContext values to Financial Assessment API enums
  const mapGoal = (goal?: string): Goal => {
    switch (goal) {
      case 'pay-faster': return Goal.BECOME_DEBT_FREE;
      case 'lower-payment': return Goal.LOWER_PAYMENTS;
      case 'reduce-interest': return Goal.BECOME_DEBT_FREE;
      case 'avoid-default': return Goal.REDUCE_STRESS;
      default: return Goal.BECOME_DEBT_FREE;
    }
  };

  const mapStressLevel = (level?: number): StressLevel => {
    if (!level) return StressLevel.MEDIUM;
    if (level <= 2) return StressLevel.LOW;
    if (level >= 4) return StressLevel.HIGH;
    return StressLevel.MEDIUM;
  };

  const mapEmploymentStatus = (status?: string): EmploymentStatus => {
    switch (status) {
      case 'full-time': return EmploymentStatus.STABLE;
      case 'part-time': return EmploymentStatus.VARIABLE;
      case 'self-employed': return EmploymentStatus.VARIABLE;
      case 'unemployed': return EmploymentStatus.UNEMPLOYED;
      case 'retired': return EmploymentStatus.STABLE;
      case 'student': return EmploymentStatus.VARIABLE;
      default: return EmploymentStatus.STABLE;
    }
  };

  const mapLifeEvent = (event?: string): LifeEvent => {
    switch (event) {
      case 'income-increase': return LifeEvent.JOB_CHANGE;
      case 'income-decrease': return LifeEvent.JOB_CHANGE;
      case 'major-expense': return LifeEvent.MEDICAL;
      case 'household-changes': return LifeEvent.MARRIAGE;
      case 'other-goals': return LifeEvent.NONE;
      default: return LifeEvent.NONE;
    }
  };

  const mapAgeRange = (range?: string): AgeRange => {
    switch (range) {
      case '18-24': return AgeRange.UNDER_25;
      case '25-34': return AgeRange.AGE_25_34;
      case '35-44': return AgeRange.AGE_35_44;
      case '45-59': return AgeRange.AGE_45_54;
      case '60+': return AgeRange.AGE_65_PLUS;
      default: return AgeRange.AGE_35_44;
    }
  };

  // Use financial assessment for recommendations
  const { data: assessmentData, loading: assessmentLoading } = useFinancialAssessment({
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
      life_events: mapLifeEvent(financialContext?.lifeEvents?.[0]),
      age_range: mapAgeRange(financialContext?.ageRange),
    },
    enabled: !!profileId && debts.length > 0,
  });

  // Derive recommendation from financial assessment
  const recommendation = assessmentData ? (() => {
    const { primary_driver, risk_band, driver_severity } = assessmentData.deterministic_output;
    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const weightedAPR = debts.reduce((sum, d) => sum + (d.balance * d.apr), 0) / totalDebt;
    
    let recommendedStrategy: string;
    let explanation = assessmentData.personalized_ux.user_friendly_summary;
    const alternatives: Array<{ strategy: string; reason: string }> = [];

    // Decision logic for primary recommendation
    if (risk_band === RiskBand.HIGH || risk_band === RiskBand.CRITICAL) {
      // Severe financial stress - consider settlement if eligible
      if (settlableDebts.length > 0 && totalSettlableBalance > 5000) {
        recommendedStrategy = 'settlement';
        explanation = `Given your financial situation, debt settlement could help reduce your total debt burden. ${settlableDebts.length} of your debts (${((totalSettlableBalance / totalDebt) * 100).toFixed(0)}% of total) are eligible for settlement.`;
        
        // Add avalanche as alternative
        alternatives.push({
          strategy: 'Avalanche',
          reason: 'If you can increase income or reduce expenses'
        });
      } else {
        recommendedStrategy = 'snowball';
        explanation = 'Focus on quick wins with the Snowball method to build momentum and reduce stress.';
      }
    } else if (consolidatableDebts.length >= 2 && totalConsolidatableBalance > 10000 && weightedAPR > 12) {
      // Good candidate for consolidation
      if (risk_band === RiskBand.EXCELLENT || risk_band === RiskBand.LOW_MODERATE) {
        recommendedStrategy = 'consolidation';
        explanation = `You have ${consolidatableDebts.length} debts eligible for consolidation with an average APR of ${weightedAPR.toFixed(1)}%. Consolidating could lower your interest rate and simplify payments.`;
        
        // Add avalanche as alternative
        alternatives.push({
          strategy: 'Avalanche',
          reason: 'If you prefer to keep debts separate'
        });
        alternatives.push({
          strategy: 'Snowball',
          reason: 'For psychological momentum'
        });
      } else {
        // Not good enough credit for consolidation
        recommendedStrategy = primary_driver === 'high_rate' ? 'avalanche' : 'snowball';
        explanation = assessmentData.personalized_ux.user_friendly_summary;
        
        // Mention consolidation as future option
        alternatives.push({
          strategy: 'Consolidation',
          reason: 'Consider once credit improves'
        });
      }
    } else if (primary_driver === 'high_rate') {
      // High interest rates - avalanche
      recommendedStrategy = 'avalanche';
      
      alternatives.push({
        strategy: 'Snowball',
        reason: 'Better for motivation and quick wins'
      });
      
      // Add consolidation if eligible
      if (consolidatableDebts.length >= 2 && (risk_band === RiskBand.EXCELLENT || risk_band === RiskBand.LOW_MODERATE)) {
        alternatives.push({
          strategy: 'Consolidation',
          reason: 'Could simplify payments and lower rates'
        });
      }
    } else {
      // Default to snowball
      recommendedStrategy = 'snowball';
      
      alternatives.push({
        strategy: 'Avalanche',
        reason: 'Saves more on interest long-term'
      });
      
      // Add consolidation if eligible
      if (consolidatableDebts.length >= 2 && (risk_band === RiskBand.EXCELLENT || risk_band === RiskBand.LOW_MODERATE)) {
        alternatives.push({
          strategy: 'Consolidation',
          reason: 'Could simplify payments'
        });
      }
    }

    return {
      recommendedStrategy,
      explanation,
      confidence: risk_band === RiskBand.EXCELLENT || risk_band === RiskBand.LOW_MODERATE ? 'high' :
                  risk_band === RiskBand.MODERATE ? 'medium' : 'low',
      factors: driver_severity.map(d => d.replace('_', ' ')),
      alternatives: alternatives.slice(0, 2), // Limit to 2 alternatives
    };
  })() : null;

  useEffect(() => {
    if (debts.length === 0) {
      navigate('/debt-entry');
      return;
    }

    generateDefaultScenarios();
    
    // Track page view
    if (profileId) {
      trackPageView(profileId, 'Scenarios', getSessionId());
    }
  }, [debts, profileId]);

  useEffect(() => {
    if (recommendation && !assessmentLoading) {
      setSelectedStrategy(recommendation.recommendedStrategy as PayoffStrategy);
    }
  }, [recommendation, assessmentLoading]);

  const generateDefaultScenarios = () => {
    const minPayment = calculateTotalMinimumPayment(debts);
    const availableAmount = financialContext
      ? financialContext.monthlyIncome - financialContext.monthlyExpenses
      : minPayment * 1.5;

    const scenarios: PayoffScenario[] = [];

    // Snowball strategy - pay smallest debts first for psychological wins
    const snowballScenario = calculatePayoffScenario(debts, 'snowball', minPayment);
    snowballScenario.name = 'Snowball Method';
    scenarios.push(snowballScenario);

    // Avalanche strategy - pay highest interest first to save money
    const avalancheScenario = calculatePayoffScenario(debts, 'avalanche', minPayment);
    avalancheScenario.name = 'Avalanche Method';
    scenarios.push(avalancheScenario);

    setDefaultScenarios(scenarios);
    setSelectedScenarios([scenarios[0].id]);
    
    // Auto-select first scenario for breakdown view
    if (scenarios.length > 0) {
      setSelectedStrategyId(scenarios[0].id);
    }

    // Set initial custom payment
    setCustomPayment(minPayment);
  };

  const handleCustomPaymentChange = (value: number) => {
    setCustomPayment(value);
  };

  const handleCreateCustomScenario = () => {
    const minPayment = calculateTotalMinimumPayment(debts);

    if (customPayment < minPayment) {
      showError(`Monthly payment must be at least $${Math.round(minPayment)}`);
      return;
    }

    if (customScenarios.length >= MAX_CUSTOM_SCENARIOS) {
      showError(`You can only create up to ${MAX_CUSTOM_SCENARIOS} custom scenarios. Delete one to create a new one.`);
      return;
    }

    // Generate default name
    const defaultName = `Custom ${selectedStrategy.charAt(0).toUpperCase() + selectedStrategy.slice(1)} #${customScenarios.length + 1}`;
    setScenarioName(defaultName);
    setShowNameDialog(true);
  };

  const handleSaveCustomScenario = () => {
    if (!scenarioName.trim()) {
      showError('Please enter a name for your scenario');
      return;
    }

    const customScenario = calculatePayoffScenario(debts, selectedStrategy, customPayment);
    customScenario.name = scenarioName.trim();

    if (editingScenario) {
      // Update existing scenario
      setCustomScenarios(customScenarios.map(s => 
        s.id === editingScenario.id ? customScenario : s
      ));
      showSuccess('Scenario updated successfully');
    } else {
      // Add new scenario
      setCustomScenarios([...customScenarios, customScenario]);
      addScenario(customScenario);
      showSuccess('Custom scenario created successfully');
      
      // Track analytics event
      if (profileId) {
        trackEvent({
          profile_id: profileId,
          event_type: 'scenario_created',
          event_data: {
            strategy: selectedStrategy,
            monthly_payment: customPayment,
            total_months: customScenario.totalMonths,
            total_interest: customScenario.totalInterest,
          },
          session_id: getSessionId(),
        });
        
        // Check for milestones
        checkMilestones({
          profile_id: profileId,
          trigger_event: 'scenario_created',
        });
      }
    }

    setShowNameDialog(false);
    setScenarioName('');
    setEditingScenario(null);
  };

  const handleEditScenario = (scenario: PayoffScenario) => {
    setEditingScenario(scenario);
    setScenarioName(scenario.name);
    setCustomPayment(scenario.monthlyPayment);
    setSelectedStrategy(scenario.strategy);
    setShowNameDialog(true);
  };

  const handleDeleteScenario = (scenarioId: string) => {
    if (confirm('Are you sure you want to delete this custom scenario?')) {
      setCustomScenarios(customScenarios.filter(s => s.id !== scenarioId));
      setSelectedScenarios(selectedScenarios.filter(id => id !== scenarioId));
      showSuccess('Scenario deleted successfully');
    }
  };

  const toggleScenarioSelection = (id: string) => {
    if (selectedScenarios.includes(id)) {
      setSelectedScenarios(selectedScenarios.filter((s) => s !== id));
    } else {
      if (selectedScenarios.length >= MAX_COMPARISON_SCENARIOS) {
        showError(`You can only compare up to ${MAX_COMPARISON_SCENARIOS} scenarios at a time. Deselect one first.`);
        return;
      }
      setSelectedScenarios([...selectedScenarios, id]);
    }
  };

  const allScenarios = [...defaultScenarios, ...customScenarios];
  const selectedScenarioObjects = allScenarios.filter((s) =>
    selectedScenarios.includes(s.id)
  );

  const handleTestSettlement = () => {
    if (debts.length === 0) {
      showError('No debts available to test settlement');
      return;
    }

    // Use the first debt for settlement test
    const testDebt = debts[0];
    const settlementScenario = simulateSettlement(
      debts,
      testDebt.id,
      50, // Settle for 50% of balance
      6, // Settlement occurs at month 6
      200, // Monthly program payment
      minPayment * 1.5, // Total monthly payment
      new Date()
    );

    settlementScenario.name = `Settlement Test - ${testDebt.name}`;
    setCustomScenarios([...customScenarios, settlementScenario]);
    setSelectedScenarios([...selectedScenarios, settlementScenario.id]);
    showSuccess(`Settlement scenario created! Check month 6 for the orange event marker.`);
  };

  const handleTestConsolidation = () => {
    if (debts.length < 2) {
      showError('Need at least 2 debts to test consolidation');
      return;
    }

    // Consolidate first 2 debts
    const debtsToConsolidate = debts.slice(0, 2).map(d => d.id);
    const consolidationScenario = simulateConsolidation(
      debts,
      debtsToConsolidate,
      7.5, // New APR
      60, // 5 year term
      minPayment * 1.5, // Total monthly payment
      3, // 3% origination fee
      new Date()
    );

    consolidationScenario.name = 'Consolidation Test';
    setCustomScenarios([...customScenarios, consolidationScenario]);
    setSelectedScenarios([...selectedScenarios, consolidationScenario.id]);
    showSuccess(`Consolidation scenario created! Check month 0 for the purple event marker.`);
  };

  const handleExport = () => {
    showSuccess('Export functionality coming soon!');
  };

  const minPayment = calculateTotalMinimumPayment(debts);
  const maxPayment = financialContext 
    ? financialContext.monthlyIncome - financialContext.monthlyExpenses
    : minPayment * 3;

  // Calculate impact for slider
  const baseScenario = defaultScenarios[0];
  const customScenarioPreview = baseScenario ? calculatePayoffScenario(debts, selectedStrategy, customPayment) : null;
  const monthsSaved = baseScenario && customScenarioPreview 
    ? baseScenario.totalMonths - customScenarioPreview.totalMonths 
    : 0;
  const interestSaved = baseScenario && customScenarioPreview
    ? baseScenario.totalInterest - customScenarioPreview.totalInterest
    : 0;

  // Calculate actual metrics for strategy options
  const snowballPreview = defaultScenarios.find(s => s.strategy === 'snowball');
  const avalanchePreview = defaultScenarios.find(s => s.strategy === 'avalanche');
  const customPreview = customScenarioPreview;

  const strategyOptions = [
    {
      value: 'snowball',
      label: 'Snowball',
      metrics: {
        months: snowballPreview?.totalMonths || 48,
        interest: Math.round(snowballPreview?.totalInterest || 8500),
        description: 'Best for motivation'
      }
    },
    {
      value: 'avalanche',
      label: 'Avalanche',
      metrics: {
        months: avalanchePreview?.totalMonths || 44,
        interest: Math.round(avalanchePreview?.totalInterest || 7200),
        description: 'Saves most money'
      }
    },
    {
      value: 'custom',
      label: 'Hybrid',
      metrics: {
        months: customPreview?.totalMonths || 46,
        interest: Math.round(customPreview?.totalInterest || 7800),
        description: 'Balanced approach'
      }
    }
  ];

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
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="border-[#D4DFE4] text-[#002B45] rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#002B45] mb-3">
            Compare Payoff Strategies
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#3A4F61]">
            See how different approaches can help you become debt-free
          </p>
        </div>

        {/* Recommendation Banner - Removed, will be shown as badge on cards */}

        {/* Comparison Limit Alert */}
        {selectedScenarios.length === MAX_COMPARISON_SCENARIOS && (
          <Card className="border-[1.5px] border-blue-200 bg-blue-50 mb-8">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800">
                You've selected the maximum of {MAX_COMPARISON_SCENARIOS} scenarios for comparison. Deselect one to choose a different scenario.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Interactive Scenario Builder */}
        <Card className="border-[1.5px] border-[#D4DFE4] mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#002B45]">Build Your Custom Plan</CardTitle>
                <CardDescription className="text-[#3A4F61]">
                  Adjust your monthly payment and strategy to see how it affects your payoff timeline
                </CardDescription>
              </div>
              <div className="text-sm text-[#4F6A7A]">
                {customScenarios.length}/{MAX_CUSTOM_SCENARIOS} custom scenarios
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <StrategyToggle
              options={strategyOptions}
              selected={selectedStrategy}
              onChange={(value) => setSelectedStrategy(value as PayoffStrategy)}
              showComparison={true}
            />

            <ScenarioSlider
              label="Monthly Payment Amount"
              min={minPayment}
              max={maxPayment}
              step={25}
              value={customPayment}
              onChange={handleCustomPaymentChange}
              unit="$"
              formatValue={(value) => `$${value.toLocaleString()}`}
              impact={[
                {
                  label: monthsSaved >= 0 ? 'Months Faster' : 'Months Slower',
                  value: `${Math.abs(monthsSaved)} months`
                },
                {
                  label: interestSaved >= 0 ? 'Interest Saved' : 'Extra Interest',
                  value: `$${Math.abs(Math.round(interestSaved)).toLocaleString()}`
                }
              ]}
            />

            <Button
              onClick={handleCreateCustomScenario}
              disabled={customScenarios.length >= MAX_CUSTOM_SCENARIOS}
              className="w-full bg-[#009A8C] hover:bg-[#007F74] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {customScenarios.length >= MAX_CUSTOM_SCENARIOS 
                ? `Maximum ${MAX_CUSTOM_SCENARIOS} Custom Scenarios Reached`
                : 'Create Custom Scenario'
              }
            </Button>
          </CardContent>
        </Card>

        {/* Test What-If Features */}
        <Card className="border-[1.5px] border-[#009A8C] bg-[#E7F7F4] mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#009A8C]" />
              <CardTitle className="text-[#002B45]">Test New Visualization Features</CardTitle>
            </div>
            <CardDescription className="text-[#3A4F61]">
              Try out consolidation and settlement scenarios to see event markers and enhanced tooltips
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-[#D4DFE4]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-purple-100 rounded">
                    <Link2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-[#002B45]">Test Consolidation</h4>
                </div>
                <p className="text-sm text-[#3A4F61] mb-3">
                  Combines your first 2 debts into a single loan at 7.5% APR. Look for the purple marker at month 0.
                </p>
                <Button
                  onClick={handleTestConsolidation}
                  disabled={debts.length < 2}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Create Consolidation Test
                </Button>
              </div>

              <div className="p-4 bg-white rounded-lg border border-[#D4DFE4]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-orange-100 rounded">
                    <Zap className="w-4 h-4 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-[#002B45]">Test Settlement</h4>
                </div>
                <p className="text-sm text-[#3A4F61] mb-3">
                  Settles your first debt for 50% at month 6. Look for the orange marker showing forgiven amount.
                </p>
                <Button
                  onClick={handleTestSettlement}
                  disabled={debts.length === 0}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Create Settlement Test
                </Button>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> After creating a test scenario, select it for comparison to see the event markers on the chart.
                Hover over the markers to see detailed event information in the tooltip.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Default Scenarios */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[#002B45]">Default Strategies</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defaultScenarios.map((scenario) => {
              const isRecommended = recommendation &&
                scenario.strategy === recommendation.recommendedStrategy;
              
              return (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  isSelected={selectedScenarios.includes(scenario.id)}
                  onClick={() => toggleScenarioSelection(scenario.id)}
                  isRecommended={isRecommended}
                  recommendationReason={isRecommended ? recommendation.explanation : undefined}
                />
              );
            })}
          </div>
        </div>

        {/* Custom Scenarios */}
        {customScenarios.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#002B45]">
                Your Custom Strategies ({customScenarios.length}/{MAX_CUSTOM_SCENARIOS})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customScenarios.map((scenario) => (
                <div key={scenario.id} className="relative group">
                  <ScenarioCard
                    scenario={scenario}
                    isSelected={selectedScenarios.includes(scenario.id)}
                    onClick={() => toggleScenarioSelection(scenario.id)}
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditScenario(scenario);
                      }}
                      className="h-8 w-8 p-0 bg-white/95 backdrop-blur-sm border-[#D4DFE4] hover:bg-white shadow-md"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScenario(scenario.id);
                      }}
                      className="h-8 w-8 p-0 bg-white/95 backdrop-blur-sm border-red-200 text-red-600 hover:bg-red-50 shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Chart 1: Payoff Trajectory Comparison */}
        {selectedScenarioObjects.length >= 1 && (
          <Card className="border-[1.5px] border-[#D4DFE4] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#002B45]">Strategy Comparison</CardTitle>
                  <CardDescription className="text-[#3A4F61]">
                    Click on any line to see detailed breakdown below
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <HelpCircle className="h-4 w-4 text-[#4F6A7A]" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Compare total debt balance over time. Click a line to view per-debt breakdown.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <PayoffTrajectoryChart
                scenarios={selectedScenarioObjects}
                selectedStrategyId={selectedStrategyId}
                onStrategySelected={(id) => {
                  setSelectedStrategyId(id);
                }}
                height={400}
                showLegend={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Chart 2: Strategy Breakdown */}
        {selectedStrategyId && selectedScenarioObjects.length >= 1 && (
          <Card className="border-[1.5px] border-[#D4DFE4] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#002B45]">Debt Breakdown</CardTitle>
                  <CardDescription className="text-[#3A4F61]">
                    {selectedScenarioObjects.find(s => s.id === selectedStrategyId)?.name}
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <HelpCircle className="h-4 w-4 text-[#4F6A7A]" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">See how each individual debt is paid off over time in the selected strategy.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <StrategyBreakdownChart
                scenario={selectedScenarioObjects.find(s => s.id === selectedStrategyId)!}
                debts={debts}
                viewMode={breakdownViewMode}
                onViewModeChange={(mode) => setBreakdownViewMode(mode as any)}
                height={400}
              />
            </CardContent>
          </Card>
        )}

        {selectedScenarioObjects.length < 1 && (
          <Card className="border-[1.5px] border-[#D4DFE4] mb-8">
            <CardContent className="py-12 text-center">
              <p className="text-[#3A4F61] text-lg">
                Select at least 1 scenario to see the visualization
              </p>
            </CardContent>
          </Card>
        )}

        {/* Explainability Section */}
        {recommendation && (
          <ExplainabilitySection
            title="Why we recommend this strategy"
            defaultOpen={false}
            explanations={[
              {
                icon: TrendingDown,
                title: 'Saves the most interest',
                description: `${recommendation.recommendedStrategy.charAt(0).toUpperCase() + recommendation.recommendedStrategy.slice(1)} method targets your highest-interest debts first, potentially saving thousands in interest charges`
              },
              {
                icon: Calendar,
                title: 'Realistic timeline',
                description: `Based on your available cash flow, this strategy provides a sustainable path to becoming debt-free`
              },
              {
                icon: Shield,
                title: 'Maintains financial stability',
                description: 'Keeps your emergency savings intact while making steady progress on debt reduction'
              },
              {
                icon: Target,
                title: 'Matches your goals',
                description: `You said you want to ${financialContext?.primaryGoal.replace('-', ' ')} - this strategy aligns with that objective`
              },
              {
                icon: Heart,
                title: 'Considers your stress level',
                description: `With your ${financialContext?.stressLevel === 5 ? 'high' : financialContext?.stressLevel === 4 ? 'elevated' : 'moderate'} stress level, this balanced approach provides steady progress without overwhelming you`
              }
            ]}
          />
        )}

      </div>

      {/* Name Scenario Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingScenario ? 'Edit Scenario Name' : 'Name Your Custom Scenario'}
            </DialogTitle>
            <DialogDescription>
              Give your scenario a memorable name to help you identify it later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <Input
                id="scenario-name"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="e.g., Aggressive Payoff Plan"
                maxLength={50}
                className="border-[#D4DFE4]"
              />
              <p className="text-xs text-[#4F6A7A]">
                {scenarioName.length}/50 characters
              </p>
            </div>
            <div className="p-4 bg-[#F7F9FA] rounded-lg border border-[#D4DFE4]">
              <h4 className="text-sm font-semibold text-[#002B45] mb-2">Scenario Details</h4>
              <div className="space-y-1 text-sm text-[#3A4F61]">
                <p><span className="font-medium">Strategy:</span> {selectedStrategy.charAt(0).toUpperCase() + selectedStrategy.slice(1)}</p>
                <p><span className="font-medium">Monthly Payment:</span> ${Math.round(customPayment).toLocaleString()}</p>
                {customScenarioPreview && (
                  <>
                    <p><span className="font-medium">Payoff Time:</span> {customScenarioPreview.totalMonths} months</p>
                    <p><span className="font-medium">Total Interest:</span> ${Math.round(customScenarioPreview.totalInterest).toLocaleString()}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNameDialog(false);
                setScenarioName('');
                setEditingScenario(null);
              }}
              className="border-[#D4DFE4] text-[#3A4F61]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCustomScenario}
              className="bg-[#009A8C] hover:bg-[#007F74] text-white"
            >
              {editingScenario ? 'Update Scenario' : 'Create Scenario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Scenarios;