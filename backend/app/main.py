from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine

# Models
from app.models.environment import Environment
from app.models.flag import Flag
from app.models.flag_version import FlagVersion
from app.models.targeting_rule import TargetingRule
from app.models.user_group_membership import UserGroupMembership
from app.models.audit_log import AuditLog
from app.models.user import User

# Routers
from app.routers.flag import router as flag_router
from app.routers.environment import router as environment_router
from app.routers.targeting_rule import router as targeting_rule_router
from app.routers.auth import router as auth_router
from app.routers.audit_log import router as audit_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Intelligent Feature Deployment API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(flag_router)
app.include_router(environment_router)
app.include_router(targeting_rule_router)
app.include_router(audit_router)


@app.get("/")
def home():
    return {
        "message": "Intelligent Feature Deployment API is Running!",
        "status": "OK",
        "version": "1.0.0",
    }
    