import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { Zap, Calendar, Percent, Shield, Lock, Clock, Heart, DollarSign, ArrowRight, RefreshCw, Check, Compass } from 'lucide-react';
import { PayoffGoal } from '@/types/debt';

const Index = () => {
  const navigate = useNavigate();
  const { onboardingComplete, clearSession } = useDebt();
  const [selectedGoal, setSelectedGoal] = useState<PayoffGoal | null>(null);

  const goals = [
    { 
      value: 'pay-faster' as PayoffGoal, 
      label: 'Pay off debt faster', 
      icon: Zap,
      description: 'Get debt-free as quickly as possible'
    },
    { 
      value: 'lower-payment' as PayoffGoal, 
      label: 'Reduce my monthly payment', 
      icon: Calendar,
      description: 'Lower your monthly obligations'
    },
    { 
      value: 'reduce-interest' as PayoffGoal, 
      label: 'Reduce my interest', 
      icon: Percent,
      description: 'Save money on interest charges'
    },
    { 
      value: 'avoid-default' as PayoffGoal, 
      label: 'Avoid falling behind', 
      icon: Shield,
      description: 'Stay current and protect your credit'
    }
  ];

  const handleContinue = () => {
    if (onboardingComplete) {
      navigate('/debt-entry');
    } else {
      navigate('/onboarding', { state: { selectedGoal } });
    }
  };

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? This will clear all your data.')) {
      clearSession();
      setSelectedGoal(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center py-5 md:py-6">
            <Compass className="w-6 h-6 md:w-7 md:h-7 text-[#009A8C] mr-2.5" strokeWidth={2.5} />
            <h1 className="text-[20px] md:text-[24px] font-bold text-[#002B45] tracking-tight" style={{ letterSpacing: '-0.5%' }}>
              Debt PathFinder
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-[650px] mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-[28px] md:text-[44px] font-bold text-[#002B45] leading-[1.2] mb-4 md:mb-6">
            See your clearest path out of debt.
          </h2>
          <p className="text-[18px] md:text-[20px] text-[#3A4F61] font-normal max-w-[620px] mx-auto leading-relaxed">
            Get your instant debt snapshot with AI-powered personalized guidance
          </p>
        </div>

        {/* Goal Selection Section */}
        {!onboardingComplete && (
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-[18px] font-semibold text-[#002B45] mb-8">
              Pick your goal - let's make a plan you'll feel great about.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {goals.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  onClick={() => setSelectedGoal(value)}
                  className={`relative p-6 md:p-7 rounded-xl border-[1.5px] transition-all duration-200 text-left group ${
                    selectedGoal === value
                      ? 'border-[#009A8C] bg-[#E7F7F4] shadow-sm'
                      : 'border-[#D4DFE4] bg-white hover:border-[#009A8C] hover:shadow-sm hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg transition-colors ${
                      selectedGoal === value
                        ? 'bg-[#009A8C]/10'
                        : 'bg-[#F7F9FA]'
                    }`}>
                      <Icon className="w-5 h-5 text-[#009A8C]" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[16px] text-[#002B45]">{label}</h3>
                        {selectedGoal === value && (
                          <Check className="w-5 h-5 text-[#009A8C]" strokeWidth={2.5} />
                        )}
                      </div>
                      <p className="text-[14px] text-[#3A4F61] leading-relaxed">{description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!selectedGoal}
              className="w-full md:w-auto md:min-w-[320px] mx-auto flex items-center justify-center bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold text-[18px] py-5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#009A8C] disabled:hover:shadow-md hover:scale-[1.02]"
            >
              Show me my path forward
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            {/* Trust Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-2xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <Lock className="w-5 h-5 text-[#4F6A7A] mb-2" strokeWidth={2} />
                <p className="text-[14px] text-[#4F6A7A] leading-snug">No PII, no risk</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Clock className="w-5 h-5 text-[#4F6A7A] mb-2" strokeWidth={2} />
                <p className="text-[14px] text-[#4F6A7A] leading-snug">Takes a few minutes</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Heart className="w-5 h-5 text-[#4F6A7A] mb-2" strokeWidth={2} />
                <p className="text-[14px] text-[#4F6A7A] leading-snug">Judgment-free guidance</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <DollarSign className="w-5 h-5 text-[#4F6A7A] mb-2" strokeWidth={2} />
                <p className="text-[14px] text-[#4F6A7A] leading-snug">Save money - right away</p>
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
                  onClick={handleContinue}
                  className="bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold text-[18px] py-4 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  Continue Your Journey
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
                  title: "Share Your Situation",
                  description: "Tell us about your debts, income, and expenses so that we can guide you towards the best path forward."
                },
                {
                  number: "2",
                  title: "See Your Options",
                  description: "Get personalized payoff strategies with clear timelines and savings projections."
                },
                {
                  number: "3",
                  title: "Take Action",
                  description: "Choose your path forward with confidence. Export your plan anytime."
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

      {/* Final CTA Section */}
      <div className="bg-[#002B45] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to find your path?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands who've taken control of their debt journey
            </p>
            <Button
              size="lg"
              onClick={handleContinue}
              className="bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold text-[18px] py-4 px-12 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]"
            >
              {onboardingComplete ? 'Continue Your Journey' : 'Get Started Now'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-white/60 text-sm mt-6">
              Reduce stress, gain clarity and discover the best path to becoming debt-free
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;