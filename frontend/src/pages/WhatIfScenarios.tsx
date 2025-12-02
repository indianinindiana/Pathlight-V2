import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '@/context/DebtContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, TrendingUp, Shuffle, HandshakeIcon, CreditCard, X } from 'lucide-react';
import WhatIfTemplateCard from '@/components/WhatIfTemplateCard';
import WhatIfComparison from '@/components/WhatIfComparison';
import { calculatePayoffScenario, calculateTotalDebt } from '@/utils/debtCalculations';
import { WhatIfScenario, PayoffScenario } from '@/types/debt';
import { showSuccess, showError } from '@/utils/toast';

type WhatIfTemplate = 'extra-payment' | 'consolidation' | 'settlement' | 'balance-transfer';

const WhatIfScenarios = () => {
  const navigate = useNavigate();
  const { debts, scenarios, whatIfScenarios, addWhatIfScenario, removeWhatIfScenario } = useDebt();
  const [selectedTemplate, setSelectedTemplate] = useState<WhatIfTemplate | null>(null);
  const [baseScenario, setBaseScenario] = useState<PayoffScenario | null>(null);
  const [templateParams, setTemplateParams] = useState<Record<string, any>>({});

  useEffect(() => {
    if (debts.length === 0) {
      navigate('/debt-entry');
      return;
    }

    // Set base scenario (use first scenario or generate one)
    if (scenarios.length > 0) {
      setBaseScenario(scenarios[0]);
    } else {
      const minPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
      const generated = calculatePayoffScenario(debts, 'avalanche', minPayment);
      setBaseScenario(generated);
    }
  }, [debts, scenarios]);

  const templates = [
    {
      type: 'extra-payment' as WhatIfTemplate,
      title: 'Pay Extra Each Month',
      description: 'See how paying more accelerates your debt freedom',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-800',
      iconBg: 'bg-green-50'
    },
    {
      type: 'consolidation' as WhatIfTemplate,
      title: 'Consolidate Debts',
      description: 'Combine multiple debts into one lower-rate loan',
      icon: Shuffle,
      color: 'bg-blue-100 text-blue-800',
      iconBg: 'bg-blue-50'
    },
    {
      type: 'settlement' as WhatIfTemplate,
      title: 'Debt Settlement',
      description: 'Negotiate to pay less than you owe',
      icon: HandshakeIcon,
      color: 'bg-orange-100 text-orange-800',
      iconBg: 'bg-orange-50'
    },
    {
      type: 'balance-transfer' as WhatIfTemplate,
      title: 'Balance Transfer',
      description: 'Move high-interest debt to 0% promotional rate',
      icon: CreditCard,
      color: 'bg-purple-100 text-purple-800',
      iconBg: 'bg-purple-50'
    }
  ];

  const handleTemplateSelect = (template: WhatIfTemplate) => {
    setSelectedTemplate(template);
    // Set default parameters based on template
    switch (template) {
      case 'extra-payment':
        setTemplateParams({ extraAmount: 100 });
        break;
      case 'consolidation':
        setTemplateParams({ newAPR: 8.0, selectedDebtIds: debts.map(d => d.id) });
        break;
      case 'settlement':
        setTemplateParams({ settlementPercentage: 60, upfrontPayment: 0 });
        break;
      case 'balance-transfer':
        setTemplateParams({ promoAPR: 0, promoMonths: 12, transferFee: 3, newAPR: 15 });
        break;
    }
  };

  const handleCreateWhatIf = () => {
    if (!baseScenario || !selectedTemplate) return;

    let whatIfResult: PayoffScenario;
    let whatIfName: string;

    try {
      switch (selectedTemplate) {
        case 'extra-payment':
          const extraAmount = parseFloat(templateParams.extraAmount || 0);
          const newPayment = baseScenario.monthlyPayment + extraAmount;
          whatIfResult = calculatePayoffScenario(debts, baseScenario.strategy, newPayment);
          whatIfName = `Pay Extra $${extraAmount}/month`;
          break;

        case 'consolidation':
          const newAPR = parseFloat(templateParams.newAPR || 8);
          const totalDebt = calculateTotalDebt(debts);
          const consolidatedDebt = {
            id: 'consolidated',
            type: 'personal-loan' as const,
            name: 'Consolidated Loan',
            balance: totalDebt,
            apr: newAPR,
            minimumPayment: baseScenario.monthlyPayment,
            nextPaymentDate: new Date()
          };
          whatIfResult = calculatePayoffScenario([consolidatedDebt], 'avalanche', baseScenario.monthlyPayment);
          whatIfName = `Consolidation at ${newAPR}% APR`;
          break;

        case 'settlement':
          const settlementPct = parseFloat(templateParams.settlementPercentage || 60);
          const settledDebts = debts.map(d => ({
            ...d,
            balance: d.balance * (settlementPct / 100)
          }));
          whatIfResult = calculatePayoffScenario(settledDebts, baseScenario.strategy, baseScenario.monthlyPayment);
          whatIfName = `Settlement at ${settlementPct}% of balance`;
          break;

        case 'balance-transfer':
          const promoAPR = parseFloat(templateParams.promoAPR || 0);
          const promoMonths = parseInt(templateParams.promoMonths || 12);
          const transferFee = parseFloat(templateParams.transferFee || 3);
          const creditCardDebts = debts.filter(d => d.type === 'credit-card');
          const totalCCDebt = creditCardDebts.reduce((sum, d) => sum + d.balance, 0);
          const transferredDebt = {
            id: 'balance-transfer',
            type: 'credit-card' as const,
            name: 'Balance Transfer Card',
            balance: totalCCDebt * (1 + transferFee / 100),
            apr: promoAPR,
            minimumPayment: baseScenario.monthlyPayment,
            nextPaymentDate: new Date()
          };
          whatIfResult = calculatePayoffScenario([transferredDebt], 'avalanche', baseScenario.monthlyPayment);
          whatIfName = `Balance Transfer (${promoAPR}% for ${promoMonths} months)`;
          break;

        default:
          throw new Error('Invalid template');
      }

      const whatIfScenario: WhatIfScenario = {
        id: `whatif-${Date.now()}`,
        type: selectedTemplate,
        name: whatIfName,
        baseScenarioId: baseScenario.id,
        parameters: templateParams,
        result: whatIfResult
      };

      addWhatIfScenario(whatIfScenario);
      showSuccess('What-if scenario created successfully');
      setSelectedTemplate(null);
      setTemplateParams({});
    } catch (error) {
      showError('Failed to create what-if scenario');
      console.error(error);
    }
  };

  const handleRemoveWhatIf = (id: string) => {
    removeWhatIfScenario(id);
    showSuccess('What-if scenario removed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-teal-50/20">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-5 md:py-6">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img src="/pathlight-logo.png" alt="PathLight" className="w-8 h-8 md:w-10 md:h-10 mr-2.5" />
              <h1 className="text-[20px] md:text-[24px] font-bold text-[#002B45] tracking-tight">
                PathLight
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/scenarios')}
              className="border-[#D4DFE4] text-[#002B45] rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scenarios
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#002B45] mb-3">
            Explore "What If?" Scenarios
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#3A4F61]">
            See how different strategies could change your debt payoff journey
          </p>
        </div>

        {/* Template Selection */}
        {!selectedTemplate && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#002B45] mb-4">Choose a scenario to explore</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <WhatIfTemplateCard
                  key={template.type}
                  template={template}
                  onClick={() => handleTemplateSelect(template.type)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Template Configuration */}
        {selectedTemplate && (
          <Card className="border-[1.5px] border-[#D4DFE4] mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#002B45]">
                    Configure Your Scenario
                  </CardTitle>
                  <CardDescription className="text-[#3A4F61]">
                    {templates.find(t => t.type === selectedTemplate)?.description}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setTemplateParams({});
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedTemplate === 'extra-payment' && (
                  <div className="space-y-2">
                    <Label htmlFor="extraAmount" className="text-[#002B45] font-medium">
                      Extra Monthly Payment
                    </Label>
                    <Input
                      id="extraAmount"
                      type="number"
                      placeholder="100"
                      value={templateParams.extraAmount || ''}
                      onChange={(e) => setTemplateParams({ ...templateParams, extraAmount: e.target.value })}
                      className="border-[#D4DFE4]"
                    />
                    <p className="text-sm text-[#4F6A7A]">
                      How much extra can you pay each month?
                    </p>
                  </div>
                )}

                {selectedTemplate === 'consolidation' && (
                  <div className="space-y-2">
                    <Label htmlFor="newAPR" className="text-[#002B45] font-medium">
                      New Consolidated APR (%)
                    </Label>
                    <Input
                      id="newAPR"
                      type="number"
                      step="0.1"
                      placeholder="8.0"
                      value={templateParams.newAPR || ''}
                      onChange={(e) => setTemplateParams({ ...templateParams, newAPR: e.target.value })}
                      className="border-[#D4DFE4]"
                    />
                    <p className="text-sm text-[#4F6A7A]">
                      What interest rate could you get on a consolidation loan?
                    </p>
                  </div>
                )}

                {selectedTemplate === 'settlement' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="settlementPercentage" className="text-[#002B45] font-medium">
                        Settlement Percentage (%)
                      </Label>
                      <Input
                        id="settlementPercentage"
                        type="number"
                        placeholder="60"
                        value={templateParams.settlementPercentage || ''}
                        onChange={(e) => setTemplateParams({ ...templateParams, settlementPercentage: e.target.value })}
                        className="border-[#D4DFE4]"
                      />
                      <p className="text-sm text-[#4F6A7A]">
                        What percentage of your debt could you settle for?
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800 font-medium mb-1">⚠️ Important Trade-offs</p>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• Significant negative impact on credit score</li>
                        <li>• May have tax implications on forgiven debt</li>
                        <li>• Not all creditors will agree to settlement</li>
                      </ul>
                    </div>
                  </>
                )}

                {selectedTemplate === 'balance-transfer' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="promoAPR" className="text-[#002B45] font-medium">
                          Promotional APR (%)
                        </Label>
                        <Input
                          id="promoAPR"
                          type="number"
                          step="0.1"
                          placeholder="0"
                          value={templateParams.promoAPR || ''}
                          onChange={(e) => setTemplateParams({ ...templateParams, promoAPR: e.target.value })}
                          className="border-[#D4DFE4]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="promoMonths" className="text-[#002B45] font-medium">
                          Promo Period (months)
                        </Label>
                        <Input
                          id="promoMonths"
                          type="number"
                          placeholder="12"
                          value={templateParams.promoMonths || ''}
                          onChange={(e) => setTemplateParams({ ...templateParams, promoMonths: e.target.value })}
                          className="border-[#D4DFE4]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transferFee" className="text-[#002B45] font-medium">
                        Transfer Fee (%)
                      </Label>
                      <Input
                        id="transferFee"
                        type="number"
                        step="0.1"
                        placeholder="3"
                        value={templateParams.transferFee || ''}
                        onChange={(e) => setTemplateParams({ ...templateParams, transferFee: e.target.value })}
                        className="border-[#D4DFE4]"
                      />
                    </div>
                  </>
                )}

                <Button
                  onClick={handleCreateWhatIf}
                  className="w-full bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Scenario
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active What-If Scenarios */}
        {whatIfScenarios.length > 0 && baseScenario && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#002B45] mb-4">
              Your What-If Scenarios ({whatIfScenarios.length})
            </h3>
            <WhatIfComparison
              baseScenario={baseScenario}
              whatIfScenarios={whatIfScenarios}
              onRemove={handleRemoveWhatIf}
            />
          </div>
        )}

        {whatIfScenarios.length === 0 && !selectedTemplate && (
          <Card className="border-[1.5px] border-[#D4DFE4]">
            <CardContent className="py-12 text-center">
              <p className="text-[#3A4F61] text-lg mb-2">No what-if scenarios yet</p>
              <p className="text-[#4F6A7A] text-sm">
                Select a template above to explore different debt payoff options
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WhatIfScenarios;