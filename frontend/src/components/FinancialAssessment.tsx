import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, AlertCircle, CheckCircle, Info, MessageCircle, ChevronDown, ChevronUp, Target, Lightbulb, Database, ArrowRight } from 'lucide-react';
import { FinancialAssessmentResult, RISK_BAND_CONFIGS, DRIVER_CONFIGS, RiskBand, DriverType } from '@/types/financialAssessment';
import { askClara } from '@/services/claraAiApi';

interface FinancialAssessmentProps {
  data: FinancialAssessmentResult | null;
  loading: boolean;
  error: { detail: string } | null;
  profileId?: string;
  context?: Record<string, any>;
  onActionClick?: (actionId: string) => void;
  userContext?: {
    goal?: string;
    stress_level?: number;
    monthly_income?: number;
    monthly_expenses?: number;
    liquid_savings?: number;
    age_range?: string;
    employment_status?: string;
    life_events?: string[];
  };
}

const getRiskBandColor = (riskBand: RiskBand): string => {
  const config = RISK_BAND_CONFIGS[riskBand];
  switch (config.color) {
    case 'green':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'blue':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'yellow':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'orange':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'red':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getRiskIcon = (riskBand: RiskBand) => {
  const config = RISK_BAND_CONFIGS[riskBand];
  switch (config.color) {
    case 'green':
      return <CheckCircle className="w-5 h-5" />;
    case 'blue':
    case 'yellow':
      return <Info className="w-5 h-5" />;
    case 'orange':
    case 'red':
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
};

// Helper function to get emotional normalization based on goal and stress level
const getEmotionalNormalization = (goal?: string, stressLevel?: number): string => {
  const highStress = (stressLevel || 0) >= 4;
  
  if (highStress) {
    return "I know dealing with debt can feel overwhelming. You're not alone in this — many people face similar challenges. ";
  }
  
  switch (goal) {
    case 'avoid-default':
      return "It takes courage to face financial challenges head-on. You're taking the right step by seeking clarity. ";
    case 'reduce-interest':
      return "Smart thinking — reducing interest costs is one of the most effective ways to accelerate your progress. ";
    case 'pay-faster':
      return "Your motivation to become debt-free is admirable. Let's create a clear path forward. ";
    case 'lower-payment':
      return "Finding breathing room in your budget is a practical first step. Let's see what's possible. ";
    default:
      return "You're taking an important step by understanding your situation. ";
  }
};

export function FinancialAssessment({ data, loading, error, profileId, context, onActionClick, userContext }: FinancialAssessmentProps) {
  const navigate = useNavigate();
  const [showQA, setShowQA] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showAccountedFor, setShowAccountedFor] = useState(false);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [qaResponse, setQaResponse] = useState<string | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);

  // Generate dynamic questions based on user's summary and financial situation
  const getSuggestedQuestions = () => {
    if (!data) return [];
    
    const questions: string[] = [];
    const { risk_band, primary_driver, drivers } = data.deterministic_output;
    const summary = data.personalized_ux.user_friendly_summary;
    
    // Questions based on primary driver
    if (primary_driver === 'high_rate' || drivers.high_rate_factor > 0) {
      questions.push('Should I focus on paying off my highest interest debt first?');
      questions.push('How much could I save by refinancing or consolidating?');
    }
    
    if (primary_driver === 'delinquency' || drivers.delinquency_factor > 0) {
      questions.push('What should I do about my delinquent accounts?');
      questions.push('How can I get back on track with my payments?');
    }
    
    if (primary_driver === 'complexity' || drivers.complexity_factor > 0) {
      questions.push('Would debt consolidation help simplify my situation?');
      questions.push('How do I prioritize which debts to pay first?');
    }
    
    // Questions based on risk band and context
    if (risk_band === 'critical' || risk_band === 'high') {
      questions.push('What are my options if I can\'t afford my minimum payments?');
    }
    
    // Questions based on user context
    if (userContext?.stress_level && userContext.stress_level >= 4) {
      questions.push('How can I reduce the stress of managing my debts?');
    }
    
    if (context?.net_cash_flow && context.net_cash_flow < 0) {
      questions.push('How can I free up more money each month?');
    }
    
    // Default question
    if (questions.length < 4) {
      questions.push('What\'s the fastest way to become debt-free?');
    }
    
    return questions.slice(0, 4);
  };

  const handleAskQuestion = async (questionText: string) => {
    if (!questionText.trim() || !profileId) return;
    
    setIsAsking(true);
    setQaError(null);
    setQaResponse(null);
    
    try {
      // Build enhanced context with financial situation
      const enhancedContext = {
        ...context,
        summary: data?.personalized_ux.user_friendly_summary,
        risk_band: data?.deterministic_output.risk_band,
        primary_driver: data?.deterministic_output.primary_driver,
        user_goal: userContext?.goal,
        stress_level: userContext?.stress_level,
        net_cash_flow: context?.net_cash_flow,
        total_debt: context?.total_debt,
        debt_count: context?.debt_count
      };
      
      const response = await askClara({
        profile_id: profileId,
        question: questionText,
        context: enhancedContext
      });
      
      setQaResponse(response.response.answer);
    } catch (err) {
      console.error('Error asking question:', err);
      setQaError('Unable to get an answer right now. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  const handleActionClick = (actionId: string | undefined) => {
    if (actionId && onActionClick) {
      onActionClick(actionId);
    }
  };
  if (loading) {
    return (
      <Card className="border-[1.5px] border-[#D4DFE4]">
        <CardHeader>
          <CardTitle className="text-[#002B45]">Financial Health Assessment</CardTitle>
          <CardDescription>Analyzing your financial situation...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#009A8C]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-[1.5px] border-[#D4DFE4]">
        <CardHeader>
          <CardTitle className="text-[#002B45]">Financial Health Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.detail}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { deterministic_output, financial_interpretation, personalized_ux } = data;
  const riskConfig = RISK_BAND_CONFIGS[deterministic_output.risk_band];

  return (
    <Card className="border-[1.5px] border-[#D4DFE4]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#002B45] text-2xl mb-2">Financial Health Assessment</CardTitle>
            <div className="flex items-center gap-2">
              <img
                src="/clara-avatar.png"
                alt="Clara"
                className="w-5 h-5 rounded-full object-cover"
              />
              <CardDescription>Personalized analysis of your debt situation</CardDescription>
            </div>
          </div>
          <div className={`flex flex-col items-end gap-1 px-4 py-2 rounded-lg border ${getRiskBandColor(deterministic_output.risk_band)}`}>
            <div className="flex items-center gap-2">
              {getRiskIcon(deterministic_output.risk_band)}
              <span className="font-semibold">{riskConfig.label}</span>
            </div>
            <span className="text-xs opacity-75">Risk Level</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary with Emotional Normalization */}
        <div>
          <h4 className="font-semibold text-[#002B45] mb-2">Summary</h4>
          <p className="text-[#3A4F61]">
            {getEmotionalNormalization(userContext?.goal, userContext?.stress_level)}
            {personalized_ux.user_friendly_summary}
          </p>
        </div>

        {/* Debt Risk Breakdown - Stacked Risk Bar */}
        {deterministic_output.drivers && (
          <div>
            <h4 className="font-semibold text-[#002B45] mb-3">Your Debt Risk Breakdown</h4>
            <div className="space-y-3">
              {/* Visual Bar with Tooltip */}
              <div className="relative group">
                <div className="relative h-8 bg-gray-200 rounded-lg overflow-hidden flex cursor-help">
                  {(() => {
                    // Convert factors to actual scores based on their maximums
                    // Delinquency out of 50, High Interest out of 30, Complexity out of 20
                    const delinquencyScore = Math.round(deterministic_output.drivers.delinquency_factor * 50);
                    const highRateScore = Math.round(deterministic_output.drivers.high_rate_factor * 30);
                    const complexityScore = Math.round(deterministic_output.drivers.complexity_factor * 20);
                    
                    // Total risk score
                    const totalRiskScore = Math.round(deterministic_output.risk_score);
                    const usedScore = delinquencyScore + highRateScore + complexityScore;
                    const remainingScore = 100 - totalRiskScore;
                    
                    // Create components with icons from DRIVER_CONFIGS
                    const components = [
                      { name: 'Delinquency Risk', score: delinquencyScore, icon: '⏰', driver: 'delinquency', color: '', bgColor: '', textColor: '' },
                      { name: 'High Interest Debt', score: highRateScore, icon: '💰', driver: 'high_rate', color: '', bgColor: '', textColor: '' },
                      { name: 'Debt Complexity', score: complexityScore, icon: '📊', driver: 'complexity', color: '', bgColor: '', textColor: '' }
                    ].filter(c => c.score > 0).sort((a, b) => b.score - a.score);
                    
                    // Assign lighter orange shades based on size (darkest for largest, but lighter overall)
                    const orangeShades = ['bg-orange-600', 'bg-orange-400', 'bg-orange-200'];
                    const tailwindColors = ['#ea580c', '#fb923c', '#fed7aa']; // Lighter Tailwind colors
                    components.forEach((comp, idx) => {
                      comp.color = orangeShades[idx] || 'bg-orange-200';
                      comp.bgColor = tailwindColors[idx] || '#fed7aa';
                      comp.textColor = idx === 0 ? 'text-white' : 'text-gray-800';
                    });
                    
                    // Store for use in Key Risk Factors
                    (window as any).riskComponentColors = components.reduce((acc: any, comp) => {
                      acc[comp.driver] = comp.bgColor;
                      return acc;
                    }, {});
                    
                    return (
                      <>
                        {components.map((component, index) => (
                          <div
                            key={index}
                            className={`${component.color} flex items-center justify-center ${component.textColor} text-base font-medium px-2 transition-opacity hover:opacity-90`}
                            style={{ width: `${(component.score / 100) * 100}%` }}
                          >
                            {component.score > 3 && <span>{component.icon}</span>}
                          </div>
                        ))}
                        {/* Unshaded portion */}
                        {remainingScore > 0 && (
                          <div
                            className="bg-gray-200"
                            style={{ width: `${(remainingScore / 100) * 100}%` }}
                          />
                        )}
                      </>
                    );
                  })()}
                </div>
                
                {/* Hover Tooltip */}
                <div className="absolute left-0 right-0 -bottom-2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                    <div className="space-y-1">
                      {(() => {
                        const delinquencyScore = Math.round(deterministic_output.drivers.delinquency_factor * 50);
                        const highRateScore = Math.round(deterministic_output.drivers.high_rate_factor * 30);
                        const complexityScore = Math.round(deterministic_output.drivers.complexity_factor * 20);
                        const totalRiskScore = Math.round(deterministic_output.risk_score);
                        
                        const components = [
                          { name: 'Delinquency Risk', score: delinquencyScore, icon: '⏰' },
                          { name: 'High Interest Debt', score: highRateScore, icon: '💰' },
                          { name: 'Debt Complexity', score: complexityScore, icon: '📊' }
                        ].filter(c => c.score > 0);
                        
                        return (
                          <>
                            <div className="font-semibold mb-2">Debt Pressure Breakdown:</div>
                            {components.map((comp, idx) => (
                              <div key={idx} className="flex justify-between gap-4">
                                <span>{comp.icon} {comp.name}:</span>
                                <span className="font-medium">{comp.score} pts</span>
                              </div>
                            ))}
                            <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between gap-4 font-semibold">
                              <span>Total Risk Score:</span>
                              <span>{totalRiskScore}/100</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Drivers */}
        {financial_interpretation.key_drivers.length > 0 && (
          <div>
            <h4 className="font-semibold text-[#002B45] mb-3">Key Risk Factors</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(() => {
                // Get the color mapping from the chart
                const colorMap = (window as any).riskComponentColors || {};
                
                // Sort drivers by score (descending) to match chart order
                const delinquencyScore = Math.round(deterministic_output.drivers.delinquency_factor * 50);
                const highRateScore = Math.round(deterministic_output.drivers.high_rate_factor * 30);
                const complexityScore = Math.round(deterministic_output.drivers.complexity_factor * 20);
                
                const driverScores = {
                  'delinquency': delinquencyScore,
                  'high_rate': highRateScore,
                  'complexity': complexityScore
                };
                
                const sortedDrivers = deterministic_output.driver_severity
                  .filter(driver => driverScores[driver] > 0)
                  .sort((a, b) => driverScores[b] - driverScores[a]);
                
                return sortedDrivers.map((driver) => {
                  const driverConfig = DRIVER_CONFIGS[driver];
                  const bgColor = colorMap[driver] || '#fdba74';
                  const isLight = driver === 'complexity' && sortedDrivers.indexOf(driver) === sortedDrivers.length - 1;
                  
                  return (
                    <div
                      key={driver}
                      className="rounded-lg p-3 border"
                      style={{
                        backgroundColor: `${bgColor}20`,
                        borderColor: bgColor
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{driverConfig.icon}</span>
                        <span className="font-medium text-[#002B45] text-sm">{driverConfig.label}</span>
                      </div>
                      <p className="text-xs text-[#3A4F61]">{driverConfig.description}</p>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* AI-Generated Interpretation Points */}
        {personalized_ux.what_this_means && personalized_ux.what_this_means.length > 0 && (
          <div>
            <h4 className="font-semibold text-[#002B45] mb-2">What This Means</h4>
            <ul className="space-y-2">
              {personalized_ux.what_this_means.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-[#3A4F61]">
                  <span className="text-[#009A8C] mt-0.5 flex-shrink-0">•</span>
                  <span className="text-sm flex-1">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Primary CTA - See Personalized Plan */}
        <div className="flex flex-col items-center gap-2 py-4">
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

        {/* Have Questions Section - Moved here */}
        {profileId && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-between text-[#002B45] hover:bg-[#E7F7F4]"
              onClick={() => setShowQA(!showQA)}
            >
              <div className="flex items-center gap-2">
                <img
                  src="/clara-avatar.png"
                  alt="Clara"
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-medium">Have Questions?</span>
              </div>
              {showQA ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {showQA && (
              <div className="mt-4 space-y-4">
                {/* Suggested Questions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#4F6A7A]">Most people in your situation ask things like…</p>
                  <div className="flex flex-wrap gap-2">
                    {getSuggestedQuestions().map((suggested, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs border-[#D4DFE4] hover:border-[#009A8C] hover:bg-[#E7F7F4]"
                        onClick={() => handleAskQuestion(suggested)}
                        disabled={isAsking}
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        {suggested}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Q&A Response */}
                {qaResponse && (
                  <div className="bg-white rounded-lg p-4 border border-[#D4DFE4]">
                    <div className="flex items-start gap-2 mb-2">
                      <img
                        src="/clara-avatar.png"
                        alt="Clara"
                        className="w-4 h-4 rounded-full object-cover mt-0.5"
                      />
                      <span className="text-xs font-medium text-[#009A8C]">Clara's Answer:</span>
                    </div>
                    <p className="text-sm text-[#3A4F61] whitespace-pre-wrap">{qaResponse}</p>
                  </div>
                )}

                {/* Q&A Error */}
                {qaError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{qaError}</AlertDescription>
                  </Alert>
                )}

              </div>
            )}
          </div>
        )}

        {/* Recommendations with Actions - Now Collapsible */}
        {personalized_ux.personalized_recommendations.length > 0 && (
          <Collapsible open={showRecommendations} onOpenChange={setShowRecommendations}>
            <div className="border-t border-gray-200 pt-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-[#002B45] hover:bg-[#E7F7F4] p-0">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#009A8C]" />
                    <h4 className="font-semibold text-[#002B45]">Recommended Actions</h4>
                  </div>
                  {showRecommendations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-3 mt-3">
              {personalized_ux.personalized_recommendations
                .sort((a, b) => a.priority - b.priority)
                .map((rec, index) => {
                  const hasAction = rec.action_id && onActionClick;
                  return (
                    <div
                      key={index}
                      className={`bg-[#E7F7F4] rounded-lg p-4 border border-[#009A8C]/20 ${
                        hasAction ? 'cursor-pointer hover:bg-[#D5EDE9] hover:shadow-md transition-all' : ''
                      }`}
                      onClick={() => {
                        if (hasAction && rec.action_id) {
                          console.log('Clicking action:', rec.action_id);
                          onActionClick(rec.action_id);
                        }
                      }}
                      role={hasAction ? 'button' : undefined}
                      tabIndex={hasAction ? 0 : undefined}
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="bg-white text-[#009A8C] border-[#009A8C] shrink-0">
                          {rec.priority}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-[#002B45] font-medium mb-1">{rec.text}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs border-[#009A8C]/30 text-[#009A8C] bg-[#009A8C]/5">
                              {rec.category === 'cash_flow' && '💰 Cash Flow'}
                              {rec.category === 'stress_reduction' && '😌 Stress Reduction'}
                              {rec.category === 'delinquency' && '⚠️ Delinquency'}
                              {rec.category === 'interest_cost' && '📉 Interest Cost'}
                              {rec.category === 'complexity' && '🎯 Simplification'}
                            </Badge>
                            {hasAction && (
                              <Badge variant="secondary" className="text-xs bg-[#009A8C] text-white">
                                Click to explore →
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        {/* What I Took Into Account Section */}
        {userContext && (
          <Collapsible open={showAccountedFor} onOpenChange={setShowAccountedFor}>
            <div className="border-t border-gray-200 pt-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-[#002B45] hover:bg-[#E7F7F4] p-0">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#009A8C]" />
                    <h4 className="font-semibold text-[#002B45]">What I Took Into Account</h4>
                  </div>
                  {showAccountedFor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-[#3A4F61] mb-3">
                    To personalize your debt snapshot, I considered all information you provided:
                  </p>
                  <ul className="space-y-2 text-sm text-[#3A4F61]">
                    {userContext.monthly_income && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#009A8C] mt-0.5">•</span>
                        <span>Monthly income: ${userContext.monthly_income.toLocaleString()}</span>
                      </li>
                    )}
                    {userContext.monthly_expenses && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#009A8C] mt-0.5">•</span>
                        <span>Monthly expenses: ${userContext.monthly_expenses.toLocaleString()}</span>
                      </li>
                    )}
                    {userContext.liquid_savings !== undefined && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#009A8C] mt-0.5">•</span>
                        <span>Emergency savings: ${userContext.liquid_savings.toLocaleString()}</span>
                      </li>
                    )}
                    {userContext.goal && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#009A8C] mt-0.5">•</span>
                        <span>Primary goal: {userContext.goal.replace(/-/g, ' ')}</span>
                      </li>
                    )}
                    {userContext.stress_level && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#009A8C] mt-0.5">•</span>
                        <span>Stress level: {userContext.stress_level}/5</span>
                      </li>
                    )}
                    {userContext.age_range && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#009A8C] mt-0.5">•</span>
                        <span>Age range: {userContext.age_range}</span>
                      </li>
                    )}
                    {userContext.employment_status && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#009A8C] mt-0.5">•</span>
                        <span>Employment: {userContext.employment_status.replace(/-/g, ' ')}</span>
                      </li>
                    )}
                    {userContext.life_events && userContext.life_events.length > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#009A8C] mt-0.5">•</span>
                        <span>Life events: {userContext.life_events.join(', ')}</span>
                      </li>
                    )}
                    {context?.debt_count && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#009A8C] mt-0.5">•</span>
                        <span>Number of debts: {context.debt_count}</span>
                      </li>
                    )}
                    {context?.total_debt && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#009A8C] mt-0.5">•</span>
                        <span>Total debt: ${context.total_debt.toLocaleString()}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}