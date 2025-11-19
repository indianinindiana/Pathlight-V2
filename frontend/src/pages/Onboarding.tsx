import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CreditScoreRange, PayoffGoal, FinancialContext, AgeRange, EmploymentStatus, StressLevel, LifeEvent } from '@/types/debt';
import { ArrowRight, ArrowLeft, DollarSign, Compass, HelpCircle, CheckCircle2 } from 'lucide-react';

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
    stressLevel: 3 as StressLevel,
    lifeEvents: [] as LifeEvent[],
    ageRange: '' as AgeRange,
    employmentStatus: '' as EmploymentStatus,
    monthlyIncome: '',
    monthlyExpenses: '',
    liquidSavings: '',
    creditScoreRange: '' as CreditScoreRange
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

  const lifeEventOptions = [
    { value: 'income-increase' as LifeEvent, label: 'I expect my income to increase' },
    { value: 'income-decrease' as LifeEvent, label: 'I expect my income to decrease' },
    { value: 'major-expense' as LifeEvent, label: 'I plan to take on a major expense or new loan' },
    { value: 'household-changes' as LifeEvent, label: 'I expect household/family changes' },
    { value: 'other-goals' as LifeEvent, label: 'I have other financial goals or priorities' }
  ];

  const toggleLifeEvent = (event: LifeEvent) => {
    if (formData.lifeEvents.includes(event)) {
      setFormData({ ...formData, lifeEvents: formData.lifeEvents.filter(e => e !== event) });
    } else {
      setFormData({ ...formData, lifeEvents: [...formData.lifeEvents, event] });
    }
  };

  const getEmpatheticMessage = () => {
    if (step === 2) {
      const stressMessages = [
        "That's great that you're feeling confident!",
        "We hear you — let's build a plan that works.",
        "We understand the pressure you're feeling.",
        "We know debt can feel heavy — you're not alone.",
        "We're here to help you through this difficult time."
      ];
      return stressMessages[formData.stressLevel - 1];
    }
    
    if (step === 3) {
      const ageMessages: Record<AgeRange, string> = {
        '18-24': "Starting your financial journey — that's smart planning.",
        '25-34': "Building your future — let's create a solid foundation.",
        '35-44': "Balancing multiple priorities — we'll help you find clarity.",
        '45-59': "Planning for what's ahead — let's secure your path.",
        '60+': "Protecting what you've built — we'll help you stay on track."
      };
      return formData.ageRange ? ageMessages[formData.ageRange] : '';
    }
    
    if (step === 4) {
      const income = parseFloat(formData.monthlyIncome);
      const expenses = parseFloat(formData.monthlyExpenses);
      if (income && expenses) {
        const available = income - expenses;
        if (available > 0) {
          return `You have $${available.toLocaleString()} available each month — let's make it work for you.`;
        } else {
          return "Money feels tight right now — we'll help you find breathing room.";
        }
      }
      return '';
    }
    
    return '';
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding and go to debt entry
      const context: FinancialContext = {
        ageRange: formData.ageRange,
        employmentStatus: formData.employmentStatus,
        monthlyIncome: parseFloat(formData.monthlyIncome),
        monthlyExpenses: parseFloat(formData.monthlyExpenses),
        liquidSavings: parseFloat(formData.liquidSavings),
        creditScoreRange: formData.creditScoreRange,
        primaryGoal: selectedGoal,
        stressLevel: formData.stressLevel,
        lifeEvents: formData.lifeEvents.length > 0 ? formData.lifeEvents : undefined
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
        return true; // Stress level always has a default value
      case 2:
        return formData.ageRange !== '' && formData.employmentStatus !== '';
      case 3:
        return formData.monthlyIncome !== '' && formData.monthlyExpenses !== '' && 
               parseFloat(formData.monthlyIncome) > 0 && parseFloat(formData.monthlyExpenses) >= 0;
      case 4:
        return formData.liquidSavings !== '' && formData.creditScoreRange !== '';
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
            {step === 2 && getEmpatheticMessage()}
            {step === 3 && getEmpatheticMessage()}
            {step === 4 && getEmpatheticMessage()}
            {step === 5 && "You're almost there!"}
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#3A4F61]">
            {step === 1 && "We just need a few details to make your plan feel personal and relevant."}
            {step === 2 && "Now let's gather some personal details to guide smarter recommendations."}
            {step === 3 && "Understanding your cash flow helps us create a realistic plan."}
            {step === 4 && "Your savings and credit picture helps us tailor the best strategies."}
            {step === 5 && "Just add your debts and we'll create your personalized payoff plan."}
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
            <TooltipProvider>
              {/* STEP 1: Stress & Life Events */}
              {step === 1 && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-[#002B45] font-medium">
                        How stressed do you feel about your debt right now?
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-[#4F6A7A]" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Helps us understand how urgent things feel so we can tailor a plan that meets you where you are.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
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

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-[#002B45] font-medium">
                        Any major life events coming up in the next 6–12 months? (Optional)
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-[#4F6A7A]" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Life events can affect your cash flow. Sharing helps us design a plan that adapts.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {lifeEventOptions.map((option) => (
                        <Badge
                          key={option.value}
                          variant={formData.lifeEvents.includes(option.value) ? 'default' : 'outline'}
                          className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                            formData.lifeEvents.includes(option.value)
                              ? 'bg-[#009A8C] hover:bg-[#007F74] text-white border-[#009A8C]'
                              : 'border-[#D4DFE4] text-[#3A4F61] hover:border-[#009A8C]'
                          }`}
                          onClick={() => toggleLifeEvent(option.value)}
                        >
                          {formData.lifeEvents.includes(option.value) && (
                            <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                          )}
                          {option.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2: Age & Employment */}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="ageRange" className="text-[#002B45] font-medium">
                        What's your age range?
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-[#4F6A7A]" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Different life stages come with different financial patterns — your answer guides smarter recommendations.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
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
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="employmentStatus" className="text-[#002B45] font-medium">
                        What's your employment situation?
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-[#4F6A7A]" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">This helps us understand income stability and tailor your monthly plan.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
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
                  </div>
                </>
              )}

              {/* STEP 3: Income & Expenses */}
              {step === 3 && (
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
                    <p className="text-sm text-[#4F6A7A]">Typical spending each month (rent, utilities, groceries, subscriptions, etc. - excluding debt payments)</p>
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

              {/* STEP 4: Savings & Credit */}
              {step === 4 && (
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

              {/* STEP 5: Summary */}
              {step === 5 && (
                <div className="py-4">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-[#E7F7F4] rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#009A8C]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#002B45] mb-4 text-center">
                      Here's what we know so far
                    </h3>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="p-4 bg-[#F7F9FA] rounded-lg">
                      <p className="text-sm text-[#4F6A7A] mb-1">Your goal</p>
                      <p className="font-medium text-[#002B45]">Focus on {goalLabels[selectedGoal]}</p>
                    </div>
                    
                    <div className="p-4 bg-[#F7F9FA] rounded-lg">
                      <p className="text-sm text-[#4F6A7A] mb-1">How you're feeling</p>
                      <p className="font-medium text-[#002B45]">{stressLabels[formData.stressLevel - 1]}</p>
                    </div>
                    
                    {formData.lifeEvents.length > 0 && (
                      <div className="p-4 bg-[#F7F9FA] rounded-lg">
                        <p className="text-sm text-[#4F6A7A] mb-2">Life events to consider</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.lifeEvents.map((event) => (
                            <Badge key={event} variant="secondary" className="text-xs">
                              {lifeEventOptions.find(o => o.value === event)?.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 bg-[#F7F9FA] rounded-lg">
                      <p className="text-sm text-[#4F6A7A] mb-1">Your situation</p>
                      <p className="font-medium text-[#002B45]">
                        {formData.ageRange} • {formData.employmentStatus.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-[#F7F9FA] rounded-lg">
                      <p className="text-sm text-[#4F6A7A] mb-1">Monthly cash flow</p>
                      <p className="font-medium text-[#002B45]">
                        ${parseFloat(formData.monthlyIncome).toLocaleString()} income • ${parseFloat(formData.monthlyExpenses).toLocaleString()} expenses
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-[#E7F7F4] rounded-lg p-6 text-center">
                    <p className="text-[#002B45] mb-2">
                      <strong>Next step:</strong> Add your debts so we can create your personalized payoff plan.
                    </p>
                    <p className="text-sm text-[#3A4F61]">
                      You can add them one by one or upload a CSV file with all your debts at once.
                    </p>
                  </div>
                </div>
              )}
            </TooltipProvider>

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