# Product Requirements Document: PathLight

**Version:** 1.0  
**Last Updated:** January 2024  
**Status:** Active Development  
**Product Owner:** [To Be Assigned]  
**Technical Lead:** [To Be Assigned]

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Target Users](#target-users)
4. [Product Vision & Goals](#product-vision--goals)
5. [User Personas](#user-personas)
6. [User Stories](#user-stories)
7. [Functional Requirements](#functional-requirements)
8. [User Workflows](#user-workflows)
9. [Data Requirements](#data-requirements)
10. [Business Rules](#business-rules)
11. [API Integration Points](#api-integration-points)
12. [Success Metrics](#success-metrics)
13. [Technical Requirements](#technical-requirements)
14. [Future Enhancements](#future-enhancements)

---

## Executive Summary

### Product Overview

**PathLight** is a frontend-only web application that helps users understand their debt situation and create personalized payoff strategies. The application provides AI-powered insights, scenario modeling, and actionable recommendations without requiring backend infrastructure or database integration.

### Key Features

1. **Intelligent Onboarding** - Empathetic, stress-aware financial context gathering
2. **Debt Management** - Easy debt entry with validation and CSV import
3. **Strategy Recommendations** - AI-powered payoff strategy suggestions with confidence scoring
4. **Scenario Modeling** - Interactive "what-if" analysis and comparison tools
5. **Personalized Guidance** - Context-aware messaging and next-best-actions
6. **Progress Tracking** - Visual debt reduction tracking and milestone celebrations
7. **Data Portability** - Export capabilities for backup and sharing

### Target Launch

- **MVP Launch:** Q2 2024
- **Platform:** Web (responsive design)
- **Technology:** React + TypeScript, frontend-only architecture

---

## Problem Statement

### The Problem

Millions of Americans struggle with debt, but existing solutions are either:
- **Too complex**: Financial calculators require expertise to interpret
- **Too generic**: One-size-fits-all advice doesn't account for individual circumstances
- **Too expensive**: Professional financial advisors are cost-prohibitive
- **Too judgmental**: Many tools lack empathy for users' stress and anxiety

### The Impact

- **Financial Stress**: 73% of Americans report feeling stressed about money
- **Decision Paralysis**: Users don't know which debt to pay first
- **Lack of Clarity**: Complex interest calculations are confusing
- **Motivation Loss**: Long payoff timelines feel overwhelming

### Our Solution

PathLight provides:
- **Personalized Strategies**: Tailored to individual financial situations and stress levels
- **Clear Visualizations**: Easy-to-understand debt payoff projections
- **Empathetic Guidance**: Stress-aware messaging and encouragement
- **Actionable Plans**: Specific next steps, not just information
- **Privacy-First**: No account creation, no data sharing, frontend-only

---

## Target Users

### Primary Audience

**Debt-Burdened Individuals** seeking clarity and a plan to become debt-free:

- **Age Range**: 25-55 years old
- **Income Level**: $30,000 - $100,000 annually
- **Debt Amount**: $5,000 - $50,000 in unsecured debt
- **Tech Savvy**: Comfortable with web applications
- **Motivation**: Actively seeking debt solutions

### Secondary Audience

- **Financial Counselors**: Using the tool to help clients
- **Personal Finance Enthusiasts**: Optimizing their debt payoff strategy
- **Recent Graduates**: Managing student loan debt

---

## Product Vision & Goals

### Vision Statement

*"Empower every person to find their clearest path out of debt through personalized, empathetic, and actionable guidance."*

### Product Goals

1. **Reduce Financial Stress**: Help users feel more in control of their debt situation
2. **Increase Clarity**: Make complex debt calculations understandable
3. **Drive Action**: Convert insights into concrete next steps
4. **Build Confidence**: Provide reliable recommendations users can trust
5. **Ensure Privacy**: Maintain user trust through frontend-only architecture

### Success Criteria

- **User Engagement**: 80% of users complete onboarding
- **Scenario Creation**: Average 3+ scenarios created per user
- **Return Rate**: 40% of users return within 7 days
- **Recommendation Acceptance**: 60% of users accept recommended strategy
- **User Satisfaction**: 4.5+ star rating (when ratings implemented)

---

## User Personas

### Persona 1: "Stressed Sarah"

**Demographics:**
- Age: 32
- Occupation: Marketing Manager
- Income: $65,000/year
- Debt: $18,000 (credit cards + personal loan)

**Characteristics:**
- High stress level (4-5/5)
- Feels overwhelmed by multiple debts
- Wants quick wins for motivation
- Needs emotional support and encouragement

**Goals:**
- Reduce monthly payment burden
- See progress quickly
- Feel less anxious about debt

**Pain Points:**
- Doesn't know which debt to pay first
- Feels judged by financial content
- Overwhelmed by complex calculations

**Recommended Strategy:** Snowball method for psychological wins

---

### Persona 2: "Analytical Alex"

**Demographics:**
- Age: 28
- Occupation: Software Engineer
- Income: $95,000/year
- Debt: $25,000 (student loans + credit card)

**Characteristics:**
- Low stress level (2/5)
- Wants to optimize for savings
- Comfortable with numbers and data
- Values efficiency and logic

**Goals:**
- Minimize total interest paid
- Become debt-free as fast as possible
- Understand the math behind recommendations

**Pain Points:**
- Existing tools lack depth
- Wants more control over strategy
- Needs detailed projections

**Recommended Strategy:** Avalanche method for maximum savings

---

### Persona 3: "Cautious Carlos"

**Demographics:**
- Age: 45
- Occupation: Teacher
- Income: $52,000/year
- Debt: $12,000 (credit card + auto loan)

**Characteristics:**
- Moderate stress level (3/5)
- Risk-averse, wants stability
- Limited emergency savings
- Concerned about unexpected expenses

**Goals:**
- Maintain financial stability
- Build emergency fund while paying debt
- Avoid falling behind on payments

**Pain Points:**
- Worried about emergencies
- Tight monthly budget
- Needs flexible approach

**Recommended Strategy:** Balanced approach with emergency fund focus

---

## User Stories

### Epic 1: Onboarding & Profile Setup

**As a new user, I want to...**

1. **Understand the product value** so I can decide if it's right for me
   - Acceptance: Clear value proposition on landing page
   - API: N/A (frontend only)

2. **Share my financial goals** so I get personalized recommendations
   - Acceptance: Goal selection with clear descriptions
   - API: [Profile API - Create Profile](./api/profile.md#createupdate-profile)

3. **Indicate my stress level** so the app adapts its tone and recommendations
   - Acceptance: Visual stress level selector (1-5 scale)
   - API: [Profile API - Create Profile](./api/profile.md#createupdate-profile)

4. **Provide my financial context** so recommendations are realistic
   - Acceptance: Income, expenses, savings, credit score inputs
   - API: [Profile API - Create Profile](./api/profile.md#createupdate-profile)

5. **Share upcoming life events** so the plan accounts for changes
   - Acceptance: Optional life event selection
   - API: [Profile API - Create Profile](./api/profile.md#createupdate-profile)

---

### Epic 2: Debt Entry & Management

**As a user, I want to...**

1. **Add my debts one at a time** so I can build my debt profile
   - Acceptance: Simple form with validation
   - API: [Debts API - Create Debt](./api/debts.md#create-debt)

2. **Import multiple debts from CSV** so I can save time
   - Acceptance: CSV upload with error handling
   - API: [Debts API - Import from CSV](./api/debts.md#import-from-csv)

3. **Get suggested minimum payments** so I know if my payment is adequate
   - Acceptance: Auto-suggest based on balance and APR
   - API: [Debts API - Suggest Minimum Payment](./api/debts.md#suggest-minimum-payment)

4. **Edit my debt information** so I can keep it up to date
   - Acceptance: Edit form with validation
   - API: [Debts API - Update Debt](./api/debts.md#update-debt-partial)

5. **See all my debts at a glance** so I understand my total situation
   - Acceptance: Sortable, filterable debt list with summary
   - API: [Debts API - Get All Debts](./api/debts.md#get-all-debts)

6. **Prioritize my debts manually** so I can create a custom payoff order
   - Acceptance: Drag-and-drop priority ordering
   - API: [Debts API - Update Debt Priority](./api/debts.md#update-debt-priority)

---

### Epic 3: Strategy Recommendations

**As a user, I want to...**

1. **Get a recommended payoff strategy** so I know where to start
   - Acceptance: Clear recommendation with reasoning
   - API: [Recommendations API - Get Strategy](./api/recommendations.md#get-strategy-recommendation)

2. **Understand why a strategy is recommended** so I can trust the advice
   - Acceptance: Detailed explanation with factors considered
   - API: [Recommendations API - Get Strategy](./api/recommendations.md#get-strategy-recommendation)

3. **See confidence level of recommendations** so I know how reliable they are
   - Acceptance: Visual confidence indicator with explanation
   - API: [Recommendations API - Get Confidence Score](./api/recommendations.md#get-confidence-score)

4. **Compare different strategies** so I can choose the best one for me
   - Acceptance: Side-by-side comparison with pros/cons
   - API: [Recommendations API - Compare Strategies](./api/recommendations.md#compare-strategies)

5. **Get product recommendations** so I can explore refinancing options
   - Acceptance: Relevant product suggestions with eligibility criteria
   - API: [Recommendations API - Get Product Recommendations](./api/recommendations.md#get-product-recommendations)

---

### Epic 4: Scenario Modeling

**As a user, I want to...**

1. **Create a payoff scenario** so I can see my debt-free timeline
   - Acceptance: Scenario with payment schedule and projections
   - API: [Scenarios API - Simulate Scenario](./api/scenarios.md#simulate-scenario)

2. **See detailed payment schedule** so I know what to expect each month
   - Acceptance: Month-by-month breakdown with principal/interest
   - API: [Scenarios API - Get Payment Schedule](./api/scenarios.md#get-payment-schedule)

3. **Compare multiple scenarios** so I can choose the best approach
   - Acceptance: Visual comparison with key metrics
   - API: [Scenarios API - Compare Scenarios](./api/scenarios.md#compare-scenarios)

4. **Explore "what-if" scenarios** so I can see impact of changes
   - Acceptance: Interactive what-if analysis with instant results
   - API: [Scenarios API - What-If Analysis](./api/scenarios.md#what-if-analysis)

5. **Find optimal payment amount** so I can balance speed and affordability
   - Acceptance: Optimization tool with constraints
   - API: [Scenarios API - Optimize Payment Amount](./api/scenarios.md#optimize-payment-amount)

6. **Calculate specific payoff dates** so I can plan for milestones
   - Acceptance: Date calculator with milestone tracking
   - API: [Scenarios API - Calculate Payoff Date](./api/scenarios.md#calculate-payoff-date)

---

### Epic 5: Personalization & Guidance

**As a user, I want to...**

1. **See personalized alerts** so I'm aware of important issues
   - Acceptance: Context-aware alerts based on my situation
   - API: [Personalization API - Get Microcopy](./api/personalization.md#get-personalized-microcopy)

2. **Get next best actions** so I know what to do next
   - Acceptance: Prioritized action list with impact estimates
   - API: [Personalization API - Get Next Best Actions](./api/personalization.md#get-next-best-actions)

3. **Receive motivational messages** so I stay encouraged
   - Acceptance: Stress-appropriate encouragement
   - API: [Personalization API - Get Motivational Message](./api/personalization.md#get-motivational-message)

4. **Get situation-specific guidance** so I can handle challenges
   - Acceptance: Contextual help for specific situations
   - API: [Personalization API - Get Contextual Guidance](./api/personalization.md#get-contextual-guidance)

5. **See page-specific content** so the app feels tailored to me
   - Acceptance: Dynamic content based on context
   - API: [Personalization API - Get Page-Specific Content](./api/personalization.md#get-page-specific-content)

---

### Epic 6: AI-Powered Insights

**As a user, I want to...**

1. **Get AI insights about my situation** so I understand my options
   - Acceptance: Comprehensive analysis with key insights
   - API: [AI Services API - Get AI Insights](./api/ai-services.md#get-ai-insights)

2. **Understand complex calculations** so I can learn
   - Acceptance: Plain-language explanations with examples
   - API: [AI Services API - Explain Calculation](./api/ai-services.md#explain-calculation)

3. **Get personalized guidance** so I can handle my specific situation
   - Acceptance: Situation-specific action plans
   - API: [AI Services API - Get Personalized Guidance](./api/ai-services.md#get-personalized-guidance)

4. **Ask questions about debt management** so I can get answers
   - Acceptance: Natural language Q&A with context
   - API: [AI Services API - Answer Question](./api/ai-services.md#answer-question)

5. **See scenario summaries** so I can understand recommendations quickly
   - Acceptance: User-friendly summaries in simple language
   - API: [AI Services API - Summarize Scenario](./api/ai-services.md#summarize-scenario)

---

### Epic 7: Progress Tracking

**As a user, I want to...**

1. **Track my debt reduction progress** so I can see how far I've come
   - Acceptance: Visual progress indicators and charts
   - API: [AI Services API - Generate Progress Report](./api/ai-services.md#generate-progress-report)

2. **Celebrate milestones** so I stay motivated
   - Acceptance: Milestone notifications with encouragement
   - API: [Analytics API - Track Milestone](./api/analytics.md#track-milestone)

3. **See my payment history** so I can review my journey
   - Acceptance: Timeline of payments and progress
   - API: [Analytics API - Get Session Analytics](./api/analytics.md#get-session-analytics)

4. **Get insights about my behavior** so I can improve
   - Acceptance: Behavioral insights and patterns
   - API: [Analytics API - Get User Insights](./api/analytics.md#get-user-insights)

---

### Epic 8: Data Management

**As a user, I want to...**

1. **Export my data** so I can back it up
   - Acceptance: JSON/CSV export of all data
   - API: [Export API - Export All Data](./api/export.md#export-all-data)

2. **Import my data** so I can restore a backup
   - Acceptance: Import from previously exported file
   - API: [Export API - Import Data](./api/export.md#import-data)

3. **Export scenarios as PDF** so I can print or share them
   - Acceptance: Professional PDF reports
   - API: [Export API - Export Scenario](./api/export.md#export-scenario)

4. **Share scenarios with others** so I can get feedback
   - Acceptance: Shareable links with privacy controls
   - API: [Export API - Generate Shareable Link](./api/export.md#generate-shareable-link)

5. **Clear my session** so I can start fresh
   - Acceptance: Clear all data with confirmation
   - API: [Sessions API - Delete Session](./api/sessions.md#delete-session)

---

## Functional Requirements

### FR-1: User Onboarding

**Priority:** P0 (Must Have)

**Description:** Guide users through initial setup to gather financial context and goals using Clara, the AI money advisor.

**Requirements:**

1. **Landing Page**
   - Display clear value proposition
   - Show "How It Works" section
   - Provide goal selection (4 primary goals)
   - Support returning users with "Continue" option

2. **Clara Conversational Onboarding Flow**
   - **Welcome Message**: Clara introduces herself warmly and explains the process
   - **Question 1**: "What brings you to Pathlight today?" (Primary goal selection)
   - **Question 2**: "What are you hoping Pathlight helps you achieve?" (Secondary goal/clarification)
   - **Question 3**: "How are you feeling about things right now?" (Stress level/mood)
   - **Question 4**: "Which support style feels right for you?" (Preferred support approach)
   - **Question 5**: "How much time would you like to invest each week?" (Time commitment)
   - **Final**: Encouragement and transition to debt entry

3. **Clara's Conversational Guidelines**
   - Speaks warmly, briefly, and without guilt
   - Reacts to user answers with 1-2 sentences of empathetic acknowledgment
   - Never pressures the user
   - Keeps tone supportive, conversational, and human
   - Asks one question at a time
   - Uses typing indicators for responses
   - Auto-scrolls conversation as messages appear

4. **UI/UX Requirements**
   - Single-screen scrolling chat feed (not multi-page)
   - User sees Clara's message → taps choice → Clara responds → next message appears
   - Existing UI answer components (buttons, chips, sliders) embedded inline as chat bubbles
   - No modal transitions or full-screen page changes
   - Typing indicators before Clara's replies
   - Auto-scroll after each message

5. **Validation**
   - Real-time field validation
   - Helpful error messages
   - Suggested values where applicable
   - Progress indicator

6. **Personalization**
   - Stress-aware messaging
   - Empathetic tone for high stress
   - Encouraging messages throughout
   - Context-specific help text

**API Integration:**
- [Profile API](./api/profile.md)
- [Personalization API](./api/personalization.md)

**Acceptance Criteria:**
- [ ] User can complete onboarding in < 5 minutes
- [ ] All required fields are validated
- [ ] Progress is saved between steps
- [ ] User can go back to edit previous steps
- [ ] Completion rate > 80%

---

### FR-2: Debt Management

**Priority:** P0 (Must Have)

**Description:** Allow users to add, edit, and manage their debt accounts.

**Requirements:**

1. **Debt Entry Form**
   - Debt type selection (credit card, personal loan, student loan, auto loan)
   - Name, balance, APR, minimum payment
   - Next payment date
   - Delinquency flag
   - Real-time validation

2. **Validation & Suggestions**
   - Minimum payment must cover monthly interest
   - Suggest minimum payment based on balance/APR
   - Warn if APR is unusually high
   - Validate payment date is in future

3. **Bulk Import**
   - CSV file upload
   - Template download
   - Error handling with row-by-row feedback
   - Preview before import

4. **Debt List**
   - Sortable by balance, APR, name, date
   - Filterable by type, delinquency
   - Summary statistics (total debt, min payment, weighted APR)
   - Edit/delete actions

5. **Priority Management**
   - Drag-and-drop reordering
   - Custom priority numbers
   - Visual indicators

**API Integration:**
- [Debts API](./api/debts.md)

**Acceptance Criteria:**
- [ ] User can add debt in < 2 minutes
- [ ] CSV import handles 100+ debts
- [ ] Validation prevents invalid data
- [ ] List supports 50+ debts without performance issues
- [ ] Priority changes are instant

---

### FR-3: Strategy Recommendations

**Priority:** P0 (Must Have)

**Description:** Provide intelligent, personalized debt payoff strategy recommendations.

**Requirements:**

1. **Recommendation Engine**
   - Analyze debts, financial context, goals
   - Calculate confidence score (0-1)
   - Generate primary recommendation
   - Provide 2-3 alternative strategies

2. **Recommendation Display**
   - Clear primary recommendation
   - Confidence indicator (high/medium/low)
   - Detailed explanation of reasoning
   - Factors considered (with weights)
   - Pros/cons of each strategy

3. **Strategy Comparison**
   - Side-by-side comparison table
   - Visual charts (interest, timeline)
   - "Best for" descriptions
   - Projected outcomes

4. **Confidence Scoring**
   - Data completeness factors
   - Visual breakdown of score
   - Suggestions to improve confidence
   - Easy wins highlighted

**API Integration:**
- [Recommendations API](./api/recommendations.md)
- [AI Services API](./api/ai-services.md)

**Acceptance Criteria:**
- [ ] Recommendation generated in < 2 seconds
- [ ] Confidence score is accurate
- [ ] Explanation is clear and non-technical
- [ ] Comparison shows meaningful differences
- [ ] User can understand why strategy is recommended

---

### FR-4: Scenario Modeling

**Priority:** P0 (Must Have)

**Description:** Enable users to create, compare, and analyze debt payoff scenarios.

**Requirements:**

1. **Scenario Creation**
   - Select strategy (snowball, avalanche, custom)
   - Set monthly payment amount
   - Interactive slider with real-time updates
   - Impact preview (months saved, interest saved)

2. **Scenario Details**
   - Total months to payoff
   - Total interest paid
   - Debt-free date
   - Debt payoff order with reasoning
   - Key milestones

3. **Payment Schedule**
   - Month-by-month breakdown
   - Principal vs interest visualization
   - Remaining balance tracking
   - Cumulative totals

4. **Scenario Comparison**
   - Compare up to 3 scenarios
   - Visual charts (bar, line)
   - Detailed analysis table
   - Insights and recommendations

5. **What-If Analysis**
   - Extra payment scenarios
   - Income/expense changes
   - APR changes (refinancing)
   - Consolidation modeling
   - Balance transfer analysis
   - Windfall application

6. **Optimization**
   - Find optimal payment amount
   - Balance constraints (min/max payment)
   - Goal-based optimization (minimize interest, minimize time)
   - Alternative suggestions

**API Integration:**
- [Scenarios API](./api/scenarios.md)
- [AI Services API](./api/ai-services.md)

**Acceptance Criteria:**
- [ ] Scenario generates in < 3 seconds
- [ ] Payment schedule is accurate
- [ ] Comparison is visually clear
- [ ] What-if analysis is interactive
- [ ] Optimization finds best solution

---

### FR-5: Personalization

**Priority:** P1 (Should Have)

**Description:** Deliver context-aware, personalized content throughout the application.

**Requirements:**

1. **Dynamic Alerts**
   - Stress-based messaging
   - Cash flow warnings
   - Delinquency alerts
   - Emergency fund reminders
   - Priority-based display

2. **Next Best Actions**
   - Prioritized action list (top 3)
   - Impact estimates
   - Time to complete
   - Confidence level
   - Reasoning for each action

3. **Contextual Hints**
   - Page-specific tips
   - Feature discovery
   - Dismissible tooltips
   - Trigger-based display

4. **Motivational Messaging**
   - Stress-appropriate tone
   - Progress-based encouragement
   - Milestone celebrations
   - Personalized next steps

5. **Situation-Specific Guidance**
   - Negative cash flow help
   - High stress support
   - Delinquency guidance
   - Multiple debt strategies

**API Integration:**
- [Personalization API](./api/personalization.md)
- [AI Services API](./api/ai-services.md)

**Acceptance Criteria:**
- [ ] Alerts are relevant to user situation
- [ ] Actions are prioritized correctly
- [ ] Hints appear at right time
- [ ] Messaging matches stress level
- [ ] Guidance is actionable

---

### FR-6: AI-Powered Insights

**Priority:** P1 (Should Have)

**Description:** Provide intelligent analysis and natural language explanations.

**Requirements:**

1. **Situation Analysis**
   - Comprehensive debt summary
   - Key insights (3-5 points)
   - Strengths and concerns
   - Opportunities identified
   - Personalized recommendations

2. **Calculation Explanations**
   - Plain-language explanations
   - Step-by-step breakdowns
   - Visual analogies
   - Implications and context
   - Related concepts

3. **Q&A System**
   - Natural language questions
   - Context-aware answers
   - Reasoning provided
   - Alternative approaches
   - Related questions suggested

4. **Scenario Summaries**
   - Non-technical language
   - Key points highlighted
   - Tradeoffs explained
   - Suitability assessment
   - Next steps provided

5. **Progress Reports**
   - Achievement highlights
   - Progress metrics
   - Momentum analysis
   - Encouragement
   - Recommendations

**API Integration:**
- [AI Services API](./api/ai-services.md)

**Acceptance Criteria:**
- [ ] Insights are accurate and relevant
- [ ] Explanations are easy to understand
- [ ] Q&A provides helpful answers
- [ ] Summaries are concise
- [ ] Reports are motivating

---

### FR-7: Progress Tracking

**Priority:** P2 (Nice to Have)

**Description:** Track user progress and celebrate milestones.

**Requirements:**

1. **Progress Dashboard**
   - Debt reduction chart
   - Payment history
   - Milestones achieved
   - Interest saved
   - Timeline progress

2. **Milestone Tracking**
   - First debt paid
   - 25%, 50%, 75% complete
   - Debt-free achievement
   - Emergency fund built
   - Strategy changes

3. **Celebrations**
   - Milestone notifications
   - Encouraging messages
   - Next milestone preview
   - Share achievements

4. **Analytics**
   - Session duration
   - Feature usage
   - Engagement level
   - Behavior patterns
   - Funnel analysis

**API Integration:**
- [Analytics API](./api/analytics.md)
- [AI Services API](./api/ai-services.md)

**Acceptance Criteria:**
- [ ] Progress is accurately tracked
- [ ] Milestones trigger celebrations
- [ ] Charts are visually appealing
- [ ] Analytics provide insights
- [ ] User feels motivated

---

### FR-8: Data Management

**Priority:** P1 (Should Have)

**Description:** Enable data export, import, and sharing.

**Requirements:**

1. **Export Capabilities**
   - Full data export (JSON)
   - Debt list export (CSV)
   - Scenario reports (PDF)
   - Comparison reports (PDF)
   - Progress reports (PDF)

2. **Import Capabilities**
   - Restore from backup
   - Validation on import
   - Error handling
   - Partial import support

3. **Sharing**
   - Generate shareable links
   - Expiration settings (1-30 days)
   - Privacy controls (exclude personal info)
   - QR code generation
   - Revoke access

4. **Session Management**
   - Clear all data
   - Start over
   - Confirmation dialogs
   - Data retention notice

**API Integration:**
- [Export API](./api/export.md)
- [Sessions API](./api/sessions.md)

**Acceptance Criteria:**
- [ ] Export completes in < 5 seconds
- [ ] Import validates data correctly
- [ ] Shared links work without auth
- [ ] PDF reports are professional
- [ ] Clear data is irreversible with warning

---

## User Workflows

### Workflow 1: First-Time User Journey

**Goal:** Complete onboarding and create first scenario

**Steps:**

1. **Landing Page**
   - User arrives at landing page
   - Reads value proposition
   - Selects primary goal
   - Clicks "Get Started"

2. **Onboarding - Stress & Life Events**
   - Selects stress level (1-5 slider)
   - Reads empathetic message
   - Optionally selects life events
   - Clicks "Next"
   - **API**: [Profile API - Create Profile](./api/profile.md#createupdate-profile)

3. **Onboarding - Demographics**
   - Selects age range
   - Selects employment status
   - Reads personalized insight
   - Clicks "Next"
   - **API**: [Profile API - Update Profile](./api/profile.md#update-profile-partial)

4. **Onboarding - Finances**
   - Enters monthly income
   - Enters monthly expenses
   - Sees available cash flow calculation
   - Clicks "Next"
   - **API**: [Profile API - Update Profile](./api/profile.md#update-profile-partial)

5. **Onboarding - Savings & Credit**
   - Enters liquid savings
   - Selects credit score range
   - Sees completeness score
   - Clicks "Next"
   - **API**: [Profile API - Update Profile](./api/profile.md#update-profile-partial)

6. **Onboarding - Summary**
   - Reviews all information
   - Sees personalized insights
   - Clicks "Add My Debts"
   - **API**: [Profile API - Get Profile](./api/profile.md#get-profile)

7. **Debt Entry**
   - Adds first debt
   - Sees validation and suggestions
   - Adds 2-3 more debts
   - Clicks "Continue to Dashboard"
   - **API**: [Debts API - Create Debt](./api/debts.md#create-debt) (multiple calls)

8. **Dashboard**
   - Sees debt snapshot
   - Views personalized alerts
   - Sees next best actions
   - Clicks "Explore Payoff Scenarios"
   - **API**: [Personalization API - Get Page Content](./api/personalization.md#get-page-specific-content)

9. **Scenarios**
   - Sees recommended strategy
   - Views confidence score
   - Creates first scenario
   - Compares with alternatives
   - **API**: [Recommendations API - Get Strategy](./api/recommendations.md#get-strategy-recommendation)
   - **API**: [Scenarios API - Simulate Scenario](./api/scenarios.md#simulate-scenario)

10. **Success**
    - User has clear debt payoff plan
    - Knows next steps
    - Feels empowered and less stressed

**Total Time:** 15-20 minutes

---

### Workflow 2: Comparing Payoff Strategies

**Goal:** Understand differences between strategies and choose best one

**Steps:**

1. **Navigate to Scenarios**
   - User clicks "Scenarios" from dashboard
   - Sees default scenarios already generated

2. **View Recommendation**
   - Sees recommended strategy banner
   - Reads confidence score and explanation
   - Understands why strategy is recommended
   - **API**: [Recommendations API - Get Strategy](./api/recommendations.md#get-strategy-recommendation)

3. **Review Default Scenarios**
   - Sees 3 pre-generated scenarios:
     - Minimum Payments (Snowball)
     - Aggressive Payoff (Avalanche)
     - Moderate Approach (Hybrid)
   - Clicks on each to see details

4. **Compare Scenarios**
   - Selects 2-3 scenarios for comparison
   - Views side-by-side comparison
   - Sees visual charts (interest, timeline)
   - Reads analysis and insights
   - **API**: [Scenarios API - Compare Scenarios](./api/scenarios.md#compare-scenarios)

5. **Create Custom Scenario**
   - Adjusts monthly payment slider
   - Sees real-time impact
   - Selects different strategy
   - Saves custom scenario
   - **API**: [Scenarios API - Simulate Scenario](./api/scenarios.md#simulate-scenario)

6. **Get AI Summary**
   - Clicks "Explain This" on scenario
   - Reads plain-language summary
   - Understands tradeoffs
   - Sees if it's right for them
   - **API**: [AI Services API - Summarize Scenario](./api/ai-services.md#summarize-scenario)

7. **Make Decision**
   - Chooses preferred strategy
   - Exports scenario as PDF
   - Sets up payment plan
   - **API**: [Export API - Export Scenario](./api/export.md#export-scenario)

**Total Time:** 10-15 minutes

---

### Workflow 3: What-If Analysis

**Goal:** Explore impact of financial changes on debt payoff

**Steps:**

1. **Navigate to What-If**
   - User clicks "What-If Scenarios" from scenarios page
   - Sees template options

2. **Select Template**
   - Chooses "Pay Extra Each Month"
   - Sees configuration form
   - **API**: [Personalization API - Get Page Content](./api/personalization.md#get-page-specific-content)

3. **Configure Scenario**
   - Enters extra monthly payment ($200)
   - Sees impact preview
   - Clicks "Create Scenario"
   - **API**: [Scenarios API - What-If Analysis](./api/scenarios.md#what-if-analysis)

4. **Review Results**
   - Sees comparison with base scenario
   - Views months saved (8 months)
   - Views interest saved ($800)
   - Reads recommendation
   - **API**: [Scenarios API - What-If Analysis](./api/scenarios.md#what-if-analysis)

5. **Try Another What-If**
   - Selects "Balance Transfer" template
   - Configures 0% APR for 18 months
   - Enters 3% transfer fee
   - Creates scenario
   - **API**: [Scenarios API - What-If Analysis](./api/scenarios.md#what-if-analysis)

6. **Compare All What-Ifs**
   - Views all what-if scenarios
   - Compares impact
   - Identifies best option
   - Exports comparison
   - **API**: [Export API - Export Comparison](./api/export.md#export-scenario-comparison)

**Total Time:** 8-12 minutes

---

### Workflow 4: Getting Personalized Guidance

**Goal:** Receive help for specific financial situation

**Steps:**

1. **Trigger Guidance**
   - User has negative cash flow
   - Sees warning alert on dashboard
   - Clicks "Get Help"
   - **API**: [Personalization API - Get Microcopy](./api/personalization.md#get-personalized-microcopy)

2. **View Situation Analysis**
   - Sees AI analysis of situation
   - Reads key concerns
   - Views immediate actions
   - **API**: [AI Services API - Get AI Insights](./api/ai-services.md#get-ai-insights)

3. **Get Specific Guidance**
   - Clicks "How to Handle Negative Cash Flow"
   - Reads step-by-step guidance
   - Sees short-term and long-term plans
   - Views resources and warnings
   - **API**: [AI Services API - Get Personalized Guidance](./api/ai-services.md#get-personalized-guidance)

4. **Review Next Best Actions**
   - Sees prioritized action list
   - Reads impact estimates
   - Understands reasoning
   - Clicks on action to learn more
   - **API**: [Personalization API - Get Next Best Actions](./api/personalization.md#get-next-best-actions)

5. **Ask Follow-Up Question**
   - Types "Should I contact my creditors?"
   - Receives detailed answer
   - Sees related questions
   - Gets actionable advice
   - **API**: [AI Services API - Answer Question](./api/ai-services.md#answer-question)

6. **Take Action**
   - Follows guidance steps
   - Updates budget
   - Contacts creditors
   - Feels more in control

**Total Time:** 5-10 minutes

---

### Workflow 5: Tracking Progress

**Goal:** Monitor debt reduction and celebrate milestones

**Steps:**

1. **Update Debt Balances**
   - User makes monthly payment
   - Updates debt balance in app
   - Sees new remaining balance
   - **API**: [Debts API - Update Debt](./api/debts.md#update-debt-partial)

2. **View Progress Dashboard**
   - Navigates to dashboard
   - Sees debt reduction chart
   - Views payment history
   - Checks progress percentage
   - **API**: [Analytics API - Get Session Analytics](./api/analytics.md#get-session-analytics)

3. **Milestone Reached**
   - System detects first debt paid off
   - Shows celebration modal
   - Displays encouraging message
   - Shows next milestone
   - **API**: [Analytics API - Track Milestone](./api/analytics.md#track-milestone)

4. **Generate Progress Report**
   - Clicks "View Progress Report"
   - Sees 6-month summary
   - Reviews achievements
   - Reads insights and momentum
   - Gets recommendations
   - **API**: [AI Services API - Generate Progress Report](./api/ai-services.md#generate-progress-report)

5. **Export Report**
   - Clicks "Export as PDF"
   - Downloads professional report
   - Shares with accountability partner
   - **API**: [Export API - Export Progress](./api/export.md#export-progress-report)

6. **Adjust Strategy**
   - Based on progress, considers changes
   - Increases monthly payment
   - Updates scenario
   - Sees new projected payoff date
   - **API**: [Scenarios API - Simulate Scenario](./api/scenarios.md#simulate-scenario)

**Total Time:** 5-8 minutes (monthly)

---

## Data Requirements

### User Profile Data

**Storage:** Browser localStorage  
**Retention:** Until user clears session  
**API Reference:** [Profile API](./api/profile.md)

**Required Fields:**
- Age range (enum)
- Employment status (enum)
- Monthly income (number, USD)
- Monthly expenses (number, USD)
- Liquid savings (number, USD)
- Credit score range (enum)
- Primary goal (enum)
- Stress level (1-5)

**Optional Fields:**
- ZIP code (string)
- Payoff priority (enum)
- Life events (array of enums)

**Calculated Fields:**
- Available cash flow
- Debt-to-income ratio
- Emergency fund ratio
- Profile completeness score

---

### Debt Data

**Storage:** Browser localStorage  
**Retention:** Until user clears session  
**API Reference:** [Debts API](./api/debts.md)

**Required Fields:**
- ID (UUID)
- Type (enum: credit-card, personal-loan, student-loan, auto-loan)
- Name (string, 1-100 chars)
- Balance (number, USD, > 0)
- APR (number, 0-100)
- Minimum payment (number, USD, > 0)
- Next payment date (ISO 8601 date)

**Optional Fields:**
- Custom order (number)
- Is delinquent (boolean)

**Calculated Fields:**
- Monthly interest
- Principal portion of minimum payment
- Months to payoff at minimum
- Total interest at minimum

**Validation Rules:**
- Minimum payment must cover monthly interest
- Balance must be positive
- APR must be 0-100
- Next payment date must be valid date

---

### Scenario Data

**Storage:** Browser localStorage  
**Retention:** Until user clears session  
**API Reference:** [Scenarios API](./api/scenarios.md)

**Required Fields:**
- ID (UUID)
- Name (string)
- Strategy (enum: snowball, avalanche, custom)
- Monthly payment (number, USD)
- Total months (number)
- Total interest (number, USD)
- Payoff date (ISO 8601 date)
- Start date (ISO 8601 date)

**Optional Fields:**
- Payment schedule (array of schedule items)
- Debt order (array with priorities)
- Milestones (array of milestone objects)

**Schedule Item Fields:**
- Month number
- Date
- Payments per debt (array)
  - Debt ID
  - Debt name
  - Payment amount
  - Principal
  - Interest
  - Remaining balance
- Total payment
- Total principal
- Total interest
- Total remaining balance

---

### Analytics Data

**Storage:** Browser sessionStorage (temporary)  
**Retention:** Current session only  
**API Reference:** [Analytics API](./api/analytics.md)

**Event Data:**
- Event type (enum)
- Timestamp (ISO 8601)
- Properties (object, varies by event)
- Session ID (UUID)

**Session Data:**
- Session ID (UUID)
- Start time
- Duration
- Events count
- Pages visited
- Time spent per page
- Engagement score

**Milestone Data:**
- Milestone type (enum)
- Date achieved
- Associated data (varies by milestone)

---

## Business Rules

### BR-1: Minimum Payment Validation

**Rule:** Minimum payment must be at least equal to the monthly interest charge.

**Formula:**
```
Monthly Interest = (Balance × APR ÷ 100) ÷ 12
Minimum Payment ≥ Monthly Interest
```

**Rationale:** Ensures debt principal decreases over time.

**Implementation:**
- Validate on debt creation/update
- Show error if validation fails
- Suggest adequate minimum payment
- **API**: [Debts API - Validate Debt](./api/debts.md#validate-debt)

---

### BR-2: Strategy Selection Logic

**Rule:** Recommend strategy based on user's stress level, goals, and debt characteristics.

**Logic:**
```
IF stress_level >= 4:
    RECOMMEND snowball (quick wins for motivation)
ELSE IF highest_apr > 18:
    RECOMMEND avalanche (high interest warrants focus)
ELSE IF debt_count > 5:
    RECOMMEND hybrid (balance for multiple debts)
ELSE IF goal == "pay-faster":
    RECOMMEND avalanche (optimal for speed)
ELSE IF goal == "lower-payment":
    RECOMMEND consolidation (reduce monthly burden)
ELSE:
    RECOMMEND avalanche (default to optimal)
```

**Implementation:**
- Calculate on profile completion
- Recalculate when debts or profile changes
- Provide reasoning for recommendation
- **API**: [Recommendations API - Get Strategy](./api/recommendations.md#get-strategy-recommendation)

---

### BR-3: Confidence Scoring

**Rule:** Calculate confidence score based on data completeness and quality.

**Formula:**
```
confidence_score = (
    debt_completeness × 0.30 +
    income_accuracy × 0.25 +
    expense_tracking × 0.20 +
    credit_score_known × 0.15 +
    goals_defined × 0.10
)

IF confidence_score >= 0.8: confidence_level = "high"
ELSE IF confidence_score >= 0.5: confidence_level = "medium"
ELSE: confidence_level = "low"
```

**Implementation:**
- Calculate on every recommendation request
- Display visually to user
- Provide suggestions to improve score
- **API**: [Recommendations API - Get Confidence Score](./api/recommendations.md#get-confidence-score)

---

### BR-4: Scenario Validation

**Rule:** Monthly payment must be at least the sum of all minimum payments.

**Formula:**
```
Total Minimum Payment = SUM(debt.minimumPayment for all debts)
Monthly Payment ≥ Total Minimum Payment
```

**Rationale:** Ensures all debts receive at least minimum payment.

**Implementation:**
- Validate before scenario creation
- Show error with required minimum
- Suggest adequate payment amount
- **API**: [Scenarios API - Validate Scenario](./api/scenarios.md#validate-scenario)

---

### BR-5: Debt Ordering

**Rule:** Order debts according to selected strategy.

**Snowball Strategy:**
```
Sort debts by balance (smallest first)
Pay minimums on all debts
Apply extra payment to smallest debt
When debt paid off, move to next smallest
```

**Avalanche Strategy:**
```
Sort debts by APR (highest first)
Pay minimums on all debts
Apply extra payment to highest APR debt
When debt paid off, move to next highest APR
```

**Custom Strategy:**
```
Sort debts by user-defined priority order
Pay minimums on all debts
Apply extra payment to highest priority debt
When debt paid off, move to next priority
```

**Implementation:**
- Apply ordering in scenario simulation
- Show debt order with reasoning
- Allow user to override with custom order
- **API**: [Scenarios API - Simulate Scenario](./api/scenarios.md#simulate-scenario)

---

### BR-6: Interest Calculation

**Rule:** Calculate monthly interest using simple interest formula.

**Formula:**
```
Monthly Interest = (Balance × APR ÷ 100) ÷ 12
Principal Payment = Total Payment - Monthly Interest
New Balance = Balance - Principal Payment
```

**Implementation:**
- Apply to each debt every month in simulation
- Track cumulative interest paid
- Show principal vs interest breakdown
- **API**: [Scenarios API - Simulate Scenario](./api/scenarios.md#simulate-scenario)

---

### BR-7: Personalization Rules

**Rule:** Adapt messaging and recommendations based on user context.

**Stress-Based Messaging:**
```
IF stress_level >= 4:
    tone = "empathetic and supportive"
    focus = "immediate relief and small steps"
    strategy_preference = "snowball"
ELSE IF stress_level == 3:
    tone = "balanced and encouraging"
    focus = "mix of short and long-term"
    strategy_preference = "flexible"
ELSE:
    tone = "confident and optimistic"
    focus = "optimization and long-term"
    strategy_preference = "avalanche"
```

**Cash Flow-Based Actions:**
```
IF cash_flow < 0:
    priority = "budget review and expense reduction"
ELSE IF cash_flow < 100:
    priority = "find ways to increase available funds"
ELSE IF cash_flow < 500:
    priority = "build emergency fund"
ELSE:
    priority = "aggressive debt payoff"
```

**Implementation:**
- Apply throughout application
- Update when context changes
- Provide consistent experience
- **API**: [Personalization API](./api/personalization.md)

---

### BR-8: Data Retention

**Rule:** All user data is stored locally and never sent to servers.

**Storage Locations:**
- **localStorage**: Profile, debts, scenarios (persistent)
- **sessionStorage**: Analytics, temporary data (session only)
- **No server storage**: Frontend-only architecture

**Data Lifecycle:**
```
1. User creates session → Data stored in localStorage
2. User makes changes → Data updated in localStorage
3. User closes browser → Data persists in localStorage
4. User clears session → Data deleted from localStorage
5. User exports data → JSON/CSV file downloaded
6. User imports data → Data restored to localStorage
```

**Implementation:**
- Use localStorage for all persistent data
- Implement export/import for data portability
- Provide clear "Clear All Data" option
- **API**: [Sessions API](./api/sessions.md), [Export API](./api/export.md)

---

## API Integration Points

### Core APIs

All API documentation is available in the `/docs/api/` directory:

1. **[Sessions API](./api/sessions.md)**
   - Session creation and management
   - Token validation
   - Session cleanup

2. **[Profile API](./api/profile.md)**
   - User financial context
   - Goals and stress levels
   - Life events tracking

3. **[Debts API](./api/debts.md)**
   - CRUD operations for debts
   - Bulk import from CSV
   - Validation and suggestions

4. **[Personalization API](./api/personalization.md)**
   - Dynamic microcopy
   - Next best actions
   - Contextual guidance

5. **[Recommendations API](./api/recommendations.md)**
   - Strategy recommendations
   - Confidence scoring
   - Product suggestions

6. **[Scenarios API](./api/scenarios.md)**
   - Payoff simulation
   - What-if analysis
   - Optimization

7. **[AI Services API](./api/ai-services.md)**
   - Insight generation
   - Calculation explanations
   - Q&A system

8. **[Analytics API](./api/analytics.md)**
   - Event tracking
   - User insights
   - Milestone tracking

9. **[Export API](./api/export.md)**
   - Data export (JSON, CSV, PDF)
   - Data import
   - Scenario sharing

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              User Interface Layer                     │  │
│  │  • Pages (Index, Onboarding, Dashboard, Scenarios)   │  │
│  │  • Components (Forms, Charts, Cards)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Business Logic Layer                        │  │
│  │  • DebtContext (State Management)                    │  │
│  │  • Calculation Utils                                 │  │
│  │  • Validation Logic                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Service Layer                        │  │
│  │  • mockApiService (Frontend Implementation)          │  │
│  │  • Personalization Hooks                             │  │
│  │  • Data Transformation                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Local Storage Layer                        │  │
│  │  • localStorage (Persistent Data)                    │  │
│  │  • sessionStorage (Temporary Data)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### API Implementation Status

| API | Status | Implementation |
|-----|--------|----------------|
| Sessions | ✅ Complete | Frontend localStorage |
| Profile | ✅ Complete | Frontend localStorage |
| Debts | ✅ Complete | Frontend localStorage |
| Personalization | ✅ Complete | Frontend mock service |
| Recommendations | ✅ Complete | Frontend mock service |
| Scenarios | ✅ Complete | Frontend calculations |
| AI Services | ✅ Complete | Frontend mock service |
| Analytics | ✅ Complete | Frontend sessionStorage |
| Export | ✅ Complete | Frontend file generation |

---

## Success Metrics

### Primary Metrics

1. **User Engagement**
   - **Onboarding Completion Rate**: Target 80%
   - **Average Session Duration**: Target 15+ minutes
   - **Return Rate (7 days)**: Target 40%
   - **Scenarios Created per User**: Target 3+

2. **Feature Adoption**
   - **Debt Entry Completion**: Target 90%
   - **Scenario Comparison Usage**: Target 70%
   - **What-If Analysis Usage**: Target 50%
   - **Export Feature Usage**: Target 30%

3. **User Satisfaction**
   - **Perceived Value**: Target 4.5/5 stars
   - **Recommendation Acceptance**: Target 60%
   - **Confidence in Plan**: Target 4/5 rating
   - **Stress Reduction**: Target 30% improvement

### Secondary Metrics

1. **Performance**
   - **Page Load Time**: < 2 seconds
   - **Scenario Generation Time**: < 3 seconds
   - **Time to First Interaction**: < 1 second

2. **Data Quality**
   - **Profile Completeness**: Target 85%
   - **Debt Data Accuracy**: Target 95%
   - **Validation Error Rate**: < 5%

3. **User Behavior**
   - **Average Debts per User**: 3-5
   - **Custom Scenarios Created**: 1-2 per user
   - **Questions Asked (AI)**: 2-3 per session
   - **Progress Updates**: Monthly

---

## Technical Requirements

### Frontend Architecture

**Framework:** React 18+ with TypeScript  
**State Management:** React Context API  
**Routing:** React Router v6  
**Styling:** Tailwind CSS  
**UI Components:** shadcn/ui  
**Charts:** Recharts  
**Icons:** Lucide React

### Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile**: iOS Safari 14+, Chrome Android 90+

### Performance Requirements

- **Initial Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Scenario Generation**: < 3 seconds
- **Page Transitions**: < 500ms
- **Bundle Size**: < 500KB (gzipped)

### Accessibility Requirements

- **WCAG 2.1 Level AA** compliance
- **Keyboard Navigation**: Full support
- **Screen Reader**: Compatible with NVDA, JAWS, VoiceOver
- **Color Contrast**: Minimum 4.5:1 for text
- **Focus Indicators**: Visible on all interactive elements

### Security Requirements

- **HTTPS Only**: All traffic encrypted
- **No PII Storage**: No personally identifiable information stored
- **Local Storage Only**: No server-side data storage
- **XSS Prevention**: Input sanitization
- **CSRF Protection**: Not applicable (no server)

### Data Storage

- **localStorage**: 5MB limit (sufficient for 100+ debts)
- **sessionStorage**: Temporary analytics data
- **IndexedDB**: Not required for MVP
- **Cookies**: Session token only

---

## Future Enhancements

### Phase 2 (Q3 2024)

1. **Mobile App**
   - React Native implementation
   - Native iOS and Android apps
   - Sync with web version

2. **Advanced Analytics**
   - Detailed spending insights
   - Budget tracking integration
   - Cash flow forecasting

3. **Social Features**
   - Accountability partners
   - Anonymous community support
   - Success story sharing

4. **Enhanced AI**
   - More sophisticated recommendations
   - Predictive analytics
   - Natural language processing improvements

### Phase 3 (Q4 2024)

1. **Financial Product Marketplace**
   - Consolidation loan offers
   - Balance transfer card recommendations
   - Affiliate partnerships

2. **Gamification**
   - Achievement badges
   - Leaderboards (anonymous)
   - Challenges and goals

3. **Educational Content**
   - Debt management courses
   - Financial literacy resources
   - Video tutorials

4. **Integration Capabilities**
   - Bank account linking (Plaid)
   - Credit score monitoring
   - Bill payment reminders

### Phase 4 (2025)

1. **Premium Features**
   - Advanced scenario modeling
   - Priority support
   - Custom branding for advisors

2. **B2B Offering**
   - White-label solution for financial advisors
   - Enterprise licensing
   - API access for partners

3. **International Expansion**
   - Multi-currency support
   - Localization (Spanish, French, etc.)
   - Regional debt types

---

## Appendix

### Glossary

- **APR**: Annual Percentage Rate - the yearly interest rate charged on debt
- **Avalanche Method**: Debt payoff strategy targeting highest interest rate first
- **Snowball Method**: Debt payoff strategy targeting smallest balance first
- **Minimum Payment**: The smallest amount required to pay on a debt each month
- **Principal**: The original amount borrowed, excluding interest
- **Delinquent**: A debt that is past due on payments
- **Debt-to-Income Ratio**: Total debt divided by annual income
- **Emergency Fund**: Savings set aside for unexpected expenses
- **Consolidation**: Combining multiple debts into a single loan
- **Balance Transfer**: Moving debt from one credit card to another

### References

- [API Documentation Index](./api/README.md)
- [Getting Started Guide](./api/getting-started.md)
- [Data Models Reference](./api/data-models.md)
- [Common Patterns](./api/common-patterns.md)

### Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jan 2024 | Initial PRD creation | [Author] |

---

**Document Status:** ✅ Active  
**Next Review Date:** March 2024  
**Feedback:** Please submit feedback via GitHub issues or contact the product team.