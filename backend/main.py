"""
Cube Trade — Backend API Server
FastAPI application with CORS, routers, and WebSocket support.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import data, portfolio, chat, brief, admin, charts


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager."""
    print("🚀 Cube Trade Backend starting...")
    yield
    print("👋 Cube Trade Backend shutting down...")


app = FastAPI(
    title="Cube Trade API",
    description="Enterprise-grade quantitative analysis & AI-powered market intelligence API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — Allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(data.router, prefix="/api/data", tags=["Data Engine"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio Engine"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])
app.include_router(brief.router, prefix="/api/brief", tags=["Market Brief"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(charts.router, prefix="/api/charts", tags=["Charts & Visualization"])


@app.get("/")
async def root():
    return {
        "name": "Cube Trade API",
        "version": "1.0.0",
        "status": "operational",
        "engines": ["data", "quant", "glm-4"],
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
