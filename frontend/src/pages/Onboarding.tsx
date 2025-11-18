import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CreditScoreRange, PayoffGoal, FinancialContext } from '@/types/debt';
import { ArrowRight, DollarSign, Target, TrendingUp } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const { setFinancialContext, setOnboardingComplete } = useDebt();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    name: '',
    zipCode: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    liquidSavings: '',
    creditScoreRange: '' as CreditScoreRange,
    primaryGoal: '' as PayoffGoal,
    timeHorizon: 'flexible' as 'asap' | '1-2-years' | '3-5-years' | 'flexible'
  });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      const context: FinancialContext = {
        name: formData.name,
        zipCode: formData.zipCode,
        monthlyIncome: parseFloat(formData.monthlyIncome),
        monthlyExpenses: parseFloat(formData.monthlyExpenses),
        liquidSavings: parseFloat(formData.liquidSavings),
        creditScoreRange: formData.creditScoreRange,
        primaryGoal: formData.primaryGoal,
        timeHorizon: formData.timeHorizon
      };
      setFinancialContext(context);
      setOnboardingComplete(true);
      navigate('/debt-entry');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '' && formData.zipCode.trim().length === 5;
      case 2:
        return formData.monthlyIncome !== '' && formData.monthlyExpenses !== '' && 
               parseFloat(formData.monthlyIncome) > 0 && parseFloat(formData.monthlyExpenses) >= 0;
      case 3:
        return formData.liquidSavings !== '' && formData.creditScoreRange !== '';
      case 4:
        return formData.primaryGoal !== '';
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Debt PathFinder</h1>
          <p className="text-lg text-gray-600">Let's understand your financial situation</p>
        </div>

        <Progress value={(step / totalSteps) * 100} className="mb-8" />

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Welcome! Let\'s get started'}
              {step === 2 && 'Your Monthly Finances'}
              {step === 3 && 'Savings & Credit Profile'}
              {step === 4 && 'Your Goals'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Tell us a bit about yourself'}
              {step === 2 && 'Help us understand your monthly cash flow'}
              {step === 3 && 'This helps us provide better recommendations'}
              {step === 4 && 'What matters most to you?'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="12345"
                    maxLength={5}
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Monthly Take-Home Income
                    </div>
                  </Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    placeholder="3500"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  />
                  <p className="text-sm text-gray-500">After taxes and deductions</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                  <Input
                    id="monthlyExpenses"
                    type="number"
                    placeholder="2500"
                    value={formData.monthlyExpenses}
                    onChange={(e) => setFormData({ ...formData, monthlyExpenses: e.target.value })}
                  />
                  <p className="text-sm text-gray-500">Rent, utilities, groceries, etc. (excluding debt payments)</p>
                </div>
                {formData.monthlyIncome && formData.monthlyExpenses && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      Available for debt payment: ${(parseFloat(formData.monthlyIncome) - parseFloat(formData.monthlyExpenses)).toFixed(2)}/month
                    </p>
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="liquidSavings">Liquid Savings</Label>
                  <Input
                    id="liquidSavings"
                    type="number"
                    placeholder="1000"
                    value={formData.liquidSavings}
                    onChange={(e) => setFormData({ ...formData, liquidSavings: e.target.value })}
                  />
                  <p className="text-sm text-gray-500">Emergency fund, checking, savings accounts</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditScore">Credit Score Range</Label>
                  <Select
                    value={formData.creditScoreRange}
                    onValueChange={(value) => setFormData({ ...formData, creditScoreRange: value as CreditScoreRange })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your credit score range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300-579">300-579 (Poor)</SelectItem>
                      <SelectItem value="580-669">580-669 (Fair)</SelectItem>
                      <SelectItem value="670-739">670-739 (Good)</SelectItem>
                      <SelectItem value="740-799">740-799 (Very Good)</SelectItem>
                      <SelectItem value="800-850">800-850 (Excellent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="space-y-2">
                  <Label>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4" />
                      What's your primary goal?
                    </div>
                  </Label>
                  <div className="space-y-3">
                    {[
                      { value: 'lower-payment', label: 'Lower my monthly payments', icon: DollarSign },
                      { value: 'pay-faster', label: 'Pay off debt as fast as possible', icon: TrendingUp },
                      { value: 'reduce-interest', label: 'Minimize total interest paid', icon: Target },
                      { value: 'avoid-default', label: 'Avoid default and stay current', icon: Target }
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setFormData({ ...formData, primaryGoal: value as PayoffGoal })}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          formData.primaryGoal === value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">{label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeHorizon">Preferred Timeline</Label>
                  <Select
                    value={formData.timeHorizon}
                    onValueChange={(value) => setFormData({ ...formData, timeHorizon: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">As soon as possible</SelectItem>
                      <SelectItem value="1-2-years">1-2 years</SelectItem>
                      <SelectItem value="3-5-years">3-5 years</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="ml-auto"
              >
                {step === totalSteps ? 'Get Started' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">What to expect:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Enter your debts manually or upload a CSV file</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>See visual breakdowns of your debt composition</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Compare different payoff strategies (Snowball vs. Avalanche)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Explore "What If?" scenarios to test different approaches</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">✓</span>
              <span>Get AI-powered explanations and guidance throughout</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;