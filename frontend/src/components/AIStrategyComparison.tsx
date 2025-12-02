import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  Clock,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { compareStrategies, type AIStrategyComparisonResponse } from '@/services/claraAiApi';

interface StrategyData {
  total_months: number;
  total_interest: number;
  first_debt_paid: string;
}

interface AIStrategyComparisonProps {
  profileId: string;
  snowballData: StrategyData;
  avalancheData: StrategyData;
  className?: string;
  onStrategySelect?: (strategy: 'snowball' | 'avalanche') => void;
}

export const AIStrategyComparison: React.FC<AIStrategyComparisonProps> = ({ 
  profileId,
  snowballData,
  avalancheData,
  className = '',
  onStrategySelect
}) => {
  const [comparison, setComparison] = useState<AIStrategyComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComparison();
  }, [profileId, snowballData, avalancheData]);

  const loadComparison = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await compareStrategies({
        profile_id: profileId,
        snowball_data: snowballData,
        avalanche_data: avalancheData
      });
      
      setComparison(response);
    } catch (err) {
      console.error('Error comparing strategies:', err);
      setError(err instanceof Error ? err.message : 'Failed to compare strategies');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    const config = {
      high: { color: 'bg-green-100 text-green-800 border-green-300', label: 'High Confidence', icon: CheckCircle2 },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Medium Confidence', icon: AlertCircle },
      low: { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Lower Confidence', icon: AlertCircle }
    };

    const { color, label, icon: Icon } = config[confidence];

    return (
      <Badge className={`${color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
    return `${years}y ${remainingMonths}m`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <img
              src="/clara-avatar.png"
              alt="Clara"
              className="w-6 h-6 rounded-full object-cover"
            />
            <CardTitle>Clara's Strategy Recommendation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <img
              src="/clara-avatar.png"
              alt="Clara"
              className="w-6 h-6 rounded-full object-cover"
            />
            <CardTitle>Clara's Strategy Recommendation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            className="mt-4 w-full"
            onClick={loadComparison}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!comparison) {
    return null;
  }

  const recommended = comparison.response.recommended_strategy;
  const notRecommended = recommended === 'snowball' ? 'avalanche' : 'snowball';
  const recommendedData = recommended === 'snowball' ? snowballData : avalancheData;
  const notRecommendedData = recommended === 'snowball' ? avalancheData : snowballData;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/clara-avatar.png"
              alt="Clara"
              className="w-6 h-6 rounded-full object-cover"
            />
            <CardTitle>Clara's Strategy Recommendation</CardTitle>
          </div>
          {getConfidenceBadge(comparison.response.confidence)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommended Strategy */}
        <div className="p-6 bg-gradient-to-br from-[#E7F7F4] to-white rounded-lg border-2 border-[#009A8C]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-[#009A8C]" />
                <h3 className="text-lg font-semibold text-[#002B45] capitalize">
                  {recommended} Method
                </h3>
                <Badge className="bg-[#009A8C] text-white">Recommended</Badge>
              </div>
              <p className="text-sm text-[#3A4F61]">
                {recommended === 'snowball' 
                  ? 'Pay off smallest debts first for quick wins'
                  : 'Pay off highest interest debts first to save money'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <Clock className="w-5 h-5 text-[#009A8C] mx-auto mb-1" />
              <p className="text-xs text-[#4F6A7A] mb-1">Time to Payoff</p>
              <p className="text-lg font-bold text-[#002B45]">
                {formatMonths(recommendedData.total_months)}
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <DollarSign className="w-5 h-5 text-[#009A8C] mx-auto mb-1" />
              <p className="text-xs text-[#4F6A7A] mb-1">Total Interest</p>
              <p className="text-lg font-bold text-[#002B45]">
                {formatCurrency(recommendedData.total_interest)}
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#009A8C] mx-auto mb-1" />
              <p className="text-xs text-[#4F6A7A] mb-1">First Win</p>
              <p className="text-sm font-semibold text-[#002B45] truncate">
                {recommendedData.first_debt_paid}
              </p>
            </div>
          </div>

          {onStrategySelect && (
            <Button 
              className="w-full bg-[#009A8C] hover:bg-[#007F74]"
              onClick={() => onStrategySelect(recommended)}
            >
              Choose {recommended.charAt(0).toUpperCase() + recommended.slice(1)} Method
            </Button>
          )}
        </div>

        {/* Clara's Reasoning */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img
              src="/clara-avatar.png"
              alt="Clara"
              className="w-5 h-5 rounded-full object-cover"
            />
            <h4 className="font-semibold text-[#002B45]">Why Clara Recommends This</h4>
          </div>
          <p className="text-sm text-[#3A4F61] leading-relaxed">
            {comparison.response.reasoning}
          </p>
        </div>

        {/* Trade-offs */}
        <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-[#002B45] mb-1">Trade-offs to Consider</h4>
              <p className="text-sm text-[#3A4F61]">
                {comparison.response.trade_offs}
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Strategy */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-[#002B45] capitalize">
              {notRecommended} Method (Alternative)
            </h4>
            <Badge variant="outline" className="text-xs">
              Not Recommended
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-[#4F6A7A] mb-1">Time</p>
              <p className="text-sm font-semibold text-[#002B45]">
                {formatMonths(notRecommendedData.total_months)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#4F6A7A] mb-1">Interest</p>
              <p className="text-sm font-semibold text-[#002B45]">
                {formatCurrency(notRecommendedData.total_interest)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#4F6A7A] mb-1">First Win</p>
              <p className="text-xs font-semibold text-[#002B45] truncate">
                {notRecommendedData.first_debt_paid}
              </p>
            </div>
          </div>

          {onStrategySelect && (
            <Button 
              variant="outline"
              className="w-full mt-3 border-[#D4DFE4] hover:border-[#009A8C]"
              onClick={() => onStrategySelect(notRecommended)}
            >
              Choose {notRecommended.charAt(0).toUpperCase() + notRecommended.slice(1)} Instead
            </Button>
          )}
        </div>

        {/* Comparison Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <TrendingDown className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-[#4F6A7A] mb-1">Interest Difference</p>
            <p className="text-lg font-bold text-[#002B45]">
              {formatCurrency(Math.abs(snowballData.total_interest - avalancheData.total_interest))}
            </p>
            <p className="text-xs text-[#4F6A7A] mt-1">
              {avalancheData.total_interest < snowballData.total_interest 
                ? 'Avalanche saves more'
                : 'Snowball saves more'}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <Clock className="w-5 h-5 text-purple-600 mx-auto mb-2" />
            <p className="text-xs text-[#4F6A7A] mb-1">Time Difference</p>
            <p className="text-lg font-bold text-[#002B45]">
              {Math.abs(snowballData.total_months - avalancheData.total_months)} months
            </p>
            <p className="text-xs text-[#4F6A7A] mt-1">
              {avalancheData.total_months < snowballData.total_months 
                ? 'Avalanche is faster'
                : 'Snowball is faster'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-[#4F6A7A] text-center">
            Recommendation by Clara • Updated {new Date(comparison.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};