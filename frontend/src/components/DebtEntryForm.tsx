import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Debt, DebtType } from '@/types/debt';
import { Plus, X, AlertCircle } from 'lucide-react';
import { suggestMinimumPayment, validateMinimumPayment } from '@/utils/debtCalculations';
import { showSuccess, showError } from '@/utils/toast';

interface DebtEntryFormProps {
  onAdd: (debt: Debt) => void;
  onCancel?: () => void;
  editingDebt?: Debt | null;
  onUpdate?: (id: string, debt: Partial<Debt>) => void;
}

const DebtEntryForm = ({ onAdd, onCancel, editingDebt, onUpdate }: DebtEntryFormProps) => {
  const [formData, setFormData] = useState<{
    type: DebtType;
    name: string;
    balance: string;
    apr: string;
    minimumPayment: string;
    nextPaymentDate: string;
    isDelinquent: boolean;
  }>(editingDebt ? {
    type: editingDebt.type,
    name: editingDebt.name,
    balance: editingDebt.balance.toString(),
    apr: editingDebt.apr.toString(),
    minimumPayment: editingDebt.minimumPayment.toString(),
    nextPaymentDate: editingDebt.nextPaymentDate.toISOString().split('T')[0],
    isDelinquent: editingDebt.isDelinquent || false
  } : {
    type: 'credit-card',
    name: '',
    balance: '',
    apr: '',
    minimumPayment: '',
    nextPaymentDate: new Date().toISOString().split('T')[0],
    isDelinquent: false
  });

  const [showMinPaymentWarning, setShowMinPaymentWarning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const balance = parseFloat(formData.balance);
    const apr = parseFloat(formData.apr);
    const minimumPayment = parseFloat(formData.minimumPayment);

    // Validate minimum payment
    if (!validateMinimumPayment(balance, apr, minimumPayment)) {
      const suggested = suggestMinimumPayment(balance, apr);
      showError(`Minimum payment should be at least $${suggested.toFixed(2)} to cover interest`);
      setShowMinPaymentWarning(true);
      return;
    }

    if (editingDebt && onUpdate) {
      onUpdate(editingDebt.id, {
        type: formData.type,
        name: formData.name,
        balance,
        apr,
        minimumPayment,
        nextPaymentDate: new Date(formData.nextPaymentDate),
        isDelinquent: formData.isDelinquent
      });
      showSuccess('Debt updated successfully');
    } else {
      const newDebt: Debt = {
        id: `debt-${Date.now()}`,
        type: formData.type,
        name: formData.name,
        balance,
        apr,
        minimumPayment,
        nextPaymentDate: new Date(formData.nextPaymentDate),
        isDelinquent: formData.isDelinquent
      };
      onAdd(newDebt);
      showSuccess('Debt added successfully');
    }

    // Reset form
    setFormData({
      type: 'credit-card',
      name: '',
      balance: '',
      apr: '',
      minimumPayment: '',
      nextPaymentDate: new Date().toISOString().split('T')[0],
      isDelinquent: false
    });
    setShowMinPaymentWarning(false);
  };

  const handleSuggestMinPayment = () => {
    if (formData.balance && formData.apr) {
      const suggested = suggestMinimumPayment(parseFloat(formData.balance), parseFloat(formData.apr));
      setFormData({ ...formData, minimumPayment: suggested.toFixed(2) });
      setShowMinPaymentWarning(false);
    }
  };

  const isFormValid = formData.name && formData.balance && formData.apr && formData.minimumPayment;

  return (
    <Card className="border-[1.5px] border-[#D4DFE4]">
      <CardHeader>
        <CardTitle className="text-[#002B45]">{editingDebt ? 'Edit Debt' : 'Add a Debt'}</CardTitle>
        <CardDescription className="text-[#3A4F61]">
          Enter the details of your debt below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-[#002B45] font-medium">Debt Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as DebtType })}>
              <SelectTrigger className="border-[#D4DFE4]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="personal-loan">Personal Loan</SelectItem>
                <SelectItem value="student-loan">Student Loan</SelectItem>
                <SelectItem value="auto-loan">Auto Loan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#002B45] font-medium">Debt Name</Label>
            <Input
              id="name"
              placeholder="e.g., Chase Visa, Car Loan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-[#D4DFE4]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balance" className="text-[#002B45] font-medium">Current Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="5000.00"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="border-[#D4DFE4]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apr" className="text-[#002B45] font-medium">APR (%)</Label>
              <Input
                id="apr"
                type="number"
                step="0.01"
                placeholder="18.99"
                value={formData.apr}
                onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
                className="border-[#D4DFE4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumPayment" className="text-[#002B45] font-medium">
                Minimum Payment
              </Label>
              <div className="flex gap-2">
                <Input
                  id="minimumPayment"
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={formData.minimumPayment}
                  onChange={(e) => {
                    setFormData({ ...formData, minimumPayment: e.target.value });
                    setShowMinPaymentWarning(false);
                  }}
                  className={`border-[#D4DFE4] ${showMinPaymentWarning ? 'border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSuggestMinPayment}
                  disabled={!formData.balance || !formData.apr}
                  className="whitespace-nowrap"
                >
                  Suggest
                </Button>
              </div>
              {showMinPaymentWarning && (
                <p className="text-sm text-red-600">Payment may not cover monthly interest</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextPaymentDate" className="text-[#002B45] font-medium">Next Payment Date</Label>
              <Input
                id="nextPaymentDate"
                type="date"
                value={formData.nextPaymentDate}
                onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                className="border-[#D4DFE4]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <Checkbox
              id="isDelinquent"
              checked={formData.isDelinquent}
              onCheckedChange={(checked) => setFormData({ ...formData, isDelinquent: checked as boolean })}
            />
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <Label
                htmlFor="isDelinquent"
                className="text-sm font-medium text-orange-900 cursor-pointer"
              >
                This debt is currently delinquent (past due)
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isFormValid}
              className="bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold rounded-xl"
            >
              {editingDebt ? (
                <>Update Debt</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Debt
                </>
              )}
            </Button>
            {(onCancel || editingDebt) && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-[#D4DFE4] text-[#002B45] rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DebtEntryForm;