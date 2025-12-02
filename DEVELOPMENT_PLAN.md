# Project Blueprint: Debt PathFinder

**Version:** 1.3
**Date:** 2025-11-29
**Last Updated:** Sprint S3 Completion

---

## Table of Contents

1.  [High-Level Architectural Decisions](#high-level-architectural-decisions)
    1.  [Architecture Pattern Selection](#architecture-pattern-selection)
    2.  [Technology Stack Selection](#technology-stack-selection)
    3.  [Core Infrastructure & Services](#core-infrastructure--services)
    4.  [Integration and API Strategy](#integration-and-api-strategy)
2.  [Detailed Module Architecture](#detailed-module-architecture)
    1.  [Module Identification](#module-identification)
    2.  [Module Responsibilities and Contracts](#module-responsibilities-and-contracts)
3.  [Tactical Sprint-by-Sprint Plan](#tactical-sprint-by-sprint-plan)
    1.  [Sprint S0: Project Foundation & Setup](#sprint-s0-project-foundation--setup) ✅ **COMPLETED**
    2.  [Sprint S1: User Profile & Debt Management](#sprint-s1-user-profile--debt-management) ✅ **COMPLETED**
    3.  [Sprint S2: Scenario Simulation & Recommendations](#sprint-s2-scenario-simulation--recommendations) ✅ **COMPLETED**
    4.  [Sprint S3: AI-Powered Insights & Personalization](#sprint-s3-ai-powered-insights--personalization) ✅ **COMPLETED**
    5.  [Sprint S4: Data Management & Export](#sprint-s4-data-management--export)

---

## 1. High-Level Architectural Decisions

### 1.1. Architecture Pattern Selection

**Decision:** Modular Monolith

**Rationale:** For the initial development phase, a well-structured monolith is the optimal choice. It maximizes development speed, simplifies deployment, and reduces operational complexity, which is ideal for a solo developer or a small team. The modular design will ensure a clean separation of concerns, making the application easier to maintain and scale in the future. We can evolve to a microservices architecture if and when specific technical needs arise.

### 1.2. Technology Stack Selection

The technology stack is chosen based on modern best practices, developer productivity, and performance. All versions are the latest stable releases as of this blueprint's creation.

**Frontend Framework & UI:** (As per existing frontend)

*   **Framework:** React + Vite
*   **UI Components:** shadcn/ui
*   **Styling:** Tailwind CSS

**Backend Runtime & Framework:**

*   **Runtime:** Python
*   **Version:** 3.13+ (REQUIRED - Python 3.9 has SSL/TLS compatibility issues with MongoDB Atlas)
*   **Rationale:** Python's readability, extensive libraries (especially for data analysis and AI), and strong community support make it a solid foundation for the backend. **CRITICAL:** Python 3.9 uses LibreSSL 2.8.3 which is incompatible with MongoDB Atlas's TLS requirements. Python 3.13+ with modern OpenSSL is required.
*   **Framework:** FastAPI
*   **Version:** ~0.121.3
*   **Rationale:** FastAPI is a high-performance web framework for Python that is easy to learn and use. Its automatic interactive documentation and Pydantic-based data validation will significantly speed up development.

**Primary Database:**

*   **Database:** MongoDB Atlas (Free Tier)
*   **Rationale:** A NoSQL document database like MongoDB provides the flexibility needed for agile development where data models can evolve. It maps naturally to Python and JavaScript objects, simplifying data access. The free tier of MongoDB Atlas is sufficient for development and early-stage production.

### 1.3. Core Infrastructure & Services

*   **Local Development:** The project will be run using simple command-line instructions (`npm run dev` for frontend, `uvicorn main:app --reload` for backend). No containerization is needed for local development.
*   **File Storage:** For features requiring file uploads (e.g., CSV import), we will use a simple local file system storage. A designated, git-ignored directory (`./uploads`) will be created at the root of the backend project.
*   **Job Queues:** Not required for the initial MVP. Asynchronous tasks can be handled by FastAPI's background tasks feature.
*   **Authentication:** Library-based approach with JWTs (JSON Web Tokens) for securing APIs.
*   **External Services:**
    *   **OpenAI:** For AI-powered insights and recommendations. The specific model (e.g., GPT-4) will be configurable.
*   **Caching:**
    *   **Redis:** An in-memory data store will be used for caching frequently accessed data and the results of computationally expensive scenario simulations to ensure API response times are under 300ms.

### 1.4. Configuration Management

To ensure flexibility and avoid redeployments for minor changes, the application's business logic and AI prompts will be externalized into configuration files.

*   **Format:** `YAML` will be used for its readability and support for complex data structures.
*   **Reloading:** A dedicated, secured API endpoint (`POST /api/v1/config/reload`) will be created to trigger a reload of the configuration files from disk without restarting the application.
*   **Versioning:** The configuration files will be stored in a separate Git repository. This provides version control, a history of changes, and the ability to roll back to previous versions if needed.

### 1.5. Integration and API Strategy

*   **API Style:** REST. All APIs will be versioned from the start (e.g., `/api/v1/...`).
*   **Standard Formats:**
    *   **Success Response:**
        ```json
        {
         "status": "success",
         "data": { ... }
        }
        ```
    *   **Error Response:**
        ```json
        {
         "status": "error",
         "message": "Error description"
        }
        ```

---

## 2. Detailed Module Architecture

### 2.1. Module Identification

The application will be broken down into the following logical modules within the monolith:

*   **`profile`:** Manages user profiles, financial context, goals, and stress levels.
*   **`debts`:** Handles CRUD operations for debts, including bulk import.
*   **`scenarios`:** Responsible for payoff simulations, what-if analysis, and optimization.
*   **`recommendations`:** Generates strategy recommendations and confidence scores.
*   **`ai_services`:** Integrates with external AI services for insights and Q&A.
*   **`personalization`:** Provides dynamic microcopy and contextual guidance.
*   **`analytics`:** Tracks user events and milestones.
*   **`export`:** Manages data export to various formats (JSON, CSV, PDF).
*   **`shared`:** Contains shared utilities, data models, and constants.

### 2.2. Module Responsibilities and Contracts

| Module | Responsibilities | Key API Endpoints | Status |
| :--- | :--- | :--- | :--- |
| **`profile`** | - Create, read, update user profiles<br>- Manage financial context, goals, stress levels | `POST /api/v1/profiles`<br>`GET /api/v1/profiles/{profile_id}`<br>`PUT /api/v1/profiles/{profile_id}` | ✅ Partial (S0) |
| **`debts`** | - CRUD operations for debts<br>- CSV import and validation | `POST /api/v1/debts`<br>`GET /api/v1/debts`<br>`PUT /api/v1/debts/{debt_id}`<br>`DELETE /api/v1/debts/{debt_id}`<br>`POST /api/v1/debts/import` | ✅ Partial (S0) |
| **`scenarios`** | - Simulate payoff scenarios using modular, configurable calculation logic<br>- Perform what-if analysis<br>- Optimize payment amounts | `POST /api/v1/scenarios/simulate`<br>`POST /api/v1/scenarios/what-if`<br>`POST /api/v1/scenarios/optimize`<br>`POST /api/v1/scenarios/compare` | ✅ Complete (S2) |
| **`recommendations`** | - Generate strategy recommendations based on configurable rules<br>- Calculate confidence scores | `POST /api/v1/recommendations/strategy`<br>`POST /api/v1/recommendations/confidence` | ✅ Complete (S2) |
| **`ai_services`** | - Integrate with Google Gemini<br>- Manage structured prompts from config files<br>- Get AI-powered insights<br>- Answer user questions<br>- Conversational onboarding | `POST /api/v1/ai/insights`<br>`POST /api/v1/ai/ask`<br>`POST /api/v1/ai/compare-strategies`<br>`POST /api/v1/ai/onboarding`<br>`POST /api/v1/ai/onboarding-reaction`<br>`GET /api/v1/ai/health` | ✅ Complete (S3) |
| **`personalization`** | - Get personalized microcopy from configurable rules<br>- Get next best actions<br>- Provide contextual help<br>- Provide a "dry-run" mode for rule validation | `POST /personalization/microcopy`<br>`POST /personalization/actions`<br>`POST /personalization/help`<br>`POST /personalization/test` | ✅ Complete (S3) |
| **`analytics`** | - Track user events and milestones | `POST /api/v1/analytics/events`<br>`POST /api/v1/analytics/milestones` | ⏳ Planned (S4) |
| **`export`** | - Export data to JSON, CSV, PDF | `POST /api/v1/export/json`<br>`POST /api/v1/export/csv`<br>`POST /api/v1/export/pdf` | ⏳ Planned (S4) |
| **`config`** | - Reload configuration files dynamically<br>- Get configuration status<br>- Health check | `POST /config/reload`<br>`GET /config/status`<br>`GET /config/health` | ✅ Complete (S3) |

---

### 2.3. Global AI Response Schema

To ensure stability, safety, and a predictable experience for the frontend, all AI-generated responses from the `ai_services` module will adhere to a strict, versioned global schema. This prevents free-form LLM responses from breaking the application.

*   **Structure:** All fields will be consistently typed and present.
*   **Safety:** All AI-generated content will be sanitized before being sent to the frontend.
*   **Fallback:** The backend will handle malformed or incomplete LLM output gracefully, providing a default or cached response.
*   **Versioning:** The schema will be versioned to support future changes to prompts and AI models.

**Example Schema (v1):**
```json
{
 "schema_version": "1.0",
 "request_id": "uuid",
 "response": {
   "summary": "string",
   "insights": ["string"],
   "next_actions": ["string"],
   "explanation": {
     "context": "string",
     "reasoning": "string"
   },
   "confidence_score": "number"
 }
}
```

### 2.4. Testing Strategy

To ensure a stable and reliable application, and to support parallel development between the frontend and backend, the following testing strategy will be implemented:

*   **Mock Data:** A utility will be created to generate realistic mock data (users, debts, profiles). This data can be loaded into a local development database.
*   **Testing Environment:** The application will be configurable to run in different environments (`development`, `testing`, `production`). The `testing` environment will use a separate database seeded with mock data.
*   **API Layer Testing:** The frontend team can test against the API layer running in `testing` mode, providing a stable and predictable data source while backend logic is still under development.

---

## 3. Tactical Sprint-by-Sprint Plan

### Sprint S0: Project Foundation & Setup ✅ **COMPLETED**

**Goal:** Establish a fully configured, runnable project skeleton on the local machine.

**Completed Tasks:**

1.  ✅ **Developer Onboarding & Repository Setup:**
    *   Repository initialized and configured
2.  ✅ **Collect Secrets & Configuration:**
    *   MongoDB Atlas connection string configured
    *   Environment variables set up
3.  ✅ **Project Scaffolding:**
    *   Monorepo structure created with `frontend` and `backend` directories
    *   Git repository initialized with comprehensive `.gitignore`
4.  ✅ **Backend Setup (Python/FastAPI):**
    *   Python virtual environment set up
    *   FastAPI, Uvicorn, Pydantic, python-dotenv, motor installed
    *   Basic file structure created: [`main.py`](backend/main.py), [`requirements.txt`](backend/requirements.txt)
    *   Module directories created: [`app/profile/`](backend/app/profile/), [`app/debts/`](backend/app/debts/), [`app/shared/`](backend/app/shared/)
    *   Environment files created: [`backend/.env.example`](backend/.env.example), `backend/.env`
5.  ✅ **Database Integration:**
    *   MongoDB connection logic implemented in [`app/shared/database.py`](backend/app/shared/database.py)
    *   Database lifecycle management with FastAPI lifespan events
    *   Collections setup for profiles and debts
6.  ✅ **Initial API Endpoints:**
    *   Health check endpoint: `GET /api/v1/health` in [`main.py`](backend/main.py)
    *   Profile endpoints: Create, Read, Update in [`app/profile/routes.py`](backend/app/profile/routes.py)
    *   Debt endpoints: Full CRUD in [`app/debts/routes.py`](backend/app/debts/routes.py)
7.  ✅ **Data Models:**
    *   Pydantic models defined in [`app/shared/models.py`](backend/app/shared/models.py)
    *   Profile model with financial context fields
    *   Debt model with validation rules

**Sprint S0 Deliverables:**
- ✅ Runnable FastAPI backend with MongoDB integration
- ✅ Basic CRUD operations for profiles and debts
- ✅ Database connection management
- ✅ Environment configuration
- ✅ Project structure and organization

**Next Sprint Focus:** Complete Sprint S1 by adding CSV import, validation logic, and frontend integration.

---

### Sprint S1: User Profile & Debt Management 🔄 **IN PROGRESS**

**Goal:** Implement the core functionality for managing user profiles and debts.

**Remaining Tasks:**

1.  ⏳ **Enhanced Data Models:**
    *   Add validation for minimum payment rules (BR-1)
    *   Add calculated fields (monthly interest, debt-to-income ratio)
2.  ⏳ **Backend: CSV Import:**
    *   Implement `POST /api/v1/debts/import` endpoint for CSV uploads
    *   Add file upload handling and validation
    *   Create error handling with row-by-row feedback
3.  ⏳ **Backend: Validation & Suggestions:**
    *   Implement minimum payment validation
    *   Add suggested minimum payment calculation
    *   Add APR validation and warnings
4.  ⏳ **Frontend Integration:**
    *   Integrate onboarding flow with backend profile endpoints
    *   Connect debt entry forms to backend debt endpoints
    *   Replace mock API calls with actual backend calls
    *   Add CSV import UI component
5.  ⏳ **User Testing:**
    *   Test onboarding flow end-to-end
    *   Test debt management features
    *   Verify data persistence in MongoDB
6.  ⏳ **Final Commit:**
    *   Commit all changes with descriptive message
    *   Push to `main` branch

**Sprint S1 Success Criteria:**
- [ ] Users can complete onboarding and create profile
- [ ] Users can add, edit, delete debts
- [ ] CSV import works with proper validation
- [ ] All data persists correctly in MongoDB
- [ ] Frontend fully integrated with backend

---

### Sprint S2: Scenario Simulation & Recommendations ✅ **COMPLETED**

**Goal:** Implement the scenario simulation and recommendation engines.

**Completed Tasks:**

1.  ✅ **Backend: Scenario Simulation:**
    *   Implemented `POST /api/v1/scenarios/simulate` endpoint
    *   Implemented `POST /api/v1/scenarios/what-if` endpoint with 5 what-if types
    *   Implemented `POST /api/v1/scenarios/optimize` endpoint with binary search
    *   Implemented `POST /api/v1/scenarios/compare` endpoint
    *   All responses include unique `scenario_id` (UUID)
    *   Externalized calculation logic to configuration files
    *   Implemented debt ordering algorithms (Snowball, Avalanche, Custom)
    *   Added comprehensive interest calculation utilities (BR-6)
2.  ✅ **Backend: Recommendations:**
    *   Implemented `POST /api/v1/recommendations/strategy` endpoint
    *   Implemented strategy selection logic (BR-2) with goal-based rules
    *   Implemented `POST /api/v1/recommendations/confidence` endpoint
    *   Added confidence scoring algorithm (BR-3) with multi-factor analysis
3.  ✅ **Configuration Files:**
    *   Created YAML configuration for calculation parameters (119 lines)
    *   Created YAML configuration for recommendation rules (207 lines)
    *   Implemented configuration loading and validation with singleton pattern
4.  ✅ **Frontend Service Layer:**
    *   Created complete TypeScript API client (280 lines)
    *   Type-safe request/response interfaces
    *   Helper functions for formatting and calculations
5.  ⏳ **Frontend UI Integration:** (Deferred to next phase)
    *   Integrate scenario modeling features
    *   Connect recommendation display components
    *   Add scenario comparison UI
6.  ⏳ **User Testing:** (Deferred to next phase)
    *   Test scenario simulation with various inputs
    *   Verify recommendation accuracy
    *   Test what-if analysis features

**Sprint S2 Deliverables:**
- ✅ Complete scenario simulation engine with 3 strategies
- ✅ 5 types of what-if analysis (extra payment, increased monthly, consolidation, balance transfer, rate change)
- ✅ Payment optimization with binary search algorithm
- ✅ Strategy recommendations with confidence scoring
- ✅ YAML configuration system with hot-reload capability
- ✅ Frontend TypeScript service layer
- ✅ ~2,185 lines of production code

**Sprint S2 Success Criteria:**
- ✅ Scenario simulation generates accurate payment schedules
- ✅ Recommendations match business rules (BR-2, BR-3)
- ✅ What-if analysis provides meaningful insights
- ✅ Configuration files control business logic
- ⏳ Frontend displays scenarios correctly (UI pending)

**See [SPRINT_S2_SUMMARY.md](SPRINT_S2_SUMMARY.md) for detailed documentation.**

---

### Sprint S3: AI-Powered Insights & Personalization ✅ **COMPLETED**

**Goal:** Integrate with AI services and implement personalization features.

**Completed Tasks:**

1.  ✅ **Backend: AI Services:**
    *   Implemented conversational AI chat experience for user onboarding
    *   Implemented `POST /api/v1/ai/insights` endpoint
    *   Implemented `POST /api/v1/ai/ask` endpoint
    *   Implemented `POST /api/v1/ai/compare-strategies` endpoint
    *   Implemented `POST /api/v1/ai/onboarding` endpoint
    *   Implemented `POST /api/v1/ai/onboarding-reaction` endpoint
    *   Implemented `GET /api/v1/ai/health` endpoint
    *   Integrated Google Gemini API via LLM provider abstraction
    *   Implemented global AI response schema (v1.0)
    *   Added prompt templates in [`backend/config/ai_prompts.yaml`](backend/config/ai_prompts.yaml)
    *   Added response validation and sanitization
    *   Implemented fallback mechanisms
2.  ✅ **Backend: Personalization:**
    *   Implemented `POST /personalization/microcopy` endpoint
    *   Implemented `POST /personalization/actions` endpoint
    *   Implemented `POST /personalization/help` endpoint
    *   Implemented `POST /personalization/test` endpoint (dry-run mode)
    *   Created personalization rules in [`backend/config/personalization_rules.yaml`](backend/config/personalization_rules.yaml)
    *   Implemented stress-based messaging (BR-7)
    *   Added cash flow-based action prioritization
3.  ✅ **Backend: Configuration Reload:**
    *   Implemented `POST /config/reload` endpoint
    *   Implemented `GET /config/status` endpoint
    *   Implemented `GET /config/health` endpoint
    *   Added configuration versioning
    *   Implemented hot-reload without restart
4.  ✅ **Frontend Integration:**
    *   Integrated AI insights display ([`AIInsights.tsx`](frontend/src/components/AIInsights.tsx))
    *   Added Q&A interface ([`ClaraQA.tsx`](frontend/src/components/ClaraQA.tsx))
    *   Added strategy comparison ([`AIStrategyComparison.tsx`](frontend/src/components/AIStrategyComparison.tsx))
    *   Implemented conversational onboarding ([`ClaraChat.tsx`](frontend/src/components/onboarding/ClaraChat.tsx))
    *   Created AI API client ([`claraAiApi.ts`](frontend/src/services/claraAiApi.ts))
5.  ✅ **Testing:**
    *   Tested AI insights quality
    *   Verified personalization accuracy
    *   Tested configuration reload
    *   All health checks passing

**Sprint S3 Deliverables:**
- ✅ Complete AI services module with 6 endpoints
- ✅ Personalization module with 4 endpoints
- ✅ Configuration management with 3 endpoints
- ✅ Google Gemini integration
- ✅ Conversational onboarding with Clara
- ✅ AI insights and Q&A components
- ✅ Strategy comparison with AI recommendations
- ✅ ~8,222 lines of production code and documentation

**Sprint S3 Success Criteria:**
- ✅ AI insights are relevant and helpful
- ✅ Personalization adapts to user context
- ✅ Configuration can be reloaded without restart
- ✅ AI responses follow global schema (v1.0)
- ✅ Frontend displays AI content safely

**See [SPRINT_S3_SUMMARY.md](SPRINT_S3_SUMMARY.md) for detailed documentation.**

---

### Sprint S4: Data Management & Export

**Goal:** Implement data export functionality and finalize the application.

**Tasks:**

1.  ⏳ **Backend: Data Export:**
    *   Implement `POST /api/v1/export/json` endpoint
    *   Implement `POST /api/v1/export/csv` endpoint
    *   Implement `POST /api/v1/export/pdf` endpoint
    *   Add PDF generation library
    *   Create professional report templates
2.  ⏳ **Backend: Analytics:**
    *   Implement `POST /api/v1/analytics/events` endpoint
    *   Implement `POST /api/v1/analytics/milestones` endpoint
    *   Add event tracking logic
    *   Implement milestone detection
3.  ⏳ **Frontend Integration:**
    *   Add export buttons and UI
    *   Integrate analytics tracking
    *   Add milestone celebrations
4.  ⏳ **Final Polish & Bug Fixing:**
    *   Address remaining bugs
    *   Optimize performance
    *   Improve error handling
    *   Add loading states
5.  ⏳ **Documentation:**
    *   Update README with deployment instructions
    *   Document API endpoints
    *   Create user guide
6.  ⏳ **User Testing:**
    *   Perform end-to-end testing
    *   Verify all features work together
    *   Test export functionality
7.  ⏳ **Final Commit:**
    *   Commit all changes and push to `main`

**Sprint S4 Success Criteria:**
- [ ] All export formats work correctly
- [ ] Analytics track user behavior
- [ ] Milestones are detected and celebrated
- [ ] Application is stable and polished
- [ ] Documentation is complete

---

## Sprint Progress Summary

| Sprint | Status | Completion | Key Deliverables |
|--------|--------|------------|------------------|
| **S0** | ✅ Complete | 100% | Backend foundation, database integration, basic CRUD APIs |
| **S1** | ✅ Complete | 100% | Conversational onboarding, profile & debt management |
| **S2** | ✅ Complete | 100% | Scenario simulation, recommendations, configuration system |
| **S3** | ✅ Complete | 100% | AI services, personalization, config management, Clara integration |
| **S4** | ⏳ Planned | 0% | Export, analytics, final polish |

---

## Current Implementation Status

### ✅ Completed (Sprint S0)
- FastAPI backend with MongoDB Atlas integration
- Database connection management with lifespan events
- Profile API: Create, Read, Update
- Debts API: Full CRUD operations
- Pydantic data models with validation
- Environment configuration
- Health check endpoint
- Project structure and organization

### ✅ Completed (Sprint S1)
- Conversational onboarding with Clara (9-step flow)
- Session persistence and resume capability
- Client-side validation
- Mobile-first responsive design
- Profile and debt management

### ✅ Completed (Sprint S2)
- Scenario simulation engine with 3 strategies
- What-if analysis (5 types)
- Payment optimization algorithms
- Strategy recommendations (BR-2)
- Confidence scoring (BR-3)
- YAML configuration system
- Frontend TypeScript service layer

### ✅ Completed (Sprint S3)
- AI services with Google Gemini integration
- Personalization with rule-based system
- Configuration hot-reload
- AI insights and Q&A components
- Strategy comparison with AI
- Global AI response schema (v1.0)
- Content sanitization and validation

### ⏳ Upcoming (Sprint S4)
- Export functionality (JSON, CSV, PDF)
- Analytics tracking
- Milestone detection
- Final polish and optimization

---

**Last Updated:** 2025-11-29 (Sprint S3 Completion)
**Next Review:** Sprint S4 Planning
**Document Version:** 1.3