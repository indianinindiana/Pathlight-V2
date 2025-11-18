import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, Target, Lightbulb, BarChart3, ArrowRight, RefreshCw } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { onboardingComplete, clearSession } = useDebt();

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  const handleContinue = () => {
    navigate('/debt-entry');
  };

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? This will clear all your data.')) {
      clearSession();
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Debt <span className="text-blue-600">PathFinder</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Understand, model, and optimize your debt repayment strategy with AI-powered guidance
          </p>
          
          {onboardingComplete ? (
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={handleContinue} className="text-lg px-8">
                Continue Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleStartOver}>
                <RefreshCw className="mr-2 w-5 h-5" />
                Start Over
              </Button>
            </div>
          ) : (
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Pain Points Solved */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Clear Starting Point</h3>
              <p className="text-gray-600 text-sm">
                Instant debt snapshot with AI summary. No more feeling overwhelmed about where to begin.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Goal-Aligned Strategy</h3>
              <p className="text-gray-600 text-sm">
                Compare Snowball vs. Avalanche strategies. See which approach best fits your goals.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Transparent Insights</h3>
              <p className="text-gray-600 text-sm">
                AI explanations for every number. Understand exactly how your payoff plan works.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Scenario Exploration</h3>
              <p className="text-gray-600 text-sm">
                Test "What If?" scenarios. See the impact of paying extra, consolidating, or settling.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Share Your Financial Context</h3>
                <p className="text-gray-600">
                  Tell us about your income, expenses, savings, and goals. This takes just 2 minutes and helps us personalize your experience.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Enter Your Debts</h3>
                <p className="text-gray-600">
                  Add your debts manually or upload a CSV file. We'll validate the information and help you catch any errors.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">See Your Debt Picture</h3>
                <p className="text-gray-600">
                  View visual breakdowns of your debt composition, interest costs, and key metrics like utilization and debt-to-income ratio.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Compare Payoff Strategies</h3>
                <p className="text-gray-600">
                  See side-by-side comparisons of Snowball (smallest balance first) vs. Avalanche (highest interest first) strategies.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Explore "What If?" Scenarios</h3>
                <p className="text-gray-600">
                  Test different approaches: paying extra each month, consolidating debts, exploring settlement options, or balance transfers.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                6
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Get Your Action Plan</h3>
                <p className="text-gray-600">
                  Receive a personalized summary with clear next steps. Export your plan as a PDF for future reference.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 border-0">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to take control of your debt?
              </h2>
              <p className="text-blue-100 mb-6 text-lg">
                Join thousands who've found their path to financial freedom
              </p>
              {onboardingComplete ? (
                <Button size="lg" variant="secondary" onClick={handleContinue} className="text-lg px-8">
                  Continue Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-lg px-8">
                  Start Your Free Analysis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;