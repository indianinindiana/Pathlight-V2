// frontend/src/components/InlineDebtMapping.tsx

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowRight, Check } from 'lucide-react';
import { useDebt } from '@/context/DebtContext';
import { createDebt } from '@/services/debtApi';
import { getUserId, getProfileId } from '@/services/sessionManager';

interface Debt {
  name: string;
  type: string;
  balance: string;
  apr: string;
  minimumPayment: string;
}

interface InlineDebtMappingProps {
  onComplete: () => void;
}

export const InlineDebtMapping: React.FC<InlineDebtMappingProps> = ({ onComplete }) => {
  const { addDebt } = useDebt();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [currentDebt, setCurrentDebt] = useState<Debt>({
    name: '',
    type: '',
    balance: '',
    apr: '',
    minimumPayment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claraFeedback, setClaraFeedback] = useState<string>('');

  const debtTypes = [
    { value: 'credit-card', label: 'Credit Card' },
    { value: 'personal-loan', label: 'Personal Loan' },
    { value: 'student-loan', label: 'Student Loan' },
    { value: 'auto-loan', label: 'Auto Loan' },
    { value: 'medical', label: 'Medical Debt' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field: keyof Debt, value: string) => {
    setCurrentDebt(prev => ({ ...prev, [field]: value }));
  };

  const isDebtComplete = () => {
    return currentDebt.name.trim() !== '' &&
           currentDebt.type !== '' &&
           currentDebt.balance.trim() !== '' &&
           currentDebt.apr.trim() !== '' &&
           currentDebt.minimumPayment.trim() !== '';
  };

  const handleAddDebt = async () => {
    if (!isDebtComplete()) return;

    setIsSubmitting(true);
    
    try {
      // Create debt in backend
      const userId = getUserId();
      const profileId = getProfileId();
      
      if (!profileId) {
        throw new Error('Profile not found');
      }

      // Calculate next payment date (30 days from now)
      const nextPaymentDate = new Date();
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

      const debtData = {
        profile_id: profileId,
        name: currentDebt.name,
        type: currentDebt.type as any,
        balance: parseFloat(currentDebt.balance),
        apr: parseFloat(currentDebt.apr),
        minimum_payment: parseFloat(currentDebt.minimumPayment),
        next_payment_date: nextPaymentDate.toISOString().split('T')[0]
      };

      const createdDebt = await createDebt(debtData);
      
      // Convert API response to Debt type for context
      const debtForContext = {
        id: createdDebt.id,
        type: createdDebt.type as any,
        name: createdDebt.name,
        balance: createdDebt.balance,
        apr: createdDebt.apr,
        minimumPayment: createdDebt.minimum_payment,
        nextPaymentDate: new Date(createdDebt.next_payment_date)
      };
      
      addDebt(debtForContext);

      // Add to local list
      setDebts(prev => [...prev, currentDebt]);
      
      // Clara's feedback
      setClaraFeedback("Got it! Another one?");
      
      // Reset form
      setCurrentDebt({
        name: '',
        type: '',
        balance: '',
        apr: '',
        minimumPayment: ''
      });

      // Clear feedback after 2 seconds
      setTimeout(() => setClaraFeedback(''), 2000);
      
    } catch (error) {
      console.error('Error adding debt:', error);
      setClaraFeedback("Hmm, something went wrong. Let's try that again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    if (debts.length === 0) {
      setClaraFeedback("Let's add at least one debt before moving forward.");
      return;
    }
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Clara's Intro */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-[#E7F7F4] to-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <img
              src="/clara-avatar.png"
              alt="Clara"
              className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
            />
            <div className="flex-1">
              <p className="text-[#002B45] text-base leading-relaxed">
                Now, let's map your debts. You can enter as many as you need—just fill out each row with the debt type, balance, and interest rate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debts Added So Far */}
      {debts.length > 0 && (
        <div className="space-y-3">
          {debts.map((debt, index) => (
            <Card key={index} className="border border-[#D4DFE4] bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#009A8C] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[#002B45] font-medium">{debt.name}</p>
                    <p className="text-[#4F6A7A] text-sm">
                      ${parseFloat(debt.balance).toLocaleString()} at {debt.apr}% APR
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Clara's Feedback */}
      {claraFeedback && (
        <Card className="border-none shadow-sm bg-gradient-to-br from-[#E7F7F4] to-white animate-in fade-in slide-in-from-left-2 duration-300">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <img
                src="/clara-avatar.png"
                alt="Clara"
                className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              />
              <p className="text-[#4F6A7A] text-sm leading-relaxed">
                {claraFeedback}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debt Entry Form */}
      <Card className="border-2 border-[#009A8C] shadow-md">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-[#002B45]">
            {debts.length === 0 ? 'Add your first debt' : 'Add another debt'}
          </h3>

          {/* Debt Name */}
          <div className="space-y-2">
            <label className="text-sm text-[#4F6A7A]">Debt name</label>
            <Input
              type="text"
              placeholder="e.g., Chase Visa, Student Loan"
              value={currentDebt.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="border-[#D4DFE4] focus:border-[#009A8C]"
            />
          </div>

          {/* Debt Type */}
          <div className="space-y-2">
            <label className="text-sm text-[#4F6A7A]">Type</label>
            <Select value={currentDebt.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger className="border-[#D4DFE4] focus:border-[#009A8C]">
                <SelectValue placeholder="Select debt type" />
              </SelectTrigger>
              <SelectContent>
                {debtTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Balance, APR, Minimum Payment - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[#4F6A7A]">Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F6A7A]">$</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="5000"
                  value={currentDebt.balance}
                  onChange={(e) => handleInputChange('balance', e.target.value)}
                  className="pl-7 border-[#D4DFE4] focus:border-[#009A8C]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#4F6A7A]">APR</label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="18.5"
                  value={currentDebt.apr}
                  onChange={(e) => handleInputChange('apr', e.target.value)}
                  className="pr-7 border-[#D4DFE4] focus:border-[#009A8C]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4F6A7A]">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#4F6A7A]">Min. payment</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F6A7A]">$</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="150"
                  value={currentDebt.minimumPayment}
                  onChange={(e) => handleInputChange('minimumPayment', e.target.value)}
                  className="pl-7 border-[#D4DFE4] focus:border-[#009A8C]"
                />
              </div>
            </div>
          </div>

          {/* Add Debt Button */}
          <Button
            onClick={handleAddDebt}
            disabled={!isDebtComplete() || isSubmitting}
            className="w-full bg-[#009A8C] hover:bg-[#007F74] text-white disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Adding...' : 'Add this debt'}
          </Button>
        </CardContent>
      </Card>

      {/* Complete Button */}
      {debts.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleComplete}
            className="bg-[#009A8C] hover:bg-[#007F74] text-white px-8 py-6 text-lg rounded-full"
          >
            All done - see my plan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};