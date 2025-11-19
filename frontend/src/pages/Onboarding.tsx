import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { CreditScoreRange, PayoffGoal, FinancialContext, AgeRange, EmploymentStatus, PayoffPriority, StressLevel } from '@/types/debt';
import { ArrowRight, ArrowLeft, DollarSign, Compass, Zap, Percent, PiggyBank, LifeBuoy } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setFinancialContext, setOnboardingComplete } = useDebt();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const selectedGoal = (location.state as any)?.selectedGoal as PayoffGoal || 'pay-faster';

  const goalLabels: Record<PayoffGoal, string> = {
    'pay-faster': 'paying off debt faster',
    'lower-payment': 'lowering your monthly payments',
    'reduce-interest': 'reducing your interest',
    'avoid-default': 'avoiding falling behind'
  };

  const [formData, setFormData] = useState({
    ageRange: '' as AgeRange,
    employmentStatus: '' as EmploymentStatus,
    zipCode: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    liquidSavings: '',
    creditScoreRange: '' as CreditScoreRange,
    payoffPriority: '' as PayoffPriority,
    stressLevel: 3 as StressLevel
  });

  const stressEmojis = ['😌', '🙂', '😐', '😟', '😰'];
  const stressLabels = [
    'I feel confident managing my debt.',
    'Manageable, but could be better.',
    'Starting to feel the pressure.',
    'Debt is weighing on me daily.',
    'Debt is causing me significant stress; I need help ASAP.'
  ];
  const stressColors = ['#10B981', '#84CC16', '#EAB308', '#F97316', '#EF4444'];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding and go to debt entry
      const context: FinancialContext = {
        ageRange: formData.ageRange,
        employmentStatus: formData.employmentStatus,
        zipCode: formData.zipCode || undefined,
        monthlyIncome: parseFloat(formData.monthlyIncome),
        monthlyExpenses: parseFloat(formData.monthlyExpenses),
        liquidSavings: parseFloat(formData.liquidSavings),
        creditScoreRange: formData.creditScoreRange,
        primaryGoal: selectedGoal,
        payoffPriority: formData.payoffPriority,
        stressLevel: formData.stressLevel
      };
      setFinancialContext(context);
      setOnboardingComplete(true);
      navigate('/debt-entry');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.ageRange !== '' && formData.employmentStatus !== '';
      case 2:
        return formData.monthlyIncome !== '' && formData.monthlyExpenses !== '' && 
               parseFloat(formData.monthlyIncome) > 0 && parseFloat(formData.monthlyExpenses) >= 0;
      case 3:
        return formData.liquidSavings !== '' && formData.creditScoreRange !== '';
      case 4:
        return formData.payoffPriority !== '';
      case 5:
        return true;
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
            {step === 1 && `Great! Let's get started on your path to ${goalLabels[selectedGoal]}`}
            {step === 2 && "Let's understand your financial situation"}
            {step === 3 && "Your savings and credit picture"}
            {step === 4 && "How you want to tackle debt"}
            {step === 5 && "And finally, let's understand your debt situation"}
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#3A4F61]">
            {step === 1 && "We just need a few details to make your plan feel personal and relevant."}
            {step === 2 && `This helps us see your money flow so that we can guide you towards ${goalLabels[selectedGoal]}.`}
            {step === 3 && "This helps us create a plan that reduces stress, gives clarity and keeps you in control."}
            {step === 4 && "We'll make your plan fit your style and stress level."}
            {step === 5 && "Add each debt individually or upload a CSV with all your debts so that we can create a plan that works for you."}
          </p>
          <p className="text-[14px] text-[#4F6A7A] mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>

        <Progress 
          value={(step / totalSteps) * 100} 
          className="mb-8 [&>div]:bg-[#009A8C]" 
        />

        <Card className="border-[1.5px] border-[#D4DFE4]">
          <CardContent className="pt-6 space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ageRange" className="text-[#002B45] font-medium">Age Range / Life Stage</Label>
                  <Select
                    value={formData.ageRange}
                    onValueChange={(value) => setFormData({ ...formData, ageRange: value as AgeRange })}
                  >
                    <SelectTrigger className="border-[#D4DFE4]">
                      <SelectValue placeholder="Select your age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-24">18-24</SelectItem>
                      <SelectItem value="25-34">25-34</SelectItem>
                      <SelectItem value="35-44">35-44</SelectItem>
                      <SelectItem value="45-59">45-59</SelectItem>
                      <SelectItem value="60+">60+</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-[#4F6A7A]">Helps us suggest a plan that fits your stage in life</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentStatus" className="text-[#002B45] font-medium">Employment Status</Label>
                  <Select
                    value={formData.employmentStatus}
                    onValueChange={(value) => setFormData({ ...formData, employmentStatus: value as EmploymentStatus })}
                  >
                    <SelectTrigger className="border-[#D4DFE4]">
                      <SelectValue placeholder="Select your employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="self-employed">Self-employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-[#4F6A7A]">This helps us understand your income patterns</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-[#002B45] font-medium">ZIP Code (Optional)</Label>
                  <Input
                    id="zipCode"
                    placeholder="12345"
                    maxLength={5}
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, '') })}
                    className="border-[#D4DFE4]"
                  />
                  <p className="text-sm text-[#4F6A7A]">Share for tips and insights specific to your area</p>
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
                  <p className="text-sm text-[#4F6A7A]">How much money comes in each month for your household (after taxes and deductions)</p>
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
                  <p className="text-sm text-[#4F6A7A]">Typical spending each month helps us create a realistic plan (rent, utilities, groceries, subscriptions, etc. - excluding debt payments)</p>
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
                  <p className="text-sm text-[#4F6A7A]">How much do you have saved that could help with debt or emergencies</p>
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
                  <p className="text-sm text-[#4F6A7A]">Sharing this helps us suggest the best repaying strategies for your situation</p>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="space-y-2">
                  <Label className="text-[#002B45] font-medium mb-3 block">
                    Debt Payoff Priority
                  </Label>
                  <div className="space-y-3">
                    <button
                      onClick={() => setFormData({ ...formData, payoffPriority: 'aggressive-freedom' })}
                      className={`w-full p-4 rounded-xl border-[1.5px] transition-all text-left ${
                        formData.payoffPriority === 'aggressive-freedom'
                          ? 'border-[#009A8C] bg-[#E7F7F4]'
                          : 'border-[#D4DFE4] hover:border-[#009A8C]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-lg ${
                          formData.payoffPriority === 'aggressive-freedom'
                            ? 'bg-[#009A8C]/10'
                            : 'bg-[#F7F9FA]'
                        }`}>
                          <Zap className="w-5 h-5 text-[#009A8C]" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-[#002B45] mb-1">Aggressive Debt Freedom</div>
                          <p className="text-sm text-[#3A4F61]">I want to get out of debt as fast as possible.</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setFormData({ ...formData, payoffPriority: 'minimize-interest' })}
                      className={`w-full p-4 rounded-xl border-[1.5px] transition-all text-left ${
                        formData.payoffPriority === 'minimize-interest'
                          ? 'border-[#009A8C] bg-[#E7F7F4]'
                          : 'border-[#D4DFE4] hover:border-[#009A8C]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-lg ${
                          formData.payoffPriority === 'minimize-interest'
                            ? 'bg-[#009A8C]/10'
                            : 'bg-[#F7F9FA]'
                        }`}>
                          <Percent className="w-5 h-5 text-[#009A8C]" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-[#002B45] mb-1">Minimize Interest</div>
                          <p className="text-sm text-[#3A4F61]">I want to pay the least interest over time.</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setFormData({ ...formData, payoffPriority: 'balance-savings' })}
                      className={`w-full p-4 rounded-xl border-[1.5px] transition-all text-left ${
                        formData.payoffPriority === 'balance-savings'
                          ? 'border-[#009A8C] bg-[#E7F7F4]'
                          : 'border-[#D4DFE4] hover:border-[#009A8C]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-lg ${
                          formData.payoffPriority === 'balance-savings'
                            ? 'bg-[#009A8C]/10'
                            : 'bg-[#F7F9FA]'
                        }`}>
                          <PiggyBank className="w-5 h-5 text-[#009A8C]" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-[#002B45] mb-1">Balance Debt + Savings</div>
                          <p className="text-sm text-[#3A4F61]">I need to build savings while paying down debt.</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setFormData({ ...formData, payoffPriority: 'cash-flow-relief' })}
                      className={`w-full p-4 rounded-xl border-[1.5px] transition-all text-left ${
                        formData.payoffPriority === 'cash-flow-relief'
                          ? 'border-[#009A8C] bg-[#E7F7F4]'
                          : 'border-[#D4DFE4] hover:border-[#009A8C]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-lg ${
                          formData.payoffPriority === 'cash-flow-relief'
                            ? 'bg-[#009A8C]/10'
                            : 'bg-[#F7F9FA]'
                        }`}>
                          <LifeBuoy className="w-5 h-5 text-[#009A8C]" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-[#002B45] mb-1">Cash Flow Relief</div>
                          <p className="text-sm text-[#3A4F61]">I need to reduce my monthly payments to stay afloat.</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[#002B45] font-medium">Stress Score</Label>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div 
                        className="text-6xl transition-all duration-300"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                      >
                        {stressEmojis[formData.stressLevel - 1]}
                      </div>
                    </div>
                    
                    <Slider
                      value={[formData.stressLevel]}
                      onValueChange={(value) => setFormData({ ...formData, stressLevel: value[0] as StressLevel })}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between text-xs text-[#4F6A7A] px-1">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                    
                    <div 
                      className="p-4 rounded-lg text-center transition-all duration-300"
                      style={{ 
                        backgroundColor: `${stressColors[formData.stressLevel - 1]}15`,
                        borderLeft: `4px solid ${stressColors[formData.stressLevel - 1]}`
                      }}
                    >
                      <p className="text-sm font-medium text-[#002B45]">
                        {stressLabels[formData.stressLevel - 1]}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 5 && (
              <div className="py-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-[#E7F7F4] rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-[#009A8C]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#002B45] mb-2">
                    You're almost there!
                  </h3>
                  <p className="text-[#3A4F61]">
                    Next, you'll add your debts so we can create your personalized payoff plan.
                  </p>
                </div>
                <div className="bg-[#F7F9FA] rounded-lg p-6 text-left">
                  <h4 className="font-semibold text-[#002B45] mb-3">What you can do:</h4>
                  <ul className="space-y-2 text-sm text-[#3A4F61]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#009A8C] mt-0.5">✓</span>
                      <span>Add each debt manually with details like balance, APR, and minimum payment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#009A8C] mt-0.5">✓</span>
                      <span>Upload a CSV file if you have multiple debts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#009A8C] mt-0.5">✓</span>
                      <span>Edit or remove debts anytime</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="border-[#D4DFE4] text-[#002B45] rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold rounded-xl"
              >
                {step === totalSteps ? 'Add My Debts' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;