import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Debt, DebtType } from '@/types/debt';
import { Plus, X, AlertCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { validateDebt, getSuggestedMinimumPayment } from '@/services/debtApi';
import { showError } from '@/utils/toast';

interface DebtEntryFormProps {
  onAdd: (debt: Omit<Debt, 'id'>) => Promise<void>;
  onCancel?: () => void;
  editingDebt?: Debt | null;
  onUpdate?: (id: string, debt: Partial<Debt>) => Promise<void>;
}

const DebtEntryForm = ({ onAdd, onCancel, editingDebt, onUpdate }: DebtEntryFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<{
    type: DebtType;
    name: string;
    balance: string;
    apr: string;
    minimumPayment: string;
    nextPaymentDate: string;
    isDelinquent: boolean;
    // Optional common fields
    lenderName: string;
    aprType: string;
    paymentType: string;
    actualMonthlyPayment: string;
    // Optional loan fields
    originalPrincipal: string;
    termMonths: string;
    originationDate: string;
    remainingMonths: string;
    // Optional credit card fields
    creditLimit: string;
    lateFees: string;
    // Optional student loan fields
    loanProgram: string;
    // Optional mortgage fields
    escrowIncluded: boolean;
    propertyTax: string;
    homeInsurance: string;
  }>(editingDebt ? {
    type: editingDebt.type,
    name: editingDebt.name,
    balance: editingDebt.balance.toString(),
    apr: editingDebt.apr.toString(),
    minimumPayment: editingDebt.minimumPayment.toString(),
    nextPaymentDate: editingDebt.nextPaymentDate.toISOString().split('T')[0],
    isDelinquent: editingDebt.isDelinquent || false,
    lenderName: editingDebt.lenderName || '',
    aprType: editingDebt.aprType || '',
    paymentType: editingDebt.paymentType || '',
    actualMonthlyPayment: editingDebt.actualMonthlyPayment?.toString() || '',
    originalPrincipal: editingDebt.originalPrincipal?.toString() || '',
    termMonths: editingDebt.termMonths?.toString() || '',
    originationDate: editingDebt.originationDate?.toISOString().split('T')[0] || '',
    remainingMonths: editingDebt.remainingMonths?.toString() || '',
    creditLimit: editingDebt.creditLimit?.toString() || '',
    lateFees: editingDebt.lateFees?.toString() || '',
    loanProgram: editingDebt.loanProgram || '',
    escrowIncluded: editingDebt.escrowIncluded || false,
    propertyTax: editingDebt.propertyTax?.toString() || '',
    homeInsurance: editingDebt.homeInsurance?.toString() || ''
  } : {
    type: 'credit-card',
    name: '',
    balance: '',
    apr: '',
    minimumPayment: '',
    nextPaymentDate: new Date().toISOString().split('T')[0],
    isDelinquent: false,
    lenderName: '',
    aprType: '',
    paymentType: '',
    actualMonthlyPayment: '',
    originalPrincipal: '',
    termMonths: '',
    originationDate: '',
    remainingMonths: '',
    creditLimit: '',
    lateFees: '',
    loanProgram: '',
    escrowIncluded: false,
    propertyTax: '',
    homeInsurance: ''
  });

  const [showMinPaymentWarning, setShowMinPaymentWarning] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Real-time validation when balance, APR, or minimum payment changes
  useEffect(() => {
    const validateFields = async () => {
      if (formData.balance && formData.apr && formData.minimumPayment) {
        setIsValidating(true);
        try {
          const result = await validateDebt({
            balance: parseFloat(formData.balance),
            apr: parseFloat(formData.apr),
            minimum_payment: parseFloat(formData.minimumPayment)
          });

          if (!result.valid) {
            setShowMinPaymentWarning(true);
          } else {
            setShowMinPaymentWarning(false);
          }

          // Set warnings
          const warningMessages = result.warnings.map(w => w.message);
          setValidationWarnings(warningMessages);
        } catch (error) {
          console.error('Validation error:', error);
        } finally {
          setIsValidating(false);
        }
      }
    };

    const debounceTimer = setTimeout(validateFields, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.balance, formData.apr, formData.minimumPayment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const balance = parseFloat(formData.balance);
    const apr = parseFloat(formData.apr);
    const minimumPayment = parseFloat(formData.minimumPayment);

    try {
      // Validate with backend before submitting
      const validation = await validateDebt({
        balance,
        apr,
        minimum_payment: minimumPayment,
        type: formData.type,
        name: formData.name
      });

      if (!validation.valid) {
        showError(validation.errors.join(', '));
        setShowMinPaymentWarning(true);
        setIsSubmitting(false);
        return;
      }

    const debtData: any = {
      type: formData.type,
      name: formData.name,
      balance,
      apr,
      minimumPayment,
      nextPaymentDate: new Date(formData.nextPaymentDate),
      isDelinquent: formData.isDelinquent
    };

    // Add optional fields if provided
    if (formData.lenderName) debtData.lenderName = formData.lenderName;
    if (formData.aprType) debtData.aprType = formData.aprType;
    if (formData.paymentType) debtData.paymentType = formData.paymentType;
    if (formData.actualMonthlyPayment) debtData.actualMonthlyPayment = parseFloat(formData.actualMonthlyPayment);
    if (formData.originalPrincipal) debtData.originalPrincipal = parseFloat(formData.originalPrincipal);
    if (formData.termMonths) debtData.termMonths = parseInt(formData.termMonths);
    if (formData.originationDate) debtData.originationDate = new Date(formData.originationDate);
    if (formData.remainingMonths) debtData.remainingMonths = parseInt(formData.remainingMonths);
    if (formData.creditLimit) debtData.creditLimit = parseFloat(formData.creditLimit);
    if (formData.lateFees) debtData.lateFees = parseFloat(formData.lateFees);
    if (formData.loanProgram) debtData.loanProgram = formData.loanProgram;
    if (formData.type === 'mortgage') {
      debtData.escrowIncluded = formData.escrowIncluded;
      if (formData.propertyTax) debtData.propertyTax = parseFloat(formData.propertyTax);
      if (formData.homeInsurance) debtData.homeInsurance = parseFloat(formData.homeInsurance);
    }

      if (editingDebt && onUpdate) {
        await onUpdate(editingDebt.id, debtData);
      } else {
        await onAdd(debtData);
      }

      // Reset form
      setFormData({
        type: 'credit-card',
        name: '',
        balance: '',
        apr: '',
        minimumPayment: '',
        nextPaymentDate: new Date().toISOString().split('T')[0],
        isDelinquent: false,
        lenderName: '',
        aprType: '',
        paymentType: '',
        actualMonthlyPayment: '',
        originalPrincipal: '',
        termMonths: '',
        originationDate: '',
        remainingMonths: '',
        creditLimit: '',
        lateFees: '',
        loanProgram: '',
        escrowIncluded: false,
        propertyTax: '',
        homeInsurance: ''
      });
      setShowMinPaymentWarning(false);
      setValidationWarnings([]);
      setShowAdvanced(false);
    } catch (error) {
      console.error('Error submitting debt:', error);
      // Error is already shown by the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestMinPayment = async () => {
    if (formData.balance && formData.apr) {
      try {
        const result = await getSuggestedMinimumPayment(
          parseFloat(formData.balance),
          parseFloat(formData.apr),
          formData.type,
          formData.termMonths ? parseInt(formData.termMonths) : undefined
        );
        setFormData({ ...formData, minimumPayment: result.suggested_minimum_payment.toFixed(2) });
        setShowMinPaymentWarning(false);
      } catch (error) {
        console.error('Error getting suggestion:', error);
        showError('Failed to get payment suggestion');
      }
    }
  };

  const isInstallmentLoan = ['auto-loan', 'mortgage', 'student-loan', 'personal-loan', 'installment-loan'].includes(formData.type);
  const isFormValid = formData.name && formData.balance && formData.apr && formData.minimumPayment &&
    (!isInstallmentLoan || formData.termMonths);

  const renderAdvancedFields = () => {
    const commonFields = (
      <>
        <div className="space-y-2">
          <Label htmlFor="lenderName" className="text-[#002B45] font-medium">Lender Name (Optional)</Label>
          <Input
            id="lenderName"
            placeholder="e.g., Chase Bank, Wells Fargo"
            value={formData.lenderName}
            onChange={(e) => setFormData({ ...formData, lenderName: e.target.value })}
            className="border-[#D4DFE4]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="aprType" className="text-[#002B45] font-medium">APR Type (Optional)</Label>
            <Select value={formData.aprType} onValueChange={(value) => setFormData({ ...formData, aprType: value })}>
              <SelectTrigger className="border-[#D4DFE4]">
                <SelectValue placeholder="Select APR type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="variable">Variable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualMonthlyPayment" className="text-[#002B45] font-medium">Actual Monthly Payment (Optional)</Label>
            <Input
              id="actualMonthlyPayment"
              type="number"
              step="0.01"
              placeholder="200.00"
              value={formData.actualMonthlyPayment}
              onChange={(e) => setFormData({ ...formData, actualMonthlyPayment: e.target.value })}
              className="border-[#D4DFE4]"
            />
          </div>
        </div>
      </>
    );

    const loanFields = (
      <>
        <div className="space-y-2">
          <Label htmlFor="originalPrincipal" className="text-[#002B45] font-medium">Original Loan Amount (Optional)</Label>
          <Input
            id="originalPrincipal"
            type="number"
            step="0.01"
            placeholder="25000.00"
            value={formData.originalPrincipal}
            onChange={(e) => setFormData({ ...formData, originalPrincipal: e.target.value })}
            className="border-[#D4DFE4]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="originationDate" className="text-[#002B45] font-medium">Origination Date (Optional)</Label>
            <Input
              id="originationDate"
              type="date"
              value={formData.originationDate}
              onChange={(e) => setFormData({ ...formData, originationDate: e.target.value })}
              className="border-[#D4DFE4]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remainingMonths" className="text-[#002B45] font-medium">Remaining Months (Optional)</Label>
            <Input
              id="remainingMonths"
              type="number"
              placeholder="48"
              value={formData.remainingMonths}
              onChange={(e) => setFormData({ ...formData, remainingMonths: e.target.value })}
              className="border-[#D4DFE4]"
            />
          </div>
        </div>
      </>
    );

    const creditCardFields = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="creditLimit" className="text-[#002B45] font-medium">Credit Limit (Optional)</Label>
            <Input
              id="creditLimit"
              type="number"
              step="0.01"
              placeholder="10000.00"
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
              className="border-[#D4DFE4]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lateFees" className="text-[#002B45] font-medium">Late Fees (Optional)</Label>
            <Input
              id="lateFees"
              type="number"
              step="0.01"
              placeholder="35.00"
              value={formData.lateFees}
              onChange={(e) => setFormData({ ...formData, lateFees: e.target.value })}
              className="border-[#D4DFE4]"
            />
          </div>
        </div>
      </>
    );

    const studentLoanFields = (
      <>
        <div className="space-y-2">
          <Label htmlFor="loanProgram" className="text-[#002B45] font-medium">Loan Program (Optional)</Label>
          <Select value={formData.loanProgram} onValueChange={(value) => setFormData({ ...formData, loanProgram: value })}>
            <SelectTrigger className="border-[#D4DFE4]">
              <SelectValue placeholder="Select loan program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="federal">Federal</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </>
    );

    const mortgageFields = (
      <>
        <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Checkbox
            id="escrowIncluded"
            checked={formData.escrowIncluded}
            onCheckedChange={(checked) => setFormData({ ...formData, escrowIncluded: checked as boolean })}
          />
          <Label htmlFor="escrowIncluded" className="text-sm font-medium text-blue-900 cursor-pointer">
            Escrow included in payment
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="propertyTax" className="text-[#002B45] font-medium">Annual Property Tax (Optional)</Label>
            <Input
              id="propertyTax"
              type="number"
              step="0.01"
              placeholder="3000.00"
              value={formData.propertyTax}
              onChange={(e) => setFormData({ ...formData, propertyTax: e.target.value })}
              className="border-[#D4DFE4]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeInsurance" className="text-[#002B45] font-medium">Annual Home Insurance (Optional)</Label>
            <Input
              id="homeInsurance"
              type="number"
              step="0.01"
              placeholder="1200.00"
              value={formData.homeInsurance}
              onChange={(e) => setFormData({ ...formData, homeInsurance: e.target.value })}
              className="border-[#D4DFE4]"
            />
          </div>
        </div>
      </>
    );

    return (
      <div className="space-y-4">
        {commonFields}
        {formData.type === 'credit-card' && creditCardFields}
        {(formData.type === 'personal-loan' || formData.type === 'auto-loan') && loanFields}
        {formData.type === 'student-loan' && (
          <>
            {loanFields}
            {studentLoanFields}
          </>
        )}
        {formData.type === 'mortgage' && (
          <>
            {loanFields}
            {mortgageFields}
          </>
        )}
      </div>
    );
  };

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
                <SelectItem value="mortgage">Mortgage</SelectItem>
                <SelectItem value="installment-loan">Installment Loan</SelectItem>
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

          {/* Term field for installment loans - required */}
          {['auto-loan', 'mortgage', 'student-loan', 'personal-loan', 'installment-loan'].includes(formData.type) && (
            <div className="space-y-2">
              <Label htmlFor="termMonths" className="text-[#002B45] font-medium">
                Loan Term (Months) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="termMonths"
                type="number"
                placeholder="60"
                value={formData.termMonths}
                onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
                className="border-[#D4DFE4]"
                required
              />
              <p className="text-sm text-[#4F6A7A]">
                Needed to calculate your correct monthly payment amount
              </p>
            </div>
          )}

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
                  disabled={!formData.balance || !formData.apr || isValidating}
                  className="whitespace-nowrap"
                >
                  {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Suggest'}
                </Button>
              </div>
              {showMinPaymentWarning && (
                <p className="text-sm text-red-600">Payment may not cover monthly interest</p>
              )}
              {validationWarnings.length > 0 && (
                <div className="space-y-1">
                  {validationWarnings.map((warning, idx) => (
                    <p key={idx} className="text-sm text-orange-600 flex items-start gap-1">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </p>
                  ))}
                </div>
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

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full border-[#D4DFE4] text-[#002B45] hover:bg-[#F7F9FA]"
              >
                {showAdvanced ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide Advanced Options
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show Advanced Options
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {renderAdvancedFields()}
            </CollapsibleContent>
          </Collapsible>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting || isValidating}
              className="bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingDebt ? 'Updating...' : 'Adding...'}
                </>
              ) : editingDebt ? (
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