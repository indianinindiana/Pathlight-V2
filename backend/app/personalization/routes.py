"""
Personalization Routes
API endpoints for dynamic microcopy and contextual guidance.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging

from .service import get_personalization_service
from ..shared.database import get_database

router = APIRouter(prefix="/personalization", tags=["Personalization"])
logger = logging.getLogger(__name__)


# ============================================================================
# Request/Response Models
# ============================================================================

class MicrocopyRequest(BaseModel):
    """Request model for microcopy"""
    profile_id: str = Field(..., description="User profile ID")
    category: str = Field(..., description="Microcopy category (e.g., 'dashboard_welcome')")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")


class MicrocopyResponse(BaseModel):
    """Response model for microcopy"""
    message: str = Field(..., description="Personalized message")
    tone: str = Field(..., description="Message tone")
    emphasis: Optional[str] = Field(default=None, description="What to emphasize")
    severity: Optional[str] = Field(default=None, description="Severity level for warnings")
    action: Optional[str] = Field(default=None, description="Suggested action")


class NextActionsRequest(BaseModel):
    """Request model for next actions"""
    profile_id: str = Field(..., description="User profile ID")
    limit: int = Field(default=3, ge=1, le=10, description="Maximum number of actions")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")


class NextAction(BaseModel):
    """Model for a single next action"""
    text: str = Field(..., description="Action text")
    priority: int = Field(..., description="Priority (lower is higher priority)")
    category: str = Field(..., description="Action category")
    icon: str = Field(..., description="Icon name")


class NextActionsResponse(BaseModel):
    """Response model for next actions"""
    actions: List[NextAction] = Field(..., description="Prioritized list of actions")


class ContextualHelpRequest(BaseModel):
    """Request model for contextual help"""
    category: str = Field(..., description="Help category (e.g., 'debt_entry')")
    field: str = Field(..., description="Field name")
    context: Dict[str, Any] = Field(..., description="Context including field value")


class ContextualHelpResponse(BaseModel):
    """Response model for contextual help"""
    help_text: Optional[str] = Field(default=None, description="Contextual help text")


class TestRulesRequest(BaseModel):
    """Request model for testing personalization rules"""
    test_context: Dict[str, Any] = Field(..., description="Test context data")


class TestRulesResponse(BaseModel):
    """Response model for rule testing"""
    context: Dict[str, Any] = Field(..., description="Test context used")
    microcopy: Dict[str, Any] = Field(..., description="All microcopy results")
    next_actions: List[Dict[str, Any]] = Field(..., description="Next actions results")
    contextual_help: Dict[str, Any] = Field(..., description="Contextual help results")


# ============================================================================
# Routes
# ============================================================================

@router.post("/microcopy", response_model=MicrocopyResponse)
async def get_microcopy(request: MicrocopyRequest):
    """
    Get personalized microcopy based on user context.
    
    This endpoint returns dynamic text that adapts to:
    - User's stress level
    - Progress milestones
    - Cash flow situation
    - Delinquency status
    - Primary goals
    
    **Example Request:**
    ```json
    {
      "profile_id": "user123",
      "category": "dashboard_welcome",
      "context": {
        "stress_level": 4,
        "debts_paid_count": 2
      }
    }
    ```
    
    **Example Response:**
    ```json
    {
      "message": "You're making real progress. Keep going, one step at a time.",
      "tone": "encouraging",
      "emphasis": null,
      "severity": null,
      "action": null
    }
    ```
    """
    try:
        # Get database
        db = await get_database()
        
        # Fetch profile
        profile = await db.profiles.find_one({"profile_id": request.profile_id})
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile not found: {request.profile_id}"
            )
        
        # Fetch debts for context
        debts_cursor = db.debts.find({"profile_id": request.profile_id})
        debts = await debts_cursor.to_list(length=100)
        
        # Build context
        context = {
            "stress_level": profile.get("stress_level", 3),
            "primary_goal": profile.get("primary_goal", "pay-faster"),
            "debt_count": len(debts),
            "debts_paid_count": profile.get("debts_paid_count", 0),
            "has_delinquent": any(d.get("is_delinquent", False) for d in debts),
            "delinquent_count": sum(1 for d in debts if d.get("is_delinquent", False)),
            "profile_complete": profile.get("profile_complete", False),
            "strategy_selected": profile.get("strategy_selected", False),
            **(request.context or {})
        }
        
        # Calculate additional context
        if debts:
            total_balance = sum(d.get("balance", 0) for d in debts)
            total_minimum = sum(d.get("minimum_payment", 0) for d in debts)
            available_payment = profile.get("available_monthly_payment", 0)
            
            context["cash_flow_ratio"] = available_payment / total_minimum if total_minimum > 0 else 0
            context["small_debts_count"] = sum(1 for d in debts if d.get("balance", 0) < 2000)
        
        # Get personalization service
        service = get_personalization_service()
        
        # Get microcopy
        result = service.get_microcopy(request.category, context)
        
        return MicrocopyResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting microcopy: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get personalized content"
        )


@router.post("/actions", response_model=NextActionsResponse)
async def get_next_actions(request: NextActionsRequest):
    """
    Get prioritized next actions based on user context.
    
    This endpoint analyzes the user's situation and recommends
    the most important actions they should take next.
    
    **Example Request:**
    ```json
    {
      "profile_id": "user123",
      "limit": 3,
      "context": {
        "has_delinquent": true
      }
    }
    ```
    
    **Example Response:**
    ```json
    {
      "actions": [
        {
          "text": "Review delinquent accounts",
          "priority": 1,
          "category": "urgent",
          "icon": "alert"
        },
        {
          "text": "Contact creditors to negotiate",
          "priority": 2,
          "category": "urgent",
          "icon": "phone"
        }
      ]
    }
    ```
    """
    try:
        # Get database
        db = await get_database()
        
        # Fetch profile
        profile = await db.profiles.find_one({"profile_id": request.profile_id})
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile not found: {request.profile_id}"
            )
        
        # Fetch debts for context
        debts_cursor = db.debts.find({"profile_id": request.profile_id})
        debts = await debts_cursor.to_list(length=100)
        
        # Build context
        context = {
            "stress_level": profile.get("stress_level", 3),
            "primary_goal": profile.get("primary_goal", "pay-faster"),
            "debt_count": len(debts),
            "has_delinquent": any(d.get("is_delinquent", False) for d in debts),
            "profile_complete": profile.get("profile_complete", True),
            "strategy_selected": profile.get("strategy_selected", False),
            "scenario_run_count": profile.get("scenario_run_count", 0),
            "months_since_last_payment": profile.get("months_since_last_payment", 0),
            **(request.context or {})
        }
        
        # Calculate cash flow ratio
        if debts:
            total_minimum = sum(d.get("minimum_payment", 0) for d in debts)
            available_payment = profile.get("available_monthly_payment", 0)
            context["cash_flow_ratio"] = available_payment / total_minimum if total_minimum > 0 else 0
        
        # Get personalization service
        service = get_personalization_service()
        
        # Get next actions
        actions = service.get_next_actions(context, limit=request.limit)
        
        return NextActionsResponse(actions=[NextAction(**action) for action in actions])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting next actions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get next actions"
        )


@router.post("/help", response_model=ContextualHelpResponse)
async def get_contextual_help(request: ContextualHelpRequest):
    """
    Get contextual help text for a specific field.
    
    This endpoint provides dynamic help text that adapts to
    the current value and context of a field.
    
    **Example Request:**
    ```json
    {
      "category": "debt_entry",
      "field": "apr",
      "context": {
        "value": 35.0
      }
    }
    ```
    
    **Example Response:**
    ```json
    {
      "help_text": "⚠️ This APR is very high. Consider balance transfer or consolidation options."
    }
    ```
    """
    try:
        # Get personalization service
        service = get_personalization_service()
        
        # Get contextual help
        help_text = service.get_contextual_help(
            request.category,
            request.field,
            request.context
        )
        
        return ContextualHelpResponse(help_text=help_text)
        
    except Exception as e:
        logger.error(f"Error getting contextual help: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get contextual help"
        )


@router.post("/test", response_model=TestRulesResponse)
async def test_personalization_rules(request: TestRulesRequest):
    """
    Test personalization rules with given context (dry-run mode).
    
    This endpoint allows testing how personalization rules would
    behave with specific context data without affecting real users.
    Useful for validating rule changes before deployment.
    
    **Example Request:**
    ```json
    {
      "test_context": {
        "stress_level": 5,
        "debt_count": 8,
        "has_delinquent": true,
        "debts_paid_count": 0,
        "cash_flow_ratio": 0.85
      }
    }
    ```
    
    **Example Response:**
    ```json
    {
      "context": { ... },
      "microcopy": {
        "dashboard_welcome": {
          "message": "You're taking the first step - that's what matters most.",
          "tone": "supportive"
        }
      },
      "next_actions": [
        {
          "text": "Review delinquent accounts",
          "priority": 1,
          "category": "urgent",
          "icon": "alert"
        }
      ],
      "contextual_help": { ... }
    }
    ```
    """
    try:
        # Get personalization service
        service = get_personalization_service()
        
        # Test rules
        results = service.test_rules(request.test_context)
        
        return TestRulesResponse(**results)
        
    except Exception as e:
        logger.error(f"Error testing personalization rules: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to test personalization rules"
        )