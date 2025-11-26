"""
Analytics Service
Business logic for event tracking and milestone detection.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

from .models import (
    AnalyticsEvent,
    Milestone,
    MilestoneType,
    EventType
)

logger = logging.getLogger(__name__)


class MilestoneDetector:
    """Service for detecting user milestones"""
    
    def __init__(self):
        """Initialize the milestone detector"""
        self.milestone_definitions = self._get_milestone_definitions()
    
    def _get_milestone_definitions(self) -> Dict[MilestoneType, Dict[str, str]]:
        """Get milestone definitions with titles and descriptions"""
        return {
            MilestoneType.FIRST_DEBT_ADDED: {
                "title": "First Step Taken! 🎯",
                "description": "You've added your first debt. This is the beginning of your journey to financial freedom!"
            },
            MilestoneType.FIRST_SCENARIO_CREATED: {
                "title": "Planning Ahead! 📊",
                "description": "You've created your first payoff scenario. Great job planning your path to debt freedom!"
            },
            MilestoneType.FIRST_DEBT_PAID_OFF: {
                "title": "First Victory! 🎉",
                "description": "Congratulations! You've paid off your first debt. This is a huge accomplishment!"
            },
            MilestoneType.HALFWAY_TO_DEBT_FREE: {
                "title": "Halfway There! 🏃",
                "description": "You're 50% of the way to being debt-free. Keep up the amazing work!"
            },
            MilestoneType.DEBT_FREE: {
                "title": "Debt Free! 🎊",
                "description": "Incredible! You've paid off all your debts. You're officially debt-free!"
            },
            MilestoneType.BALANCE_REDUCED_25: {
                "title": "Quarter Way Down! 💪",
                "description": "You've reduced your total debt balance by 25%. Excellent progress!"
            },
            MilestoneType.BALANCE_REDUCED_50: {
                "title": "Half Way Down! 🌟",
                "description": "Amazing! You've reduced your total debt balance by 50%!"
            },
            MilestoneType.BALANCE_REDUCED_75: {
                "title": "Almost There! 🚀",
                "description": "Fantastic! You've reduced your total debt balance by 75%!"
            },
            MilestoneType.TOTAL_INTEREST_SAVED: {
                "title": "Money Saved! 💰",
                "description": "Through smart planning, you've saved significant money on interest!"
            },
            MilestoneType.CONSISTENT_PAYMENTS: {
                "title": "Consistency Champion! ⭐",
                "description": "You've made consistent payments for 3 months in a row. Great discipline!"
            }
        }
    
    async def check_milestones(
        self,
        profile_id: str,
        db,
        trigger_event: Optional[EventType] = None
    ) -> List[Milestone]:
        """
        Check for new milestones based on user's current state.
        
        Args:
            profile_id: User's profile ID
            db: Database connection
            trigger_event: Event that triggered the check
            
        Returns:
            List of newly achieved milestones
        """
        new_milestones = []
        
        try:
            # Get existing milestones to avoid duplicates
            existing_milestones = set()
            async for milestone in db.milestones.find({"profile_id": profile_id}):
                existing_milestones.add(milestone["milestone_type"])
            
            # Check for first debt added
            if MilestoneType.FIRST_DEBT_ADDED not in existing_milestones:
                debt_count = await db.debts.count_documents({"profile_id": profile_id})
                if debt_count >= 1:
                    new_milestones.append(
                        await self._create_milestone(
                            profile_id,
                            MilestoneType.FIRST_DEBT_ADDED,
                            {"debt_count": debt_count}
                        )
                    )
            
            # Check for first scenario created
            if MilestoneType.FIRST_SCENARIO_CREATED not in existing_milestones:
                # Note: Scenarios are not yet persisted in DB, so this is a placeholder
                # In production, check scenario count from database
                pass
            
            # Check for first debt paid off
            if MilestoneType.FIRST_DEBT_PAID_OFF not in existing_milestones:
                paid_off_count = await db.debts.count_documents({
                    "profile_id": profile_id,
                    "status": "paid_off"
                })
                if paid_off_count >= 1:
                    new_milestones.append(
                        await self._create_milestone(
                            profile_id,
                            MilestoneType.FIRST_DEBT_PAID_OFF,
                            {"paid_off_count": paid_off_count}
                        )
                    )
            
            # Check for balance reduction milestones
            await self._check_balance_reduction_milestones(
                profile_id,
                db,
                existing_milestones,
                new_milestones
            )
            
            # Check for debt-free milestone
            if MilestoneType.DEBT_FREE not in existing_milestones:
                active_debt_count = await db.debts.count_documents({
                    "profile_id": profile_id,
                    "status": "active"
                })
                total_debt_count = await db.debts.count_documents({"profile_id": profile_id})
                
                if total_debt_count > 0 and active_debt_count == 0:
                    new_milestones.append(
                        await self._create_milestone(
                            profile_id,
                            MilestoneType.DEBT_FREE,
                            {"total_debts_paid": total_debt_count}
                        )
                    )
            
            return new_milestones
            
        except Exception as e:
            logger.error(f"Error checking milestones: {e}")
            return []
    
    async def _check_balance_reduction_milestones(
        self,
        profile_id: str,
        db,
        existing_milestones: set,
        new_milestones: List[Milestone]
    ):
        """Check for balance reduction milestones (25%, 50%, 75%)"""
        try:
            # Get all debts for this profile
            debts = []
            async for debt in db.debts.find({"profile_id": profile_id}):
                debts.append(debt)
            
            if not debts:
                return
            
            # Calculate original total balance (from created_at or initial_balance field)
            # For now, we'll use current balance as a placeholder
            # In production, track original_balance when debt is first added
            current_total = sum(d.get("balance", 0) for d in debts)
            
            # Placeholder: In production, compare against original_balance
            # For now, we'll skip these milestones as we don't have historical data
            
        except Exception as e:
            logger.error(f"Error checking balance reduction milestones: {e}")
    
    async def _create_milestone(
        self,
        profile_id: str,
        milestone_type: MilestoneType,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Milestone:
        """Create a new milestone"""
        definition = self.milestone_definitions.get(milestone_type, {})
        
        return Milestone(
            profile_id=profile_id,
            milestone_type=milestone_type,
            title=definition.get("title", "Milestone Achieved!"),
            description=definition.get("description", "You've reached a new milestone!"),
            achieved_at=datetime.utcnow(),
            celebration_shown=False,
            metadata=metadata
        )


class AnalyticsService:
    """Service for handling analytics operations"""
    
    def __init__(self):
        """Initialize the analytics service"""
        self.milestone_detector = MilestoneDetector()
    
    async def track_event(
        self,
        db,
        event: AnalyticsEvent
    ) -> str:
        """
        Track a user event.
        
        Args:
            db: Database connection
            event: Event to track
            
        Returns:
            Event ID
        """
        try:
            # Store event in database
            event_dict = event.model_dump()
            await db.analytics_events.insert_one(event_dict)
            
            logger.info(f"Tracked event: {event.event_type} for profile {event.profile_id}")
            
            return event.event_id
            
        except Exception as e:
            logger.error(f"Error tracking event: {e}")
            raise
    
    async def get_event_summary(
        self,
        db,
        profile_id: str
    ) -> Dict[str, Any]:
        """
        Get summary of events for a profile.
        
        Args:
            db: Database connection
            profile_id: Profile ID
            
        Returns:
            Event summary
        """
        try:
            events = []
            async for event in db.analytics_events.find({"profile_id": profile_id}):
                events.append(event)
            
            if not events:
                return {
                    "total_events": 0,
                    "events_by_type": {},
                    "first_event": None,
                    "last_event": None,
                    "most_common_event": None
                }
            
            # Count events by type
            events_by_type = {}
            for event in events:
                event_type = event.get("event_type")
                events_by_type[event_type] = events_by_type.get(event_type, 0) + 1
            
            # Find most common event
            most_common = max(events_by_type.items(), key=lambda x: x[1])[0] if events_by_type else None
            
            # Get first and last event timestamps
            timestamps = [e.get("timestamp") for e in events if e.get("timestamp")]
            first_event = min(timestamps) if timestamps else None
            last_event = max(timestamps) if timestamps else None
            
            return {
                "total_events": len(events),
                "events_by_type": events_by_type,
                "first_event": first_event,
                "last_event": last_event,
                "most_common_event": most_common
            }
            
        except Exception as e:
            logger.error(f"Error getting event summary: {e}")
            raise


# Global service instance
_analytics_service = AnalyticsService()


def get_analytics_service() -> AnalyticsService:
    """Get the global analytics service instance"""
    return _analytics_service