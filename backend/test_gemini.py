"""
Test script to verify Gemini API key is working correctly.
"""

import os
import sys
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.shared.llm_provider import LLMProviderFactory


async def test_gemini_connection():
    """Test Gemini API connection and basic functionality"""
    
    print("=" * 60)
    print("Testing Gemini API Connection")
    print("=" * 60)
    
    try:
        # Get provider
        print("\n1. Initializing Gemini provider...")
        provider = LLMProviderFactory.get_provider("gemini")
        print(f"   ✓ Provider initialized: {provider.get_provider_name()}")
        print(f"   ✓ Model: {provider.model}")
        
        # Test simple text generation
        print("\n2. Testing text generation...")
        prompt = "Say 'Hello from Gemini!' in a friendly way."
        response = await provider.generate_text(
            prompt=prompt,
            temperature=0.7,
            max_tokens=100
        )
        print(f"   ✓ Response received:")
        print(f"   {response}")
        
        # Test JSON generation
        print("\n3. Testing JSON generation...")
        json_prompt = """Generate a simple JSON object with these fields:
        - greeting: a friendly greeting message
        - status: "success"
        - timestamp: current date in YYYY-MM-DD format
        
        Return only valid JSON, no additional text."""
        
        json_response = await provider.generate_json(
            prompt=json_prompt,
            temperature=0.5,
            max_tokens=200
        )
        print(f"   ✓ JSON response received:")
        print(f"   {json_response}")
        
        # Test with system prompt
        print("\n4. Testing with system prompt...")
        system_prompt = "You are a helpful financial advisor. Be concise and professional."
        user_prompt = "What's the best way to pay off debt?"
        
        response = await provider.generate_text(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=150
        )
        print(f"   ✓ Response with system prompt:")
        print(f"   {response}")
        
        print("\n" + "=" * 60)
        print("✅ All tests passed! Gemini API is working correctly.")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print("\n" + "=" * 60)
        print(f"❌ Error testing Gemini API: {e}")
        print("=" * 60)
        print("\nTroubleshooting:")
        print("1. Check that GEMINI_API_KEY is set in backend/.env")
        print("2. Verify the API key is valid at https://makersuite.google.com/app/apikey")
        print("3. Ensure google-generativeai package is installed: pip3 install google-generativeai")
        return False


if __name__ == "__main__":
    # Run the test
    success = asyncio.run(test_gemini_connection())
    sys.exit(0 if success else 1)