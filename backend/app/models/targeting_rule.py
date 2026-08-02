from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base

class TargetingRule(Base):
    __tablename__ = "targeting_rules"

    id = Column(Integer, primary_key=True, index=True)
    flag_id = Column(Integer, ForeignKey("flags.id"), nullable=False)
    user_group = Column(String(100), nullable=False)
    