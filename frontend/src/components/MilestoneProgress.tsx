import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getMilestones, type Milestone } from '@/services/analyticsApi';

interface MilestoneProgressProps {
  profileId: string;
}

const milestoneCategories = {
  getting_started: ['first_debt_added', 'first_scenario_created'],
  progress: ['balance_reduced_25', 'balance_reduced_50', 'balance_reduced_75'],
  achievements: ['first_debt_paid_off', 'halfway_to_debt_free', 'debt_free'],
  consistency: ['consistent_payments', 'total_interest_saved'],
};

export function MilestoneProgress({ profileId }: MilestoneProgressProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMilestones();
  }, [profileId]);

  const loadMilestones = async () => {
    try {
      const response = await getMilestones(profileId, false);
      setMilestones(response.milestones);
    } catch (error) {
      console.error('Error loading milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-[1.5px] border-[#D4DFE4]">
        <CardHeader>
          <CardTitle className="text-[#002B45] flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#009A8C]" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const achievedMilestones = milestones.length;
  const totalPossibleMilestones = 10; // Total milestone types
  const progressPercentage = (achievedMilestones / totalPossibleMilestones) * 100;

  // Get recent milestones (last 3)
  const recentMilestones = milestones
    .sort((a, b) => new Date(b.achieved_at).getTime() - new Date(a.achieved_at).getTime())
    .slice(0, 3);

  return (
    <Card className="border-[1.5px] border-[#D4DFE4]">
      <CardHeader>
        <CardTitle className="text-[#002B45] flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[#009A8C]" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#3A4F61]">Milestones Achieved</span>
            <span className="font-semibold text-[#002B45]">
              {achievedMilestones} / {totalPossibleMilestones}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Recent Milestones */}
        {recentMilestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#002B45]">Recent Achievements</h4>
            <div className="space-y-2">
              {recentMilestones.map((milestone) => (
                <div
                  key={milestone.milestone_id}
                  className="flex items-start gap-3 p-3 bg-[#E7F7F4] rounded-lg"
                >
                  <div className="p-1.5 bg-[#009A8C]/10 rounded-full">
                    <Trophy className="h-4 w-4 text-[#009A8C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#002B45] truncate">
                      {milestone.title}
                    </p>
                    <p className="text-xs text-[#3A4F61] mt-0.5">
                      {new Date(milestone.achieved_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Milestone Hint */}
        {achievedMilestones < totalPossibleMilestones && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Keep Going!</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  {achievedMilestones === 0
                    ? 'Add your first debt to unlock your first milestone'
                    : achievedMilestones < 3
                    ? 'Create a scenario to plan your debt payoff journey'
                    : 'Continue making progress to unlock more achievements'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completion Badge */}
        {achievedMilestones === totalPossibleMilestones && (
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 text-center">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-yellow-900">
              All Milestones Achieved! 🎉
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              You've completed your debt-free journey!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}