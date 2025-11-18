import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, Calendar, Percent, Shield, Lock, Clock, Check, Heart, ArrowRight, RefreshCw } from 'lucide-react';
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
      navigate('/onboarding');
    }
  };

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? This will clear all your data.')) {
      clearSession();
      setSelectedGoal(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-teal">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Finally, a debt plan<br />that makes sense.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light">
              No jargon. No stress. Just clarity.
            </p>
            <p className="text-lg text-white/80 mt-4 max-w-2xl mx-auto">
              Get your instant debt snapshot with AI-powered personalized guidance.
            </p>
          </div>

          {/* Goal Selector Card */}
          {!onboardingComplete && (
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-8 md:p-12 mb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-navy mb-3">
                  What matters most to you?
                </h2>
                <p className="text-gray-600">
                  Choose your primary goal to get started
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {goals.map(({ value, label, icon: Icon, description }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedGoal(value)}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-200 text-left group hover:scale-[1.02] ${
                      selectedGoal === value
                        ? 'border-teal bg-teal/5 shadow-lg'
                        : 'border-gray-200 hover:border-teal/50 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl transition-colors ${
                        selectedGoal === value
                          ? 'bg-teal text-white'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-teal/10 group-hover:text-teal'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-navy text-lg">{label}</h3>
                          {selectedGoal === value && (
                            <Check className="w-5 h-5 text-teal" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!selectedGoal}
                className="w-full bg-teal hover:bg-teal-dark text-white font-semibold py-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Show me my path forward
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              {/* Trust Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-col items-center text-center">
                  <Lock className="w-5 h-5 text-teal mb-2" />
                  <p className="text-xs text-gray-600">Private & secure</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Clock className="w-5 h-5 text-teal mb-2" />
                  <p className="text-xs text-gray-600">Takes 2 minutes</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Check className="w-5 h-5 text-teal mb-2" />
                  <p className="text-xs text-gray-600">No credit impact</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Heart className="w-5 h-5 text-teal mb-2" />
                  <p className="text-xs text-gray-600">Judgment-free</p>
                </div>
              </div>
            </Card>
          )}

          {/* Returning User Card */}
          {onboardingComplete && (
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-8 md:p-12 mb-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-semibold text-navy mb-4">
                  Welcome back!
                </h2>
                <p className="text-gray-600 mb-8">
                  Continue where you left off or start fresh
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={handleContinue}
                    className="bg-teal hover:bg-teal-dark text-white font-semibold py-6 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Continue Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleStartOver}
                    className="border-2 border-white/50 text-white hover:bg-white/10 font-semibold py-6 px-8 rounded-xl text-lg"
                  >
                    <RefreshCw className="mr-2 w-5 h-5" />
                    Start Over
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              "Finally helped me make sense of my debt.",
              "Clear, simple, and stress-free.",
              "I wish I found this sooner."
            ].map((quote, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 p-6 rounded-2xl">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-white/90 text-sm italic">"{quote}"</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-[#F7F9FA] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-navy mb-4">
              How It Works
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Your path to clarity in three simple steps
            </p>

            <div className="space-y-8">
              {[
                {
                  number: "1",
                  title: "Share Your Situation",
                  description: "Tell us about your debts, income, and goals. Takes just 2 minutes."
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
                  <div className="w-14 h-14 bg-teal text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg">
                    {number}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-navy mb-2">{title}</h3>
                    <p className="text-gray-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-navy py-16 md:py-24">
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
              className="bg-teal hover:bg-teal-dark text-white font-semibold py-6 px-12 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              {onboardingComplete ? 'Continue Your Journey' : 'Get Started Free'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-white/60 text-sm mt-6">
              No credit card required • Takes 2 minutes • 100% free
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;