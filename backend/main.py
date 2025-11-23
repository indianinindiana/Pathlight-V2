from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.profile.routes import router as profile_router
from app.debts.routes import router as debts_router
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

@app.get("/api/v1/health")
def read_root():
    return {"status": "ok"}