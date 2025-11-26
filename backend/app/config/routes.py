"""
Configuration Management Routes
API endpoints for reloading configuration files without restarting the server.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging

from ..shared.config_loader import get_config
from ..shared.ai_service import get_ai_service
from ..personalization.service import get_personalization_service

router = APIRouter(prefix="/config", tags=["Configuration"])
logger = logging.getLogger(__name__)


# ============================================================================
# Request/Response Models
# ============================================================================

class ReloadRequest(BaseModel):
    """Request model for configuration reload"""
    configs: Optional[List[str]] = None  # Specific configs to reload, or None for all
    

class ReloadResponse(BaseModel):
    """Response model for configuration reload"""
    success: bool
    message: str
    reloaded_configs: List[str]
    timestamp: datetime
    errors: Optional[List[str]] = None


class ConfigStatusResponse(BaseModel):
    """Response model for configuration status"""
    calculation_parameters: dict
    recommendation_rules: dict
    ai_prompts: dict
    personalization_rules: dict
    last_loaded: Optional[datetime] = None


# ============================================================================
# Routes
# ============================================================================

@router.post("/reload", response_model=ReloadResponse)
async def reload_configuration(request: ReloadRequest):
    """
    Reload configuration files without restarting the server.
    
    This endpoint allows hot-reloading of:
    - Calculation parameters
    - Recommendation rules
    - AI prompt templates
    - Personalization rules
    
    **Security Note:** In production, this endpoint should be secured
    with authentication and authorization to prevent unauthorized
    configuration changes.
    
    **Example Request (Reload All):**
    ```json
    {
      "configs": null
    }
    ```
    
    **Example Request (Reload Specific):**
    ```json
    {
      "configs": ["ai_prompts", "personalization_rules"]
    }
    ```
    
    **Example Response:**
    ```json
    {
      "success": true,
      "message": "Configuration reloaded successfully",
      "reloaded_configs": [
        "calculation_parameters",
        "recommendation_rules",
        "ai_prompts",
        "personalization_rules"
      ],
      "timestamp": "2025-11-25T19:30:00Z",
      "errors": null
    }
    ```
    """
    try:
        reloaded = []
        errors = []
        
        # Determine which configs to reload
        configs_to_reload = request.configs or [
            "calculation_parameters",
            "recommendation_rules",
            "ai_prompts",
            "personalization_rules"
        ]
        
        # Reload calculation parameters and recommendation rules
        if "calculation_parameters" in configs_to_reload or "recommendation_rules" in configs_to_reload:
            try:
                config_loader = get_config()
                config_loader.reload()
                if "calculation_parameters" in configs_to_reload:
                    reloaded.append("calculation_parameters")
                if "recommendation_rules" in configs_to_reload:
                    reloaded.append("recommendation_rules")
                logger.info("Reloaded calculation and recommendation configs")
            except Exception as e:
                error_msg = f"Failed to reload calculation/recommendation configs: {e}"
                logger.error(error_msg)
                errors.append(error_msg)
        
        # Reload AI prompts
        if "ai_prompts" in configs_to_reload:
            try:
                ai_service = get_ai_service()
                ai_service.reload_config()
                reloaded.append("ai_prompts")
                logger.info("Reloaded AI prompts config")
            except Exception as e:
                error_msg = f"Failed to reload AI prompts: {e}"
                logger.error(error_msg)
                errors.append(error_msg)
        
        # Reload personalization rules
        if "personalization_rules" in configs_to_reload:
            try:
                personalization_service = get_personalization_service()
                personalization_service.reload_config()
                reloaded.append("personalization_rules")
                logger.info("Reloaded personalization rules config")
            except Exception as e:
                error_msg = f"Failed to reload personalization rules: {e}"
                logger.error(error_msg)
                errors.append(error_msg)
        
        # Determine success
        success = len(errors) == 0
        message = "Configuration reloaded successfully" if success else "Configuration reload completed with errors"
        
        return ReloadResponse(
            success=success,
            message=message,
            reloaded_configs=reloaded,
            timestamp=datetime.utcnow(),
            errors=errors if errors else None
        )
        
    except Exception as e:
        logger.error(f"Error reloading configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reload configuration: {str(e)}"
        )


@router.get("/status", response_model=ConfigStatusResponse)
async def get_configuration_status():
    """
    Get current configuration status and versions.
    
    This endpoint returns metadata about the currently loaded
    configuration files, including versions and last update times.
    
    **Example Response:**
    ```json
    {
      "calculation_parameters": {
        "version": "1.0",
        "last_updated": "2025-11-25"
      },
      "recommendation_rules": {
        "version": "1.0",
        "last_updated": "2025-11-25"
      },
      "ai_prompts": {
        "version": "1.0",
        "last_updated": "2025-11-25"
      },
      "personalization_rules": {
        "version": "1.0",
        "last_updated": "2025-11-25"
      },
      "last_loaded": "2025-11-25T19:00:00Z"
    }
    ```
    """
    try:
        # Get config loader
        config_loader = get_config()
        calc_config = config_loader.calculation_params
        rec_config = config_loader.recommendation_rules
        
        # Get AI service config
        ai_service = get_ai_service()
        ai_config = ai_service.config.get_config()
        
        # Get personalization service config
        personalization_service = get_personalization_service()
        pers_config = personalization_service.config.get_config()
        
        return ConfigStatusResponse(
            calculation_parameters={
                "version": calc_config.get("version", "unknown"),
                "last_updated": calc_config.get("last_updated", "unknown")
            },
            recommendation_rules={
                "version": rec_config.get("version", "unknown"),
                "last_updated": rec_config.get("last_updated", "unknown")
            },
            ai_prompts={
                "version": ai_config.get("version", "unknown"),
                "last_updated": ai_config.get("last_updated", "unknown")
            },
            personalization_rules={
                "version": pers_config.get("version", "unknown"),
                "last_updated": pers_config.get("last_updated", "unknown")
            },
            last_loaded=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Error getting configuration status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get configuration status"
        )


@router.get("/health")
async def config_health_check():
    """
    Check if all configuration files are loaded and valid.
    
    Returns:
    - Status of each configuration file
    - Any loading errors
    - Configuration versions
    """
    try:
        health_status = {
            "status": "healthy",
            "configs": {}
        }
        
        # Check calculation parameters
        try:
            config_loader = get_config()
            calc_config = config_loader.calculation_params
            health_status["configs"]["calculation_parameters"] = {
                "loaded": True,
                "version": calc_config.get("version", "unknown")
            }
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["configs"]["calculation_parameters"] = {
                "loaded": False,
                "error": str(e)
            }
        
        # Check recommendation rules
        try:
            rec_config = config_loader.recommendation_rules
            health_status["configs"]["recommendation_rules"] = {
                "loaded": True,
                "version": rec_config.get("version", "unknown")
            }
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["configs"]["recommendation_rules"] = {
                "loaded": False,
                "error": str(e)
            }
        
        # Check AI prompts
        try:
            ai_service = get_ai_service()
            ai_config = ai_service.config.get_config()
            health_status["configs"]["ai_prompts"] = {
                "loaded": True,
                "version": ai_config.get("version", "unknown")
            }
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["configs"]["ai_prompts"] = {
                "loaded": False,
                "error": str(e)
            }
        
        # Check personalization rules
        try:
            personalization_service = get_personalization_service()
            pers_config = personalization_service.config.get_config()
            health_status["configs"]["personalization_rules"] = {
                "loaded": True,
                "version": pers_config.get("version", "unknown")
            }
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["configs"]["personalization_rules"] = {
                "loaded": False,
                "error": str(e)
            }
        
        return health_status
        
    except Exception as e:
        logger.error(f"Configuration health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }