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
import { ArrowRight, ArrowLeft, DollarSign, Target, TrendingUp, Compass } from 'lucide-react';

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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <div className="mb-8">
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#002B45] mb-3">
            Let's understand your financial situation
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#3A4F61]">
            Step {step} of {totalSteps}
          </p>
        </div>

        <Progress value={(step / totalSteps) * 100} className="mb-8" />

        <Card className="border-[1.5px] border-[#D4DFE4]">
          <CardHeader>
            <CardTitle className="text-[#002B45]">
              {step === 1 && 'Welcome! Let\'s get started'}
              {step === 2 && 'Your Monthly Finances'}
              {step === 3 && 'Savings & Credit Profile'}
              {step === 4 && 'Your Goals'}
            </CardTitle>
            <CardDescription className="text-[#3A4F61]">
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
                  <Label htmlFor="name" className="text-[#002B45] font-medium">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-[#D4DFE4]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-[#002B45] font-medium">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="12345"
                    maxLength={5}
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, '') })}
                    className="border-[#D4DFE4]"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome" className="text-[#002B45] font-medium">
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
                    className="border-[#D4DFE4]"
                  />
                  <p className="text-sm text-[#4F6A7A]">After taxes and deductions</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses" className="text-[#002B45] font-medium">Monthly Expenses</Label>
                  <Input
                    id="monthlyExpenses"
                    type="number"
                    placeholder="2500"
                    value={formData.monthlyExpenses}
                    onChange={(e) => setFormData({ ...formData, monthlyExpenses: e.target.value })}
                    className="border-[#D4DFE4]"
                  />
                  <p className="text-sm text-[#4F6A7A]">Rent, utilities, groceries, etc. (excluding debt payments)</p>
                </div>
                {formData.monthlyIncome && formData.monthlyExpenses && (
                  <div className="p-4 bg-[#E7F7F4] rounded-lg">
                    <p className="text-sm font-medium text-[#002B45]">
                      Available for debt payment: ${(parseFloat(formData.monthlyIncome) - parseFloat(formData.monthlyExpenses)).toFixed(2)}/month
                    </p>
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="liquidSavings" className="text-[#002B45] font-medium">Liquid Savings</Label>
                  <Input
                    id="liquidSavings"
                    type="number"
                    placeholder="1000"
                    value={formData.liquidSavings}
                    onChange={(e) => setFormData({ ...formData, liquidSavings: e.target.value })}
                    className="border-[#D4DFE4]"
                  />
                  <p className="text-sm text-[#4F6A7A]">Emergency fund, checking, savings accounts</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditScore" className="text-[#002B45] font-medium">Credit Score Range</Label>
                  <Select
                    value={formData.creditScoreRange}
                    onValueChange={(value) => setFormData({ ...formData, creditScoreRange: value as CreditScoreRange })}
                  >
                    <SelectTrigger className="border-[#D4DFE4]">
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
                  <Label className="text-[#002B45] font-medium">
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
                        className={`w-full p-4 rounded-xl border-[1.5px] transition-all text-left ${
                          formData.primaryGoal === value
                            ? 'border-[#009A8C] bg-[#E7F7F4]'
                            : 'border-[#D4DFE4] hover:border-[#009A8C]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-[#009A8C]" />
                          <span className="font-medium text-[#002B45]">{label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeHorizon" className="text-[#002B45] font-medium">Preferred Timeline</Label>
                  <Select
                    value={formData.timeHorizon}
                    onValueChange={(value) => setFormData({ ...formData, timeHorizon: value as any })}
                  >
                    <SelectTrigger className="border-[#D4DFE4]">
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
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="border-[#D4DFE4] text-[#002B45] rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="ml-auto bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold rounded-xl"
              >
                {step === totalSteps ? 'Get Started' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-white border-[1.5px] border-[#D4DFE4] rounded-xl">
          <h3 className="font-semibold text-[#002B45] mb-3">What to expect:</h3>
          <ul className="space-y-2 text-sm text-[#3A4F61]">
            <li className="flex items-start gap-2">
              <span className="text-[#009A8C] mt-0.5">✓</span>
              <span>Enter your debts manually or upload a CSV file</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#009A8C] mt-0.5">✓</span>
              <span>See visual breakdowns of your debt composition</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#009A8C] mt-0.5">✓</span>
              <span>Compare different payoff strategies (Snowball vs. Avalanche)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#009A8C] mt-0.5">✓</span>
              <span>Explore "What If?" scenarios to test different approaches</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#009A8C] mt-0.5">✓</span>
              <span>Get AI-powered explanations and guidance throughout</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;