import os
import uvicorn
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
allowed_origins_str = os.environ.get("ALLOWED_ORIGINS", "")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(',') if origin.strip()]

# Fallback to default origins if the environment variable is not set
if not allowed_origins:
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:5137",
        "http://localhost:3000",
        "http://localhost:32100",
        "https://pathlight-v2-frontend.onrender.com"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )