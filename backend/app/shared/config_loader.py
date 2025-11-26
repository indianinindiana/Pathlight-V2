"""
Configuration loader for YAML configuration files.
Provides centralized access to calculation parameters and recommendation rules.
"""
import yaml
from pathlib import Path
from typing import Dict, Any, Optional
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

# Configuration file paths
CONFIG_DIR = Path(__file__).parent.parent.parent / "config"
CALCULATION_PARAMS_FILE = CONFIG_DIR / "calculation_parameters.yaml"
RECOMMENDATION_RULES_FILE = CONFIG_DIR / "recommendation_rules.yaml"

class ConfigLoader:
    """Singleton configuration loader with caching."""
    
    _instance: Optional['ConfigLoader'] = None
    _calculation_params: Optional[Dict[str, Any]] = None
    _recommendation_rules: Optional[Dict[str, Any]] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize the configuration loader."""
        if self._calculation_params is None:
            self.reload()
    
    def reload(self):
        """Reload all configuration files from disk."""
        logger.info("Loading configuration files...")
        
        try:
            self._calculation_params = self._load_yaml(CALCULATION_PARAMS_FILE)
            logger.info(f"Loaded calculation parameters (version: {self._calculation_params.get('version', 'unknown')})")
        except Exception as e:
            logger.error(f"Failed to load calculation parameters: {e}")
            self._calculation_params = self._get_default_calculation_params()
        
        try:
            self._recommendation_rules = self._load_yaml(RECOMMENDATION_RULES_FILE)
            logger.info(f"Loaded recommendation rules (version: {self._recommendation_rules.get('version', 'unknown')})")
        except Exception as e:
            logger.error(f"Failed to load recommendation rules: {e}")
            self._recommendation_rules = self._get_default_recommendation_rules()
    
    @staticmethod
    def _load_yaml(file_path: Path) -> Dict[str, Any]:
        """Load and parse a YAML file."""
        if not file_path.exists():
            raise FileNotFoundError(f"Configuration file not found: {file_path}")
        
        with open(file_path, 'r') as f:
            return yaml.safe_load(f)
    
    @property
    def calculation_params(self) -> Dict[str, Any]:
        """Get calculation parameters."""
        if self._calculation_params is None:
            self.reload()
        return self._calculation_params
    
    @property
    def recommendation_rules(self) -> Dict[str, Any]:
        """Get recommendation rules."""
        if self._recommendation_rules is None:
            self.reload()
        return self._recommendation_rules
    
    # Convenience methods for accessing specific configuration values
    
    def get_interest_config(self) -> Dict[str, Any]:
        """Get interest calculation configuration."""
        return self.calculation_params.get('interest', {})
    
    def get_minimum_payment_config(self) -> Dict[str, Any]:
        """Get minimum payment configuration."""
        return self.calculation_params.get('minimum_payment', {})
    
    def get_strategy_config(self, strategy: str) -> Dict[str, Any]:
        """Get configuration for a specific strategy."""
        strategies = self.calculation_params.get('strategies', {})
        return strategies.get(strategy, {})
    
    def get_optimization_config(self) -> Dict[str, Any]:
        """Get optimization configuration."""
        return self.calculation_params.get('optimization', {})
    
    def get_simulation_config(self) -> Dict[str, Any]:
        """Get simulation configuration."""
        return self.calculation_params.get('simulation', {})
    
    def get_what_if_config(self) -> Dict[str, Any]:
        """Get what-if analysis configuration."""
        return self.calculation_params.get('what_if', {})
    
    def get_strategy_selection_rules(self) -> Dict[str, Any]:
        """Get strategy selection rules."""
        return self.recommendation_rules.get('strategy_selection', {})
    
    def get_confidence_scoring_rules(self) -> Dict[str, Any]:
        """Get confidence scoring rules."""
        return self.recommendation_rules.get('confidence_scoring', {})
    
    def get_goal_rules(self, goal: str) -> Dict[str, Any]:
        """Get rules for a specific goal."""
        goals = self.recommendation_rules.get('strategy_selection', {}).get('goals', {})
        return goals.get(goal, {})
    
    def get_comparison_thresholds(self) -> Dict[str, Any]:
        """Get strategy comparison thresholds."""
        return self.recommendation_rules.get('strategy_selection', {}).get('comparison', {})
    
    def get_debt_analysis_config(self) -> Dict[str, Any]:
        """Get debt analysis configuration."""
        return self.recommendation_rules.get('strategy_selection', {}).get('debt_analysis', {})
    
    def get_messaging_template(self, template_name: str) -> Dict[str, Any]:
        """Get a messaging template."""
        templates = self.recommendation_rules.get('messaging', {}).get('templates', {})
        return templates.get(template_name, {})
    
    # Default configurations (fallback if files are missing)
    
    @staticmethod
    def _get_default_calculation_params() -> Dict[str, Any]:
        """Get default calculation parameters."""
        return {
            'version': '1.0',
            'interest': {
                'compound_frequency': 'monthly',
                'minimum_threshold': 0.01,
                'high_apr_warning_threshold': 30.0
            },
            'minimum_payment': {
                'interest_coverage_ratio': 1.0,
                'suggested_calculation': {
                    'balance_percentage': 0.01,
                    'minimum_principal_payment': 25.0
                }
            },
            'strategies': {
                'snowball': {'sort_by': 'balance', 'sort_order': 'ascending'},
                'avalanche': {'sort_by': 'apr', 'sort_order': 'descending'},
                'custom': {'sort_by': 'custom'}
            },
            'optimization': {
                'binary_search': {
                    'max_iterations': 50,
                    'tolerance_dollars': 1.0
                },
                'suggested_increase_percentage': 0.20
            },
            'simulation': {
                'max_months': 600,
                'balance_tolerance': 0.01
            }
        }
    
    @staticmethod
    def _get_default_recommendation_rules() -> Dict[str, Any]:
        """Get default recommendation rules."""
        return {
            'version': '1.0',
            'strategy_selection': {
                'goals': {
                    'pay-faster': {'primary_factor': 'time_to_payoff'},
                    'reduce-interest': {'primary_factor': 'total_interest', 'force_avalanche': True},
                    'lower-payment': {'primary_factor': 'quick_wins'},
                    'avoid-default': {'primary_factor': 'psychological_momentum', 'prefer_snowball': True}
                },
                'comparison': {
                    'significant_interest_difference': 500,
                    'significant_time_difference': 6
                },
                'debt_analysis': {
                    'small_debt_balance': 2000,
                    'high_apr': 20.0
                }
            },
            'confidence_scoring': {
                'profile_completeness': {'weight': 0.40},
                'debt_complexity': {'weight': 0.20},
                'delinquency': {'weight': 0.20},
                'cash_flow': {'weight': 0.20}
            }
        }

# Global configuration instance
_config = ConfigLoader()

def get_config() -> ConfigLoader:
    """Get the global configuration instance."""
    return _config

def reload_config():
    """Reload all configuration files."""
    _config.reload()

# Convenience functions for direct access
def get_calculation_params() -> Dict[str, Any]:
    """Get calculation parameters."""
    return _config.calculation_params

def get_recommendation_rules() -> Dict[str, Any]:
    """Get recommendation rules."""
    return _config.recommendation_rules