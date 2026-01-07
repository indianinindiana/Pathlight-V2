"""
AI Service Layer
Manages AI-powered features including insights, Q&A, and onboarding.
Uses the LLM provider abstraction and prompt templates from configuration.
"""

import logging
import yaml
from typing import Dict, Any, Optional, List
from pathlib import Path

from .llm_provider import LLMProviderFactory
from .clara_fallbacks import get_clara_fallback, get_resume_message
from .ai_models import (
    InsightsResponse, InsightsResponseContent,
    QAResponse, QAResponseContent,
    OnboardingResponse, OnboardingResponseContent,
    StrategyComparisonResponse, StrategyComparisonContent,
    ProgressCelebrationResponse, ProgressCelebrationContent,
    AIErrorResponse,
    sanitize_ai_content, validate_ai_response, get_fallback_response
)

logger = logging.getLogger(__name__)


# ============================================================================
# Configuration Loader
# ============================================================================

class AIPromptConfig:
    """Loads and manages AI prompt templates from YAML configuration"""
    
    _instance = None
    _config = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._config is None:
            self.reload()
    
    def reload(self):
        """Reload configuration from file"""
        try:
            config_path = Path(__file__).parent.parent.parent / "config" / "ai_prompts.yaml"
            with open(config_path, 'r') as f:
                self._config = yaml.safe_load(f)
            logger.info("AI prompt configuration loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load AI prompt configuration: {e}")
            self._config = self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration if file loading fails"""
        return {
            "system_prompts": {
                "insights": {
                    "role": "You are a financial advisor providing debt management insights."
                },
                "ask": {
                    "role": "You are a financial advisor answering questions about debt."
                },
                "onboarding": {
                    "role": "You are a friendly coach helping with debt management."
                }
            },
            "fallback_responses": get_fallback_response("insights")
        }
    
    def get_system_prompt(self, feature: str) -> str:
        """Get system prompt for a feature"""
        try:
            prompt_config = self._config.get("system_prompts", {}).get(feature, {})
            role = prompt_config.get("role", "")
            guidelines = prompt_config.get("guidelines", [])
            
            if guidelines:
                guidelines_text = "\n".join([f"- {g}" for g in guidelines])
                return f"{role}\n\nGuidelines:\n{guidelines_text}"
            return role
        except Exception as e:
            logger.error(f"Error getting system prompt for {feature}: {e}")
            return "You are a helpful financial advisor."
    
    def get_prompt_template(self, category: str, template_name: str) -> str:
        """Get a specific prompt template"""
        try:
            templates = self._config.get(f"{category}_templates", {})
            template_config = templates.get(template_name, {})
            return template_config.get("template", "")
        except Exception as e:
            logger.error(f"Error getting template {category}.{template_name}: {e}")
            return ""
    
    def get_fallback_response(self, response_type: str) -> Dict[str, Any]:
        """Get fallback response for a type"""
        try:
            return self._config.get("fallback_responses", {}).get(response_type, {})
        except Exception as e:
            logger.error(f"Error getting fallback for {response_type}: {e}")
            return get_fallback_response(response_type)
    
    def get_config(self) -> Dict[str, Any]:
        """Get the full configuration dictionary"""
        return self._config or {}


# ============================================================================
# AI Service
# ============================================================================

class AIService:
    """Main AI service for generating insights, answering questions, etc."""
    
    def __init__(self):
        self.config = AIPromptConfig()
        self.provider = LLMProviderFactory.get_provider()
    
    async def generate_insights(
        self,
        profile_data: Dict[str, Any],
        debt_data: List[Dict[str, Any]],
        scenario_data: Optional[Dict[str, Any]] = None
    ) -> InsightsResponse:
        """
        Generate AI-powered insights about user's debt portfolio.
        
        Args:
            profile_data: User profile information
            debt_data: List of user's debts
            scenario_data: Optional scenario simulation results
        
        Returns:
            InsightsResponse with structured insights
        """
        try:
            # Prepare context data
            total_debt = sum(d.get("balance", 0) for d in debt_data)
            debt_count = len(debt_data)
            highest_apr = max((d.get("apr", 0) for d in debt_data), default=0)
            lowest_apr = min((d.get("apr", 0) for d in debt_data), default=0)
            total_minimum = sum(d.get("minimum_payment", 0) for d in debt_data)
            
            # Format debt list
            debt_list = "\n".join([
                f"- {d.get('name', 'Unnamed')}: ${d.get('balance', 0):.2f} at {d.get('apr', 0):.1f}% APR"
                for d in debt_data[:10]  # Limit to first 10 for prompt length
            ])
            
            # Get prompt template
            template = self.config.get_prompt_template("insights", "debt_overview")
            
            # Fill in template
            prompt = template.format(
                total_debt=f"{total_debt:.2f}",
                debt_count=debt_count,
                highest_apr=f"{highest_apr:.1f}",
                lowest_apr=f"{lowest_apr:.1f}",
                total_minimum=f"{total_minimum:.2f}",
                available_payment=f"{profile_data.get('available_monthly_payment', 0):.2f}",
                primary_goal=profile_data.get('primary_goal', 'pay-faster'),
                stress_level=profile_data.get('stress_level', 3),
                debt_list=debt_list
            )
            
            # Get system prompt
            system_prompt = self.config.get_system_prompt("insights")
            
            # Generate response
            response_data = await self.provider.generate_json(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=1500
            )
            
            # Sanitize content
            if "summary" in response_data:
                response_data["summary"] = sanitize_ai_content(response_data["summary"])
            if "insights" in response_data:
                response_data["insights"] = [
                    sanitize_ai_content(i) for i in response_data["insights"]
                ]
            
            # Validate and create response
            if validate_ai_response(response_data, "insights"):
                content = InsightsResponseContent(**response_data)
                return InsightsResponse(response=content)
            else:
                raise ValueError("Invalid response structure from LLM")
                
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            # Return fallback response
            fallback = self.config.get_fallback_response("insights")
            content = InsightsResponseContent(**fallback)
            return InsightsResponse(response=content)
    
    async def answer_question(
        self,
        question: str,
        profile_data: Dict[str, Any],
        debt_data: List[Dict[str, Any]],
        context: Optional[Dict[str, Any]] = None
    ) -> QAResponse:
        """
        Answer user's question about debt management.
        
        Args:
            question: User's question
            profile_data: User profile information
            debt_data: List of user's debts
            context: Additional context
        
        Returns:
            QAResponse with answer and related information
        """
        try:
            # Prepare context
            total_debt = sum(d.get("balance", 0) for d in debt_data) if debt_data else 0
            debt_count = len(debt_data) if debt_data else 0
            
            # Get prompt template
            template = self.config.get_prompt_template("qa", "general_question")
            
            # If no template found, use a simple default
            if not template:
                template = """User question: {question}

Context:
- Total debt: ${total_debt}
- Number of debts: {debt_count}
- Primary goal: {primary_goal}
- Current strategy: {current_strategy}

Please provide a helpful, personalized answer based on this context."""
            
            # Fill in template
            prompt = template.format(
                question=question,
                total_debt=f"{total_debt:.2f}",
                debt_count=debt_count,
                primary_goal=profile_data.get('primary_goal', 'pay-faster'),
                current_strategy=context.get('current_strategy', 'not selected') if context else 'not selected'
            )
            
            # Get system prompt
            system_prompt = self.config.get_system_prompt("ask")
            
            # Generate response with increased token limit for complete JSON
            logger.info(f"Sending prompt to LLM: {prompt[:200]}...")  # Log first 200 chars
            response_data = await self.provider.generate_json(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=2000  # Increased to ensure complete JSON responses
            )
            logger.info(f"Received response from LLM: {response_data}")
            
            # Sanitize content
            if "answer" in response_data:
                response_data["answer"] = sanitize_ai_content(response_data["answer"])
            
            # Ensure arrays don't exceed limits
            if "next_steps" in response_data and isinstance(response_data["next_steps"], list):
                response_data["next_steps"] = response_data["next_steps"][:5]  # Max 5
            if "related_topics" in response_data and isinstance(response_data["related_topics"], list):
                response_data["related_topics"] = response_data["related_topics"][:4]  # Max 4
            
            # Validate and create response
            try:
                content = QAResponseContent(**response_data)
                return QAResponse(response=content)
            except Exception as validation_error:
                logger.error(f"Pydantic validation failed: {validation_error}")
                logger.error(f"Response data: {response_data}")
                raise ValueError(f"Invalid response structure from LLM: {validation_error}")
                
        except Exception as e:
            logger.error(f"Error answering question: {e}", exc_info=True)
            
            # Create a helpful, context-aware fallback response
            fallback = {
                "answer": "I'd love to help answer that! However, I'm having a temporary issue connecting to my knowledge base right now. While I work on that, here are some general debt management principles:\n\n• Paying off high-interest debt first (avalanche method) typically saves the most money\n• Paying off smallest balances first (snowball method) can provide quick wins and motivation\n• Making extra payments beyond minimums accelerates your debt-free date\n• Consider your personal goals and what motivates you most\n\nPlease try asking your question again in a moment, or feel free to explore your Dashboard for personalized insights!",
                "context": "This is a general response due to a temporary service issue",
                "next_steps": [
                    "Try asking your question again",
                    "Explore your personalized Dashboard insights",
                    "Review your debt payoff strategies"
                ],
                "related_topics": ["Debt Payoff Strategies", "Interest Savings", "Payment Planning"],
                "confidence": "low"
            }
            
            content = QAResponseContent(**fallback)
            return QAResponse(response=content)
    
    async def compare_strategies(
        self,
        profile_data: Dict[str, Any],
        snowball_results: Dict[str, Any],
        avalanche_results: Dict[str, Any]
    ) -> StrategyComparisonResponse:
        """
        Compare debt payoff strategies and recommend one.
        
        Args:
            profile_data: User profile information
            snowball_results: Snowball strategy simulation results
            avalanche_results: Avalanche strategy simulation results
        
        Returns:
            StrategyComparisonResponse with recommendation
        """
        try:
            # Get prompt template
            template = self.config.get_prompt_template("insights", "strategy_comparison")
            
            # Fill in template
            prompt = template.format(
                primary_goal=profile_data.get('primary_goal', 'pay-faster'),
                stress_level=profile_data.get('stress_level', 3),
                available_payment=f"{profile_data.get('available_monthly_payment', 0):.2f}",
                snowball_months=snowball_results.get('total_months', 0),
                snowball_interest=f"{snowball_results.get('total_interest', 0):.2f}",
                snowball_first_debt=snowball_results.get('first_debt_paid', 'Unknown'),
                avalanche_months=avalanche_results.get('total_months', 0),
                avalanche_interest=f"{avalanche_results.get('total_interest', 0):.2f}",
                avalanche_first_debt=avalanche_results.get('first_debt_paid', 'Unknown')
            )
            
            # Get system prompt
            system_prompt = self.config.get_system_prompt("insights")
            
            # Generate response
            response_data = await self.provider.generate_json(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=800
            )
            
            # Sanitize content
            for field in ["reasoning", "trade_offs"]:
                if field in response_data:
                    response_data[field] = sanitize_ai_content(response_data[field])
            
            # Validate and create response
            if validate_ai_response(response_data, "strategy_comparison"):
                content = StrategyComparisonContent(**response_data)
                return StrategyComparisonResponse(response=content)
            else:
                raise ValueError("Invalid response structure from LLM")
                
        except Exception as e:
            logger.error(f"Error comparing strategies: {e}")
            # Return fallback response
            fallback = self.config.get_fallback_response("strategy_comparison")
            content = StrategyComparisonContent(**fallback)
            return StrategyComparisonResponse(response=content)
    
    async def generate_onboarding_message(
        self,
        step: str,
        collected_data: Optional[Dict[str, Any]] = None,
        user_input: Optional[str] = None
    ) -> OnboardingResponse:
        """
        Generate conversational onboarding message.
        
        Args:
            step: Current onboarding step
            collected_data: Data collected so far
            user_input: User's latest input
        
        Returns:
            OnboardingResponse with next message/question
        """
        try:
            if step == "welcome":
                template = self.config.get_prompt_template("onboarding", "welcome")
                prompt = template
            else:
                template = self.config.get_prompt_template("onboarding", "collect_debt_info")
                prompt = template.format(
                    previous_info=str(collected_data or {}),
                    missing_fields="balance, apr, minimum_payment"  # Simplified
                )
            
            # Get system prompt
            system_prompt = self.config.get_system_prompt("onboarding")
            
            # Generate response
            response_data = await self.provider.generate_json(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.8,
                max_tokens=500
            )
            
            # Sanitize content
            if "message" in response_data:
                response_data["message"] = sanitize_ai_content(response_data["message"])
            
            # Validate and create response
            if validate_ai_response(response_data, "onboarding"):
                content = OnboardingResponseContent(**response_data)
                return OnboardingResponse(response=content)
            else:
                raise ValueError("Invalid response structure from LLM")
                
        except Exception as e:
            logger.error(f"Error generating onboarding message: {e}")
            # Return fallback response
            fallback = self.config.get_fallback_response("onboarding")
            content = OnboardingResponseContent(**fallback)
            return OnboardingResponse(response=content)
    
    async def generate_onboarding_reaction(
        self,
        step_id: str,
        user_answers: Dict[str, Any],
        is_resume: bool = False
    ) -> str:
        """
        Generate Clara's empathetic reaction to user's onboarding answer.
        
        Args:
            step_id: ID of the question just answered
            user_answers: All answers collected so far
            is_resume: Whether this is a session resume
        
        Returns:
            Clara's empathetic message (1-2 sentences)
        """
        try:
            # Get prompt template
            template = self.config.get_prompt_template("onboarding", "onboarding_reaction")
            
            # Add is_resume to user_answers for template processing
            answers_with_context = {**user_answers, "is_resume": is_resume}
            
            # Fill in template
            import json
            prompt = template.format(
                user_answers=json.dumps(answers_with_context, indent=2),
                step_id=step_id
            )
            
            # Get system prompt
            system_prompt = self.config.get_system_prompt("onboarding_reaction")
            
            # Generate response (plain text, not JSON)
            response_text = await self.provider.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.8,
                max_tokens=500  # Increased to allow full responses
            )
            
            # Sanitize and validate
            clara_message = sanitize_ai_content(response_text)
            
            # Return the full message without truncation
            return clara_message
                
        except Exception as e:
            logger.error(f"Error generating onboarding reaction: {e}")
            # Use context-aware fallback message
            if is_resume:
                return get_resume_message()
            return get_clara_fallback(step_id, user_answers)
    
    def reload_config(self):
        """Reload AI prompt configuration"""
        self.config.reload()
        logger.info("AI service configuration reloaded")


# ============================================================================
# Singleton Instance
# ============================================================================

_ai_service_instance: Optional[AIService] = None


def get_ai_service() -> AIService:
    """Get or create AI service singleton instance"""
    global _ai_service_instance
    if _ai_service_instance is None:
        _ai_service_instance = AIService()
    return _ai_service_instance