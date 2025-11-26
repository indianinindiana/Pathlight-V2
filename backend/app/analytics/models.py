"""
Analytics Models
Data models for event tracking and milestone detection.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum


class EventType(str, Enum):
    """Types of trackable events"""
    # User actions
    PROFILE_CREATED = "profile_created"
    PROFILE_UPDATED = "profile_updated"
    DEBT_ADDED = "debt_added"
    DEBT_UPDATED = "debt_updated"
    DEBT_DELETED = "debt_deleted"
    DEBT_PAID_OFF = "debt_paid_off"
    
    # Scenario actions
    SCENARIO_CREATED = "scenario_created"
    SCENARIO_VIEWED = "scenario_viewed"
    WHAT_IF_ANALYZED = "what_if_analyzed"
    STRATEGY_COMPARED = "strategy_compared"
    
    # AI interactions
    AI_INSIGHT_REQUESTED = "ai_insight_requested"
    AI_QUESTION_ASKED = "ai_question_asked"
    
    # Export actions
    DATA_EXPORTED = "data_exported"
    
    # Page views
    PAGE_VIEWED = "page_viewed"


class MilestoneType(str, Enum):
    """Types of milestones"""
    FIRST_DEBT_ADDED = "first_debt_added"
    FIRST_SCENARIO_CREATED = "first_scenario_created"
    FIRST_DEBT_PAID_OFF = "first_debt_paid_off"
    HALFWAY_TO_DEBT_FREE = "halfway_to_debt_free"
    DEBT_FREE = "debt_free"
    TOTAL_INTEREST_SAVED = "total_interest_saved"
    CONSISTENT_PAYMENTS = "consistent_payments"
    BALANCE_REDUCED_25 = "balance_reduced_25"
    BALANCE_REDUCED_50 = "balance_reduced_50"
    BALANCE_REDUCED_75 = "balance_reduced_75"


class AnalyticsEvent(BaseModel):
    """Model for tracking user events"""
    event_id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))
    profile_id: str = Field(..., description="Profile ID")
    event_type: EventType = Field(..., description="Type of event")
    event_data: Optional[Dict[str, Any]] = Field(None, description="Additional event data")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    session_id: Optional[str] = Field(None, description="Session identifier")
    user_agent: Optional[str] = Field(None, description="User agent string")


class TrackEventRequest(BaseModel):
    """Request model for tracking an event"""
    profile_id: str = Field(..., description="Profile ID")
    event_type: EventType = Field(..., description="Type of event")
    event_data: Optional[Dict[str, Any]] = Field(None, description="Additional event data")
    session_id: Optional[str] = Field(None, description="Session identifier")


class TrackEventResponse(BaseModel):
    """Response model for event tracking"""
    success: bool
    message: str
    event_id: str
    timestamp: datetime


class Milestone(BaseModel):
    """Model for user milestones"""
    milestone_id: str = Field(default_factory=lambda: str(__import__('uuid').uuid4()))
    profile_id: str = Field(..., description="Profile ID")
    milestone_type: MilestoneType = Field(..., description="Type of milestone")
    title: str = Field(..., description="Milestone title")
    description: str = Field(..., description="Milestone description")
    achieved_at: datetime = Field(default_factory=datetime.utcnow)
    celebration_shown: bool = Field(default=False, description="Whether celebration was shown to user")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional milestone data")


class CheckMilestonesRequest(BaseModel):
    """Request model for checking milestones"""
    profile_id: str = Field(..., description="Profile ID")
    trigger_event: Optional[EventType] = Field(None, description="Event that triggered milestone check")


class CheckMilestonesResponse(BaseModel):
    """Response model for milestone checking"""
    success: bool
    message: str
    new_milestones: List[Milestone] = Field(default_factory=list)
    total_milestones: int = Field(..., description="Total milestones achieved by user")


class MilestoneListResponse(BaseModel):
    """Response model for listing milestones"""
    milestones: List[Milestone]
    total_count: int
    unshown_count: int = Field(..., description="Count of milestones not yet shown to user")


class EventSummary(BaseModel):
    """Summary of events for analytics"""
    profile_id: str
    total_events: int
    events_by_type: Dict[str, int]
    first_event: Optional[datetime] = None
    last_event: Optional[datetime] = None
    most_common_event: Optional[str] = None