from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base

class FlagVersion(Base):
    __tablename__ = "flag_versions"

    id = Column(Integer, primary_key=True, index=True)
    flag_id = Column(Integer, ForeignKey("flags.id"), nullable=False)
    version = Column(Integer, nullable=False)
    enabled = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())