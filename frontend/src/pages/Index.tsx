import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Clock, Heart, DollarSign, ArrowRight, RefreshCw } from 'lucide-react';
import { ConversationalContainer } from '@/components/ConversationalContainer';
import { InlineDebtMapping } from '@/components/InlineDebtMapping';
import { useConversationalFlow } from '@/hooks/useConversationalFlow';
import { onboardingQuestions } from '@/lib/onboardingQuestions';
import { getUserId, setProfileId as setSessionProfileId } from '@/services/sessionManager';
import { createProfile } from '@/services/profileApi';
import { FinancialContext, AgeRange, EmploymentStatus, CreditScoreRange } from '@/types/debt';

// Define UI state type
type HomeUIState = 'idle' | 'transitioning' | 'conversation_active' | 'debt_mapping';

const Index = () => {
  const navigate = useNavigate();
  const {
    onboardingComplete,
    clearSession,
    journeyState,
    setJourneyState,
    setFinancialContext,
    setOnboardingComplete,
    setProfileId: setContextProfileId
  } = useDebt();
  const [uiState, setUiState] = useState<HomeUIState>('idle');
  
  // Conversational flow hook
  const {
    currentStep,
    currentQuestion,
    userAnswers,
    history,
    isComplete,
    isLoadingClara,
    handleAnswer,
    resetFlow
  } = useConversationalFlow();

  // Handle transition animation
  useEffect(() => {
    if (uiState === 'transitioning') {
      const timer = setTimeout(() => {
        setUiState('conversation_active');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [uiState]);

  // Check for existing session on mount
  useEffect(() => {
    const savedAnswers = sessionStorage.getItem('onboarding_answers');
    const savedStep = sessionStorage.getItem('onboarding_step');
    const savedTimestamp = sessionStorage.getItem('onboarding_timestamp');
    
    if (savedAnswers && savedStep && savedTimestamp) {
      const timestamp = parseInt(savedTimestamp, 10);
      const now = Date.now();
      const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - timestamp < SESSION_TIMEOUT_MS) {
        // Resume conversation
        setUiState('conversation_active');
      } else {
        // Clear expired session
        sessionStorage.removeItem('onboarding_answers');
        sessionStorage.removeItem('onboarding_step');
        sessionStorage.removeItem('onboarding_timestamp');
      }
    }
  }, []);

  const handleStartConversation = () => {
    if (onboardingComplete) {
      navigate('/debt-entry');
    } else {
      setJourneyState('debt_entry_started');
      setUiState('transitioning');
    }
  };
  
  // Get CTA configuration based on journey state
  const getCTAConfig = () => {
    switch (journeyState) {
      case 'new':
        return {
          text: 'Get my Debt Snapshot',
          subtext: null,
          action: handleStartConversation
        };
      case 'debt_entry_started':
        return {
          text: 'Continue mapping my debts',
          subtext: null,
          action: () => navigate('/debt-entry')
        };
      case 'snapshot_generated':
        return {
          text: 'See my plan',
          subtext: null,
          action: () => navigate('/dashboard')
        };
      default:
        return {
          text: 'Get my Debt Snapshot',
          subtext: null,
          action: handleStartConversation
        };
    }
  };
  
  const ctaConfig = getCTAConfig();

  const handleConversationComplete = async () => {
    try {
      const userId = getUserId();
      
      // Create profile with collected data
      const newProfile = await createProfile({
        user_id: userId,
        primary_goal: 'pay-faster' // Default goal, can be customized later
      });
      
      // Store profile ID in session and context
      setSessionProfileId(newProfile.id);
      setContextProfileId(newProfile.id);
      
      // Map collected data to financial context
      const context: FinancialContext = {
        ageRange: (userAnswers.ageRange || '25-34') as AgeRange,
        employmentStatus: (userAnswers.employmentStatus || 'full-time') as EmploymentStatus,
        monthlyIncome: userAnswers.monthlyIncome || 5000,
        monthlyExpenses: userAnswers.monthlyExpenses || 3000,
        liquidSavings: userAnswers.liquidSavings || 1000,
        creditScoreRange: (userAnswers.creditScore || '670-739') as CreditScoreRange,
        primaryGoal: 'pay-faster',
        stressLevel: (userAnswers.stressLevel || 3) as 1 | 2 | 3 | 4 | 5,
        lifeEvents: userAnswers.lifeEvents || []
      };
      
      setFinancialContext(context);
      setOnboardingComplete(true);
      
      // Wait 2 seconds before navigating to debt entry
      setTimeout(() => {
        navigate('/debt-entry');
      }, 2000);
    } catch (error) {
      console.error('Error creating profile:', error);
      // Still navigate even if profile creation fails
      setTimeout(() => {
        navigate('/debt-entry');
      }, 2000);
    }
  };

  const handleDebtMappingComplete = () => {
    // Navigate to dashboard after debt mapping is complete
    navigate('/dashboard');
  };

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? This will clear all your data.')) {
      clearSession();
      sessionStorage.removeItem('onboarding_answers');
      sessionStorage.removeItem('onboarding_step');
      sessionStorage.removeItem('onboarding_timestamp');
      setUiState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center py-5 md:py-6">
            <img src="/pathlight-logo.png" alt="PathLight" className="w-8 h-8 md:w-10 md:h-10 mr-2.5" />
            <h1 className="text-[20px] md:text-[24px] font-bold text-[#002B45] tracking-tight" style={{ letterSpacing: '-0.5%' }}>
              PathLight
            </h1>
          </div>
        </div>
      </header>

      {/* Home Content - remains fully visible and interactive */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-[650px] mx-auto text-center mb-6 md:mb-10">
          <h2 className="text-[26px] md:text-[40px] font-bold text-[#002B45] leading-[1.2] mb-3 md:mb-5">
            Your path out of debt — guided step by step by Clara
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#3A4F61] font-normal max-w-[620px] mx-auto leading-relaxed">
            Get a personalized debt snapshot in ~3 minutes with AI-powered, judgment-free guidance
          </p>
        </div>

        {/* Meet Clara Card - Only show for new users */}
        {journeyState === 'new' && (
          <Card className="max-w-2xl mx-auto mb-6 md:mb-8 border-l-4 border-[#009A8C] shadow-md">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <img
                  src="/clara-avatar.png"
                  alt="Clara"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0 object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold text-[#002B45] mb-1 md:mb-2">
                    Meet Clara, your AI Money Advisor
                  </h3>
                  <p className="text-xs md:text-sm text-[#3A4F61] leading-relaxed">
                    Clara helps you organize your debts, spot opportunities, and understand your options — judgment-free.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Primary CTA Section */}
        {!onboardingComplete && uiState === 'idle' && (
          <div className="max-w-3xl mx-auto text-center">
            <Button
              size="lg"
              onClick={ctaConfig.action}
              className="w-full md:w-auto md:min-w-[300px] mx-auto flex items-center justify-center bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold text-[16px] md:text-[18px] py-4 md:py-5 px-6 md:px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              {ctaConfig.text}
              <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
            
            {/* Subtext */}
            {ctaConfig.subtext && (
              <p className="text-sm text-[#4F6A7A] mt-3">
                {ctaConfig.subtext}
              </p>
            )}

            {/* Trust Bar - Updated messages */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8 max-w-2xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <Lock className="w-4 h-4 md:w-5 md:h-5 text-[#4F6A7A] mb-1 md:mb-2" strokeWidth={2} />
                <p className="text-[11px] md:text-[13px] text-[#4F6A7A] leading-snug">No PII required</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-[#4F6A7A] mb-1 md:mb-2" strokeWidth={2} />
                <p className="text-[11px] md:text-[13px] text-[#4F6A7A] leading-snug">Get powerful insights within minutes</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-[#4F6A7A] mb-1 md:mb-2" strokeWidth={2} />
                <p className="text-[11px] md:text-[13px] text-[#4F6A7A] leading-snug">Empathetic guidance</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-[#4F6A7A] mb-1 md:mb-2" strokeWidth={2} />
                <p className="text-[11px] md:text-[13px] text-[#4F6A7A] leading-snug">Discover ways to save money</p>
              </div>
            </div>
          </div>
        )}

        {/* Returning User Section */}
        {onboardingComplete && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-[#002B45] mb-4">
                Welcome back!
              </h2>
              <p className="text-[#3A4F61] text-lg mb-8">
                Continue where you left off or start fresh
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={ctaConfig.action}
                  className="bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold text-[18px] py-4 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  {ctaConfig.text}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleStartOver}
                  className="border-2 border-[#D4DFE4] text-[#002B45] hover:bg-gray-50 font-semibold text-[18px] py-4 px-8 rounded-xl transition-all duration-200"
                >
                  <RefreshCw className="mr-2 w-5 h-5" />
                  Start Over
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="bg-[#F7F9FA] py-16 md:py-24 mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#002B45] mb-4">
              How It Works
            </h2>
            <p className="text-center text-[#3A4F61] mb-12 text-lg">
              Your path to clarity in three simple steps
            </p>

            <div className="space-y-8">
              {[
                {
                  number: "1",
                  title: "Get your Debt Snapshot",
                  description: "Tell Clara about your debts, income, and expenses so she can guide you toward the best path forward."
                },
                {
                  number: "2",
                  title: "See Your Options",
                  description: "Clara recommends a personalized strategy based on your goals with clear timelines and projected savings. Create and compare other strategies."
                },
                {
                  number: "3",
                  title: "Take Action",
                  description: "Choose your path forward with confidence."
                }
              ].map(({ number, title, description }) => (
                <div key={number} className="flex gap-6 items-start">
                  <div className="w-14 h-14 bg-[#009A8C] text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md">
                    {number}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-[#002B45] mb-2">{title}</h3>
                    <p className="text-[#3A4F61]">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase Section */}
      <div className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#002B45] mb-4">
              See PathLight in Action
            </h2>
            <p className="text-center text-[#3A4F61] mb-16 text-lg max-w-2xl mx-auto">
              Get a clear view of your debt situation with powerful visualizations and personalized strategies
            </p>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Feature 1: Dashboard Overview */}
              <div className="space-y-4">
               <div className="rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
  <img 
    src="/dashboard-screenshot.png" 
    alt="PathLight Dashboard showing complete debt overview with metrics and charts"
    className="w-full h-auto object-contain aspect-video"
  />
</div>
                <div>
                  <h3 className="text-xl font-semibold text-[#002B45] mb-2">
                    Complete Debt Overview
                  </h3>
                  <p className="text-[#3A4F61]">
                    See all your debts in one place with Clara helping you understand your current financial situation.
                  </p>
                </div>
              </div>

              {/* Feature 2: Scenario Analysis */}
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
  <img 
    src="/scenarios-screenshot.png" 
    alt="PathLight Scenarios page comparing payoff strategies"
    className="w-full h-auto object-contain aspect-video bg-gray-50"
  />
</div>
                <div>
                  <h3 className="text-xl font-semibold text-[#002B45] mb-2">
                    Compare Payoff Strategies
                  </h3>
                  <p className="text-[#3A4F61]">
                    Visualize different approaches — Snowball, Avalanche, or Hybrid — and see which saves you the most time and money.
                  </p>
                </div>
              </div>

              {/* Feature 3: Financial Assessment */}
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
  <img 
    src="/assessment-screenshot.png" 
    alt="PathLight Financial Assessment with personalized insights"
    className="w-full h-auto object-contain aspect-video bg-gray-50"
  />
</div>
                <div>
                  <h3 className="text-xl font-semibold text-[#002B45] mb-2">
                    Personalized Insights
                  </h3>
                  <p className="text-[#3A4F61]">
                    Receive AI-powered, Clara-guided recommendations tailored to your unique financial goals.
                  </p>
                </div>
              </div>

              {/* Feature 4: Payoff Timeline */}
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
                  <img
                    src="/timeline-screenshot.png"
                    alt="PathLight Payoff Timeline visualization"
                    className="w-full h-auto object-contain aspect-video bg-gray-50"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#002B45] mb-2">
                    Visualize Your Payoff Timeline
                  </h3>
                  <p className="text-[#3A4F61]">
                    See exactly when you'll be debt-free with interactive charts comparing payoff strategies and event markers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-[#002B45] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to find your Path?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Reduce stress, gain clarity, and discover your personalized path to becoming debt-free.
            </p>
            <Button
              size="lg"
              onClick={ctaConfig.action}
              className="bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold text-[18px] py-4 px-12 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]"
            >
              Get my Debt Snapshot
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conversational Container - inline, pushes content down */}
      {(uiState === 'transitioning' || uiState === 'conversation_active') && (
        <div
          role="region"
          aria-label="Clara guiding you"
          className={`container mx-auto px-4 transition-all duration-300 ease-in-out ${
            uiState === 'conversation_active'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4'
          }`}
        >
          <ConversationalContainer
            currentQuestion={currentQuestion}
            history={history}
            isComplete={isComplete}
            isLoadingClara={isLoadingClara}
            currentStep={currentStep}
            totalSteps={onboardingQuestions.length}
            userAnswers={userAnswers}
            onAnswer={handleAnswer}
            onComplete={handleConversationComplete}
          />
        </div>
      )}

      {/* Debt Mapping Container - inline, appears after onboarding */}
      {uiState === 'debt_mapping' && (
        <div
          role="region"
          aria-label="Debt mapping with Clara"
          className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="max-w-3xl mx-auto">
            <InlineDebtMapping onComplete={handleDebtMappingComplete} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;