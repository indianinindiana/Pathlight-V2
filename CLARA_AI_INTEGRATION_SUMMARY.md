# Clara AI Integration Summary

## Overview

Clara is PathLight's AI money advisor that provides personalized debt analysis, answers questions, and guides users through their debt payoff journey. This document summarizes the Clara AI integration across the frontend.

## Backend AI Endpoints

All Clara AI features leverage these backend endpoints:

### 1. AI Insights (`/api/v1/ai/insights`)
- **Purpose**: Personalized debt portfolio analysis
- **Returns**: Summary, key insights, opportunities, risks, and next actions
- **Use Case**: Dashboard insights, debt analysis

### 2. AI Q&A (`/api/v1/ai/ask`)
- **Purpose**: Answer user questions about debt management
- **Returns**: Contextual answers with confidence levels, next steps, and related topics
- **Use Case**: Interactive Q&A widget, help system

### 3. Strategy Comparison (`/api/v1/ai/compare-strategies`)
- **Purpose**: AI-powered strategy recommendations (Snowball vs Avalanche)
- **Returns**: Recommended strategy with reasoning, trade-offs, and confidence level
- **Use Case**: Scenario comparison, strategy selection

### 4. Conversational Onboarding (`/api/v1/ai/onboarding`)
- **Purpose**: Natural language onboarding flow
- **Returns**: Conversational messages and questions
- **Use Case**: User onboarding experience

## Frontend Components Created

### 1. Clara AI Service (`frontend/src/services/claraAiApi.ts`)
**Purpose**: API integration layer for all Clara AI endpoints

**Key Functions**:
- `getAIInsights()` - Fetch personalized insights
- `askClara()` - Ask questions and get answers
- `compareStrategies()` - Get strategy recommendations
- `claraOnboarding()` - Conversational onboarding
- `checkAIHealth()` - Health check for AI services

**Usage Example**:
```typescript
import { getAIInsights } from '@/services/claraAiApi';

const insights = await getAIInsights({
  profile_id: profileId,
  include_recommendations: true,
  focus_areas: ['interest_savings', 'quick_wins']
});
```

### 2. Clara Chat Component (`frontend/src/components/onboarding/ClaraChat.tsx`)
**Purpose**: Conversational onboarding interface

**Features**:
- Single-screen scrolling chat feed
- Typing indicators
- Auto-scroll functionality
- Multiple question types (choice, slider, text)
- Empathetic reactions to user responses
- Progress tracking through conversation flow

**Conversation Flow**:
1. Welcome message
2. Primary goal selection
3. Short-term goal
4. Current feeling (stress level with emojis)
5. Support style preference
6. Time commitment

**Usage Example**:
```typescript
import { ClaraChat } from '@/components/onboarding/ClaraChat';

<ClaraChat
  onComplete={(collectedData) => {
    // Handle completion
    console.log('Collected data:', collectedData);
  }}
  initialData={{}}
/>
```

### 3. AI Insights Component (`frontend/src/components/AIInsights.tsx`)
**Purpose**: Display Clara's personalized debt insights on dashboard

**Features**:
- Summary of debt situation
- Key insights with visual indicators
- Opportunities highlighted
- Risks/concerns flagged
- Recommended next actions
- Refresh capability
- Loading states and error handling

**Usage Example**:
```typescript
import { AIInsights } from '@/components/AIInsights';

<AIInsights
  profileId={profileId}
  focusAreas={['interest_savings', 'quick_wins']}
  className="mb-6"
/>
```

### 4. Clara Q&A Component (`frontend/src/components/ClaraQA.tsx`)
**Purpose**: Interactive Q&A widget for user questions

**Features**:
- Chat-style interface
- Suggested questions
- Typing indicators
- Confidence levels displayed
- Next steps provided
- Related topics for exploration
- Message history

**Usage Example**:
```typescript
import { ClaraQA } from '@/components/ClaraQA';

<ClaraQA
  profileId={profileId}
  context={{ current_strategy: 'snowball' }}
  suggestedQuestions={[
    "Should I pay off my credit card or student loan first?",
    "How can I reduce my monthly payments?"
  ]}
/>
```

### 5. AI Strategy Comparison (`frontend/src/components/AIStrategyComparison.tsx`)
**Purpose**: Compare debt payoff strategies with AI recommendations

**Features**:
- Visual comparison of Snowball vs Avalanche
- Clara's recommendation with reasoning
- Confidence level indicator
- Trade-offs explanation
- Interactive strategy selection
- Comparison statistics

**Usage Example**:
```typescript
import { AIStrategyComparison } from '@/components/AIStrategyComparison';

<AIStrategyComparison
  profileId={profileId}
  snowballData={{
    total_months: 36,
    total_interest: 5000,
    first_debt_paid: "Credit Card A"
  }}
  avalancheData={{
    total_months: 34,
    total_interest: 4200,
    first_debt_paid: "Credit Card B"
  }}
  onStrategySelect={(strategy) => {
    console.log('Selected strategy:', strategy);
  }}
/>
```

## Integration Points

### Dashboard Page
**Location**: `frontend/src/pages/Dashboard.tsx`

**Clara Components to Add**:
```typescript
import { AIInsights } from '@/components/AIInsights';
import { ClaraQA } from '@/components/ClaraQA';

// In Dashboard component:
<AIInsights profileId={profileId} className="mb-6" />
<ClaraQA profileId={profileId} className="mb-6" />
```

### Scenarios Page
**Location**: `frontend/src/pages/Scenarios.tsx`

**Clara Components to Add**:
```typescript
import { AIStrategyComparison } from '@/components/AIStrategyComparison';

// After generating scenarios:
<AIStrategyComparison
  profileId={profileId}
  snowballData={snowballScenario}
  avalancheData={avalancheScenario}
  onStrategySelect={handleStrategySelect}
/>
```

### Onboarding Page (Optional Enhancement)
**Location**: `frontend/src/pages/Onboarding.tsx`

**Option to Replace with Clara Chat**:
```typescript
import { ClaraChat } from '@/components/onboarding/ClaraChat';

// Replace existing onboarding flow with:
<ClaraChat
  onComplete={(data) => {
    // Map Clara's collected data to profile format
    // Save to backend
    // Navigate to debt entry
  }}
/>
```

## Clara's Personality & Guidelines

### Tone & Voice
- **Warm and supportive**: Never judgmental
- **Brief and conversational**: 1-2 sentences per response
- **Human and empathetic**: Acknowledges feelings
- **Encouraging**: Celebrates progress
- **Clear and actionable**: Provides specific next steps

### Communication Principles
1. **One question at a time**: Never overwhelm
2. **Acknowledge responses**: Validate user input
3. **Explain reasoning**: Help users understand "why"
4. **No pressure**: Supportive, not pushy
5. **Stress-aware**: Adapts tone to user's stress level

### Visual Identity
- **Icon**: Sparkles (✨) - represents AI intelligence
- **Primary Color**: #009A8C (teal) - matches PathLight brand
- **Badge**: "Clara" label on messages
- **Typing Indicator**: Three animated dots

## Error Handling

All Clara components include:
- **Loading states**: Skeleton loaders during API calls
- **Error messages**: User-friendly error descriptions
- **Retry functionality**: Allow users to retry failed requests
- **Fallback content**: Graceful degradation if AI unavailable

## Performance Considerations

1. **Lazy Loading**: Components load on demand
2. **Caching**: Consider caching insights for short periods
3. **Debouncing**: Q&A input debounced to reduce API calls
4. **Progressive Enhancement**: Core functionality works without AI

## Testing Checklist

### Unit Tests
- [ ] Clara API service functions
- [ ] Component rendering
- [ ] Error handling
- [ ] Loading states

### Integration Tests
- [ ] End-to-end onboarding flow
- [ ] Insights generation
- [ ] Q&A conversation
- [ ] Strategy comparison

### User Acceptance Tests
- [ ] Conversational flow feels natural
- [ ] Responses are helpful and relevant
- [ ] UI is responsive and smooth
- [ ] Error states are clear

## Future Enhancements

### Phase 2
1. **Voice of Clara**: Add audio responses
2. **Proactive Insights**: Push notifications for important insights
3. **Learning**: Clara learns from user interactions
4. **Multi-language**: Support for Spanish, French, etc.

### Phase 3
1. **Advanced Analytics**: Deeper behavioral insights
2. **Predictive Recommendations**: Anticipate user needs
3. **Integration with Financial Tools**: Connect to bank accounts
4. **Personalized Content**: Tailored educational resources

## Documentation Links

- **Backend AI Prompts**: `backend/config/ai_prompts.yaml`
- **PRD Updates**: `frontend/docs/PRD.md` (Section FR-1)
- **API Documentation**: Backend `/api/v1/ai/*` endpoints

## Support & Troubleshooting

### Common Issues

**Issue**: AI responses are slow
- **Solution**: Check backend AI service health endpoint
- **Check**: Network latency, API key configuration

**Issue**: Insights not loading
- **Solution**: Verify profile_id exists and has debts
- **Check**: Console for API errors

**Issue**: Conversational flow breaks
- **Solution**: Check collected_data state management
- **Check**: Step progression logic

### Health Check
```typescript
import { checkAIHealth } from '@/services/claraAiApi';

const health = await checkAIHealth();
console.log('AI Status:', health.status);
console.log('Provider:', health.provider);
```

## Deployment Notes

### Environment Variables
Ensure `VITE_API_BASE_URL` is set correctly:
- **Development**: `http://localhost:8000`
- **Production**: Your production API URL

### Backend Requirements
- AI service must be running
- Gemini API key configured
- MongoDB connection active

### Frontend Build
All Clara components are included in the standard build process. No special configuration needed.

---

**Last Updated**: 2025-11-26  
**Version**: 1.0  
**Status**: Ready for Integration