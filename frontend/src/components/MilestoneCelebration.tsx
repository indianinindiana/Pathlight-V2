import { useEffect, useState } from 'react';
import { Trophy, X, Sparkles, Target, TrendingUp, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getMilestones,
  markMilestoneShown,
  type Milestone,
  type MilestoneType,
} from '@/services/analyticsApi';

interface MilestoneCelebrationProps {
  profileId: string;
  checkInterval?: number; // milliseconds, default 30000 (30 seconds)
}

const milestoneIcons: Record<MilestoneType, React.ReactNode> = {
  first_debt_added: <Target className="h-12 w-12" />,
  first_scenario_created: <Sparkles className="h-12 w-12" />,
  first_debt_paid_off: <Trophy className="h-12 w-12" />,
  halfway_to_debt_free: <TrendingUp className="h-12 w-12" />,
  debt_free: <Award className="h-12 w-12" />,
  balance_reduced_25: <TrendingUp className="h-12 w-12" />,
  balance_reduced_50: <TrendingUp className="h-12 w-12" />,
  balance_reduced_75: <TrendingUp className="h-12 w-12" />,
  total_interest_saved: <Sparkles className="h-12 w-12" />,
  consistent_payments: <Award className="h-12 w-12" />,
};

const milestoneColors: Record<MilestoneType, string> = {
  first_debt_added: 'bg-blue-500',
  first_scenario_created: 'bg-purple-500',
  first_debt_paid_off: 'bg-green-500',
  halfway_to_debt_free: 'bg-yellow-500',
  debt_free: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500',
  balance_reduced_25: 'bg-green-400',
  balance_reduced_50: 'bg-green-500',
  balance_reduced_75: 'bg-green-600',
  total_interest_saved: 'bg-indigo-500',
  consistent_payments: 'bg-teal-500',
};

export function MilestoneCelebration({
  profileId,
  checkInterval = 30000,
}: MilestoneCelebrationProps) {
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const [queue, setQueue] = useState<Milestone[]>([]);
  const [open, setOpen] = useState(false);

  // Check for unshown milestones
  const checkForMilestones = async () => {
    try {
      const response = await getMilestones(profileId, true);
      if (response.unshown_count > 0 && response.milestones.length > 0) {
        setQueue(response.milestones);
      }
    } catch (error) {
      console.error('Error checking milestones:', error);
    }
  };

  // Show next milestone from queue
  useEffect(() => {
    if (queue.length > 0 && !open) {
      const [next, ...rest] = queue;
      setCurrentMilestone(next);
      setQueue(rest);
      setOpen(true);
    }
  }, [queue, open]);

  // Periodic check for new milestones
  useEffect(() => {
    checkForMilestones();
    const interval = setInterval(checkForMilestones, checkInterval);
    return () => clearInterval(interval);
  }, [profileId, checkInterval]);

  const handleClose = async () => {
    if (currentMilestone) {
      try {
        await markMilestoneShown(currentMilestone.milestone_id);
      } catch (error) {
        console.error('Error marking milestone as shown:', error);
      }
    }
    setOpen(false);
    setCurrentMilestone(null);
  };

  if (!currentMilestone) return null;

  const icon = milestoneIcons[currentMilestone.milestone_type];
  const colorClass = milestoneColors[currentMilestone.milestone_type];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0">
        {/* Celebration Header with Gradient */}
        <div className={`${colorClass} p-8 text-white relative overflow-hidden`}>
          {/* Animated sparkles background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 animate-pulse">✨</div>
            <div className="absolute top-8 right-8 animate-pulse delay-100">⭐</div>
            <div className="absolute bottom-4 left-12 animate-pulse delay-200">🎉</div>
            <div className="absolute bottom-8 right-4 animate-pulse delay-300">🎊</div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 animate-bounce">
              {icon}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white mb-2">
                {currentMilestone.title}
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base">
                {currentMilestone.description}
              </DialogDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Milestone Details */}
        <div className="p-6 space-y-4">
          {currentMilestone.metadata && Object.keys(currentMilestone.metadata).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Details</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentMilestone.metadata).map(([key, value]) => (
                  <Badge key={key} variant="secondary">
                    {key.replace(/_/g, ' ')}: {String(value)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Achieved on {new Date(currentMilestone.achieved_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>

          {queue.length > 0 && (
            <div className="text-sm text-muted-foreground text-center pt-2 border-t">
              {queue.length} more milestone{queue.length > 1 ? 's' : ''} to celebrate! 🎉
            </div>
          )}

          <Button onClick={handleClose} className="w-full" size="lg">
            Awesome! Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manually trigger milestone check
 */
export function useMilestoneCheck(profileId: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const checkMilestones = async () => {
    try {
      const response = await getMilestones(profileId, true);
      setMilestones(response.milestones);
      return response.milestones;
    } catch (error) {
      console.error('Error checking milestones:', error);
      return [];
    }
  };

  return { milestones, checkMilestones };
}