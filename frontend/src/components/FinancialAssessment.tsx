import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle, CheckCircle, Info, MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { FinancialAssessmentResult, RISK_BAND_CONFIGS, DRIVER_CONFIGS, RiskBand } from '@/types/financialAssessment';
import { askClara } from '@/services/claraAiApi';

interface FinancialAssessmentProps {
  data: FinancialAssessmentResult | null;
  loading: boolean;
  error: { detail: string } | null;
  profileId?: string;
  context?: Record<string, any>;
  onActionClick?: (actionId: string) => void;
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

export function FinancialAssessment({ data, loading, error, profileId, context, onActionClick }: FinancialAssessmentProps) {
  const [showQA, setShowQA] = useState(false);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [qaResponse, setQaResponse] = useState<string | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);

  // Suggested questions based on risk band and drivers
  const getSuggestedQuestions = () => {
    if (!data) return [];
    
    const questions: string[] = [];
    const { risk_band, primary_driver } = data.deterministic_output;
    
    // Add questions based on primary driver
    if (primary_driver === 'high_rate') {
      questions.push('Should I focus on paying off my highest interest debt first?');
      questions.push('How much could I save by refinancing or consolidating?');
    } else if (primary_driver === 'delinquency') {
      questions.push('What should I do about my delinquent accounts?');
      questions.push('How can I get back on track with my payments?');
    } else if (primary_driver === 'complexity') {
      questions.push('Would debt consolidation help simplify my situation?');
      questions.push('How do I prioritize which debts to pay first?');
    }
    
    // Add general questions based on risk band
    if (risk_band === 'critical' || risk_band === 'high') {
      questions.push('What are my options if I can\'t afford my minimum payments?');
    } else {
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
      const response = await askClara({
        profile_id: profileId,
        question: questionText,
        context: context || {}
      });
      
      setQaResponse(response.response.answer);
      setQuestion('');
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
            <CardDescription>Personalized analysis of your debt situation</CardDescription>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getRiskBandColor(deterministic_output.risk_band)}`}>
            {getRiskIcon(deterministic_output.risk_band)}
            <span className="font-semibold">{riskConfig.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#3A4F61]">Risk Score</span>
            <span className="text-2xl font-bold text-[#002B45]">{deterministic_output.risk_score.toFixed(1)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                deterministic_output.risk_score < 30 ? 'bg-green-500' :
                deterministic_output.risk_score < 50 ? 'bg-blue-500' :
                deterministic_output.risk_score < 70 ? 'bg-yellow-500' :
                deterministic_output.risk_score < 85 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${deterministic_output.risk_score}%` }}
            />
          </div>
          <p className="text-xs text-[#3A4F61] mt-2">{riskConfig.description}</p>
        </div>

        {/* Summary */}
        <div>
          <h4 className="font-semibold text-[#002B45] mb-2">Summary</h4>
          <p className="text-[#3A4F61]">{personalized_ux.user_friendly_summary}</p>
        </div>

        {/* Key Drivers */}
        {financial_interpretation.key_drivers.length > 0 && (
          <div>
            <h4 className="font-semibold text-[#002B45] mb-3">Key Risk Factors</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {deterministic_output.driver_severity.map((driver) => {
                const driverConfig = DRIVER_CONFIGS[driver];
                return (
                  <div key={driver} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{driverConfig.icon}</span>
                      <span className="font-medium text-[#002B45] text-sm">{driverConfig.label}</span>
                    </div>
                    <p className="text-xs text-[#3A4F61]">{driverConfig.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Interpretation Points */}
        {financial_interpretation.interpretation_points.length > 0 && (
          <div>
            <h4 className="font-semibold text-[#002B45] mb-2">What This Means</h4>
            <ul className="space-y-2">
              {financial_interpretation.interpretation_points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-[#3A4F61]">
                  <span className="text-[#009A8C] mt-1">•</span>
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations with Actions */}
        {personalized_ux.personalized_recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-[#002B45] mb-3">Recommended Actions</h4>
            <div className="space-y-3">
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
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-[#3A4F61] capitalize">{rec.category.replace('_', ' ')}</p>
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
          </div>
        )}

        {/* Closing Message */}
        {personalized_ux.closing_message && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-[#002B45]">{personalized_ux.closing_message}</p>
          </div>
        )}

        {/* Ask Clara Section */}
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
                <span className="font-medium">Have questions? Ask Clara</span>
              </div>
              {showQA ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {showQA && (
              <div className="mt-4 space-y-4">
                {/* Suggested Questions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#4F6A7A]">Suggested questions:</p>
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

                {/* Ask Input */}
                <div className="flex gap-2">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAskQuestion(question);
                      }
                    }}
                    placeholder="Ask Clara a question..."
                    disabled={isAsking}
                    className="flex-1 border-[#D4DFE4]"
                  />
                  <Button
                    onClick={() => handleAskQuestion(question)}
                    disabled={!question.trim() || isAsking}
                    className="bg-[#009A8C] hover:bg-[#007F74]"
                  >
                    {isAsking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <p className="text-xs text-[#4F6A7A] text-center">
                  Clara provides educational information based on your debt profile.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-[#3A4F61] pt-4 border-t border-gray-200">
          <p>Assessment generated: {new Date(data.generated_at).toLocaleString()}</p>
          <p>Version: {data.assessment_version}</p>
        </div>
      </CardContent>
    </Card>
  );
}