import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import DebtEntryForm from '@/components/DebtEntryForm';
import DebtList from '@/components/DebtList';
import CSVImportDialog from '@/components/CSVImportDialog';
import { Debt } from '@/types/debt';
import { showSuccess } from '@/utils/toast';

const DebtEntry = () => {
  const navigate = useNavigate();
  const { debts, addDebt, updateDebt, deleteDebt, setCalibrationComplete, loadDebts, isLoadingDebts } = useDebt();
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const handleAddDebt = async (debt: Omit<Debt, 'id'>) => {
    await addDebt(debt);
    setEditingDebt(null);
  };

  const handleUpdateDebt = async (id: string, updates: Partial<Debt>) => {
    await updateDebt(id, updates);
    setEditingDebt(null);
  };

  const handleImportComplete = () => {
    // Reload debts after CSV import
    loadDebts();
  };

  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinue = () => {
    if (debts.length === 0) {
      showSuccess('Please add at least one debt to continue');
      return;
    }
    setCalibrationComplete(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-5 md:py-6">
            <div className="flex items-center">
              <img src="/pathlight-logo.png" alt="PathLight" className="w-8 h-8 md:w-10 md:h-10 mr-2.5" />
              <h1 className="text-[20px] md:text-[24px] font-bold text-[#002B45] tracking-tight" style={{ letterSpacing: '-0.5%' }}>
                PathLight
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#002B45] mb-3">
            Tell us about your debts
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#3A4F61]">
            Add each debt individually or upload a CSV file with all your debts
          </p>
        </div>

        {/* Debt Entry Form */}
        <div className="mb-8">
          <DebtEntryForm
            onAdd={handleAddDebt}
            onCancel={editingDebt ? () => setEditingDebt(null) : undefined}
            editingDebt={editingDebt}
            onUpdate={handleUpdateDebt}
          />
        </div>

        {/* CSV Upload Option */}
        <div className="mb-8">
          <CSVImportDialog onImportComplete={handleImportComplete} />
          <p className="text-sm text-[#4F6A7A] mt-2">
            Have multiple debts? Upload a CSV file to add them all at once
          </p>
        </div>

        {/* Debt List */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-[#002B45] mb-4">
            Your Debts ({debts.length})
            {isLoadingDebts && <span className="text-sm text-[#4F6A7A] ml-2">(Loading...)</span>}
          </h3>
          <DebtList
            debts={debts}
            onEdit={handleEditDebt}
            onDelete={deleteDebt}
          />
        </div>

        {/* Continue Button */}
        {debts.length > 0 && (
          <div className="flex justify-center pt-6">
            <Button
              size="lg"
              onClick={handleContinue}
              className="bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold text-[18px] py-5 px-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              Continue to Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtEntry;