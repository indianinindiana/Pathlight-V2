"""
AI Response Models
Defines the global AI response schema (v1.0) for all AI-powered features.
Ensures stability, safety, and predictable frontend integration.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
import uuid


# ============================================================================
# Global AI Response Schema (v1.0)
# ============================================================================

class AIExplanation(BaseModel):
    """Explanation component for AI responses"""
    context: str = Field(..., max_length=500, description="Context for the response")
    reasoning: str = Field(..., max_length=500, description="Reasoning behind the response")


class AIResponse(BaseModel):
    """Base AI response structure"""
    schema_version: str = Field(default="1.0", description="Schema version")
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique request ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")
    response: Dict[str, Any] = Field(..., description="The actual response content")
    
    class Config:
        json_schema_extra = {
            "example": {
                "schema_version": "1.0",
                "request_id": "123e4567-e89b-12d3-a456-426614174000",
                "timestamp": "2025-11-25T19:00:00Z",
                "response": {
                    "summary": "Your debt portfolio analysis",
                    "insights": ["Insight 1", "Insight 2"]
                }
            }
        }


# ============================================================================
# Insights Response Models
# ============================================================================

class InsightsResponseContent(BaseModel):
    """Content structure for insights responses"""
    summary: str = Field(..., max_length=200, description="One sentence overview")
    insights: List[str] = Field(..., max_items=5, description="Key insights (max 5)")
    opportunities: Optional[List[str]] = Field(default=None, max_items=3, description="Opportunities for improvement")
    risks: Optional[List[str]] = Field(default=None, max_items=3, description="Potential risks or concerns")
    next_actions: List[str] = Field(..., max_items=5, description="Recommended next steps")
    confidence_score: Optional[float] = Field(default=None, ge=0, le=100, description="Confidence in the insights (0-100)")
    
    @validator('insights')
    def validate_insights(cls, v):
        if not v or len(v) == 0:
            raise ValueError("At least one insight is required")
        for insight in v:
            if len(insight) > 150:
                raise ValueError(f"Insight too long: {len(insight)} chars (max 150)")
        return v
    
    @validator('next_actions')
    def validate_next_actions(cls, v):
        if not v or len(v) == 0:
            raise ValueError("At least one next action is required")
        return v


class InsightsResponse(AIResponse):
    """Complete insights response"""
    response: InsightsResponseContent


# ============================================================================
# Q&A Response Models
# ============================================================================

class QAResponseContent(BaseModel):
    """Content structure for Q&A responses"""
    answer: str = Field(..., max_length=500, description="Direct answer to the question")
    context: Optional[str] = Field(default=None, max_length=300, description="How this applies to their situation")
    next_steps: Optional[List[str]] = Field(default=None, max_items=3, description="Actionable next steps")
    related_topics: Optional[List[str]] = Field(default=None, max_items=4, description="Related topics to explore")
    confidence: Optional[Literal["high", "medium", "low"]] = Field(default=None, description="Confidence in the answer")
    
    @validator('answer')
    def validate_answer(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Answer cannot be empty")
        return v


class QAResponse(AIResponse):
    """Complete Q&A response"""
    response: QAResponseContent


# ============================================================================
# Strategy Comparison Response Models
# ============================================================================

class StrategyComparisonContent(BaseModel):
    """Content structure for strategy comparison responses"""
    recommended_strategy: Literal["snowball", "avalanche", "custom"] = Field(..., description="Recommended strategy")
    reasoning: str = Field(..., max_length=300, description="2-3 sentence explanation")
    trade_offs: str = Field(..., max_length=200, description="What they're giving up with this choice")
    confidence: Literal["high", "medium", "low"] = Field(..., description="Confidence in recommendation")
    key_factors: Optional[List[str]] = Field(default=None, max_items=3, description="Key factors in the decision")


class StrategyComparisonResponse(AIResponse):
    """Complete strategy comparison response"""
    response: StrategyComparisonContent


# ============================================================================
# Onboarding Response Models
# ============================================================================

class OnboardingResponseContent(BaseModel):
    """Content structure for onboarding conversation responses"""
    message: str = Field(..., max_length=300, description="Conversational message")
    question: Optional[str] = Field(default=None, max_length=200, description="Next question to ask")
    help_text: Optional[str] = Field(default=None, max_length=150, description="Why you're asking this")
    field_name: Optional[str] = Field(default=None, description="Field being collected")
    validation_rules: Optional[Dict[str, Any]] = Field(default=None, description="Validation rules for the field")
    progress: Optional[float] = Field(default=None, ge=0, le=100, description="Onboarding progress percentage")


class OnboardingResponse(AIResponse):
    """Complete onboarding response"""
    response: OnboardingResponseContent


# ============================================================================
# Progress Celebration Response Models
# ============================================================================

class ProgressCelebrationContent(BaseModel):
    """Content structure for progress celebration responses"""
    celebration: str = Field(..., max_length=200, description="Celebratory message")
    perspective: str = Field(..., max_length=200, description="Context about their progress")
    motivation: str = Field(..., max_length=200, description="Encouraging next step")
    milestone: Optional[str] = Field(default=None, description="Milestone achieved")
    celebration_level: Optional[Literal["low", "medium", "high", "maximum"]] = Field(default=None)


class ProgressCelebrationResponse(AIResponse):
    """Complete progress celebration response"""
    response: ProgressCelebrationContent


# ============================================================================
# Request Models
# ============================================================================

class InsightsRequest(BaseModel):
    """Request model for insights generation"""
    profile_id: str = Field(..., description="User profile ID")
    include_recommendations: bool = Field(default=True, description="Include strategy recommendations")
    focus_areas: Optional[List[str]] = Field(default=None, description="Specific areas to focus on")


class QARequest(BaseModel):
    """Request model for Q&A"""
    profile_id: str = Field(..., description="User profile ID")
    question: str = Field(..., min_length=5, max_length=500, description="User's question")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")


class OnboardingRequest(BaseModel):
    """Request model for onboarding conversation"""
    session_id: str = Field(..., description="Onboarding session ID")
    user_input: Optional[str] = Field(default=None, description="User's response")
    collected_data: Optional[Dict[str, Any]] = Field(default=None, description="Data collected so far")
    step: Optional[str] = Field(default=None, description="Current onboarding step")


class StrategyComparisonRequest(BaseModel):
    """Request model for strategy comparison"""
    profile_id: str = Field(..., description="User profile ID")
    snowball_data: Dict[str, Any] = Field(..., description="Snowball strategy results")
    avalanche_data: Dict[str, Any] = Field(..., description="Avalanche strategy results")


# ============================================================================
# Error Response Models
# ============================================================================

class AIErrorResponse(BaseModel):
    """Error response when AI fails"""
    schema_version: str = Field(default="1.0")
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    error: str = Field(..., description="Error message")
    fallback_used: bool = Field(default=False, description="Whether fallback response was used")
    retry_available: bool = Field(default=True, description="Whether retry is available")


# ============================================================================
# Sanitization and Validation Utilities
# ============================================================================

def sanitize_ai_content(content: str) -> str:
    """
    Sanitize AI-generated content before sending to frontend.
    Removes potentially harmful content and ensures safe display.
    """
    # Remove any HTML tags
    import re
    content = re.sub(r'<[^>]+>', '', content)
    
    # Remove any script-like content
    content = re.sub(r'<script.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Trim whitespace
    content = content.strip()
    
    return content


def validate_ai_response(response: Dict[str, Any], response_type: str) -> bool:
    """
    Validate AI response against expected schema.
    Returns True if valid, False otherwise.
    """
    try:
        if response_type == "insights":
            InsightsResponseContent(**response)
        elif response_type == "qa":
            QAResponseContent(**response)
        elif response_type == "onboarding":
            OnboardingResponseContent(**response)
        elif response_type == "strategy_comparison":
            StrategyComparisonContent(**response)
        elif response_type == "progress_celebration":
            ProgressCelebrationContent(**response)
        else:
            return False
        return True
    except Exception:
        return False


def get_fallback_response(response_type: str) -> Dict[str, Any]:
    """
    Get fallback response when AI fails or is unavailable.
    """
    fallbacks = {
        "insights": {
            "summary": "Your debt portfolio has been analyzed.",
            "insights": [
                "Focus on paying off high-interest debts first to minimize total interest",
                "Consider the debt snowball method if you need quick wins for motivation",
                "Review your budget to find opportunities for extra payments"
            ],
            "next_actions": [
                "Review your recommended payoff strategy",
                "Set up automatic payments to stay on track",
                "Check back monthly to monitor your progress"
            ]
        },
        "qa": {
            "answer": "I'm having trouble generating a response right now. Please try rephrasing your question or contact support for assistance.",
            "confidence": "low"
        },
        "onboarding": {
            "message": "Welcome! Let's get started by adding your debts. You can enter them manually or import from a CSV file.",
            "progress": 0
        },
        "strategy_comparison": {
            "recommended_strategy": "avalanche",
            "reasoning": "Based on your debt profile, the avalanche method will save you the most money on interest.",
            "trade_offs": "You may not see quick wins as fast as with the snowball method.",
            "confidence": "medium"
        },
        "progress_celebration": {
            "celebration": "Great progress on your debt payoff journey!",
            "perspective": "Every payment brings you closer to financial freedom.",
            "motivation": "Keep up the great work!"
        }
    }
    
    return fallbacks.get(response_type, {})