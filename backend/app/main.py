"""
CHEM-SIM API server.

Chemical Engineering Simulation Suite — FastAPI entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router

app = FastAPI(
    title="CHEM-SIM",
    description="Chemical Engineering Simulation Suite API",
    version="0.1.0",
)

# CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
app.include_router(router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "service": "CHEM-SIM"}


@app.get("/")
def root():
    return {
        "name": "CHEM-SIM",
        "version": "0.1.0",
        "description": "Chemical Engineering Simulation Suite",
        "docs": "/docs",
    }
