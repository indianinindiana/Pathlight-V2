# 🚀 Quick Fix: 3 Steps to See the New Recommended Strategy Section

## The Problem
Your profile has `primary_goal: "lower-payments"` but the backend expects `"lower-payment"` (no 's').

## The Solution (Takes 2 minutes!)

### Step 1: Open MongoDB Atlas
1. Go to: https://cloud.mongodb.com
2. Log in
3. Click your cluster
4. Click **"Browse Collections"**

### Step 2: Fix the Profile
1. Select database: `pathlight`
2. Select collection: `profiles`
3. Find your profile (look for `primary_goal: "lower-payments"`)
4. Click the **pencil icon** ✏️ to edit
5. Change `"lower-payments"` → `"lower-payment"` (remove the 's')
6. Click **Update**

### Step 3: Refresh & See the Magic! ✨
1. Go back to your browser
2. Refresh the Scenarios page
3. **The new Recommended Strategy section will appear at the top!**

---

## What You'll See

After the fix, the Scenarios page will show:

```
┌─────────────────────────────────────────────────────┐
│ Explore Your Path to Becoming Debt-Free            │
│ [Clara Avatar] Clara has analyzed your profile...   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ✨ Recommended Strategy          [Snowball Badge]  │  ← THIS IS NEW!
│ Confidence: 92%                                      │
│                                                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│
│ │ Monthly  │ │ Interest │ │ Debt-Free│ │  Time   ││
│ │ Payment  │ │  Saved   │ │   Date   │ │ to Pay  ││
│ └──────────┘ └──────────┘ └──────────┘ └─────────┘│
│                                                      │
│ Clara says: "Focusing on your highest-interest..."  │
│                                                      │
│ [Start This Plan Today] ← Big green button          │
└─────────────────────────────────────────────────────┘
```

---

## Alternative: Use This MongoDB Query

If you prefer to use the MongoDB shell or Compass:

```javascript
db.profiles.updateMany(
  { primary_goal: "lower-payments" },
  { $set: { primary_goal: "lower-payment" } }
)
```

---

## Still Not Working?

Check the browser console (F12) and Network tab to see:
- Is the API call succeeding?
- What's the response from `/api/v1/recommendations/strategy`?

The backend is now fixed and ready - it just needs the correct data! 🎯