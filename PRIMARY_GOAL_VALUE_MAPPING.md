# Primary Goal Value Mapping - Frontend vs Backend

## Issue Summary
The backend API is rejecting profile data because of a mismatch in the `primary_goal` field values between what's stored in the database and what the backend enum expects.

## Frontend Values (TypeScript)
**File:** `frontend/src/types/debt.ts` (line 3)

```typescript
export type PayoffGoal = 'lower-payment' | 'pay-faster' | 'reduce-interest' | 'avoid-default';
```

### Frontend UI Labels (ProfileSettings.tsx)
```typescript
<SelectItem value="pay-faster">Pay off Debt Faster</SelectItem>
<SelectItem value="reduce-interest">Reduce my interest</SelectItem>
<SelectItem value="lower-payment">Reduce my monthly payment</SelectItem>
<SelectItem value="avoid-default">Avoid falling behind</SelectItem>
```

## Backend Expected Values (Python)
**File:** `backend/app/shared/enums.py` (lines 32-36)

```python
class PrimaryGoal(str, Enum):
    PAY_FASTER = "pay-faster"
    LOWER_PAYMENT = "lower-payment"
    REDUCE_INTEREST = "reduce-interest"
    AVOID_DEFAULT = "avoid-default"
```

## ✅ Value Comparison

| Frontend Value | Backend Enum | Status | Notes |
|---------------|--------------|--------|-------|
| `'pay-faster'` | `"pay-faster"` | ✅ **MATCH** | No changes needed |
| `'lower-payment'` | `"lower-payment"` | ✅ **MATCH** | No changes needed |
| `'reduce-interest'` | `"reduce-interest"` | ✅ **MATCH** | No changes needed |
| `'avoid-default'` | `"avoid-default"` | ✅ **MATCH** | No changes needed |

## 🔴 The Actual Problem

The error message shows:
```
primary_goal
  Input should be 'pay-faster', 'lower-payment', 'reduce-interest' or 'avoid-default' 
  [type=enum, input_value='lower-payments', input_type=str]
```

**The database contains:** `'lower-payments'` (with an 's')
**The backend expects:** `'lower-payment'` (without an 's')

## Root Cause

The issue is **NOT** a frontend/backend mismatch. The values are correctly aligned. The problem is that there's **old/incorrect data in the MongoDB database** that has `'lower-payments'` instead of `'lower-payment'`.

## Solutions

### Option 1: Database Migration (Recommended)
Update all existing profiles in MongoDB to fix the typo:

```javascript
// MongoDB update command
db.profiles.updateMany(
  { primary_goal: "lower-payments" },
  { $set: { primary_goal: "lower-payment" } }
)
```

### Option 2: Backend Tolerance (Temporary Fix)
Add a data migration/normalization layer in the backend to handle the typo:

```python
# In backend/app/recommendations/routes.py
# Before creating Profile object:
if profile_data.get('primary_goal') == 'lower-payments':
    profile_data['primary_goal'] = 'lower-payment'
```

### Option 3: Add Backward Compatibility to Enum
Extend the backend enum to accept both values (not recommended):

```python
class PrimaryGoal(str, Enum):
    PAY_FASTER = "pay-faster"
    LOWER_PAYMENT = "lower-payment"
    LOWER_PAYMENTS = "lower-payments"  # Legacy support
    REDUCE_INTEREST = "reduce-interest"
    AVOID_DEFAULT = "avoid-default"
```

## Additional Issue: ObjectId Type

The error also shows:
```
_id
  Input should be a valid string 
  [type=string_type, input_value=ObjectId('695f562b67acf98e80343a36'), input_type=ObjectId]
```

This is because MongoDB returns `_id` as an `ObjectId` type, but Pydantic expects a string.

### Solution:
Convert ObjectId to string before passing to Pydantic:

```python
# In backend/app/recommendations/routes.py (line 40)
profile_data = await db.profiles.find_one({"user_id": request.profile_id})
if profile_data:
    profile_data['_id'] = str(profile_data['_id'])  # Convert ObjectId to string
    profile = Profile(**profile_data)
```

## Recommended Action Plan

1. **Fix the database data** (Option 1 above)
2. **Add ObjectId conversion** in the backend route
3. **Verify** no other profiles have similar data issues

## Testing After Fix

Once fixed, test with:
```bash
# Check if any profiles still have the typo
db.profiles.find({ primary_goal: "lower-payments" }).count()

# Should return 0