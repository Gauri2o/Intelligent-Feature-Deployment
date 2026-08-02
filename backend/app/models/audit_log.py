from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(255), nullable=False)
    user = Column(String(100), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())