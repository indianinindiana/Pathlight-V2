import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditScoreRange, RepaymentGoal } from '@/types/debt';
import { ArrowRight, ArrowLeft, DollarSign, Target, TrendingUp } from 'lucide-react';

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { setFinancialContext, setHasCompletedOnboarding } = useDebt();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    zipCode: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    liquidSavings: '',
    creditScoreRange: '' as CreditScoreRange,
    primaryGoal: '' as RepaymentGoal,
    timeHorizon: '36',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.zipCode.trim() || !/^\d{5}$/.test(formData.zipCode)) {
        newErrors.zipCode = 'Valid 5-digit ZIP code required';
      }
    }

    if (currentStep === 2) {
      const income = parseFloat(formData.monthlyIncome);
      const expenses = parseFloat(formData.monthlyExpenses);
      
      if (!formData.monthlyIncome || income <= 0) {
        newErrors.monthlyIncome = 'Monthly income must be greater than 0';
      }
      if (!formData.monthlyExpenses || expenses < 0) {
        newErrors.monthlyExpenses = 'Monthly expenses must be 0 or greater';
      }
      if (income > 0 && expenses > income) {
        newErrors.monthlyExpenses = 'Expenses cannot exceed income';
      }
      if (!formData.liquidSavings || parseFloat(formData.liquidSavings) < 0) {
        newErrors.liquidSavings = 'Savings must be 0 or greater';
      }
    }

    if (currentStep === 3) {
      if (!formData.creditScoreRange) {
        newErrors.creditScoreRange = 'Please select your credit score range';
      }
      if (!formData.primaryGoal) {
        newErrors.primaryGoal = 'Please select your primary goal';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    setFinancialContext({
      name: formData.name,
      zipCode: formData.zipCode,
      monthlyIncome: parseFloat(formData.monthlyIncome),
      monthlyExpenses: parseFloat(formData.monthlyExpenses),
      liquidSavings: parseFloat(formData.liquidSavings),
      creditScoreRange: formData.creditScoreRange,
      primaryGoal: formData.primaryGoal,
      timeHorizon: parseInt(formData.timeHorizon),
    });
    setHasCompletedOnboarding(true);
    navigate('/debt-entry');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="12345"
                maxLength={5}
                className={errors.zipCode ? 'border-red-500' : ''}
              />
              {errors.zipCode && <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="monthlyIncome">Monthly Take-Home Income</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  placeholder="5000"
                  className={`pl-9 ${errors.monthlyIncome ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.monthlyIncome && <p className="text-sm text-red-500 mt-1">{errors.monthlyIncome}</p>}
            </div>
            <div>
              <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="monthlyExpenses"
                  type="number"
                  value={formData.monthlyExpenses}
                  onChange={(e) => setFormData({ ...formData, monthlyExpenses: e.target.value })}
                  placeholder="3000"
                  className={`pl-9 ${errors.monthlyExpenses ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.monthlyExpenses && <p className="text-sm text-red-500 mt-1">{errors.monthlyExpenses}</p>}
            </div>
            <div>
              <Label htmlFor="liquidSavings">Liquid Savings</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="liquidSavings"
                  type="number"
                  value={formData.liquidSavings}
                  onChange={(e) => setFormData({ ...formData, liquidSavings: e.target.value })}
                  placeholder="1000"
                  className={`pl-9 ${errors.liquidSavings ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.liquidSavings && <p className="text-sm text-red-500 mt-1">{errors.liquidSavings}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="creditScoreRange">Credit Score Range</Label>
              <Select
                value={formData.creditScoreRange}
                onValueChange={(value) => setFormData({ ...formData, creditScoreRange: value as CreditScoreRange })}
              >
                <SelectTrigger className={errors.creditScoreRange ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your credit score range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor (300-579)</SelectItem>
                  <SelectItem value="fair">Fair (580-669)</SelectItem>
                  <SelectItem value="good">Good (670-739)</SelectItem>
                  <SelectItem value="very_good">Very Good (740-799)</SelectItem>
                  <SelectItem value="excellent">Excellent (800-850)</SelectItem>
                </SelectContent>
              </Select>
              {errors.creditScoreRange && <p className="text-sm text-red-500 mt-1">{errors.creditScoreRange}</p>}
            </div>
            <div>
              <Label htmlFor="primaryGoal">Primary Repayment Goal</Label>
              <Select
                value={formData.primaryGoal}
                onValueChange={(value) => setFormData({ ...formData, primaryGoal: value as RepaymentGoal })}
              >
                <SelectTrigger className={errors.primaryGoal ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your primary goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lower_payment">Lower My Monthly Payment</SelectItem>
                  <SelectItem value="pay_off_faster">Pay Off Debt Faster</SelectItem>
                  <SelectItem value="reduce_interest">Reduce Total Interest</SelectItem>
                  <SelectItem value="avoid_default">Avoid Default</SelectItem>
                </SelectContent>
              </Select>
              {errors.primaryGoal && <p className="text-sm text-red-500 mt-1">{errors.primaryGoal}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                How Debt PathFinder Works
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• <strong>Enter Your Debts:</strong> Add each debt manually or upload a CSV file</li>
                <li>• <strong>See Your Options:</strong> View different payoff strategies (Snowball, Avalanche)</li>
                <li>• <strong>Explore "What If?":</strong> Test scenarios like paying extra or consolidating</li>
                <li>• <strong>Get AI Guidance:</strong> Click "Explain This" anytime for clear explanations</li>
                <li>• <strong>Receive Recommendations:</strong> See personalized product options based on your situation</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Your Privacy
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                All your data stays in your browser. Nothing is saved to our servers. 
                You can clear your session anytime.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Welcome to Debt PathFinder';
      case 2: return 'Your Financial Situation';
      case 3: return 'Your Goals';
      case 4: return 'Ready to Get Started';
      default: return '';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "Let's start with some basic information";
      case 2: return 'Help us understand your monthly finances';
      case 3: return 'What matters most to you?';
      case 4: return "Here's what to expect";
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-16 rounded-full transition-colors ${
                    s <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">Step {step} of 4</span>
          </div>
          <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
          <CardDescription>{getStepDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext}>
              {step === 4 ? 'Get Started' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;