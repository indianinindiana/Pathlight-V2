from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.profile.routes import router as profile_router
from app.debts.routes import router as debts_router
from app.scenarios.routes import router as scenarios_router
from app.recommendations.routes import router as recommendations_router
from app.ai_services.routes import router as ai_services_router
from app.personalization.routes import router as personalization_router
from app.config.routes import router as config_router
from app.export.routes import router as export_router
from app.analytics.routes import router as analytics_router
from app.shared.database import Database
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to database
    await Database.connect_db()
    yield
    # Shutdown: Close database connection
    await Database.close_db()

app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5137",
        "http://localhost:3000",
        "http://localhost:32100"
    ],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, PATCH, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(profile_router)
app.include_router(debts_router)
app.include_router(scenarios_router)
app.include_router(recommendations_router)
app.include_router(ai_services_router)
app.include_router(personalization_router)
app.include_router(config_router)
app.include_router(export_router)
app.include_router(analytics_router)

@app.get("/api/v1/health")
def read_root():
    return {"status": "ok"}