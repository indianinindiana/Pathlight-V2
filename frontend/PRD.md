---
title: Product Requirements Document
app: wise-okapi-flit
created: 2025-11-18T00:57:45.342Z
version: 1
source: Deep Mode PRD Generation
---

# PRODUCT REQUIREMENTS DOCUMENT

## EXECUTIVE SUMMARY

**Product Vision:** Debt PathFinder empowers consumers to understand and optimize their debt repayment through simple data entry, visual modeling, and AI-guided insights that build confidence and clarity.

**Core Purpose:** Solve the overwhelming confusion consumers face when managing multiple debts by providing instant clarity on their debt picture, personalized payoff strategies aligned with their goals, transparent explanations they can trust, and guided scenario exploration to find realistic solutions.

**Target Users:** U.S. consumers with mixed debts (credit cards, personal loans, student loans, auto loans) who feel overwhelmed and need clear guidance on debt repayment strategies.

**Key Features:**
- Debt Data Collection & Management (User-Generated Content)
- Debt Payoff Scenario Modeling (User-selection from pre-configured options)
- AI-Powered Contextual Guidance (System/Configuration)
- Product Recommendation Engine (System/Configuration)
- Interactive Visualizations (System/Configuration)

**Complexity Assessment:** Moderate
- **State Management:** Local (session-based, no persistence)
- **External Integrations:** 1 (Gemini AI via Vertex AI - reduces complexity)
- **Business Logic:** Moderate (financial calculations, recommendation engine, scenario modeling)
- **Data Synchronization:** None (single-session application)

**MVP Success Metrics:**
- Users can complete full debt entry and view payoff projections
- System generates accurate payoff calculations within ±2% of expected schedules
- AI contextual guidance activates appropriately based on user actions
- Recommendation engine successfully evaluates and presents product options
- Application handles concurrent users without performance degradation

## 1. USERS & PERSONAS

**Primary Persona:**
- **Name:** Sarah Martinez
- **Context:** 34-year-old professional with $27,000 in mixed debt across 4 credit cards, 1 personal loan, and student loans. Feels overwhelmed and doesn't know where to start.
- **Goals:** 
  - Understand total debt picture clearly
  - Find the best payoff strategy for her situation
  - Explore realistic options without judgment
  - Build confidence in her repayment plan
- **Needs:** 
  - Simple way to enter all debt information
  - Visual representation of debt composition
  - Clear explanations of financial terms and calculations
  - Ability to view product recommendations and their potential impact on debt payoff
  - Ability to test different scenarios
  - Trustworthy, non-judgmental guidance

**Secondary Personas:**
- **Internal Teams:** Product, design, and data teams exploring AI-guided financial modeling experiences

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 User-Requested Features (All are Priority 0)

**FR-001: Debt Data Collection & Management - COMPLETE VERSION**
- **Description:** Users can enter, view, edit, and manage their debt information through manual entry or CSV upload, including debt type, balance, APR, minimum payment, and next payment date
- **Entity Type:** User-Generated Content with pre-defined values for debt type and calendar selection for next payment date. 
- **User Benefit:** Creates immediate clarity on total debt picture and enables accurate payoff modeling
- **Primary User:** Primary Persona (debt holders)
- **Lifecycle Operations:**
  - **Create:** Users manually enter individual debt tradelines via form OR upload CSV file with structured template
  - **View:** Users see all entered debts in a list view with key details (type, balance, APR, minimum payment) and aggregated summary dashboard
  - **Edit:** Users can modify any debt tradeline details (balance, APR, minimum payment, next payment date) through inline editing or form
  - **Delete:** Users can remove individual debt tradelines from their session
  - **List/Search:** Users can view all debts in a list, filter by debt type, sort by balance/APR/payment
  - **Additional:** 
    - Bulk upload via CSV template
    - Validation and error handling for data entry
    - Demo dataset option for exploration
    - Calibration loop for data verification
- **Acceptance Criteria:**
  - [ ] Given user is on debt entry screen, when they fill out debt form with type/balance/APR/minimum payment, then debt is added to their session
  - [ ] Given user has CSV file in correct format, when they upload it, then all debts are parsed and added with validation
  - [ ] Given user has entered debts, when they view debt dashboard, then they see complete list with all details
  - [ ] Given user wants to correct information, when they click edit on a debt, then they can modify all fields and save changes
  - [ ] Given user wants to remove a debt, when they click delete with confirmation, then debt is removed from session
  - [ ] Users can search/filter their debts by type (credit card, personal loan, student loan, auto)
  - [ ] Users can sort debts by balance, APR, or minimum payment
  - [ ] System validates minimum payment is reasonable for given balance and APR
  - [ ] System provides inline validation feedback during data entry
  - [ ] CSV upload handles errors gracefully with clear error messages

**FR-002: Financial Context Collection - COMPLETE VERSION**
- **Description:** Users can enter, view, and edit their financial context including income, expenses, savings, credit score range, repayment goal, and time horizon preferences
- **Entity Type:** User-Generated Content
- **User Benefit:** Enables personalized payoff modeling and recommendations aligned with user's specific financial situation and goals
- **Primary User:** Primary Persona
- **Lifecycle Operations:**
  - **Create:** Users enter financial information during onboarding flow
  - **View:** Users can review their entered financial context in profile/settings area
  - **Edit:** Users can update any financial information to recalculate scenarios
  - **Delete:** Not applicable (required for modeling)
  - **List/Search:** Not applicable (single record per session)
  - **Additional:** Validation for reasonable ranges, goal selection from predefined options
- **Acceptance Criteria:**
  - [ ] Given user is onboarding, when they enter monthly take-home income, then system validates it's a positive number
  - [ ] Given user enters monthly expenses, when they save, then system calculates available budget for debt payment
  - [ ] Given user enters liquid savings amount, when saved, then system can factor this into recommendations
  - [ ] Given user selects credit score range, when saved, then system uses this for product eligibility
  - [ ] Given user selects primary goal (lower payment/pay off faster/reduce interest/avoid default), when saved, then system prioritizes recommendations accordingly
  - [ ] Users can edit any financial context field and trigger recalculation of scenarios
  - [ ] System validates that expenses don't exceed income
  - [ ] System provides helpful prompts for each field

**FR-003: Debt Payoff Scenario Modeling - COMPLETE VERSION**
- **Description:** Users can generate, view, compare, and adjust multiple debt payoff scenarios using different strategies (Snowball, Avalanche, Custom) with adjustable monthly budget
- **Entity Type:** User-Generated Content (scenarios created by user choices)
- **User Benefit:** Enables users to understand which payoff strategy best aligns with their goals and see concrete timelines and savings
- **Primary User:** Primary Persona
- **Lifecycle Operations:**
  - **Create:** Users select payoff strategy and system generates complete payoff projection
  - **View:** Users see detailed payoff timeline, total interest, payoff date, and monthly breakdown
  - **Edit:** Users can adjust monthly payment budget and see recalculated projections
  - **Delete:** Users can clear scenarios and start over
  - **List/Search:** Users can compare multiple scenarios side-by-side
  - **Additional:** 
    - Save multiple scenarios for comparison
    - Export scenario details
    - Calibration loop for verification
- **Acceptance Criteria:**
  - [ ] Given user has entered debts, when they select Snowball strategy, then system generates payoff schedule prioritizing smallest balances first
  - [ ] Given user has entered debts, when they select Avalanche strategy, then system generates payoff schedule prioritizing highest APR first
  - [ ] Given user has entered debts, when they select Custom strategy, then they can manually order debt payoff priority
  - [ ] Given user views a scenario, when they see payoff projection, then it shows total payoff time, total interest paid, and monthly payment breakdown
  - [ ] Given user wants to adjust budget, when they change monthly payment amount, then system recalculates entire payoff schedule
  - [ ] Users can compare multiple scenarios side-by-side with visual differences highlighted
  - [ ] System validates payoff calculations are within ±2% accuracy
  - [ ] Users can clear all scenarios and start fresh modeling
  - [ ] Calibration prompt asks "Do these numbers look right?" after initial projection

**FR-004: "What If?" Scenario Exploration - COMPLETE VERSION**
- **Description:** Users can create, view, and compare templated scenario variations including paying extra, consolidation, settlement, and balance transfers
- **Entity Type:** User-Generated Content
- **User Benefit:** Empowers users to explore realistic options and understand trade-offs without complex manual calculations
- **Primary User:** Primary Persona
- **Lifecycle Operations:**
  - **Create:** Users select from predefined "What If?" templates and system generates modified scenario
  - **View:** Users see side-by-side comparison of original vs. "What If?" scenario with key differences highlighted
  - **Edit:** Users can adjust parameters within "What If?" template (e.g., extra payment amount)
  - **Delete:** Users can remove "What If?" scenarios from comparison
  - **List/Search:** Users can view all active "What If?" scenarios in comparison view
  - **Additional:** Quick recalculation, visual delta indicators
- **Acceptance Criteria:**
  - [ ] Given user is viewing base scenario, when they select "Pay $X more per month", then system generates new projection with adjusted timeline and savings
  - [ ] Given user has multiple debts, when they select "Consolidate debts X, Y, Z", then system models single consolidated loan scenario
  - [ ] Given user is exploring options, when they select "Explore debt settlement", then system shows settlement scenario with trade-offs
  - [ ] Given user has credit card debt, when they select "Balance transfer", then system models transfer scenario with promotional rate
  - [ ] Given user creates "What If?" scenario, when they view it, then they see clear comparison showing time saved, interest saved, and payment changes
  - [ ] Users can adjust parameters within each "What If?" template
  - [ ] Users can remove individual "What If?" scenarios from comparison
  - [ ] System recalculates "What If?" scenarios in under 2 seconds
  - [ ] Visual indicators clearly show improvements (green) vs. trade-offs (yellow/red)

**FR-005: AI-Powered Contextual Guidance - COMPLETE VERSION**
- **Description:** Users can receive and interact with AI-generated explanations, summaries, and clarifications that activate contextually based on user actions or on-demand via "Explain This" button
- **Entity Type:** System/Configuration
- **User Benefit:** Builds trust and understanding through transparent, timely explanations without overwhelming users
- **Primary User:** Primary Persona
- **Lifecycle Operations:**
  - **Create:** System automatically generates contextual AI guidance based on user actions and context
  - **View:** Users see AI explanations inline, in modals, or in dedicated help panel
  - **Edit:** Not applicable (AI generates fresh responses)
  - **Delete:** Users can dismiss AI guidance messages
  - **List/Search:** Users can access history of AI explanations in session
  - **Additional:** 
    - On-demand "Explain This" button on key UI elements
    - Predefined question list for common queries
    - Rating mechanism for AI helpfulness
- **Acceptance Criteria:**
  - [ ] Given user completes debt entry, when all debts are entered, then AI provides personalized summary of debt situation
  - [ ] Given user enters data that appears inconsistent, when system detects anomaly, then AI suggests corrections
  - [ ] Given user views recommendation, when they click "Explain This", then AI explains why recommendation was made and trade-offs
  - [ ] Given user views payoff projection, when they click "Explain This" on timeline, then AI explains how payoff date was calculated
  - [ ] Given user is exploring scenarios, when they pause on a chart, then contextual AI tip appears explaining the data
  - [ ] Users can click "Explain This" button on any key metric or recommendation
  - [ ] Users can select from predefined list of common questions
  - [ ] Users can rate AI explanations as helpful/not helpful
  - [ ] AI responses appear within 3 seconds of trigger
  - [ ] AI tone is empathetic, supportive, and factual (never prescriptive or judgmental)
  - [ ] At least 70% of users interact with AI guidance and rate it helpful

**FR-006: Product Recommendation Engine - COMPLETE VERSION**
- **Description:** System generates, displays, and explains personalized product recommendations (consolidation loans, settlement options, balance transfers) based on user's debt profile and configurable business rules
- **Entity Type:** System/Configuration
- **User Benefit:** Provides relevant, actionable options without requiring users to research products themselves
- **Primary User:** Primary Persona
- **Lifecycle Operations:**
  - **Create:** System automatically generates recommendations based on debt profile and rules engine
  - **View:** Users see recommendations with key details (new APR, payment change, interest savings, payoff time change, fit score)
  - **Edit:** Not applicable (system-generated based on rules)
  - **Delete:** Users can dismiss recommendations they're not interested in
  - **List/Search:** Users can filter recommendations by type or fit score
  - **Additional:** 
    - Configurable rules via JSON/YAML
    - Fit score calculation (low/medium/high)
    - Detailed comparison view
- **Acceptance Criteria:**
  - [ ] Given user has entered debts, when system evaluates eligibility, then it generates appropriate product recommendations
  - [ ] Given user views recommendations, when they see a product, then they see new APR, monthly payment change, interest savings, payoff time change, and fit score
  - [ ] Given user wants to understand recommendation, when they click for details, then they see eligibility criteria and trade-offs
  - [ ] Given recommendation is generated, when user's credit score is in eligible range, then recommendation shows as "high fit"
  - [ ] Given user has high-APR credit card debt, when consolidation loan is available, then system recommends it with savings calculation
  - [ ] Users can filter recommendations by product type (consolidation, settlement, balance transfer)
  - [ ] Users can sort recommendations by fit score or potential savings
  - [ ] Users can dismiss recommendations they're not interested in
  - [ ] System evaluates recommendations in under 10 seconds
  - [ ] Business rules (min APR, min balance, credit score ranges, eligible debt types) are configurable via JSON/YAML
  - [ ] At least 3 product categories are configured via parameters

**FR-007: Interactive Visualizations - COMPLETE VERSION**
- **Description:** Users can view and interact with visual representations of their debt data, payoff timelines, interest costs, and scenario comparisons
- **Entity Type:** System/Configuration
- **User Benefit:** Makes complex financial data immediately understandable and enables quick comparison of options
- **Primary User:** Primary Persona
- **Lifecycle Operations:**
  - **Create:** System automatically generates visualizations from user's debt data
  - **View:** Users see interactive charts and graphs throughout the application
  - **Edit:** Not applicable (visualizations update automatically with data changes)
  - **Delete:** Not applicable (always displayed with data)
  - **List/Search:** Not applicable (visualizations are views of data)
  - **Additional:** 
    - Interactive tooltips
    - Zoom and pan capabilities
    - Export as images
    - Responsive design for mobile
- **Acceptance Criteria:**
  - [ ] Given user has entered debts, when they view dashboard, then they see pie chart of debt composition by type
  - [ ] Given user has entered debts, when they view dashboard, then they see bar chart of balances by account
  - [ ] Given user generates payoff scenario, when they view timeline, then they see line chart showing balance reduction over time
  - [ ] Given user compares scenarios, when they view comparison, then they see bar chart of total interest paid for each scenario
  - [ ] Given user hovers over chart element, when tooltip appears, then it shows detailed data for that point
  - [ ] Users can interact with charts (hover, click for details)
  - [ ] Charts are responsive and work well on mobile devices
  - [ ] Visual deltas clearly show differences between scenarios
  - [ ] Charts load and render in under 2 seconds

**FR-008: Session Summary & Export - COMPLETE VERSION**
- **Description:** Users can view a comprehensive summary of their debt analysis session and export it as a PDF for offline reference
- **Entity Type:** User-Generated Content
- **User Benefit:** Provides actionable next steps and allows users to save their analysis for future reference
- **Primary User:** Primary Persona
- **Lifecycle Operations:**
  - **Create:** System generates summary based on user's session data and choices
  - **View:** Users see AI-generated summary with recommended next steps
  - **Edit:** Not applicable (summary reflects session state)
  - **Delete:** Not applicable (session-based)
  - **List/Search:** Not applicable (single summary per session)
  - **Additional:** 
    - PDF export with all key data
    - Confidence-building messaging
    - Clear next action items
- **Acceptance Criteria:**
  - [ ] Given user completes debt