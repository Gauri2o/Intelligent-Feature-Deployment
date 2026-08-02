from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine

from app.routers.flag import router as flag_router
from app.models.environment import Environment
from app.models.flag import Flag
from app.models.flag_version import FlagVersion
from app.models.targeting_rule import TargetingRule
from app.models.user_group_membership import UserGroupMembership
from app.models.audit_log import AuditLog

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Intelligent Feature Deployment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(flag_router)

@app.get("/")
def home():
    return {
        "message": "Intelligent Feature Deployment API is Running!"
    }