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
    StrategyComparisonRequest, StrategyComparisonResponse,
    AIErrorResponse
)
from ..shared.database import get_database

router = APIRouter(prefix="/ai", tags=["AI Services"])
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
        
        # Fetch profile
        profile = await db.profiles.find_one({"profile_id": request.profile_id})
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
        
        # Fetch profile
        profile = await db.profiles.find_one({"profile_id": request.profile_id})
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
        
        # Fetch profile
        profile = await db.profiles.find_one({"profile_id": request.profile_id})
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