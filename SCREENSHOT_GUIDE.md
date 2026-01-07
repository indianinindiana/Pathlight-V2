# PathLight Screenshot Capture Guide

## Overview
This guide will help you capture professional screenshots of PathLight's key features using the test profile data.

## Prerequisites
- Frontend running on `http://localhost:5137`
- Backend running on `http://localhost:8000`
- Test profiles created (run `python backend/create_test_profiles.py` if needed)

## Screenshots to Capture

### 1. Dashboard Overview
**URL:** `http://localhost:5137/dashboard?profileId=test_profile_family_homeowner`

**What to capture:**
- Full dashboard view showing:
  - Total debt summary card
  - Monthly payment breakdown
  - Debt composition chart
  - List of all debts

**Recommended size:** 1200x800px
**Save as:** `frontend/public/screenshot-dashboard.png`

---

### 2. Scenario Comparison
**URL:** `http://localhost:5137/scenarios?profileId=test_profile_family_homeowner`

**What to capture:**
- Scenario comparison view showing:
  - Avalanche vs Snowball vs Hybrid strategies
  - Side-by-side comparison cards
  - Savings and timeline differences

**Recommended size:** 1200x800px
**Save as:** `frontend/public/screenshot-scenarios.png`

---

### 3. Financial Assessment (if available)
**URL:** `http://localhost:5137/dashboard?profileId=test_profile_family_homeowner`
(Scroll to financial assessment section)

**What to capture:**
- AI-powered insights
- Personalized recommendations
- Financial health indicators

**Recommended size:** 1200x800px
**Save as:** `frontend/public/screenshot-assessment.png`

---

### 4. Payoff Trajectory Chart
**URL:** `http://localhost:5137/scenarios?profileId=test_profile_family_homeowner`
(Scroll to trajectory chart)

**What to capture:**
- Interactive payoff timeline chart
- Debt reduction over time
- Strategy comparison lines

**Recommended size:** 1200x800px
**Save as:** `frontend/public/screenshot-trajectory.png`

---

## How to Capture Screenshots

### Option 1: Browser DevTools (Recommended)
1. Open the URL in Chrome/Edge
2. Press `F12` to open DevTools
3. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
4. Type "Capture screenshot"
5. Select "Capture full size screenshot"
6. Save to `frontend/public/` with the filename above

### Option 2: macOS Screenshot Tool
1. Press `Cmd+Shift+4`
2. Press `Space` to capture window
3. Click on the browser window
4. Save and rename to the appropriate filename

### Option 3: Windows Snipping Tool
1. Open Snipping Tool
2. Select "Window Snip"
3. Click on the browser window
4. Save to `frontend/public/` with the filename above

---

## After Capturing Screenshots

Update `frontend/src/pages/Index.tsx` to use the real images:

Replace the placeholder divs with:

```tsx
{/* Feature 1: Dashboard Overview */}
<div className="space-y-4">
  <div className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
    <img 
      src="/screenshot-dashboard.png" 
      alt="PathLight Dashboard Overview"
      className="w-full h-auto"
    />
  </div>
  <div>
    <h3 className="text-xl font-semibold text-[#002B45] mb-2">
      Complete Debt Overview
    </h3>
    <p className="text-[#3A4F61]">
      See all your debts in one place with clear metrics on total balance, monthly payments, and payoff timeline.
    </p>
  </div>
</div>
```

Repeat for all four features with their respective image files.

---

## Test Profiles Available

- `test_profile_young_professional` - 4 debts, $47K total
- `test_profile_family_homeowner` - 5 debts, $327K total (recommended)
- `test_profile_high_stress` - 6 debts, $33K total
- `test_profile_diverse` - 10 debts, $327K total

**Recommended:** Use `test_profile_family_homeowner` for the most realistic and comprehensive screenshots.

---

## Tips for Great Screenshots

1. **Use a clean browser window** - Close unnecessary tabs and extensions
2. **Full screen** - Maximize the browser for best quality
3. **Wait for loading** - Ensure all charts and data are fully loaded
4. **Consistent sizing** - Keep all screenshots the same dimensions
5. **High resolution** - Capture at 2x resolution if possible for retina displays

---

## Quick Command

To quickly navigate with test data:
```bash
# Open in browser
open "http://localhost:5137/dashboard?profileId=test_profile_family_homeowner"
open "http://localhost:5137/scenarios?profileId=test_profile_family_homeowner"