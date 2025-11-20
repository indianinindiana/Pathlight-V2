import { Debt, FinancialContext, PayoffScenario } from '@/types/debt';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data generators
export const mockApiService = {
  // Personalization API
  async getPersonalizedMicrocopy(context: {
    stressLevel: number;
    cashFlow: number;
    debtCount: number;
    goal: string;
  }): Promise<{
    alerts: Array<{
      type: 'warning' | 'info' | 'success';
      message: string;
      condition: boolean;
    }>;
    hints: Array<{
      location: string;
      message: string;
    }>;
  }> {
    await delay(300);

    const alerts = [];
    const hints = [];

    // Stress-based alerts
    if (context.stressLevel >= 4) {
      alerts.push({
        type: 'warning' as const,
        message: "We notice you're feeling stressed. Let's focus on creating breathing room first.",
        condition: true
      });
    }

    // Cash flow alerts
    if (context.cashFlow < 0) {
      alerts.push({
        type: 'warning' as const,
        message: 'Your expenses exceed income. Let\'s explore ways to free up cash flow.',
        condition: true
      });
    } else if (context.cashFlow > 500) {
      alerts.push({
        type: 'success' as const,
        message: `You have $${context.cashFlow.toFixed(0)} available monthly. Great position to accelerate debt payoff!`,
        condition: true
      });
    }

    // Goal-based hints
    if (context.goal === 'pay-faster' && context.cashFlow > 200) {
      hints.push({
        location: 'scenarios',
        message: 'With your available cash flow, you could be debt-free 12-18 months faster with the Avalanche method.'
      });
    }

    return { alerts, hints };
  },

  // Next Best Actions API
  async getNextBestActions(context: {
    debts: Debt[];
    financialContext: FinancialContext | null;
    cashFlow: number;
  }): Promise<Array<{
    priority: number;
    title: string;
    description: string;
    impact: string;
    cta: string;
    action: string;
    progress: number;
    confidence: 'high' | 'medium' | 'low';
  }>> {
    await delay(400);

    const actions = [];

    // Emergency savings check
    if (context.financialContext && context.financialContext.liquidSavings < 500) {
      actions.push({
        priority: 1,
        title: 'Build Emergency Buffer',
        description: 'Save $500 before aggressive debt payoff to prevent new debt from emergencies',
        impact: 'Prevents falling behind on payments',
        cta: 'Start Saving Plan',
        action: 'emergency-savings',
        progress: context.financialContext.liquidSavings / 500,
        confidence: 'high' as const
      });
    }

    // High interest debt
    const highInterestDebt = context.debts.find(d => d.apr > 20);
    if (highInterestDebt && context.cashFlow > 100) {
      actions.push({
        priority: actions.length + 1,
        title: 'Attack High-Interest Debt',
        description: `Pay extra $${Math.min(context.cashFlow, 200).toFixed(0)}/month on ${highInterestDebt.name} (${highInterestDebt.apr}% APR)`,
        impact: `Save $${(highInterestDebt.balance * (highInterestDebt.apr / 100) * 0.5).toFixed(0)} in interest over 2 years`,
        cta: 'Start Avalanche Plan',
        action: 'high-interest-focus',
        progress: 0,
        confidence: 'high' as const
      });
    }

    // Cash flow optimization
    if (context.cashFlow < 100 && context.cashFlow > 0) {
      actions.push({
        priority: actions.length + 1,
        title: 'Optimize Monthly Budget',
        description: 'Review expenses to free up $100-200/month for debt payments',
        impact: 'Could reduce payoff time by 6-12 months',
        cta: 'Review Budget',
        action: 'budget-review',
        progress: 0,
        confidence: 'medium' as const
      });
    }

    // Consolidation opportunity
    if (context.debts.length >= 3 && context.financialContext?.creditScoreRange && 
        ['670-739', '740-799', '800-850'].includes(context.financialContext.creditScoreRange)) {
      const avgAPR = context.debts.reduce((sum, d) => sum + d.apr, 0) / context.debts.length;
      if (avgAPR > 12) {
        actions.push({
          priority: actions.length + 1,
          title: 'Explore Debt Consolidation',
          description: `With your ${context.financialContext.creditScoreRange} credit score, you may qualify for 8-10% APR`,
          impact: `Could save $${(context.debts.reduce((sum, d) => sum + d.balance, 0) * 0.05).toFixed(0)}/year in interest`,
          cta: 'See Options',
          action: 'consolidation',
          progress: 0,
          confidence: 'medium' as const
        });
      }
    }

    return actions.slice(0, 3); // Return top 3 actions
  },

  // Recommendation Engine API
  async getRecommendations(context: {
    debts: Debt[];
    financialContext: FinancialContext | null;
    currentStrategy?: string;
  }): Promise<{
    recommendedStrategy: 'snowball' | 'avalanche' | 'hybrid';
    confidence: 'high' | 'medium' | 'low';
    factors: Array<{ name: string; met: boolean }>;
    explanation: string;
    alternatives: Array<{
      strategy: string;
      reason: string;
    }>;
  }> {
    await delay(500);

    const totalDebt = context.debts.reduce((sum, d) => sum + d.balance, 0);
    const avgAPR = context.debts.reduce((sum, d) => sum + d.apr, 0) / context.debts.length;
    const highestAPR = Math.max(...context.debts.map(d => d.apr));

    let recommendedStrategy: 'snowball' | 'avalanche' | 'hybrid' = 'avalanche';
    let confidence: 'high' | 'medium' | 'low' = 'high';
    let explanation = '';

    // Decision logic
    if (context.financialContext?.stressLevel && context.financialContext.stressLevel >= 4) {
      recommendedStrategy = 'snowball';
      explanation = 'Given your stress level, the Snowball method provides quick wins to build momentum and motivation.';
    } else if (highestAPR > 18) {
      recommendedStrategy = 'avalanche';
      explanation = 'The Avalanche method will save you the most money by targeting your high-interest debts first.';
    } else if (context.debts.length > 5) {
      recommendedStrategy = 'hybrid';
      explanation = 'A hybrid approach balances motivation (quick wins) with savings (high-interest focus).';
      confidence = 'medium';
    }

    const factors = [
      { name: 'Complete debt information', met: context.debts.length > 0 },
      { name: 'Accurate income data', met: !!context.financialContext?.monthlyIncome },
      { name: 'Recent credit score', met: !!context.financialContext?.creditScoreRange },
      { name: 'Clear financial goals', met: !!context.financialContext?.primaryGoal }
    ];

    const alternatives = [];
    if (recommendedStrategy !== 'snowball') {
      alternatives.push({
        strategy: 'Snowball',
        reason: 'Better for motivation through quick wins'
      });
    }
    if (recommendedStrategy !== 'avalanche') {
      alternatives.push({
        strategy: 'Avalanche',
        reason: 'Saves the most money on interest'
      });
    }

    return {
      recommendedStrategy,
      confidence,
      factors,
      explanation,
      alternatives
    };
  },

  // Scenario Simulation API
  async simulateScenario(params: {
    debts: Debt[];
    monthlyPayment: number;
    strategy: 'snowball' | 'avalanche' | 'custom';
    modifications?: {
      incomeChange?: number;
      expenseChange?: number;
      aprChange?: { debtId: string; newAPR: number }[];
    };
  }): Promise<PayoffScenario> {
    await delay(600);

    // This would normally call the backend calculation engine
    // For now, return mock data
    const baseMonths = 48;
    const baseInterest = 8500;

    // Adjust based on modifications
    let adjustedMonths = baseMonths;
    let adjustedInterest = baseInterest;

    if (params.modifications?.incomeChange) {
      const extraPayment = params.modifications.incomeChange;
      adjustedMonths = Math.max(12, baseMonths - Math.floor(extraPayment / 50));
      adjustedInterest = baseInterest * (adjustedMonths / baseMonths);
    }

    return {
      id: `scenario-${Date.now()}`,
      name: `${params.strategy.charAt(0).toUpperCase() + params.strategy.slice(1)} Strategy`,
      strategy: params.strategy,
      monthlyPayment: params.monthlyPayment,
      totalMonths: adjustedMonths,
      totalInterest: adjustedInterest,
      payoffDate: new Date(Date.now() + adjustedMonths * 30 * 24 * 60 * 60 * 1000),
      schedule: [] // Would be populated with detailed schedule
    };
  },

  // AI Insights API
  async getAIInsights(context: {
    debts: Debt[];
    financialContext: FinancialContext | null;
    scenarios: PayoffScenario[];
  }): Promise<{
    summary: string;
    keyInsights: string[];
    recommendations: string[];
    motivationalMessage: string;
  }> {
    await delay(700);

    const totalDebt = context.debts.reduce((sum, d) => sum + d.balance, 0);
    const avgAPR = context.debts.reduce((sum, d) => sum + d.apr, 0) / context.debts.length;

    return {
      summary: `You have $${totalDebt.toLocaleString()} in debt across ${context.debts.length} accounts with an average APR of ${avgAPR.toFixed(1)}%. Based on your financial situation, you have several paths to becoming debt-free.`,
      keyInsights: [
        `Your highest-interest debt (${Math.max(...context.debts.map(d => d.apr)).toFixed(1)}% APR) is costing you the most`,
        `With your current minimum payments, you'll pay $${(totalDebt * 0.3).toFixed(0)} in interest`,
        `Paying an extra $100/month could save you $${(totalDebt * 0.1).toFixed(0)} and 12 months`
      ],
      recommendations: [
        'Focus on your highest-interest debt first to maximize savings',
        'Consider building a $500 emergency fund before aggressive payoff',
        'Look into balance transfer offers for your credit card debt'
      ],
      motivationalMessage: context.financialContext?.stressLevel && context.financialContext.stressLevel >= 4
        ? "You're taking the right steps by seeking help. Every journey starts with a single step, and you've already taken it."
        : "You're in a strong position to tackle this debt. With focus and consistency, you'll be debt-free sooner than you think."
    };
  },

  // Confidence Scoring API
  async getConfidenceScore(context: {
    debts: Debt[];
    financialContext: FinancialContext | null;
  }): Promise<{
    level: 'high' | 'medium' | 'low';
    score: number;
    factors: Array<{ name: string; met: boolean; weight: number }>;
    suggestions: string[];
  }> {
    await delay(300);

    const factors = [
      {
        name: 'Complete debt information',
        met: context.debts.length > 0 && context.debts.every(d => d.balance > 0 && d.apr > 0),
        weight: 0.3
      },
      {
        name: 'Accurate income data',
        met: !!context.financialContext?.monthlyIncome && context.financialContext.monthlyIncome > 0,
        weight: 0.25
      },
      {
        name: 'Expense tracking',
        met: !!context.financialContext?.monthlyExpenses && context.financialContext.monthlyExpenses > 0,
        weight: 0.2
      },
      {
        name: 'Recent credit score',
        met: !!context.financialContext?.creditScoreRange,
        weight: 0.15
      },
      {
        name: 'Clear financial goals',
        met: !!context.financialContext?.primaryGoal,
        weight: 0.1
      }
    ];

    const score = factors.reduce((sum, f) => sum + (f.met ? f.weight : 0), 0);
    
    let level: 'high' | 'medium' | 'low';
    if (score >= 0.8) level = 'high';
    else if (score >= 0.5) level = 'medium';
    else level = 'low';

    const suggestions = factors
      .filter(f => !f.met)
      .map(f => {
        switch (f.name) {
          case 'Recent credit score':
            return 'Adding your credit score would improve recommendation accuracy';
          case 'Expense tracking':
            return 'Tracking your monthly expenses helps us suggest realistic payment plans';
          case 'Accurate income data':
            return 'Providing accurate income information ensures better recommendations';
          default:
            return `Complete ${f.name.toLowerCase()} for better recommendations`;
        }
      });

    return { level, score, factors, suggestions };
  }
};