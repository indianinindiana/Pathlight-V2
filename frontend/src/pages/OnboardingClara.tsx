import { useNavigate, useLocation } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { getUserId, getProfileId, setProfileId } from '@/services/sessionManager';
import { createProfile } from '@/services/profileApi';
import { PayoffGoal, FinancialContext, AgeRange, EmploymentStatus, CreditScoreRange } from '@/types/debt';
import { ConversationalPageLayout } from '@/components/onboarding/ConversationalPageLayout';
import { useConversationalFlow } from '@/hooks/useConversationalFlow';
import { QuestionMultipleChoice } from '@/components/onboarding/QuestionMultipleChoice';
import { QuestionSlider } from '@/components/onboarding/QuestionSlider';
import { QuestionNumber } from '@/components/onboarding/QuestionNumber';
import { QuestionOptionalMultipleChoice } from '@/components/onboarding/QuestionOptionalMultipleChoice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const OnboardingClara = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setFinancialContext, setOnboardingComplete, setProfileId: setContextProfileId } = useDebt();
  
  const selectedGoal = (location.state as any)?.selectedGoal as PayoffGoal || 'pay-faster';

  const {
    currentStep,
    currentQuestion,
    userAnswers,
    history,
    isComplete,
    isLoadingClara,
    handleAnswer,
    handleBack,
    canGoBack
  } = useConversationalFlow();

  // Handle completion
  const handleComplete = async () => {
    try {
      const userId = getUserId();
      let currentProfileId = getProfileId();
      
      // Create profile if needed
      if (!currentProfileId) {
        const newProfile = await createProfile({
          user_id: userId,
          primary_goal: selectedGoal
        });
        currentProfileId = newProfile.id;
        setProfileId(currentProfileId);
        setContextProfileId(currentProfileId);
      }

      // Map collected data to financial context
      const context: FinancialContext = {
        ageRange: (userAnswers.ageRange || '25-34') as AgeRange,
        employmentStatus: (userAnswers.employmentStatus || 'full-time') as EmploymentStatus,
        monthlyIncome: userAnswers.monthlyIncome || 5000,
        monthlyExpenses: userAnswers.monthlyExpenses || 3000,
        liquidSavings: userAnswers.liquidSavings || 1000,
        creditScoreRange: (userAnswers.creditScore || '670-739') as CreditScoreRange,
        primaryGoal: selectedGoal,
        stressLevel: (userAnswers.stressLevel || 3) as 1 | 2 | 3 | 4 | 5,
        lifeEvents: userAnswers.lifeEvents || []
      };

      setFinancialContext(context);
      setOnboardingComplete(true);
      navigate('/debt-entry');
    } catch (err) {
      console.error('Error completing onboarding:', err);
    }
  };

  // Render question based on type
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const handleQuestionAnswer = (answer: any) => {
      handleAnswer(currentQuestion.id, answer);
    };

    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <QuestionMultipleChoice
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
          />
        );
      
      case 'slider':
        return (
          <QuestionSlider
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
          />
        );
      
      case 'number':
        return (
          <QuestionNumber
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
          />
        );
      
      case 'optional-multiple-choice':
        return (
          <QuestionOptionalMultipleChoice
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
          />
        );
      
      default:
        return null;
    }
  };

  // Render answered question in history
  const renderHistoryItem = (item: any, index: number) => {
    const { question, answer, claraMessage } = item;
    
    let displayAnswer = '';
    
    if (question.type === 'multiple-choice') {
      const option = question.options?.find((opt: any) => opt.value === answer);
      displayAnswer = option?.label || answer;
    } else if (question.type === 'slider') {
      displayAnswer = question.sliderConfig?.labels[answer - question.sliderConfig.min] || answer;
    } else if (question.type === 'number') {
      displayAnswer = `$${answer.toLocaleString()}`;
    } else if (question.type === 'optional-multiple-choice') {
      if (Array.isArray(answer) && answer.length > 0) {
        const labels = answer.map((val: string) => {
          const option = question.options?.find((opt: any) => opt.value === val);
          return option?.label || val;
        });
        displayAnswer = labels.join(', ');
      } else {
        displayAnswer = 'Skipped';
      }
    }

    return (
      <div key={index} className="space-y-4">
        {/* User's answer - right-aligned with checkmark */}
        <div className="flex justify-end">
          <Card className="border-2 border-[#D4DFE4] hover:border-[#009A8C] transition-colors max-w-[85%]">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-1">
                  <p className="text-[14px] text-[#4F6A7A]">{question.label}</p>
                  <p className="text-[16px] font-medium text-[#002B45]">{displayAnswer}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#009A8C] mt-1 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Clara's empathetic reaction - left-aligned with avatar and fade-in */}
        {claraMessage && (
          <div className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300 max-w-[85%]">
            <img
              src="/clara-avatar.png"
              alt="Clara"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 bg-[#E7F7F4] rounded-lg p-4">
              <p className="text-[14px] text-[#3A4F61] whitespace-pre-wrap break-words">{claraMessage}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <ConversationalPageLayout>
      {/* Introduction */}
      {currentStep === 0 && (
        <div className="text-center mb-8">
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#002B45] mb-3">
            Let's Get to Know You
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#3A4F61]">
            Clara will ask you a few quick questions to personalize your experience
          </p>
        </div>
      )}

      {/* History of answered questions */}
      {history.map((item, index) => renderHistoryItem(item, index))}

      {/* Current question */}
      {!isComplete && currentQuestion && (
        <div className="space-y-4">
          {!isLoadingClara ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {renderQuestion()}
            </div>
          ) : (
            <Card className="border-2 border-[#009A8C] bg-[#E7F7F4]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/clara-avatar.png"
                    alt="Clara"
                    className="w-8 h-8 rounded-full animate-pulse"
                  />
                  <div className="flex-1">
                    <p className="text-[14px] text-[#3A4F61] italic">Clara is thinking...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Back button */}
          {canGoBack && !isLoadingClara && (
            <div className="flex justify-start">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-[#4F6A7A] hover:text-[#002B45]"
              >
                ← Go Back
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Completion state */}
      {isComplete && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Clara's final message */}
          <div className="flex items-start gap-3 max-w-[85%]">
            <img
              src="/clara-avatar.png"
              alt="Clara"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 bg-[#E7F7F4] rounded-lg p-4">
              <p className="text-[14px] text-[#3A4F61] whitespace-pre-wrap break-words">
                Thanks for sharing all that. I'm excited to help you from here.
              </p>
              <p className="text-[12px] text-[#4F6A7A] mt-2 italic">— Clara</p>
            </div>
          </div>
          
          {/* Completion card */}
          <Card className="border-2 border-[#009A8C] bg-[#E7F7F4]">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-[#009A8C]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[24px] font-bold text-[#002B45]">
                  All Set!
                </h3>
                <p className="text-[16px] text-[#3A4F61]">
                  Let's start building your personalized debt payoff plan.
                </p>
              </div>
              <Button
                className="bg-[#009A8C] hover:bg-[#007F74] text-white py-6 px-8 text-[16px]"
                onClick={handleComplete}
              >
                Continue to Debt Entry
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress indicator */}
      {!isComplete && (
        <div className="mt-8 text-center">
          <p className="text-sm text-[#4F6A7A]">
            Question {currentStep + 1} of 9
          </p>
          <div className="mt-2 w-full max-w-xs mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#009A8C] transition-all duration-300"
              style={{ width: `${((currentStep + 1) / 9) * 100}%` }}
            />
          </div>
        </div>
      )}
    </ConversationalPageLayout>
  );
};

export default OnboardingClara;