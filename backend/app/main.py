from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine

# ---------------------------------------------------
# Models
# ---------------------------------------------------

# Import model so SQLAlchemy registers the table
from app.models.flag_environment_override import (
    FlagEnvironmentOverride
)


# ---------------------------------------------------
# Routers
# ---------------------------------------------------

from app.routers.flag import (
    router as flag_router
)

from app.routers.environment import (
    router as environment_router
)

from app.routers.audit_log import (
    router as audit_log_router
)

from app.routers.targeting_rule import (
    router as targeting_rule_router
)

from app.routers.user_group_membership import (
    router as user_group_membership_router
)

from app.routers.auth import (
    router as auth_router
)

from app.routers.evaluation import (
    router as evaluation_router
)

from app.routers.flag_environment_override import (
    router as flag_environment_override_router
)


# ---------------------------------------------------
# Create Database Tables
# ---------------------------------------------------

Base.metadata.create_all(
    bind=engine
)


# ---------------------------------------------------
# Create FastAPI Application
# ---------------------------------------------------

app = FastAPI(
    title="Intelligent Feature Deployment",
    description=(
        "Feature Flag Management and "
        "Intelligent Deployment System"
    ),
    version="1.0.0",
)


# ---------------------------------------------------
# CORS Configuration
# ---------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------
# Include Routers
# ---------------------------------------------------

# Feature Flags
app.include_router(
    flag_router,
    tags=["Feature Flags"],
)


# Environment Management
app.include_router(
    environment_router,
    tags=["Environments"],
)


# Environment Overrides
app.include_router(
    flag_environment_override_router,
)


# Audit Logs
app.include_router(
    audit_log_router,
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


# Targeting Rules
app.include_router(
    targeting_rule_router,
    prefix="/targeting-rules",
    tags=["Targeting Rules"],
)


# User Group Membership
app.include_router(
    user_group_membership_router,
    prefix="/user-groups",
    tags=["User Group Membership"],
)


# Authentication
app.include_router(
    auth_router,
    tags=["Authentication"],
)


# Evaluation
app.include_router(
    evaluation_router
)


# ---------------------------------------------------
# Root Endpoint
# ---------------------------------------------------

@app.get("/")
def root():

    return {
        "message": (
            "Intelligent Feature Deployment "
            "API is running"
        ),
        "docs": "/docs",
        "version": "1.0.0",
    }


# ---------------------------------------------------
# Health Check
# ---------------------------------------------------

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }