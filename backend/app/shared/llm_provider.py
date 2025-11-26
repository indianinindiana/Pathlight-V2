"""
LLM Provider Abstraction Layer
Provides a unified interface for multiple LLM providers (Gemini, Claude, OpenAI).
Allows easy switching between providers without changing application code.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List, Literal
from abc import ABC, abstractmethod
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


# ============================================================================
# Base Provider Interface
# ============================================================================

class LLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
    
    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        json_mode: bool = False
    ) -> str:
        """Generate text completion"""
        pass
    
    @abstractmethod
    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """Generate JSON response"""
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Get provider name"""
        pass


# ============================================================================
# Google Gemini Provider
# ============================================================================

class GeminiProvider(LLMProvider):
    """Google Gemini provider implementation"""
    
    def __init__(self, api_key: str, model: str = "gemini-1.5-flash"):
        super().__init__(api_key, model)
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            self.genai = genai
            self.client = genai.GenerativeModel(model)
            logger.info(f"Initialized Gemini provider with model: {model}")
        except ImportError:
            raise ImportError("google-generativeai package not installed. Run: pip install google-generativeai")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini provider: {e}")
            raise
    
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        json_mode: bool = False
    ) -> str:
        """Generate text completion using Gemini"""
        try:
            # Combine system prompt and user prompt
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"{system_prompt}\n\n{prompt}"
            
            # Configure generation
            generation_config = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            }
            
            if json_mode:
                generation_config["response_mime_type"] = "application/json"
            
            # Generate response
            response = self.client.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            raise
    
    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """Generate JSON response using Gemini"""
        try:
            text_response = await self.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=temperature,
                max_tokens=max_tokens,
                json_mode=True
            )
            
            # Parse JSON response
            return json.loads(text_response)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from Gemini: {e}")
            logger.error(f"Response text: {text_response}")
            raise ValueError(f"Invalid JSON response from Gemini: {e}")
        except Exception as e:
            logger.error(f"Gemini JSON generation error: {e}")
            raise
    
    def get_provider_name(self) -> str:
        return "gemini"


# ============================================================================
# Anthropic Claude Provider
# ============================================================================

class ClaudeProvider(LLMProvider):
    """Anthropic Claude provider implementation"""
    
    def __init__(self, api_key: str, model: str = "claude-3-5-haiku-20241022"):
        super().__init__(api_key, model)
        try:
            from anthropic import Anthropic
            self.client = Anthropic(api_key=api_key)
            logger.info(f"Initialized Claude provider with model: {model}")
        except ImportError:
            raise ImportError("anthropic package not installed. Run: pip install anthropic")
        except Exception as e:
            logger.error(f"Failed to initialize Claude provider: {e}")
            raise
    
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        json_mode: bool = False
    ) -> str:
        """Generate text completion using Claude"""
        try:
            messages = [{"role": "user", "content": prompt}]
            
            kwargs = {
                "model": self.model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": messages
            }
            
            if system_prompt:
                kwargs["system"] = system_prompt
            
            response = self.client.messages.create(**kwargs)
            
            return response.content[0].text
            
        except Exception as e:
            logger.error(f"Claude generation error: {e}")
            raise
    
    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """Generate JSON response using Claude"""
        try:
            # Add JSON instruction to prompt
            json_prompt = f"{prompt}\n\nRespond with valid JSON only, no additional text."
            
            text_response = await self.generate_text(
                prompt=json_prompt,
                system_prompt=system_prompt,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            # Parse JSON response
            return json.loads(text_response)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from Claude: {e}")
            logger.error(f"Response text: {text_response}")
            raise ValueError(f"Invalid JSON response from Claude: {e}")
        except Exception as e:
            logger.error(f"Claude JSON generation error: {e}")
            raise
    
    def get_provider_name(self) -> str:
        return "claude"


# ============================================================================
# OpenAI Provider
# ============================================================================

class OpenAIProvider(LLMProvider):
    """OpenAI provider implementation"""
    
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        super().__init__(api_key, model)
        try:
            from openai import OpenAI
            self.client = OpenAI(api_key=api_key)
            logger.info(f"Initialized OpenAI provider with model: {model}")
        except ImportError:
            raise ImportError("openai package not installed. Run: pip install openai")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI provider: {e}")
            raise
    
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        json_mode: bool = False
    ) -> str:
        """Generate text completion using OpenAI"""
        try:
            messages = []
            
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            messages.append({"role": "user", "content": prompt})
            
            kwargs = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}
            
            response = self.client.chat.completions.create(**kwargs)
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI generation error: {e}")
            raise
    
    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """Generate JSON response using OpenAI"""
        try:
            text_response = await self.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=temperature,
                max_tokens=max_tokens,
                json_mode=True
            )
            
            # Parse JSON response
            return json.loads(text_response)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from OpenAI: {e}")
            logger.error(f"Response text: {text_response}")
            raise ValueError(f"Invalid JSON response from OpenAI: {e}")
        except Exception as e:
            logger.error(f"OpenAI JSON generation error: {e}")
            raise
    
    def get_provider_name(self) -> str:
        return "openai"


# ============================================================================
# Provider Factory
# ============================================================================

class LLMProviderFactory:
    """Factory for creating LLM provider instances"""
    
    _instance: Optional[LLMProvider] = None
    _provider_type: Optional[str] = None
    
    @classmethod
    def get_provider(
        cls,
        provider_type: Optional[Literal["gemini", "claude", "openai"]] = None
    ) -> LLMProvider:
        """
        Get or create LLM provider instance (singleton pattern).
        
        Args:
            provider_type: Provider to use. If None, uses LLM_PROVIDER env var.
        
        Returns:
            LLMProvider instance
        """
        # Determine provider type
        if provider_type is None:
            provider_type = os.getenv("LLM_PROVIDER", "gemini").lower()
        
        # Return cached instance if same provider
        if cls._instance is not None and cls._provider_type == provider_type:
            return cls._instance
        
        # Create new provider instance
        try:
            if provider_type == "gemini":
                api_key = os.getenv("GEMINI_API_KEY")
                if not api_key:
                    raise ValueError("GEMINI_API_KEY environment variable not set")
                model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
                cls._instance = GeminiProvider(api_key=api_key, model=model)
                
            elif provider_type == "claude":
                api_key = os.getenv("ANTHROPIC_API_KEY")
                if not api_key:
                    raise ValueError("ANTHROPIC_API_KEY environment variable not set")
                model = os.getenv("CLAUDE_MODEL", "claude-3-5-haiku-20241022")
                cls._instance = ClaudeProvider(api_key=api_key, model=model)
                
            elif provider_type == "openai":
                api_key = os.getenv("OPENAI_API_KEY")
                if not api_key:
                    raise ValueError("OPENAI_API_KEY environment variable not set")
                model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
                cls._instance = OpenAIProvider(api_key=api_key, model=model)
                
            else:
                raise ValueError(f"Unsupported provider type: {provider_type}")
            
            cls._provider_type = provider_type
            logger.info(f"Created LLM provider: {provider_type}")
            return cls._instance
            
        except Exception as e:
            logger.error(f"Failed to create LLM provider: {e}")
            raise
    
    @classmethod
    def reset(cls):
        """Reset the singleton instance (useful for testing)"""
        cls._instance = None
        cls._provider_type = None


# ============================================================================
# Convenience Functions
# ============================================================================

async def generate_text(
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 1000,
    provider_type: Optional[str] = None
) -> str:
    """
    Convenience function to generate text using the configured provider.
    """
    provider = LLMProviderFactory.get_provider(provider_type)
    return await provider.generate_text(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=temperature,
        max_tokens=max_tokens
    )


async def generate_json(
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 1000,
    provider_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Convenience function to generate JSON using the configured provider.
    """
    provider = LLMProviderFactory.get_provider(provider_type)
    return await provider.generate_json(
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=temperature,
        max_tokens=max_tokens
    )