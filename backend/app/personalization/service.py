"""
Personalization Service
Implements rule-based personalization for microcopy and next actions.
"""

import logging
import yaml
from typing import Dict, Any, List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class PersonalizationConfig:
    """Loads and manages personalization rules from YAML configuration"""
    
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
            config_path = Path(__file__).parent.parent.parent / "config" / "personalization_rules.yaml"
            with open(config_path, 'r') as f:
                self._config = yaml.safe_load(f)
            logger.info("Personalization configuration loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load personalization configuration: {e}")
            self._config = self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration if file loading fails"""
        return {
            "microcopy": {
                "dashboard_welcome": {
                    "rules": [
                        {
                            "condition": {"default": True},
                            "message": "Welcome back! Let's check on your progress.",
                            "tone": "neutral"
                        }
                    ]
                }
            },
            "next_actions": {
                "priority_rules": []
            }
        }
    
    def get_config(self) -> Dict[str, Any]:
        """Get full configuration"""
        return self._config


class PersonalizationService:
    """Service for generating personalized content"""
    
    def __init__(self):
        self.config = PersonalizationConfig()
    
    def _evaluate_condition(self, condition: Dict[str, Any], context: Dict[str, Any]) -> bool:
        """
        Evaluate if a condition matches the given context.
        
        Args:
            condition: Condition dictionary from rules
            context: User context data
        
        Returns:
            True if condition matches, False otherwise
        """
        # Default condition always matches
        if condition.get("default"):
            return True
        
        # Check each condition field
        for key, expected_value in condition.items():
            if key == "default":
                continue
            
            context_value = context.get(key)
            
            # Handle list of acceptable values
            if isinstance(expected_value, list):
                if context_value not in expected_value:
                    return False
            # Handle range conditions
            elif isinstance(expected_value, dict):
                if "min" in expected_value and context_value < expected_value["min"]:
                    return False
                if "max" in expected_value and context_value > expected_value["max"]:
                    return False
            # Handle exact match
            else:
                if context_value != expected_value:
                    return False
        
        return True
    
    def get_microcopy(self, category: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get personalized microcopy based on context.
        
        Args:
            category: Microcopy category (e.g., "dashboard_welcome")
            context: User context data
        
        Returns:
            Dictionary with message and metadata
        """
        try:
            microcopy_config = self.config.get_config().get("microcopy", {})
            category_rules = microcopy_config.get(category, {}).get("rules", [])
            
            # Find first matching rule
            for rule in category_rules:
                condition = rule.get("condition", {})
                if self._evaluate_condition(condition, context):
                    message = rule.get("message", "")
                    
                    # Replace placeholders in message
                    for key, value in context.items():
                        placeholder = f"{{{key}}}"
                        if placeholder in message:
                            message = message.replace(placeholder, str(value))
                    
                    return {
                        "message": message,
                        "tone": rule.get("tone", "neutral"),
                        "emphasis": rule.get("emphasis"),
                        "severity": rule.get("severity"),
                        "action": rule.get("action")
                    }
            
            # No matching rule found
            return {
                "message": "Welcome!",
                "tone": "neutral"
            }
            
        except Exception as e:
            logger.error(f"Error getting microcopy for {category}: {e}")
            return {
                "message": "Welcome!",
                "tone": "neutral"
            }
    
    def get_next_actions(self, context: Dict[str, Any], limit: int = 3) -> List[Dict[str, Any]]:
        """
        Get prioritized next actions based on context.
        
        Args:
            context: User context data
            limit: Maximum number of actions to return
        
        Returns:
            List of action dictionaries
        """
        try:
            next_actions_config = self.config.get_config().get("next_actions", {})
            priority_rules = next_actions_config.get("priority_rules", [])
            
            all_actions = []
            
            # Evaluate each rule and collect matching actions
            for rule in priority_rules:
                condition = rule.get("condition", {})
                if self._evaluate_condition(condition, context):
                    actions = rule.get("actions", [])
                    all_actions.extend(actions)
            
            # Sort by priority and limit
            all_actions.sort(key=lambda x: x.get("priority", 999))
            return all_actions[:limit]
            
        except Exception as e:
            logger.error(f"Error getting next actions: {e}")
            return [
                {
                    "text": "Review your progress",
                    "priority": 1,
                    "category": "tracking",
                    "icon": "chart"
                }
            ]
    
    def get_contextual_help(self, category: str, field: str, context: Dict[str, Any]) -> Optional[str]:
        """
        Get contextual help text for a specific field.
        
        Args:
            category: Help category (e.g., "debt_entry")
            field: Field name
            context: Context data including field value
        
        Returns:
            Help text or None
        """
        try:
            help_config = self.config.get_config().get("contextual_help", {})
            category_rules = help_config.get(category, {}).get("rules", [])
            
            # Find matching rule for this field
            for rule in category_rules:
                if rule.get("field") == field:
                    condition = rule.get("condition", {})
                    # Add field value to context for evaluation
                    eval_context = {**context, **condition}
                    if self._evaluate_condition(condition, eval_context):
                        return rule.get("help")
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting contextual help for {category}.{field}: {e}")
            return None
    
    def test_rules(self, test_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Test personalization rules with given context (dry-run mode).
        
        Args:
            test_context: Test context data
        
        Returns:
            Dictionary with all personalization results
        """
        try:
            results = {
                "context": test_context,
                "microcopy": {},
                "next_actions": [],
                "contextual_help": {}
            }
            
            # Test all microcopy categories
            microcopy_config = self.config.get_config().get("microcopy", {})
            for category in microcopy_config.keys():
                results["microcopy"][category] = self.get_microcopy(category, test_context)
            
            # Test next actions
            results["next_actions"] = self.get_next_actions(test_context, limit=5)
            
            # Test contextual help
            help_config = self.config.get_config().get("contextual_help", {})
            for category in help_config.keys():
                results["contextual_help"][category] = {}
                category_rules = help_config.get(category, {}).get("rules", [])
                for rule in category_rules:
                    field = rule.get("field")
                    if field:
                        help_text = self.get_contextual_help(category, field, test_context)
                        if help_text:
                            results["contextual_help"][category][field] = help_text
            
            return results
            
        except Exception as e:
            logger.error(f"Error testing rules: {e}")
            return {
                "error": str(e),
                "context": test_context
            }
    
    def reload_config(self):
        """Reload personalization configuration"""
        self.config.reload()
        logger.info("Personalization service configuration reloaded")


# Singleton instance
_personalization_service_instance: Optional[PersonalizationService] = None


def get_personalization_service() -> PersonalizationService:
    """Get or create personalization service singleton instance"""
    global _personalization_service_instance
    if _personalization_service_instance is None:
        _personalization_service_instance = PersonalizationService()
    return _personalization_service_instance