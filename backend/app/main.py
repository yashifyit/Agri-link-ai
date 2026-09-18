import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, get_db
from app.routes.api_router import router as api_router
from app.routes.ws_router import router as ws_router

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KisanLink — AgriLink AI API",
    description="Production-grade Full-Stack Agricultural Marketplace API with real-time sync, buyer matching, dynamic pricing, and escrow settlements.",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS — explicit origins only (no wildcard with credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With", "Accept"],
)

# Include REST & WebSocket Routers
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)

@app.get("/")
def root():
    return {
        "title": "KisanLink — AgriLink AI Marketplace Backend API",
        "status": "online",
        "docs": "/docs",
        "version": settings.VERSION
    }

from sqlalchemy import text

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "ok" if db_status == "healthy" else "degraded",
        "database": db_status,
        "version": settings.VERSION
    }

@app.get("/ready")
def readiness_check():
    return {"status": "ready"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
