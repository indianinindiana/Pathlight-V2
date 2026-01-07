# Clara's Response Logic - Complete Flow

This document explains how Clara generates empathetic responses to user answers during the onboarding flow.

## Architecture Overview

Clara's response system uses a **hybrid approach**:
- **Frontend**: Manages the conversation flow, questions, and UI
- **Backend**: Generates personalized, AI-powered empathetic reactions

## Flow Diagram

```
User answers question
    ↓
Frontend (useConversationalFlow.ts)
    ↓
API Call: POST /api/v1/ai/onboarding-reaction
    ↓
Backend (ai_services/routes.py)
    ↓
AI Service (ai_service.py)
    ↓
LLM Provider (Gemini/Claude/OpenAI)
    ↓
Response returned to frontend
    ↓
Displayed in OnboardingClara.tsx
```

## 1. Frontend Flow

### File: `frontend/src/hooks/useConversationalFlow.ts`

**When user answers a question (lines 148-206):**

```typescript
const handleAnswer = async (questionId: string, answer: any) => {
  // 1. Validate answer
  if (!validateAnswer(question, answer)) return;
  
  // 2. Update answers state
  const updatedAnswers = { ...userAnswers, [questionId]: answer };
  setUserAnswers(updatedAnswers);
  
  // 3. Show loading state
  setIsLoadingClara(true);
  
  // 4. Call backend API with random delay (800-1500ms) for natural feel
  const reaction = await getOnboardingReaction({
    session_id: sessionId,
    step_id: questionId,
    user_answers: updatedAnswers,
    is_resume: isResume
  });
  
  // 5. Get Clara's message
  claraMessage = reaction.clara_message;
  
  // 6. Add to history and advance to next question
  setHistory(prev => [...prev, { question, answer, claraMessage }]);
  setCurrentStep(prev => prev + 1);
}
```

## 2. Backend API Endpoint

### File: `backend/app/ai_services/routes.py` (lines 324-388)

**Endpoint: POST `/api/v1/ai/onboarding-reaction`**

```python
@router.post("/onboarding-reaction")
async def onboarding_reaction(request: OnboardingReactionRequest):
    """
    Generate Clara's empathetic reaction to user's answer.
    
    Request:
    {
      "session_id": "session-uuid",
      "step_id": "stressLevel",
      "user_answers": {
        "moneyGoal": "pay-faster",
        "stressLevel": 5
      },
      "is_resume": false
    }
    
    Response:
    {
      "clara_message": "Thanks for sharing that—I know talking about debt can be stressful...",
      "validation_error": null
    }
    """
    try:
        ai_service = get_ai_service()
        
        # Generate Clara's reaction
        clara_message = await ai_service.generate_onboarding_reaction(
            step_id=request.step_id,
            user_answers=request.user_answers,
            is_resume=request.is_resume
        )
        
        return OnboardingReactionResponse(
            clara_message=clara_message,
            validation_error=None
        )
    except Exception as e:
        # Fallback on error
        fallback = "Thank you for sharing that. Let's keep going."
        return OnboardingReactionResponse(
            clara_message=fallback,
            validation_error=None
        )
```

## 3. AI Service Logic

### File: `backend/app/shared/ai_service.py` (lines 389-455)

**Method: `generate_onboarding_reaction()`**

```python
async def generate_onboarding_reaction(
    self,
    step_id: str,
    user_answers: Dict[str, Any],
    is_resume: bool = False
) -> str:
    """
    Generate Clara's empathetic reaction (1-2 sentences).
    
    Args:
        step_id: ID of question just answered (e.g., "stressLevel")
        user_answers: All answers collected so far
        is_resume: Whether user is resuming a session
    
    Returns:
        Clara's empathetic message
    """
    try:
        # 1. Get prompt template from config
        template = self.config.get_prompt_template(
            "onboarding", 
            "onboarding_reaction"
        )
        
        # 2. Add context
        answers_with_context = {**user_answers, "is_resume": is_resume}
        
        # 3. Fill in template with user data
        prompt = template.format(
            user_answers=json.dumps(answers_with_context, indent=2),
            step_id=step_id
        )
        
        # 4. Get system prompt (Clara's personality)
        system_prompt = self.config.get_system_prompt("onboarding_reaction")
        
        # 5. Generate response using LLM
        response_text = await self.provider.generate_text(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.8,  # Higher = more creative
            max_tokens=500    # Allow full responses
        )
        
        # 6. Sanitize content (remove harmful content)
        clara_message = sanitize_ai_content(response_text)
        
        return clara_message
        
    except Exception as e:
        # Fallback to context-aware message
        if is_resume:
            return get_resume_message()
        return get_clara_fallback(step_id, user_answers)
```

## 4. Prompt Configuration

### File: `backend/config/ai_prompts.yaml` (lines 206-235)

**Clara's System Prompt:**

```yaml
onboarding_reaction:
  role: "You are Clara, an empathetic and supportive AI guide from Pathlight..."
  guidelines:
    - "DO NOT ASK QUESTIONS - The frontend handles all questions"
    - "Keep responses to 1-2 sentences maximum"
    - "Be conversational and chat-like, not formal"
    - "Tone should be warm, calm, guilt-free, and emotionally intelligent"
    - "Base reactions on the user's most recent answer"
    - "Use the full answer history for context"
```

**Prompt Template:**

```yaml
onboarding_reaction:
  template: |
    The user is filling out their Pathlight profile. Here are their answers:
    {user_answers}
    
    They just answered the '{step_id}' question.
    
    Provide a short, empathetic reaction (1-2 sentences maximum).
    
    SPECIALIZED RESPONSES (prioritize if they match):
    
    - High Stress (stressLevel >= 4): 
      "Thanks for sharing that—I know talking about debt can be stressful..."
    
    - Negative Cash Flow (monthlyIncome - monthlyExpenses < 0):
      "It's okay to be in a tight spot right now..."
    
    - Young User (ageRange == '18-24'):
      "It's fantastic that you're building these habits early on..."
    
    - Pay Faster Goal (moneyGoal == 'pay-faster'):
      "Great! We'll focus on finding the fastest path forward..."
    
    - Session Resume (is_resume == true):
      "Welcome back! Let's pick up where we left off..."
    
    Return ONLY plain text (no JSON, no formatting).
```

## 5. LLM Provider

### File: `backend/app/shared/llm_provider.py`

Clara's responses are generated by one of these LLM providers:

**Gemini (Default):**
- Model: `gemini-1.5-flash`
- Fast, cost-effective
- Good for conversational responses

**Claude:**
- Model: `claude-3-5-haiku-20241022`
- More nuanced, empathetic
- Better at emotional intelligence

**OpenAI:**
- Model: `gpt-4o-mini`
- Balanced performance
- Good general-purpose option

**Configuration in `.env`:**
```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash
```

## 6. Response Examples

### Example 1: High Stress User

**User Input:**
```json
{
  "step_id": "stressLevel",
  "user_answers": {
    "moneyGoal": "reduce-stress",
    "stressLevel": 5
  }
}
```

**Clara's Response:**
```
"Thanks for sharing that—I know talking about debt can be stressful. I'm here with you every step of the way."
```

### Example 2: Young User

**User Input:**
```json
{
  "step_id": "ageRange",
  "user_answers": {
    "ageRange": "18-24",
    "moneyGoal": "pay-faster"
  }
}
```

**Clara's Response:**
```
"It's fantastic that you're building these healthy financial habits early on. It makes a huge difference."
```

### Example 3: Session Resume

**User Input:**
```json
{
  "step_id": "monthlyIncome",
  "user_answers": {
    "moneyGoal": "save-money",
    "ageRange": "25-34"
  },
  "is_resume": true
}
```

**Clara's Response:**
```
"Welcome back! I'm glad you're continuing your journey. Let's pick up where we left off."
```

## 7. Fallback Logic

### File: `backend/app/shared/clara_fallbacks.py`

If the AI service fails, Clara uses context-aware fallbacks:

```python
def get_clara_fallback(step_id: str, user_answers: Dict[str, Any]) -> str:
    """Get context-aware fallback message"""
    
    # Check for high stress
    if user_answers.get('stressLevel', 0) >= 4:
        return "I appreciate you sharing that. Let's take this one step at a time."
    
    # Check for negative cash flow
    income = user_answers.get('monthlyIncome', 0)
    expenses = user_answers.get('monthlyExpenses', 0)
    if income > 0 and expenses > income:
        return "Thanks for being honest about your situation. We'll work with what you have."
    
    # Generic fallback
    return "Thank you for sharing that. Let's keep going."
```

## 8. Key Features

### Natural Timing
- Random delay (800-1500ms) before showing Clara's response
- Makes the interaction feel more human

### Session Persistence
- Answers saved to sessionStorage
- 24-hour timeout
- Can resume where they left off

### Error Handling
- Graceful fallbacks if AI fails
- Never blocks user progress
- Always provides a response

### Context Awareness
- Clara sees all previous answers
- Responses adapt to user's situation
- Specialized reactions for specific scenarios

## 9. Customization

### To modify Clara's personality:

1. **Edit system prompt** in `backend/config/ai_prompts.yaml`
2. **Add new specialized responses** in the prompt template
3. **Adjust temperature** (0.0-1.0) for creativity level
4. **Change max_tokens** for response length

### To add new response patterns:

1. Add condition to prompt template in `ai_prompts.yaml`
2. Add fallback in `clara_fallbacks.py`
3. Test with various user inputs

## 10. Monitoring & Debugging

### Check Clara's responses:

```bash
# Backend logs
tail -f backend/logs/app.log

# Check API response
curl -X POST http://localhost:8000/api/v1/ai/onboarding-reaction \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test",
    "step_id": "stressLevel",
    "user_answers": {"stressLevel": 5}
  }'
```

### Common Issues:

1. **Truncated responses**: Check `max_tokens` in `ai_service.py`
2. **Generic responses**: Check if API key is configured
3. **Slow responses**: Check LLM provider latency
4. **No response**: Check fallback logic is working

## Summary

Clara's response system is a sophisticated, multi-layered architecture that:
- Uses AI to generate personalized, empathetic responses
- Has robust fallback mechanisms
- Provides context-aware reactions
- Maintains a warm, supportive tone
- Never blocks user progress

The system is designed to feel natural and human-like while being reliable and maintainable.