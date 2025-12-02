"""
AI Services Routes
API endpoints for AI-powered features: insights, Q&A, and onboarding.
"""

from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
import logging

from ..shared.ai_service import get_ai_service
from ..shared.ai_models import (
    InsightsRequest, InsightsResponse,
    QARequest, QAResponse,
    OnboardingRequest, OnboardingResponse,
    OnboardingReactionRequest, OnboardingReactionResponse,
    StrategyComparisonRequest, StrategyComparisonResponse,
    AIErrorResponse
)
from ..shared.database import get_database

router = APIRouter(prefix="/api/v1/ai", tags=["AI Services"])
logger = logging.getLogger(__name__)


@router.post("/insights", response_model=InsightsResponse)
async def generate_insights(request: InsightsRequest):
    """
    Generate AI-powered insights about user's debt portfolio.
    
    This endpoint analyzes the user's debt situation and provides:
    - Summary of their debt health
    - Key insights and opportunities
    - Potential risks or concerns
    - Recommended next actions
    
    **Example Request:**
    ```json
    {
      "profile_id": "user123",
      "include_recommendations": true,
      "focus_areas": ["interest_savings", "quick_wins"]
    }
    ```
    
    **Example Response:**
    ```json
    {
      "schema_version": "1.0",
      "request_id": "uuid",
      "timestamp": "2025-11-25T19:00:00Z",
      "response": {
        "summary": "You have $25,000 in debt across 5 accounts",
        "insights": [
          "Your highest APR is 24.99% - prioritize this debt",
          "You could save $2,500 in interest with the avalanche method"
        ],
        "next_actions": [
          "Review your recommended payoff strategy",
          "Consider a balance transfer for high-APR debt"
        ]
      }
    }
    ```
    """
    try:
        # Get database
        db = await get_database()
        
        # Fetch profile - try both profile_id and _id fields
        from bson import ObjectId
        profile = await db.profiles.find_one({"profile_id": request.profile_id})
        if not profile:
            # Try using the request.profile_id as MongoDB ObjectId
            try:
                profile = await db.profiles.find_one({"_id": ObjectId(request.profile_id)})
            except:
                pass
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile not found: {request.profile_id}"
            )
        
        # Fetch debts
        debts_cursor = db.debts.find({"profile_id": request.profile_id})
        debts = await debts_cursor.to_list(length=100)
        
        if not debts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No debts found for this profile. Add debts first."
            )
        
        # Get AI service
        ai_service = get_ai_service()
        
        # Generate insights
        response = await ai_service.generate_insights(
            profile_data=profile,
            debt_data=debts,
            scenario_data=None
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate insights. Please try again."
        )


@router.post("/ask", response_model=QAResponse)
async def ask_question(request: QARequest):
    """
    Answer user's question about debt management.
    
    This endpoint provides personalized answers to questions about:
    - Debt payoff strategies
    - Interest calculations
    - Payment optimization
    - Financial planning
    
    **Example Request:**
    ```json
    {
      "profile_id": "user123",
      "question": "Should I pay off my credit card or student loan first?",
      "context": {
        "current_strategy": "snowball"
      }
    }
    ```
    
    **Example Response:**
    ```json
    {
      "schema_version": "1.0",
      "request_id": "uuid",
      "timestamp": "2025-11-25T19:00:00Z",
      "response": {
        "answer": "Based on your debt profile, focus on the credit card first...",
        "context": "Your credit card has a 24.99% APR vs 6.5% for student loan",
        "next_steps": [
          "Review the avalanche strategy",
          "Calculate potential interest savings"
        ],
        "confidence": "high"
      }
    }
    ```
    """
    try:
        # Get database
        db = await get_database()
        
        # Fetch profile - try both profile_id and _id fields
        from bson import ObjectId
        profile = await db.profiles.find_one({"profile_id": request.profile_id})
        if not profile:
            # Try using the request.profile_id as MongoDB ObjectId
            try:
                profile = await db.profiles.find_one({"_id": ObjectId(request.profile_id)})
            except:
                pass
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile not found: {request.profile_id}"
            )
        
        # Fetch debts
        debts_cursor = db.debts.find({"profile_id": request.profile_id})
        debts = await debts_cursor.to_list(length=100)
        
        # Get AI service
        ai_service = get_ai_service()
        
        # Answer question
        response = await ai_service.answer_question(
            question=request.question,
            profile_data=profile,
            debt_data=debts,
            context=request.context
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error answering question: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to answer question. Please try again."
        )


@router.post("/compare-strategies", response_model=StrategyComparisonResponse)
async def compare_strategies(request: StrategyComparisonRequest):
    """
    Compare debt payoff strategies and get AI recommendation.
    
    This endpoint analyzes snowball vs avalanche strategies and provides:
    - Recommended strategy based on user's goals
    - Reasoning for the recommendation
    - Trade-offs to consider
    - Confidence level
    
    **Example Request:**
    ```json
    {
      "profile_id": "user123",
      "snowball_data": {
        "total_months": 36,
        "total_interest": 5000,
        "first_debt_paid": "Credit Card A"
      },
      "avalanche_data": {
        "total_months": 34,
        "total_interest": 4200,
        "first_debt_paid": "Credit Card B"
      }
    }
    ```
    """
    try:
        # Get database
        db = await get_database()
        
        # Fetch profile - try both profile_id and _id fields
        from bson import ObjectId
        profile = await db.profiles.find_one({"profile_id": request.profile_id})
        if not profile:
            # Try using the request.profile_id as MongoDB ObjectId
            try:
                profile = await db.profiles.find_one({"_id": ObjectId(request.profile_id)})
            except:
                pass
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile not found: {request.profile_id}"
            )
        
        # Get AI service
        ai_service = get_ai_service()
        
        # Compare strategies
        response = await ai_service.compare_strategies(
            profile_data=profile,
            snowball_results=request.snowball_data,
            avalanche_results=request.avalanche_data
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing strategies: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compare strategies. Please try again."
        )


@router.post("/onboarding", response_model=OnboardingResponse)
async def onboarding_conversation(request: OnboardingRequest):
    """
    Conversational AI onboarding flow.
    
    This endpoint provides a conversational experience for collecting
    user information during onboarding. It asks questions naturally
    and guides users through the setup process.
    
    **Example Request (Welcome):**
    ```json
    {
      "session_id": "session123",
      "step": "welcome"
    }
    ```
    
    **Example Request (Collecting Data):**
    ```json
    {
      "session_id": "session123",
      "user_input": "I have about $15,000 in credit card debt",
      "collected_data": {
        "debt_type": "credit_card"
      },
      "step": "collect_balance"
    }
    ```
    """
    try:
        # Get AI service
        ai_service = get_ai_service()
        
        # Generate onboarding message
        response = await ai_service.generate_onboarding_message(
            step=request.step or "welcome",
            collected_data=request.collected_data,
            user_input=request.user_input
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error in onboarding conversation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate onboarding message. Please try again."
        )


@router.post("/onboarding-reaction", response_model=OnboardingReactionResponse)
async def onboarding_reaction(request: OnboardingReactionRequest):
    """
    Generate Clara's empathetic reaction to user's onboarding answer.
    
    This endpoint provides personalized, empathetic reactions (1-2 sentences)
    to user answers during the conversational onboarding flow. It enriches
    the frontend-driven experience with AI-powered personalization.
    
    **Example Request:**
    ```json
    {
      "session_id": "user-session-uuid",
      "step_id": "stressLevel",
      "user_answers": {
        "moneyGoal": "pay-faster",
        "stressLevel": 5
      },
      "is_resume": false
    }
    ```
    
    **Example Response:**
    ```json
    {
      "schema_version": "1.1",
      "request_id": "uuid",
      "timestamp": "2025-11-29T19:00:00Z",
      "clara_message": "Thanks for sharing that—I know talking about debt can be stressful. I'm here with you every step of the way.",
      "validation_error": null
    }
    ```
    
    **Key Features:**
    - Reactive, not directive (doesn't ask questions)
    - Empathetic and personalized based on user context
    - Maximum 2 sentences for quick reading
    - Handles session resume with welcome-back messages
    - Graceful fallback on errors
    """
    try:
        # Get AI service
        ai_service = get_ai_service()
        
        # Generate Clara's empathetic reaction
        clara_message = await ai_service.generate_onboarding_reaction(
            step_id=request.step_id,
            user_answers=request.user_answers,
            is_resume=request.is_resume
        )
        
        # Create and return response
        return OnboardingReactionResponse(
            clara_message=clara_message,
            validation_error=None
        )
        
    except Exception as e:
        logger.error(f"Error generating onboarding reaction: {e}")
        # Return fallback message instead of error
        fallback_message = "Thank you for sharing that. Let's keep going." if not request.is_resume else "Welcome back! Let's continue where you left off."
        return OnboardingReactionResponse(
            clara_message=fallback_message,
            validation_error=None
        )


@router.get("/health")
async def health_check():
    """
    Check if AI services are available and configured correctly.
    
    Returns:
    - Provider status
    - Configuration status
    - API key validation (without exposing keys)
    """
    try:
        ai_service = get_ai_service()
        provider_name = ai_service.provider.get_provider_name()
        
        return {
            "status": "healthy",
            "provider": provider_name,
            "config_loaded": True,
            "api_key_configured": True
        }
    except Exception as e:
        logger.error(f"AI services health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "provider": None,
            "config_loaded": False,
            "api_key_configured": False
        }