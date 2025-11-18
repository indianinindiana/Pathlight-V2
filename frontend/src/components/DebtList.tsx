import { Debt } from '@/types/debt';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, CreditCard, DollarSign, Percent, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DebtListProps {
  debts: Debt[];
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
}

const DebtList = ({ debts, onEdit, onDelete }: DebtListProps) => {
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

  if (debts.length === 0) {
    return (
      <Card className="border-[1.5px] border-[#D4DFE4]">
        <CardContent className="py-12 text-center">
          <CreditCard className="w-12 h-12 text-[#D4DFE4] mx-auto mb-4" />
          <p className="text-[#3A4F61] text-lg">No debts added yet</p>
          <p className="text-[#4F6A7A] text-sm mt-2">Add your first debt above to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {debts.map((debt) => (
        <Card key={debt.id} className="border-[1.5px] border-[#D4DFE4] hover:border-[#009A8C] transition-colors">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-[#002B45]">{debt.name}</h3>
                  <Badge className={`${getDebtTypeColor(debt.type)} border-0`}>
                    {getDebtTypeLabel(debt.type)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#4F6A7A]" />
                    <div>
                      <p className="text-xs text-[#4F6A7A]">Balance</p>
                      <p className="font-semibold text-[#002B45]">${debt.balance.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-[#4F6A7A]" />
                    <div>
                      <p className="text-xs text-[#4F6A7A]">APR</p>
                      <p className="font-semibold text-[#002B45]">{debt.apr}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#4F6A7A]" />
                    <div>
                      <p className="text-xs text-[#4F6A7A]">Min Payment</p>
                      <p className="font-semibold text-[#002B45]">${debt.minimumPayment}</p>
                    </div>
                  </div>
                  
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
              
              <div className="flex gap-2 md:flex-col">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(debt)}
                  className="border-[#D4DFE4] text-[#002B45] hover:bg-[#F7F9FA] rounded-lg flex-1 md:flex-none"
                >
                  <Edit2 className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${debt.name}?`)) {
                      onDelete(debt.id);
                    }
                  }}
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg flex-1 md:flex-none"
                >
                  <Trash2 className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Delete</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DebtList;