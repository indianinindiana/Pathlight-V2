# Clara AI Design System & UI Guidelines

## Overview

This document outlines the complete design system for Clara, PathLight's AI money advisor, including colors, typography, components, spacing, interaction patterns, and her role throughout the user journey.

**Related Documentation:**
- [`PATHLIGHT_HOME_ONBOARDING_DESIGN_GUIDE_V5.md`](PATHLIGHT_HOME_ONBOARDING_DESIGN_GUIDE_V5.md) - Complete user journey and flow
- [`IMPLEMENTATION_GUIDE.md`](IMPLEMENTATION_GUIDE.md) - Step-by-step implementation

---

## Brand Colors

### Primary Brand Colors
```css
/* Navy (Primary Text & Headers) */
--navy-default: #002B45
--navy-light: #003D5C
--navy-dark: #001A2B

/* Teal (Primary Actions & Clara Identity) */
--teal-default: #009A8C
--teal-light: #00BFA9
--teal-dark: #007A6F
--teal-text: #006F63 (AA compliant for text)
--teal-bg: #E3F5F2 (Clara section backgrounds)
--teal-gradient: linear-gradient(135deg, #00BFA9, #009A8C)
```

**Usage Guidelines:**
- `--teal-default`: Borders, icons, accents
- `--teal-text`: Small text labels (AA compliant)
- `--teal-gradient`: Clara avatar, highlight cards, primary CTAs for insights
- `--teal-bg`: Clara section backgrounds (improved visibility)

### Semantic Colors
```css
/* Text Colors */
--text-primary: #002B45 (Navy - Headers, important text)
--text-secondary: #3A4F61 (Body text, descriptions)
--text-tertiary: #4F6A7A (Helper text, labels)
--text-muted: #6B7F8F (Disabled, placeholder)

/* Background Colors */
--bg-primary: #FFFFFF (White - Cards, surfaces)
--bg-secondary: #F7F9FA (Light gray - Sections)
--bg-tertiary: #E7F7F4 (Teal tint - Clara highlights)

/* Border Colors */
--border-default: #D4DFE4 (Default borders)
--border-focus: #009A8C (Focused/active borders)
--border-subtle: #E8EEF2 (Subtle dividers)

/* Status Colors */
--success: #10B981 (Green)
--success-bg: #ECFDF5
--warning: #F59E0B (Amber)
--warning-bg: #FEF3C7
--error: #EF4444 (Red)
--error-bg: #FEE2E2
--info: #3B82F6 (Blue)
--info-bg: #DBEAFE

/* AI-Specific Colors */
--ai-uncertainty: #6B7280 (Gray for estimates)
--ai-uncertainty-bg: #F3F4F6
```

### Dark Mode Tokens (Future-Proofing)
```css
/* Dark Mode Colors - Not yet implemented */
--navy-default-dark: #E7F7FA
--bg-primary-dark: #0E1111
--bg-secondary-dark: #171A1C
--teal-default-dark: #00C4AD
--teal-bg-dark: #0A2E2A
```

---

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes & Weights

**Headers**
```css
/* H1 - Page Titles */
font-size: 28px (mobile) / 44px (desktop)
font-weight: 700 (bold)
line-height: 1.2
color: #002B45

/* H2 - Section Titles */
font-size: 24px (mobile) / 36px (desktop)
font-weight: 700 (bold)
line-height: 1.2
color: #002B45

/* H3 - Card Titles */
font-size: 18px / 20px
font-weight: 600 (semibold)
line-height: 1.3
color: #002B45

/* H4 - Subsection Titles */
font-size: 16px
font-weight: 600 (semibold)
line-height: 1.4
color: #002B45
```

**Body Text**
```css
/* Large Body */
font-size: 18px / 20px
font-weight: 400 (regular)
line-height: 1.6
color: #3A4F61

/* Regular Body */
font-size: 14px / 16px
font-weight: 400 (regular)
line-height: 1.5
color: #3A4F61

/* Small Text */
font-size: 12px / 14px
font-weight: 400 (regular)
line-height: 1.4
color: #4F6A7A
```

**Special Text**
```css
/* Labels */
font-size: 14px
font-weight: 500 (medium)
color: #002B45

/* Helper Text */
font-size: 12px / 14px
font-weight: 400 (regular)
color: #4F6A7A
```

---

## Clara-Specific Design Elements

### Clara's Visual Identity

**Icon System (Contextual)**
Clara uses different icons based on context to maintain appropriate tone:

```tsx
// Use contextually appropriate icons
import {
  Sparkles,      // "Magic moments" - insights, celebrations
  Lightbulb,     // General insights, ideas
  Shield,        // Safety, security, protection
  DollarSign,    // Money, savings, financial topics
  TrendingUp,    // Opportunities, growth
  Target,        // Goals, actions
  Heart          // Empathy, support
} from 'lucide-react';
```

**Icon Usage Guidelines:**
- **Sparkles**: Use for delightful moments, AI-powered features, celebrations
- **Lightbulb**: Use for insights, tips, recommendations
- **Shield/DollarSign**: Use for serious financial topics (credit, budgets, emergencies)
- **Avoid overusing sparkles** - maintain financial gravity when appropriate

**Badge/Label**
```tsx
{/* Use teal-text for AA compliance */}
<Badge className="bg-white text-[#006F63] border border-[#B6E9E0] text-xs">
  <Lightbulb className="w-3 h-3 mr-1" />
  Clara
</Badge>
```

**Avatar/Profile**
```tsx
{/* Use gradient for warmth */}
<div className="w-10 h-10 rounded-full flex items-center justify-center"
     style={{ background: 'linear-gradient(135deg, #00BFA9, #009A8C)' }}>
  <Sparkles className="w-5 h-5 text-white" />
</div>
```

**Clara Voice Strip Container**
```tsx
{/* Distinctive left border for Clara insights */}
<div className="p-4 bg-white rounded-lg border-l-4 border-[#009A8C] shadow-sm">
  {/* Clara content */}
</div>
```

### Clara Message Bubbles

**Clara's Messages (Left-aligned)**
```tsx
<div className="flex justify-start">
  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white text-[#002B45] shadow-sm">
    {/* Clara badge - ONLY show on first message in cluster or context switch */}
    {showClaraBadge && (
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-[#006F63]" />
        <span className="text-xs font-medium text-[#006F63]">Clara</span>
      </div>
    )}
    {/* Message content */}
    <p className="text-sm">{message}</p>
  </div>
</div>
```

**Badge Display Logic:**
- Show Clara badge on:
  - First message in a conversation
  - First message after user response
  - When switching topics/context
- Hide on consecutive Clara messages to reduce cognitive load

**User Messages (Right-aligned)**
```tsx
<div className="flex justify-end">
  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-[#009A8C] text-white">
    <p className="text-sm">{message}</p>
  </div>
</div>
```

**Typing Indicator**
```tsx
<div className="flex justify-start">
  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <Sparkles className="w-4 h-4 text-[#009A8C]" />
      <span className="text-xs font-medium text-[#009A8C]">Clara</span>
    </div>
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
           style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
           style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
           style={{ animationDelay: '300ms' }} />
    </div>
  </div>
</div>
```

---

## Component Patterns

### Cards

**Standard Card**
```tsx
<Card className="border-[1.5px] border-[#D4DFE4] rounded-lg shadow-sm">
  <CardHeader>
    <CardTitle className="text-[#002B45]">Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Clara Insight Card**
```tsx
<Card className="border-[1.5px] border-[#D4DFE4] rounded-lg">
  <CardHeader>
    <div className="flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-[#009A8C]" />
      <CardTitle>Clara's Insights</CardTitle>
    </div>
  </CardHeader>
  <CardContent>
    {/* Insights content */}
  </CardContent>
</Card>
```

**Highlighted/Recommended Card**
```tsx
<div className="p-6 bg-gradient-to-br from-[#E7F7F4] to-white rounded-lg border-2 border-[#009A8C]">
  <Badge className="bg-[#009A8C] text-white mb-3">Recommended</Badge>
  {/* Content */}
</div>
```

### Buttons

**Primary Action (Clara Actions)**
```tsx
<Button className="bg-[#009A8C] hover:bg-[#007F74] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
  Action Text
  <ArrowRight className="ml-2 w-4 h-4" />
</Button>
```

**Secondary Action**
```tsx
<Button variant="outline" className="border-[#D4DFE4] hover:border-[#009A8C] hover:bg-[#E7F7F4] text-[#002B45] rounded-xl">
  Action Text
</Button>
```

**Ghost/Subtle Action**
```tsx
<Button variant="ghost" className="text-[#009A8C] hover:bg-[#E7F7F4]">
  <RefreshCw className="w-4 h-4 mr-2" />
  Refresh
</Button>
```

### Badges

**Confidence Levels**
```tsx
{/* High Confidence */}
<Badge className="bg-green-100 text-green-800 border border-green-300">
  <CheckCircle2 className="w-3 h-3 mr-1" />
  High Confidence
</Badge>

{/* Medium Confidence */}
<Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">
  <AlertCircle className="w-3 h-3 mr-1" />
  Medium Confidence
</Badge>

{/* Low Confidence */}
<Badge className="bg-orange-100 text-orange-800 border border-orange-300">
  <AlertCircle className="w-3 h-3 mr-1" />
  Lower Confidence
</Badge>
```

**Status Badges**
```tsx
{/* Recommended */}
<Badge className="bg-[#009A8C] text-white">Recommended</Badge>

{/* In Progress */}
<Badge className="bg-blue-100 text-blue-800">In Progress</Badge>

{/* Completed */}
<Badge className="bg-green-100 text-green-800">Completed</Badge>
```

### Alerts & Callouts

**Info/Insight Callout**
```tsx
<div className="p-4 bg-[#E7F7F4] rounded-lg border-l-4 border-[#009A8C]">
  <p className="text-sm font-medium text-[#002B45]">
    {insightText}
  </p>
</div>
```

**Success Callout**
```tsx
<div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
  <div className="flex items-start gap-2">
    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
    <p className="text-sm text-[#3A4F61]">{successText}</p>
  </div>
</div>
```

**Warning Callout**
```tsx
<div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
  <div className="flex items-start gap-2">
    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
    <div>
      <h4 className="font-semibold text-[#002B45] mb-1">Heading</h4>
      <p className="text-sm text-[#3A4F61]">{warningText}</p>
    </div>
  </div>
</div>
```

**Error Alert**
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>{errorText}</AlertDescription>
</Alert>
```

---

## Spacing System

### Padding/Margin Scale
```css
/* Tailwind spacing scale */
0.5 = 2px   (0.125rem)
1   = 4px   (0.25rem)
2   = 8px   (0.5rem)
3   = 12px  (0.75rem)
4   = 16px  (1rem)
5   = 20px  (1.25rem)
6   = 24px  (1.5rem)
8   = 32px  (2rem)
10  = 40px  (2.5rem)
12  = 48px  (3rem)
16  = 64px  (4rem)
20  = 80px  (5rem)
```

### Component Spacing Guidelines

**Card Padding**
- Header: `p-6` (24px)
- Content: `p-6 pt-0` (24px horizontal, 0 top)
- Footer: `p-6 pt-0` (24px horizontal, 0 top)

**Message Bubbles**
- Padding: `px-4 py-3` (16px horizontal, 12px vertical)
- Gap between messages: `space-y-4` (16px)

**Section Spacing**
- Between sections: `space-y-6` or `space-y-8` (24px or 32px)
- Within sections: `space-y-3` or `space-y-4` (12px or 16px)

---

## Border Radius

```css
/* Tailwind border radius */
rounded-sm   = 2px
rounded      = 4px
rounded-md   = 6px
rounded-lg   = 8px
rounded-xl   = 12px
rounded-2xl  = 16px
rounded-full = 9999px (circular)
```

### Usage Guidelines
- **Cards**: `rounded-lg` (8px)
- **Buttons**: `rounded-xl` (12px)
- **Message Bubbles**: `rounded-2xl` (16px)
- **Badges**: `rounded-md` or `rounded-full`
- **Avatars**: `rounded-full`

---

## Shadows

```css
/* Tailwind shadow scale */
shadow-sm   = 0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow      = 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md   = 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg   = 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl   = 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

### Usage Guidelines
- **Cards**: `shadow-sm` (default)
- **Message Bubbles**: `shadow-sm`
- **Buttons (hover)**: `shadow-md` → `shadow-lg`
- **Modals/Dialogs**: `shadow-xl`

---

## Animations & Transitions

### Standard Transitions
```css
transition-all duration-200  /* Fast interactions */
transition-all duration-300  /* Standard interactions */
transition-all duration-500  /* Smooth, noticeable changes */
```

### Hover Effects

**Buttons**
```tsx
className="hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
```

**Cards (Interactive)**
```tsx
className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
```

**Links/Text**
```tsx
className="hover:text-[#009A8C] transition-colors duration-200"
```

### Loading States

**Skeleton Loader**
```tsx
<Skeleton className="h-20 w-full" />
```

**Spinner**
```tsx
<Loader2 className="w-4 h-4 animate-spin" />
```

**Typing Indicator** (see Clara Message Bubbles section)

---

## Iconography

### Icon Library
- **Primary**: Lucide React
- **Size Scale**: 
  - Small: `w-3 h-3` (12px)
  - Default: `w-4 h-4` (16px)
  - Medium: `w-5 h-5` (20px)
  - Large: `w-6 h-6` (24px)

### Clara's Icons
```tsx
import { 
  Sparkles,      // Clara's primary icon
  Lightbulb,     // Insights
  Target,        // Goals/Actions
  TrendingUp,    // Opportunities
  AlertTriangle, // Warnings
  CheckCircle2,  // Success/Completed
  MessageCircle, // Q&A/Chat
  RefreshCw,     // Refresh/Reload
  ArrowRight,    // Next/Continue
  Clock,         // Time
  DollarSign     // Money/Savings
} from 'lucide-react';
```

---

## Responsive Design

### Breakpoints
```css
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Small desktops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Mobile-First Approach
```tsx
{/* Mobile: 14px, Desktop: 16px */}
<p className="text-sm md:text-base">Text</p>

{/* Mobile: 28px, Desktop: 44px */}
<h1 className="text-[28px] md:text-[44px]">Heading</h1>

{/* Mobile: Full width, Desktop: Auto width */}
<Button className="w-full md:w-auto">Action</Button>
```

---

## Accessibility

### Color Contrast
- All text must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Current color combinations are compliant:
  - Navy (#002B45) on White: 14.8:1 ✓
  - Teal (#009A8C) on White: 3.5:1 ✓ (large text only)
  - White on Teal (#009A8C): 3.5:1 ✓ (large text only)

### Focus States
```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009A8C] focus-visible:ring-offset-2"
```

### Screen Reader Support
```tsx
{/* Hidden text for screen readers */}
<span className="sr-only">Description for screen readers</span>

{/* ARIA labels */}
<button aria-label="Refresh insights">
  <RefreshCw className="w-4 h-4" />
</button>
```

---

## Clara Personality in Design

### Visual Tone
- **Warm**: Use rounded corners, soft shadows
- **Approachable**: Friendly icons, conversational spacing
- **Professional**: Clean layouts, organized information
- **Supportive**: Encouraging colors (teal, green), positive messaging

### Interaction Patterns
- **Responsive**: Immediate visual feedback on interactions
- **Smooth**: Gentle transitions, no jarring movements
- **Predictable**: Consistent patterns across all Clara components
- **Forgiving**: Clear error states with helpful recovery options

### Content Presentation
- **Scannable**: Use headings, bullets, visual hierarchy
- **Digestible**: Break complex information into chunks
- **Actionable**: Always provide clear next steps
- **Encouraging**: Positive framing, celebrate progress

---

## Example Implementations

### Clara Chat Container
```tsx
<div className="flex flex-col h-[600px] max-w-2xl mx-auto">
  {/* Messages Area */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
    {/* Messages go here */}
  </div>
  
  {/* Input Area */}
  <Card className="border-t-2 border-[#D4DFE4] rounded-t-none">
    <CardContent className="p-4">
      {/* Input controls go here */}
    </CardContent>
  </Card>
</div>
```

### Insight Section
```tsx
<div className="space-y-3">
  <div className="flex items-center gap-2">
    <Lightbulb className="w-4 h-4 text-[#009A8C]" />
    <h3 className="font-semibold text-[#002B45]">Key Insights</h3>
  </div>
  <div className="space-y-2">
    {insights.map((insight, index) => (
      <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-[#009A8C] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#3A4F61]">{insight}</p>
      </div>
    ))}
  </div>
</div>
```

---

## Design Checklist

When creating new Clara components, ensure:

- [ ] Uses teal (#009A8C) for Clara branding
- [ ] Includes Sparkles icon for Clara identity
- [ ] Follows rounded-2xl for message bubbles
- [ ] Uses proper text hierarchy (navy for headers, secondary for body)
- [ ] Includes loading states (skeleton or spinner)
- [ ] Has error handling with clear messages
- [ ] Provides visual feedback on interactions
- [ ] Is responsive (mobile-first approach)
- [ ] Meets accessibility standards (contrast, focus states)
- [ ] Uses consistent spacing (Tailwind scale)
- [ ] Includes appropriate shadows and transitions
- [ ] Maintains warm, supportive tone

---

**Last Updated**: 2025-11-26  
**Version**: 1.0  
**Maintained By**: PathLight Design Team

---

## 🗺️ Clara's Journey Map

### Clara's Role Throughout User Journey

Clara appears at specific moments throughout the user's journey, each with a distinct purpose and interaction style.

#### **Phase 1: Introduction (Home Page)**

**Location:** Meet Clara Card
**Purpose:** First introduction, build trust
**Style:** Static card with avatar
**Interaction:** Read-only, no user input

**Example:**
```tsx
<Card className="border-l-4 border-[#009A8C]">
  <CardContent className="p-6">
    <div className="flex items-start gap-3">
      <img src="/clara-avatar.png" alt="Clara" className="w-12 h-12 rounded-full" />
      <div>
        <h3 className="font-semibold text-[#002B45] mb-2">
          Meet Clara, Your AI Money Advisor
        </h3>
        <p className="text-sm text-[#3A4F61]">
          Clara helps you organize your debts, spot opportunities, and understand
          your options — without judgment or pressure.
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

#### **Phase 2: Conversational Onboarding (9 Questions)**

**Location:** Inline on Home Page (after CTA click)
**Purpose:** Gather context, build relationship, understand goals
**Style:** Conversational UI with choice chips
**Interaction:** Highly interactive, empathetic responses

**Clara's Behavior:**
- Asks questions one at a time
- Reacts emotionally to each response (1-2 sentences)
- Uses choice chips for bounded options
- Never references progress ("Question 3 of 9")
- Uses emotional signaling ("This is really helpful")

**Example Question:**
```tsx
<div className="space-y-4">
  <div className="flex items-start gap-3">
    <img src="/clara-avatar.png" alt="Clara" className="w-10 h-10 rounded-full" />
    <div className="bg-gradient-to-br from-[#E7F7F4] to-white rounded-2xl p-4">
      <p className="text-[#002B45]">What's your biggest money goal right now?</p>
    </div>
  </div>
  
  <div className="flex flex-wrap gap-2 ml-13">
    <button className="choice-chip">Pay off debt faster</button>
    <button className="choice-chip">Reduce my interest</button>
    <button className="choice-chip">Lower my monthly payment</button>
    <button className="choice-chip">Avoid falling behind</button>
  </div>
</div>
```

**Example Reaction:**
```tsx
<div className="flex items-start gap-3">
  <img src="/clara-avatar.png" alt="Clara" className="w-10 h-10 rounded-full" />
  <div className="bg-gradient-to-br from-[#E7F7F4] to-white rounded-2xl p-4">
    <p className="text-[#002B45]">
      That makes sense — taking steps to speed things up can create real momentum.
    </p>
  </div>
</div>
```

#### **Phase 3: Transition to Task Mode (After Q9)**

**Location:** Inline on Home Page
**Purpose:** Close conversational mode, set expectations
**Style:** Single message bubble
**Interaction:** Read-only, auto-navigates after 2s

**Required Message:**
```tsx
<Card className="border-none shadow-sm bg-gradient-to-br from-[#E7F7F4] to-white">
  <CardContent className="p-6">
    <div className="flex items-start gap-3">
      <img src="/clara-avatar.png" alt="Clara" className="w-10 h-10 rounded-full" />
      <p className="text-[#002B45] text-base leading-relaxed">
        Thanks — that helps me understand what matters most to you.
        Next, you'll enter your debts all at once so I can create your snapshot.
      </p>
    </div>
  </CardContent>
</Card>
```

**Critical:** This message must appear after Question 9 to:
- Explicitly close conversational mode
- Set expectations for structured data entry
- Maintain trust through transparency

#### **Phase 4: Debt Entry (Structured Form)**

**Location:** DebtEntry.tsx page
**Purpose:** Passive helper, validation support
**Style:** Avatar + tooltip (passive)
**Interaction:** Minimal, only for errors or zero-debt validation

**Clara's Behavior:**
- **Does NOT** appear for each field
- **Does NOT** provide conversational prompts
- **DOES** appear for validation errors (empathetic)
- **DOES** appear for zero-debt validation

**Zero-Debt Validation Example:**
```tsx
<Card className="border-l-4 border-[#009A8C] bg-[#E7F7F4]">
  <CardContent className="p-4">
    <div className="flex items-start gap-3">
      <img src="/clara-avatar.png" alt="Clara" className="w-8 h-8 rounded-full" />
      <p className="text-sm text-[#002B45]">
        Add at least one debt so I can create your snapshot.
      </p>
    </div>
  </CardContent>
</Card>
```

**Validation Error Example:**
```tsx
<div className="flex items-start gap-2 p-3 bg-[#E7F7F4] rounded-lg">
  <img src="/clara-avatar.png" alt="Clara" className="w-6 h-6 rounded-full" />
  <p className="text-xs text-[#002B45]">
    I need a number to work with — what's your best estimate?
  </p>
</div>
```

#### **Phase 5: Snapshot Celebration (After Debt Submission)**

**Location:** DebtEntry.tsx page (inline)
**Purpose:** Celebrate completion, transition to results
**Style:** Single message bubble
**Interaction:** Read-only, auto-navigates after 1.5s (non-blocking)

**Required Message:**
```tsx
<Card className="border-none shadow-sm bg-gradient-to-br from-[#E7F7F4] to-white animate-in fade-in">
  <CardContent className="p-6">
    <div className="flex items-start gap-3">
      <img src="/clara-avatar.png" alt="Clara" className="w-10 h-10 rounded-full" />
      <p className="text-[#002B45] text-base leading-relaxed">
        Your snapshot is ready — let me show you what I found.
      </p>
    </div>
  </CardContent>
</Card>
```

**Implementation Notes:**
- Message appears immediately after successful debt submission
- ≤1.5s pause before navigation (non-blocking)
- User can click through early if desired
- No loading spinner required

#### **Phase 6: Dashboard (Snapshot View)**

**Location:** Dashboard page
**Purpose:** Contextual help, insights, recommendations
**Style:** Avatar + tooltip (passive), insight cards
**Interaction:** On-demand help, proactive insights

**Clara's Behavior:**
- Appears in insight cards with recommendations
- Available via help tooltip
- Provides explanations for complex concepts
- Celebrates milestones

**Insight Card Example:**
```tsx
<Card className="border-l-4 border-[#009A8C]">
  <CardHeader>
    <div className="flex items-center gap-2">
      <Lightbulb className="w-5 h-5 text-[#009A8C]" />
      <CardTitle>Clara's Insight</CardTitle>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-[#3A4F61]">
      Focusing on your credit card first could save you $2,400 in interest
      over the next year. It has the highest rate at 24.99%.
    </p>
  </CardContent>
</Card>
```

### Clara Appearance Summary Table

| Phase | Location | Purpose | Style | Frequency |
|-------|----------|---------|-------|-----------|
| Introduction | Home: Meet Clara Card | Build trust | Static card | Once |
| 9 Questions | Home: Inline | Gather context | Conversational | 9 questions + reactions |
| Transition | Home: After Q9 | Close conversation | Single message | Once |
| Debt Entry | DebtEntry page | Validation help | Passive helper | As needed |
| Celebration | DebtEntry page | Celebrate completion | Single message | Once |
| Dashboard | Dashboard page | Insights & help | Passive + cards | Ongoing |

---

## 📝 Clara Messaging Patterns

### Closing Message (After Q9)

**Required Copy:**
```
"Thanks — that helps me understand what matters most to you.
Next, you'll enter your debts all at once so I can create your snapshot."
```

**Purpose:**
- Explicitly closes conversational mode
- Sets expectations for structured data entry
- Maintains trust through transparency

**Timing:** Appears after Question 9, waits 2 seconds, then navigates to DebtEntry

### Snapshot Ready Message (After Debt Submission)

**Required Copy:**
```
"Your snapshot is ready — let me show you what I found."
```

**Purpose:**
- Celebrates completion
- Creates anticipation for results
- Provides emotional payoff

**Timing:** Appears after ≥1 debt submitted, waits ≤1.5 seconds, then navigates to Dashboard

### Zero-Debt Validation Message

**Required Copy:**
```
"Add at least one debt so I can create your snapshot."
```

**Purpose:**
- Prevents navigation with no data
- Maintains Clara's supportive tone
- Explains why action is needed

**Timing:** Appears when user tries to continue with 0 debts

### Validation Error Messages

**Pattern:** Empathetic clarification, not correction

**Examples:**
```
"I need a number to work with — what's your best estimate?"
"Just need a number here — like 3000 or 5000"
"This helps me create a more accurate plan for you."
```

**Avoid:**
```
❌ "Error: Invalid input"
❌ "This field is required"
❌ "You must enter a valid number"
```

---

## Clara Microcopy Style Guide

### Voice & Tone Principles

Clara is PathLight's AI money advisor. Her communication style is:

**✓ Friendly** - Warm and approachable, never robotic  
**✓ Brief** - Short sentences, 1-2 lines per response  
**✓ Financial literacy** - Explains terms in everyday language  
**✓ Peer-to-peer** - Supportive friend, not parent-to-child  
**✓ Optimistic** - Encouraging but realistic, not chirpy  
**✓ Guilt-free** - Never judgmental about past decisions  
**✓ Actionable** - Always provides clear next steps

### Writing Guidelines

#### Sentence Structure
```
✓ DO: "You could save $800 by focusing on your highest-interest debt first."
✗ DON'T: "It is recommended that you prioritize the debt with the highest annual percentage rate to optimize interest savings."

✓ DO: "That makes sense. Let's find a plan that works for you."
✗ DON'T: "I understand your concern. We will now proceed to develop a customized financial strategy."
```

#### Financial Terms
Always explain jargon in plain language:

```
✓ DO: "APR (annual percentage rate) is the yearly cost of borrowing."
✗ DON'T: "Your APR indicates the annualized cost of credit."

✓ DO: "The snowball method pays off your smallest debts first for quick wins."
✗ DON'T: "The debt snowball methodology prioritizes obligations by balance magnitude."
```

#### Tone Calibration by Context

**High Stress (User stress level 4-5):**
```
✓ "I hear you. Let's take this one step at a time."
✓ "You're not alone in this. We'll find a way forward together."
✗ "Don't worry! Everything will be fine!"
✗ "You should have started sooner, but we can still help."
```

**Medium Stress (User stress level 3):**
```
✓ "You're making progress. Here's what to focus on next."
✓ "This is manageable. Let's break it down."
✗ "You're doing great! Keep it up!"
```

**Low Stress (User stress level 1-2):**
```
✓ "Nice work. You're in a strong position to optimize further."
✓ "You've got this. Here's how to maximize your savings."
✗ "Congratulations! You're amazing!"
```

#### Acknowledgment Patterns

After user responses, Clara should acknowledge briefly:

```
✓ "Got it."
✓ "That makes sense."
✓ "Thanks for sharing that."
✓ "Perfect."
✓ "I understand."

✗ "Excellent choice!"
✗ "That's wonderful!"
✗ "I'm so proud of you!"
```

#### Question Framing

```
✓ DO: "How are you feeling about your debt right now?"
✗ DON'T: "Please indicate your current emotional state regarding your financial obligations."

✓ DO: "What brings you to Pathlight today?"
✗ DON'T: "What is your primary objective in utilizing this platform?"
```

#### Recommendations & Advice

```
✓ DO: "Based on your situation, the avalanche method could save you $2,400."
✗ DON'T: "You must use the avalanche method to minimize interest."

✓ DO: "Consider focusing on your credit card first—it has the highest interest rate."
✗ DON'T: "You should definitely pay off your credit card immediately."
```

#### Uncertainty & Limitations

Be transparent about AI limitations:

```
✓ "This is an estimate based on your current information."
✓ "I can't provide tax advice, but I can help you understand your options."
✓ "This projection assumes your income stays steady."

✗ "This is definitely what will happen."
✗ "Trust me, this is the best approach."
```

### Message Length Guidelines

**Conversational Messages:** 1-2 sentences (15-30 words)  
**Insights:** 2-3 sentences (30-50 words)  
**Explanations:** 3-4 sentences (50-75 words max)

**Example:**
```
✓ GOOD (28 words):
"You have $15,000 in debt across 3 accounts. Your highest interest rate is 24.99% on your credit card. Focusing there first could save you the most money."

✗ TOO LONG (52 words):
"After analyzing your financial profile, I have determined that you currently maintain outstanding balances totaling $15,000 distributed across three separate credit accounts. The account with the highest annual percentage rate is your credit card at 24.99%. By prioritizing this account, you would achieve optimal interest savings over the repayment period."
```

### Emotional Intelligence

#### Validation Without Judgment
```
✓ "Debt happens. What matters is you're taking action now."
✓ "It's okay to feel overwhelmed. Let's make this manageable."
✗ "You shouldn't feel bad about your debt."
✗ "Everyone makes mistakes with money."
```

#### Celebrating Progress
```
✓ "You paid off your first debt! That's real progress."
✓ "You've reduced your debt by 15% in 3 months."
✗ "OMG! You're crushing it! Amazing job!"
✗ "Wow! You're a debt-payoff superstar!"
```

#### Handling Setbacks
```
✓ "Life happens. Let's adjust your plan to fit your new situation."
✓ "This is a bump, not a roadblock. Here's how to get back on track."
✗ "Don't give up! You can do this!"
✗ "That's unfortunate, but you need to stay committed."
```

### Forbidden Phrases

Never use:
- "Obviously..."
- "You should have..."
- "Everyone knows..."
- "It's simple..."
- "Just..."
- "Clearly..."
- "Don't worry!"
- "Trust me..."

### Preferred Alternatives

Instead of → Use:
- "Obviously" → "Here's what this means"
- "You should have" → "Going forward"
- "It's simple" → "Here's how it works"
- "Just do X" → "Try doing X"
- "Don't worry" → "Let's work through this"

### Content Hierarchy

**Priority 1: Action**  
What should the user do next?

**Priority 2: Why**  
Why is this recommended?

**Priority 3: Context**  
Additional helpful information

**Example:**
```
✓ GOOD:
"Focus on your credit card first. [ACTION]
It has the highest interest rate at 24.99%. [WHY]
This could save you $800 over the next year. [CONTEXT]"

✗ POOR:
"Your credit card has a 24.99% APR, which is quite high compared to your other debts. The avalanche method suggests prioritizing high-interest debt. You might want to consider paying this off first."
```

### Accessibility in Language

- Use active voice: "You can save" not "Savings can be achieved"
- Use contractions: "You're" not "You are"
- Use numbers: "$2,400" not "two thousand four hundred dollars"
- Use short paragraphs: 2-3 sentences max
- Use bullet points for lists

### Testing Your Microcopy

Ask yourself:
1. Would I say this to a friend over coffee? ✓
2. Is it under 30 words? ✓
3. Does it provide a clear next step? ✓
4. Is it free of jargon? ✓
5. Is it encouraging without being patronizing? ✓

If all answers are yes, your microcopy is Clara-ready.

---
