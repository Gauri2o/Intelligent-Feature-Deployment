from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import (
    Base,
    engine
)


# =========================================================
# MODELS
# =========================================================

from app.models.environment import Environment

from app.models.flag import Flag

from app.models.audit_log import AuditLog

from app.models.targeting_rule import TargetingRule

from app.models.user_group_membership import (
    UserGroupMembership
)

from app.models.flag_environment_override import (
    FlagEnvironmentOverride
)

from app.models.evaluation_metric import EvaluationMetric

from app.models.cleanup_suggestion import CleanupSuggestion


# =========================================================
# ROUTERS
# =========================================================

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

from app.routers.cleanup import (
    router as cleanup_router
)


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="Intelligent Feature Deployment",
    description=(
        "Feature Flag Management and "
        "Intelligent Deployment System"
    ),
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    flag_router,
    tags=["Feature Flags"],
)


app.include_router(
    environment_router,
    tags=["Environments"],
)


app.include_router(
    flag_environment_override_router,
)


app.include_router(
    audit_log_router,
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


app.include_router(
    targeting_rule_router,
    prefix="/targeting-rules",
    tags=["Targeting Rules"],
)


app.include_router(
    user_group_membership_router,
    prefix="/user-groups",
    tags=["User Group Membership"],
)


app.include_router(
    auth_router,
    tags=["Authentication"],
)


app.include_router(
    evaluation_router
)


app.include_router(
    cleanup_router
)


# =========================================================
# ROOT
# =========================================================

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


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }