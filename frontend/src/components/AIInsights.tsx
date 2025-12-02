import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Lightbulb,
  Target
} from 'lucide-react';
import { getAIInsights, type AIInsightsResponse } from '@/services/claraAiApi';

interface AIInsightsProps {
  profileId: string;
  focusAreas?: string[];
  className?: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ 
  profileId, 
  focusAreas = [],
  className = '' 
}) => {
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [profileId]);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getAIInsights({
        profile_id: profileId,
        include_recommendations: true,
        focus_areas: focusAreas.length > 0 ? focusAreas : undefined
      });
      
      setInsights(response);
    } catch (err) {
      console.error('Error loading AI insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadInsights();
  };

  if (isLoading) {
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
              <CardTitle>Clara's Insights</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
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
            <CardTitle>Clara's Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            className="mt-4 w-full"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

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
            <CardTitle>Clara's Insights</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="p-4 bg-[#E7F7F4] rounded-lg border-l-4 border-[#009A8C]">
          <p className="text-sm font-medium text-[#002B45]">
            {insights.response.summary}
          </p>
        </div>

        {/* Key Insights */}
        {insights.response.insights && insights.response.insights.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#009A8C]" />
              <h3 className="font-semibold text-[#002B45]">Key Insights</h3>
            </div>
            <div className="space-y-2">
              {insights.response.insights.map((insight, index) => (
                <div 
                  key={index}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#009A8C] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#3A4F61]">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunities */}
        {insights.response.opportunities && insights.response.opportunities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-[#002B45]">Opportunities</h3>
            </div>
            <div className="space-y-2">
              {insights.response.opportunities.map((opportunity, index) => (
                <div 
                  key={index}
                  className="flex gap-3 p-3 bg-green-50 rounded-lg border-l-2 border-green-500"
                >
                  <p className="text-sm text-[#3A4F61]">{opportunity}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risks/Concerns */}
        {insights.response.risks && insights.response.risks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-[#002B45]">Things to Watch</h3>
            </div>
            <div className="space-y-2">
              {insights.response.risks.map((risk, index) => (
                <div 
                  key={index}
                  className="flex gap-3 p-3 bg-amber-50 rounded-lg border-l-2 border-amber-500"
                >
                  <p className="text-sm text-[#3A4F61]">{risk}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Actions */}
        {insights.response.next_actions && insights.response.next_actions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#009A8C]" />
              <h3 className="font-semibold text-[#002B45]">Recommended Next Steps</h3>
            </div>
            <div className="space-y-2">
              {insights.response.next_actions.map((action, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-[#009A8C] text-white flex-shrink-0"
                  >
                    {index + 1}
                  </Badge>
                  <p className="text-sm text-[#3A4F61] flex-1">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-[#4F6A7A] text-center">
            Insights powered by Clara • Last updated {new Date(insights.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};