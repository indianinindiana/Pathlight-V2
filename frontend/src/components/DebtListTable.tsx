import { useState } from 'react';
import { Debt } from '@/types/debt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit2, Trash2, CreditCard, DollarSign, Percent, Calendar, AlertCircle, GripVertical, ArrowUpDown, Plus } from 'lucide-react';

interface DebtListTableProps {
  debts: Debt[];
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onUpdatePriority?: (debtId: string, priority: number) => void;
}

type SortOption = 'balance-asc' | 'balance-desc' | 'apr-desc' | 'apr-asc' | 'priority' | 'name';

const DebtListTable = ({ debts, onEdit, onDelete, onAddNew, onUpdatePriority }: DebtListTableProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('balance-desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [draggedDebt, setDraggedDebt] = useState<string | null>(null);

  // Find debts with highest interest and largest balance
  const highestInterestDebt = debts.length > 0 ? debts.reduce((max, debt) => debt.apr > max.apr ? debt : max) : null;
  const largestBalanceDebt = debts.length > 0 ? debts.reduce((max, debt) => debt.balance > max.balance ? debt : max) : null;

  const getDebtTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'credit-card': 'Credit Card',
      'personal-loan': 'Personal Loan',
      'student-loan': 'Student Loan',
      'auto-loan': 'Auto Loan'
    };
    return labels[type] || type;
  };

  const getDebtTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'credit-card': 'bg-blue-100 text-blue-800',
      'personal-loan': 'bg-purple-100 text-purple-800',
      'student-loan': 'bg-green-100 text-green-800',
      'auto-loan': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const sortDebts = (debts: Debt[]) => {
    const sorted = [...debts];
    switch (sortBy) {
      case 'balance-asc':
        return sorted.sort((a, b) => a.balance - b.balance);
      case 'balance-desc':
        return sorted.sort((a, b) => b.balance - a.balance);
      case 'apr-desc':
        return sorted.sort((a, b) => b.apr - a.apr);
      case 'apr-asc':
        return sorted.sort((a, b) => a.apr - b.apr);
      case 'priority':
        return sorted.sort((a, b) => (a.customOrder || 999) - (b.customOrder || 999));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  };

  const filterDebts = (debts: Debt[]) => {
    if (filterType === 'all') return debts;
    if (filterType === 'delinquent') return debts.filter(d => d.isDelinquent);
    return debts.filter(d => d.type === filterType);
  };

  const displayedDebts = sortDebts(filterDebts(debts));

  const handleDragStart = (debtId: string) => {
    setDraggedDebt(debtId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetDebtId: string) => {
    if (!draggedDebt || !onUpdatePriority) return;
    
    const draggedIndex = displayedDebts.findIndex(d => d.id === draggedDebt);
    const targetIndex = displayedDebts.findIndex(d => d.id === targetDebtId);
    
    if (draggedIndex !== targetIndex) {
      // Update priorities based on new order
      displayedDebts.forEach((debt, index) => {
        onUpdatePriority(debt.id, index + 1);
      });
    }
    
    setDraggedDebt(null);
  };

  if (debts.length === 0) {
    return (
      <Card className="border-[1.5px] border-[#D4DFE4]">
        <CardContent className="py-12 text-center">
          <CreditCard className="w-12 h-12 text-[#D4DFE4] mx-auto mb-4" />
          <p className="text-[#3A4F61] text-lg mb-4">No debts added yet</p>
          <Button
            onClick={onAddNew}
            className="bg-[#009A8C] hover:bg-[#007F74] text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Debt
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[1.5px] border-[#D4DFE4]">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-[#002B45]">Your Debts ({debts.length})</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px] border-[#D4DFE4]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Debts</SelectItem>
                <SelectItem value="delinquent">Delinquent Only</SelectItem>
                <SelectItem value="credit-card">Credit Cards</SelectItem>
                <SelectItem value="personal-loan">Personal Loans</SelectItem>
                <SelectItem value="student-loan">Student Loans</SelectItem>
                <SelectItem value="auto-loan">Auto Loans</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-full sm:w-[180px] border-[#D4DFE4]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balance-desc">Balance (High → Low)</SelectItem>
                <SelectItem value="balance-asc">Balance (Low → High)</SelectItem>
                <SelectItem value="apr-desc">APR (High → Low)</SelectItem>
                <SelectItem value="apr-asc">APR (Low → High)</SelectItem>
                <SelectItem value="priority">Priority Order</SelectItem>
                <SelectItem value="name">Name (A → Z)</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={onAddNew}
              className="bg-[#009A8C] hover:bg-[#007F74] text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Debt
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-3">
            {displayedDebts.map((debt, index) => (
              <div
                key={debt.id}
                draggable={sortBy === 'priority'}
                onDragStart={() => handleDragStart(debt.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(debt.id)}
                className={`p-4 border-[1.5px] rounded-lg transition-all ${
                  draggedDebt === debt.id
                    ? 'border-[#009A8C] bg-[#E7F7F4] opacity-50'
                    : 'border-[#D4DFE4] hover:border-[#009A8C]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {sortBy === 'priority' && (
                    <div className="cursor-move pt-1">
                      <GripVertical className="w-5 h-5 text-[#4F6A7A]" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-[#002B45]">{debt.name}</h3>
                      <Badge className={`${getDebtTypeColor(debt.type)} border-0`}>
                        {getDebtTypeLabel(debt.type)}
                      </Badge>
                      {debt.isDelinquent && (
                        <Badge className="bg-red-100 text-red-800 border-0">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Delinquent
                        </Badge>
                      )}
                      {highestInterestDebt && debt.id === highestInterestDebt.id && (
                        <Badge className="bg-[#E7F7F4] text-[#009A8C] border-0 font-semibold">
                          🔥 Highest Interest
                        </Badge>
                      )}
                      {largestBalanceDebt && debt.id === largestBalanceDebt.id && (
                        <Badge className="bg-blue-50 text-blue-600 border-0 font-semibold">
                          💰 Largest Balance
                        </Badge>
                      )}
                      {debt.customOrder && (
                        <Badge className="bg-purple-100 text-purple-800 border-0">
                          Priority #{debt.customOrder}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <DollarSign className="w-4 h-4 text-[#4F6A7A]" />
                            <div>
                              <p className="text-xs text-[#4F6A7A]">Balance</p>
                              <p className="font-semibold text-[#002B45]">${debt.balance.toLocaleString()}</p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Current outstanding balance on this debt</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <Percent className="w-4 h-4 text-[#4F6A7A]" />
                            <div>
                              <p className="text-xs text-[#4F6A7A]">APR</p>
                              <p className="font-semibold text-[#002B45]">{debt.apr}%</p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Annual Percentage Rate - the yearly interest cost</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <DollarSign className="w-4 h-4 text-[#4F6A7A]" />
                            <div>
                              <p className="text-xs text-[#4F6A7A]">Min Payment</p>
                              <p className="font-semibold text-[#002B45]">${debt.minimumPayment}</p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Minimum monthly payment required</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#4F6A7A]" />
                        <div>
                          <p className="text-xs text-[#4F6A7A]">Next Due</p>
                          <p className="font-semibold text-[#002B45]">
                            {new Date(debt.nextPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(debt)}
                      className="border-[#D4DFE4] text-[#002B45] hover:bg-[#F7F9FA] rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${debt.name}?`)) {
                          onDelete(debt.id);
                        }
                      }}
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>
        
        {sortBy === 'priority' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Drag and drop debts to set your custom payoff priority order
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtListTable;