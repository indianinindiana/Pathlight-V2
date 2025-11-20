import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, ArrowLeft, Download, Lightbulb, TrendingDown, Calendar, Shield, Target, Heart } from 'lucide-react';
import ScenarioCard from '@/components/ScenarioCard';
import ScenarioComparison from '@/components/ScenarioComparison';
import ScenarioSlider from '@/components/ui/scenario-slider';
import StrategyToggle from '@/components/ui/strategy-toggle';
import ExplainabilitySection from '@/components/ui/explainability-section';
import ConfidenceIndicator from '@/components/ui/confidence-indicator';
import { calculatePayoffScenario, calculateTotalMinimumPayment } from '@/utils/debtCalculations';
import { PayoffScenario, PayoffStrategy } from '@/types/debt';
import { showSuccess, showError } from '@/utils/toast';
import { useRecommendations } from '@/hooks/usePersonalization';

const Scenarios = () => {
  const navigate = useNavigate();
  const { debts, financialContext, scenarios, addScenario } = useDebt();
  const [generatedScenarios, setGeneratedScenarios] = useState<PayoffScenario[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<PayoffStrategy>('avalanche');
  const [customPayment, setCustomPayment] = useState(0);

  const { recommendation, isLoading: recommendationLoading } = useRecommendations();

  useEffect(() => {
    if (debts.length === 0) {
      navigate('/debt-entry');
      return;
    }

    generateDefaultScenarios();
  }, [debts]);

  useEffect(() => {
    if (recommendation && !recommendationLoading) {
      setSelectedStrategy(recommendation.recommendedStrategy);
    }
  }, [recommendation, recommendationLoading]);

  const generateDefaultScenarios = () => {
    const minPayment = calculateTotalMinimumPayment(debts);
    const availableAmount = financialContext
      ? financialContext.monthlyIncome - financialContext.monthlyExpenses
      : minPayment * 1.5;

    const scenarios: PayoffScenario[] = [];

    // Minimum payment scenario (Snowball)
    const minScenario = calculatePayoffScenario(debts, 'snowball', minPayment);
    scenarios.push(minScenario);

    // Aggressive payment scenario (Avalanche)
    const aggressivePayment = Math.min(availableAmount, minPayment * 2);
    const aggressiveScenario = calculatePayoffScenario(debts, 'avalanche', aggressivePayment);
    scenarios.push(aggressiveScenario);

    // Moderate payment scenario
    const moderatePayment = minPayment * 1.5;
    const moderateScenario = calculatePayoffScenario(debts, 'avalanche', moderatePayment);
    moderateScenario.name = 'Moderate Strategy';
    scenarios.push(moderateScenario);

    setGeneratedScenarios(scenarios);
    setSelectedScenarios([scenarios[0].id, scenarios[1].id]);

    // Set initial custom payment
    setCustomPayment(minPayment);
  };

  const handleCustomPaymentChange = (value: number) => {
    setCustomPayment(value);
  };

  const handleCreateCustomScenario = () => {
    const minPayment = calculateTotalMinimumPayment(debts);

    if (customPayment < minPayment) {
      showError(`Monthly payment must be at least $${minPayment.toFixed(2)}`);
      return;
    }

    const customScenario = calculatePayoffScenario(debts, selectedStrategy, customPayment);
    customScenario.name = `Custom ${selectedStrategy.charAt(0).toUpperCase() + selectedStrategy.slice(1)} ($${customPayment}/month)`;

    setGeneratedScenarios([...generatedScenarios, customScenario]);
    addScenario(customScenario);
    showSuccess('Custom scenario created successfully');
  };

  const toggleScenarioSelection = (id: string) => {
    if (selectedScenarios.includes(id)) {
      setSelectedScenarios(selectedScenarios.filter((s) => s !== id));
    } else {
      setSelectedScenarios([...selectedScenarios, id]);
    }
  };

  const selectedScenarioObjects = generatedScenarios.filter((s) =>
    selectedScenarios.includes(s.id)
  );

  const handleExport = () => {
    showSuccess('Export functionality coming soon!');
  };

  const minPayment = calculateTotalMinimumPayment(debts);
  const maxPayment = financialContext 
    ? financialContext.monthlyIncome - financialContext.monthlyExpenses
    : minPayment * 3;

  // Calculate impact for slider
  const baseScenario = generatedScenarios[0];
  const customScenarioPreview = baseScenario ? calculatePayoffScenario(debts, selectedStrategy, customPayment) : null;
  const monthsSaved = baseScenario && customScenarioPreview 
    ? baseScenario.totalMonths - customScenarioPreview.totalMonths 
    : 0;
  const interestSaved = baseScenario && customScenarioPreview
    ? baseScenario.totalInterest - customScenarioPreview.totalInterest
    : 0;

  const strategyOptions = [
    {
      value: 'snowball',
      label: 'Snowball',
      metrics: {
        months: 48,
        interest: 8500,
        description: 'Best for motivation'
      }
    },
    {
      value: 'avalanche',
      label: 'Avalanche',
      metrics: {
        months: 44,
        interest: 7200,
        description: 'Saves most money'
      }
    },
    {
      value: 'custom',
      label: 'Hybrid',
      metrics: {
        months: 46,
        interest: 7800,
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
              <Compass className="w-6 h-6 md:w-7 md:h-7 text-[#009A8C] mr-2.5" strokeWidth={2.5} />
              <h1 className="text-[20px] md:text-[24px] font-bold text-[#002B45] tracking-tight" style={{ letterSpacing: '-0.5%' }}>
                Debt PathFinder
              </h1>
            </div>
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

        {/* Recommendation Banner */}
        {recommendation && !recommendationLoading && (
          <Card className="border-[1.5px] border-[#009A8C] bg-[#E7F7F4] mb-8">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-[#009A8C]/10 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-[#009A8C]" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[#002B45] text-lg">
                        Recommended Strategy: {recommendation.recommendedStrategy.charAt(0).toUpperCase() + recommendation.recommendedStrategy.slice(1)}
                      </h3>
                      <ConfidenceIndicator
                        level={recommendation.confidence}
                        factors={recommendation.factors}
                        explanation={recommendation.explanation}
                      />
                    </div>
                    <p className="text-sm text-[#3A4F61] mb-3">
                      {recommendation.explanation}
                    </p>
                    {recommendation.alternatives.length > 0 && (
                      <div className="text-xs text-[#4F6A7A]">
                        <span className="font-medium">Also consider:</span>{' '}
                        {recommendation.alternatives.map((alt, i) => (
                          <span key={i}>
                            {alt.strategy} ({alt.reason})
                            {i < recommendation.alternatives.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What-If CTA Card */}
        <Card className="border-[1.5px] border-[#009A8C] bg-[#E7F7F4] mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#009A8C]/10 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-[#009A8C]" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#002B45] text-lg mb-1">
                    Want to explore more options?
                  </h3>
                  <p className="text-sm text-[#3A4F61]">
                    Try "What If?" scenarios to see how paying extra, consolidating, or other strategies could change your payoff journey
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/what-if')}
                className="bg-[#009A8C] hover:bg-[#007F74] text-white rounded-xl whitespace-nowrap"
              >
                Explore What-If Scenarios
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Scenario Builder */}
        <Card className="border-[1.5px] border-[#D4DFE4] mb-8">
          <CardHeader>
            <CardTitle className="text-[#002B45]">Build Your Custom Plan</CardTitle>
            <CardDescription className="text-[#3A4F61]">
              Adjust your monthly payment and strategy to see how it affects your payoff timeline
            </CardDescription>
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
                  value: `$${Math.abs(interestSaved).toLocaleString()}`
                }
              ]}
            />

            <Button
              onClick={handleCreateCustomScenario}
              className="w-full bg-[#009A8C] hover:bg-[#007F74] text-white rounded-xl"
            >
              Create Custom Scenario
            </Button>
          </CardContent>
        </Card>

        {/* Scenario Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[#002B45]">Available Strategies</h3>
            <Button
              onClick={handleExport}
              className="bg-[#009A8C] hover:bg-[#007F74] text-white rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isSelected={selectedScenarios.includes(scenario.id)}
                onClick={() => toggleScenarioSelection(scenario.id)}
              />
            ))}
          </div>

          <p className="text-sm text-[#4F6A7A] mt-4">
            Click on scenarios to select them for comparison (selected: {selectedScenarios.length})
          </p>
        </div>

        {/* Comparison Section */}
        {selectedScenarioObjects.length >= 2 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#002B45] mb-4">
              Scenario Comparison
            </h3>
            <ScenarioComparison scenarios={selectedScenarioObjects} />
          </div>
        )}

        {selectedScenarioObjects.length < 2 && (
          <Card className="border-[1.5px] border-[#D4DFE4]">
            <CardContent className="py-12 text-center">
              <p className="text-[#3A4F61] text-lg">
                Select at least 2 scenarios to see a detailed comparison
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

        {/* Key Insights */}
        <Card className="border-[1.5px] border-[#D4DFE4] mt-8">
          <CardHeader>
            <CardTitle className="text-[#002B45]">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-[#E7F7F4] rounded-lg">
                <h4 className="font-semibold text-[#002B45] mb-2">Snowball Method</h4>
                <p className="text-sm text-[#3A4F61]">
                  Focuses on paying off smallest debts first. Builds momentum and motivation through quick wins.
                  May pay slightly more interest overall but provides psychological benefits.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-[#002B45] mb-2">Avalanche Method</h4>
                <p className="text-sm text-[#3A4F61]">
                  Targets highest interest rate debts first. Mathematically optimal approach that saves the most
                  money on interest. Best for those focused on minimizing total cost.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-[#002B45] mb-2">Custom Strategy</h4>
                <p className="text-sm text-[#3A4F61]">
                  Create your own plan based on your specific situation and preferences. Adjust monthly payments
                  to find the right balance between speed and affordability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Scenarios;