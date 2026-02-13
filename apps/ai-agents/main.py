from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from routers import ldr, bdr, sdr, ae
import uvicorn
from middleware.context import ContextMiddleware
from middleware.auth import AuthMiddleware
from utils.logger import logger
import os
import redis
import psycopg2
import sentry_sdk

# Initialize Sentry if configured
if os.getenv("SENTRY_DSN"):
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
        environment=os.getenv("NODE_ENV", "development"),
    )

app = FastAPI(
    title="SalesOS AI Agents",
    description="Microserviço de Inteligência Artificial para Automação de Vendas",
    version="1.0.0"
)

# Inclusão dos roteadores de domínio
app.include_router(ldr.router, prefix="/api/v1", tags=["LDR - Market Intelligence"])
app.include_router(bdr.router, prefix="/api/v1", tags=["BDR - Outbound"])
app.include_router(sdr.router, prefix="/api/v1", tags=["SDR - Inbound"])
app.include_router(ae.router, prefix="/api/v1", tags=["AE - Closing"])

# Middleware Stack (Execution Order: Bottom to Top of this block, i.e., Last added runs first)

# 3. Auth Middleware (Runs 3rd - Validates Token)
app.add_middleware(AuthMiddleware)

# 2. Context Middleware (Runs 2nd - Sets Request ID, etc.)
app.add_middleware(ContextMiddleware)

# 1. CORS Middleware (Runs 1st - Handles Cross-Origin & Preflight)
cors_env = os.getenv("CORS_ALLOWED_ORIGINS")
if not cors_env or cors_env.strip() == "":
    logger.error("CORS_ALLOWED_ORIGINS not set! Blocking all cross-origin requests for security.")
    allowed_origins = [] # Fail closed
else:
    allowed_origins = [origin.strip() for origin in cors_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Adiciona middleware de compressão (Gzip)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Adiciona middleware de contexto e observabilidade
app.add_middleware(ContextMiddleware)

# Inclusão dos roteadores de domínio
app.include_router(ldr.router, prefix="/api/v1", tags=["LDR - Market Intelligence"])
app.include_router(bdr.router, prefix="/api/v1", tags=["BDR - Outbound"])
app.include_router(sdr.router, prefix="/api/v1", tags=["SDR - Inbound"])
app.include_router(ae.router, prefix="/api/v1", tags=["AE - Closing"])

@app.get("/health", status_code=200)
def health_check():
    logger.info("Health check requested")
    return {"status": "operational", "service": "ai-agents-core"}

@app.get("/ready", status_code=200)
def readiness_check(response: Response):
    health = {
        "status": "ready",
        "services": {
            "database": "unknown",
            "redis": "unknown"
        }
    }

    # Check Redis
    try:
        r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
        r.ping()
        health["services"]["redis"] = "connected"
    except Exception as e:
        logger.error(f"Redis check failed: {e}")
        health["services"]["redis"] = "disconnected"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    # Check Database
    try:
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            raise ValueError("DATABASE_URL not set")
        conn = psycopg2.connect(db_url)
        conn.close()
        health["services"]["database"] = "connected"
    except Exception as e:
        logger.error(f"Database check failed: {e}")
        health["services"]["database"] = "disconnected"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    if response.status_code == 503:
        health["status"] = "not_ready"

    return health

if __name__ == "__main__":
    logger.info("Starting AI Agents Service...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
