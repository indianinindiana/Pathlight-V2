"""
Analytics Routes
API endpoints for event tracking and milestone detection.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from .models import (
    TrackEventRequest,
    TrackEventResponse,
    CheckMilestonesRequest,
    CheckMilestonesResponse,
    MilestoneListResponse,
    AnalyticsEvent,
    EventSummary
)
from .service import get_analytics_service
from ..shared.database import get_database

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])
logger = logging.getLogger(__name__)


# ============================================================================
# Event Tracking Endpoints
# ============================================================================

@router.post("/events", response_model=TrackEventResponse)
async def track_event(request: TrackEventRequest):
    """
    Track a user event for analytics.
    
    This endpoint records user actions and interactions for analytics purposes.
    Events can be used to understand user behavior, detect milestones, and
    improve the user experience.
    
    **Example Request:**
    ```json
    {
      "profile_id": "user123",
      "event_type": "debt_added",
      "event_data": {
        "debt_name": "Credit Card",
        "balance": 5000
      },
      "session_id": "session_abc123"
    }
    ```
    
    **Example Response:**
    ```json
    {
      "success": true,
      "message": "Event tracked successfully",
      "event_id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-11-25T19:30:00Z"
    }
    ```
    
    **Event Types:**
    - `profile_created`, `profile_updated`
    - `debt_added`, `debt_updated`, `debt_deleted`, `debt_paid_off`
    - `scenario_created`, `scenario_viewed`, `what_if_analyzed`
    - `ai_insight_requested`, `ai_question_asked`
    - `data_exported`, `page_viewed`
    """
    try:
        db = await get_database()
        analytics_service = get_analytics_service()
        
        # Create analytics event
        event = AnalyticsEvent(
            profile_id=request.profile_id,
            event_type=request.event_type,
            event_data=request.event_data,
            session_id=request.session_id
        )
        
        # Track the event
        event_id = await analytics_service.track_event(db, event)
        
        # Check for new milestones triggered by this event
        milestone_detector = analytics_service.milestone_detector
        new_milestones = await milestone_detector.check_milestones(
            profile_id=request.profile_id,
            db=db,
            trigger_event=request.event_type
        )
        
        # Store any new milestones
        if new_milestones:
            for milestone in new_milestones:
                milestone_dict = milestone.model_dump()
                await db.milestones.insert_one(milestone_dict)
                logger.info(f"New milestone achieved: {milestone.milestone_type} for profile {request.profile_id}")
        
        return TrackEventResponse(
            success=True,
            message="Event tracked successfully",
            event_id=event_id,
            timestamp=event.timestamp
        )
        
    except Exception as e:
        logger.error(f"Error tracking event: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to track event: {str(e)}"
        )


@router.get("/events/{profile_id}/summary", response_model=EventSummary)
async def get_event_summary(profile_id: str):
    """
    Get summary of events for a profile.
    
    Returns analytics about user's tracked events including:
    - Total event count
    - Events by type
    - First and last event timestamps
    - Most common event type
    
    **Example Response:**
    ```json
    {
      "profile_id": "user123",
      "total_events": 42,
      "events_by_type": {
        "debt_added": 5,
        "scenario_created": 3,
        "page_viewed": 34
      },
      "first_event": "2025-11-01T10:00:00Z",
      "last_event": "2025-11-25T19:30:00Z",
      "most_common_event": "page_viewed"
    }
    ```
    """
    try:
        db = await get_database()
        analytics_service = get_analytics_service()
        
        summary = await analytics_service.get_event_summary(db, profile_id)
        
        return EventSummary(
            profile_id=profile_id,
            **summary
        )
        
    except Exception as e:
        logger.error(f"Error getting event summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get event summary"
        )


# ============================================================================
# Milestone Endpoints
# ============================================================================

@router.post("/milestones/check", response_model=CheckMilestonesResponse)
async def check_milestones(request: CheckMilestonesRequest):
    """
    Check for new milestones for a user.
    
    This endpoint analyzes the user's current state and detects any newly
    achieved milestones. Milestones include:
    - First debt added
    - First scenario created
    - First debt paid off
    - Balance reduction milestones (25%, 50%, 75%)
    - Debt-free achievement
    - Consistent payment streaks
    
    **Example Request:**
    ```json
    {
      "profile_id": "user123",
      "trigger_event": "debt_paid_off"
    }
    ```
    
    **Example Response:**
    ```json
    {
      "success": true,
      "message": "Found 2 new milestones",
      "new_milestones": [
        {
          "milestone_id": "milestone_123",
          "profile_id": "user123",
          "milestone_type": "first_debt_paid_off",
          "title": "First Victory! 🎉",
          "description": "Congratulations! You've paid off your first debt.",
          "achieved_at": "2025-11-25T19:30:00Z",
          "celebration_shown": false,
          "metadata": {"paid_off_count": 1}
        }
      ],
      "total_milestones": 5
    }
    ```
    """
    try:
        db = await get_database()
        analytics_service = get_analytics_service()
        
        # Check for new milestones
        new_milestones = await analytics_service.milestone_detector.check_milestones(
            profile_id=request.profile_id,
            db=db,
            trigger_event=request.trigger_event
        )
        
        # Store new milestones in database
        if new_milestones:
            for milestone in new_milestones:
                milestone_dict = milestone.model_dump()
                await db.milestones.insert_one(milestone_dict)
        
        # Get total milestone count
        total_milestones = await db.milestones.count_documents({"profile_id": request.profile_id})
        
        message = f"Found {len(new_milestones)} new milestone(s)" if new_milestones else "No new milestones"
        
        return CheckMilestonesResponse(
            success=True,
            message=message,
            new_milestones=new_milestones,
            total_milestones=total_milestones
        )
        
    except Exception as e:
        logger.error(f"Error checking milestones: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check milestones"
        )


@router.get("/milestones/{profile_id}", response_model=MilestoneListResponse)
async def get_milestones(profile_id: str, unshown_only: bool = False):
    """
    Get all milestones for a user.
    
    Returns a list of all milestones achieved by the user, optionally
    filtered to only show milestones that haven't been displayed yet.
    
    **Query Parameters:**
    - `unshown_only`: If true, only return milestones where celebration_shown=false
    
    **Example Response:**
    ```json
    {
      "milestones": [
        {
          "milestone_id": "milestone_123",
          "profile_id": "user123",
          "milestone_type": "first_debt_added",
          "title": "First Step Taken! 🎯",
          "description": "You've added your first debt...",
          "achieved_at": "2025-11-20T10:00:00Z",
          "celebration_shown": true,
          "metadata": {"debt_count": 1}
        }
      ],
      "total_count": 5,
      "unshown_count": 2
    }
    ```
    """
    try:
        db = await get_database()
        
        # Build query
        query = {"profile_id": profile_id}
        if unshown_only:
            query["celebration_shown"] = False
        
        # Fetch milestones
        milestones = []
        async for milestone in db.milestones.find(query).sort("achieved_at", -1):
            milestone.pop("_id", None)
            milestones.append(milestone)
        
        # Get counts
        total_count = await db.milestones.count_documents({"profile_id": profile_id})
        unshown_count = await db.milestones.count_documents({
            "profile_id": profile_id,
            "celebration_shown": False
        })
        
        return MilestoneListResponse(
            milestones=milestones,
            total_count=total_count,
            unshown_count=unshown_count
        )
        
    except Exception as e:
        logger.error(f"Error getting milestones: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get milestones"
        )


@router.patch("/milestones/{milestone_id}/shown")
async def mark_milestone_shown(milestone_id: str):
    """
    Mark a milestone as shown to the user.
    
    This endpoint updates the celebration_shown flag to true, indicating
    that the milestone celebration has been displayed to the user.
    
    **Example Response:**
    ```json
    {
      "success": true,
      "message": "Milestone marked as shown"
    }
    ```
    """
    try:
        db = await get_database()
        
        result = await db.milestones.update_one(
            {"milestone_id": milestone_id},
            {"$set": {"celebration_shown": True}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Milestone not found"
            )
        
        return {
            "success": True,
            "message": "Milestone marked as shown"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking milestone as shown: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update milestone"
        )