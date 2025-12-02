import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { getProfileId } from '@/services/sessionManager';
import { getProfileById, updateProfile } from '@/services/profileApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { PayoffGoal, AgeRange, EmploymentStatus, CreditScoreRange, LifeEvent } from '@/types/debt';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { setFinancialContext, financialContext } = useDebt();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [primaryGoal, setPrimaryGoal] = useState<PayoffGoal>('pay-faster');
  const [stressLevel, setStressLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [ageRange, setAgeRange] = useState<AgeRange>('25-34');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('full-time');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(5000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(3000);
  const [liquidSavings, setLiquidSavings] = useState<number>(1000);
  const [creditScore, setCreditScore] = useState<CreditScoreRange>('670-739');
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);

  const stressLabels = [
    "I feel confident managing my debt.",
    "Manageable, but could be better.",
    "Starting to feel the pressure.",
    "Debt is weighing on me daily.",
    "Debt is causing me significant stress; I need help ASAP.",
  ];

  const lifeEventOptions: { value: LifeEvent; label: string }[] = [
    { value: 'income-increase', label: 'I expect my income to increase' },
    { value: 'income-decrease', label: 'I expect my income to decrease' },
    { value: 'major-expense', label: 'I plan to take on a major expense or new loan' },
    { value: 'household-changes', label: 'I expect household/family changes' },
    { value: 'other-goals', label: 'I have other financial goals or priorities' },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profileId = getProfileId();
    if (!profileId) {
      showError('No profile found. Please complete onboarding first.');
      navigate('/');
      return;
    }

    try {
      const profile = await getProfileById(profileId);
      
      // Set form values from profile
      setPrimaryGoal(profile.primary_goal as PayoffGoal);
      if (profile.stress_level) setStressLevel(profile.stress_level as 1 | 2 | 3 | 4 | 5);
      
      if (profile.financial_context) {
        const fc = profile.financial_context;
        if (fc.age_range) setAgeRange(fc.age_range as AgeRange);
        if (fc.employment_status) setEmploymentStatus(fc.employment_status as EmploymentStatus);
        if (fc.monthly_income) setMonthlyIncome(fc.monthly_income);
        if (fc.monthly_expenses) setMonthlyExpenses(fc.monthly_expenses);
        if (fc.liquid_savings) setLiquidSavings(fc.liquid_savings);
        if (fc.credit_score_range) setCreditScore(fc.credit_score_range as CreditScoreRange);
        if (fc.life_events) setLifeEvents(fc.life_events as LifeEvent[]);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      showError('Failed to load profile settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const profileId = getProfileId();
    if (!profileId) {
      showError('No profile found');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(profileId, {
        stress_level: stressLevel,
        financial_context: {
          age_range: ageRange,
          employment_status: employmentStatus,
          monthly_income: monthlyIncome,
          monthly_expenses: monthlyExpenses,
          liquid_savings: liquidSavings,
          credit_score_range: creditScore,
          life_events: lifeEvents,
        },
      });

      // Update local context
      setFinancialContext({
        ageRange,
        employmentStatus,
        monthlyIncome,
        monthlyExpenses,
        liquidSavings,
        creditScoreRange: creditScore,
        primaryGoal,
        stressLevel,
        lifeEvents,
      });

      showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleLifeEvent = (event: LifeEvent) => {
    setLifeEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7F7F4] to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#009A8C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7F7F4] to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-[#4F6A7A] hover:text-[#002B45]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-[32px] font-bold text-[#002B45] mb-2">Profile Settings</h1>
          <p className="text-[16px] text-[#4F6A7A]">
            Update your financial information to get more accurate recommendations
          </p>
        </div>

        {/* Primary Goal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-[#002B45]">Primary Goal</CardTitle>
            <CardDescription>What's your biggest money goal right now?</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={primaryGoal} onValueChange={(value) => setPrimaryGoal(value as PayoffGoal)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pay-faster">Pay off Debt Faster</SelectItem>
                <SelectItem value="reduce-interest">Reduce my interest</SelectItem>
                <SelectItem value="lower-payment">Reduce my monthly payment</SelectItem>
                <SelectItem value="avoid-default">Avoid falling behind</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Stress Level */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-[#002B45]">Stress Level</CardTitle>
            <CardDescription>How stressful does your money situation feel right now?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Slider
              value={[stressLevel]}
              onValueChange={(value) => setStressLevel(value[0] as 1 | 2 | 3 | 4 | 5)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-[#4F6A7A] italic">
              {stressLabels[stressLevel - 1]}
            </p>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-[#002B45]">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ageRange">Age Range</Label>
              <Select value={ageRange} onValueChange={(value) => setAgeRange(value as AgeRange)}>
                <SelectTrigger id="ageRange">
                  <SelectValue />
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

            <div>
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Select value={employmentStatus} onValueChange={(value) => setEmploymentStatus(value as EmploymentStatus)}>
                <SelectTrigger id="employmentStatus">
                  <SelectValue />
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

            <div>
              <Label htmlFor="creditScore">Credit Score Range</Label>
              <Select value={creditScore} onValueChange={(value) => setCreditScore(value as CreditScoreRange)}>
                <SelectTrigger id="creditScore">
                  <SelectValue />
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
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-[#002B45]">Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="monthlyIncome">Monthly Take-Home Income</Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                placeholder="5000"
              />
              <p className="text-xs text-[#4F6A7A] mt-1">
                After taxes and deductions
              </p>
            </div>

            <div>
              <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
              <Input
                id="monthlyExpenses"
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                placeholder="3000"
              />
              <p className="text-xs text-[#4F6A7A] mt-1">
                Rent, utilities, groceries, etc. (excluding debt payments)
              </p>
            </div>

            <div>
              <Label htmlFor="liquidSavings">Liquid Savings</Label>
              <Input
                id="liquidSavings"
                type="number"
                value={liquidSavings}
                onChange={(e) => setLiquidSavings(Number(e.target.value))}
                placeholder="1000"
              />
              <p className="text-xs text-[#4F6A7A] mt-1">
                Available for debt or emergencies
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Life Events */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-[#002B45]">Upcoming Life Events</CardTitle>
            <CardDescription>
              Any major life events coming up in the next 6–12 months? (Optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lifeEventOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={lifeEvents.includes(option.value)}
                  onCheckedChange={() => toggleLifeEvent(option.value)}
                />
                <Label
                  htmlFor={option.value}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#009A8C] hover:bg-[#007F74] text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;