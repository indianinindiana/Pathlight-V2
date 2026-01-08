# Scenarios Page - New Recommended Strategy Section

## Yes, This is a NEW Section!

The **Recommended Strategy** section is a brand new UI component that appears at the top of the Scenarios page, right after Clara's introduction header.

## Where It Appears

```
┌─────────────────────────────────────────────────────┐
│ Page Header (PathLight logo, Back button)          │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ "Explore Your Path to Becoming Debt-Free"          │
│ [Clara Avatar] Clara has analyzed your profile...   │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ 💡 Recommended Strategy  [Snowball/Avalanche Badge]│  ← NEW SECTION
│ Confidence: 92%                                      │
│                                                      │
│ [Monthly Payment] [Interest Saved] [Debt-Free Date] │
│ [Time to Payoff]                                     │
│                                                      │
│ Clara says: "Focusing on your highest-interest..."  │
│                                                      │
│ [Start This Plan Today] ← Primary CTA               │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ 💡 Build Your Own Custom Strategy (Collapsed)      │
└─────────────────────────────────────────────────────┘
... rest of page ...
```

## Why You Don't See It

The section only appears when **both** conditions are met:

1. ✅ **Frontend code is in place** (lines 610-715 in Scenarios.tsx)
2. ❌ **Backend API returns valid data** (currently failing with 404)

### Current Issue

The API call on line 286 is failing:
```typescript
const recommendation = await getStrategyRecommendation({
  profile_id: profileId,  // ← This profile doesn't exist in database
  monthly_payment: availableAmount,
  start_date: new Date().toISOString().split('T')[0],
});
```

Terminal shows:
```
INFO: 127.0.0.1:50425 - "POST /api/v1/recommendations/strategy HTTP/1.1" 404 Not Found
```

## How to Make It Appear

### Option 1: Create a Valid Profile (Recommended)
1. Go through the onboarding flow to create a proper profile
2. Add debts to your profile
3. Navigate to the Scenarios page
4. The recommendation section should now appear

### Option 2: Fix Existing Profile Data
The migration script failed because it tried to connect to localhost MongoDB instead of Atlas. You need to either:

1. **Run the migration with correct connection**: Update the `.env` file to ensure `MONGODB_URI` points to your Atlas cluster
2. **Manually fix the database**: Use MongoDB Compass or Atlas UI to change `'lower-payments'` to `'lower-payment'` in affected profiles

### Option 3: Test with Mock Data (Development Only)
Add a fallback in the frontend to show mock recommendation data when the API fails (for testing purposes only).

## What the Section Contains

When it appears, you'll see:

1. **Header**: "Recommended Strategy" with sparkles icon
2. **Strategy Badge**: Shows "Snowball" or "Avalanche" with star icon
3. **Confidence Score**: e.g., "92%"
4. **4 Metric Cards**:
   - Monthly Payment
   - Interest Saved
   - Debt-Free Date
   - Time to Payoff (with "X months faster" indicator)
5. **Clara's Explanation**: Personalized rationale for the recommendation
6. **Primary CTA**: "Start This Plan Today" button

## Backend Requirements

The section requires these API endpoints to work:
- `POST /api/v1/recommendations/strategy` - Get strategy recommendation
- `POST /api/v1/recommendations/confidence` - Get confidence score

Both are now fixed to handle:
- ✅ ObjectId to string conversion
- ✅ Proper enum validation

## Next Steps

1. **Create a test profile** through the onboarding flow
2. **Add some debts** to the profile
3. **Navigate to Scenarios page**
4. **The new section should appear** at the top

If it still doesn't appear, check the browser console for errors and verify the API responses in the Network tab.