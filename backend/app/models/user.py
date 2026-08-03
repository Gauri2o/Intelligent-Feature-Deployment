from sqlalchemy import Column, Integer, String, Boolean
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(100), nullable=False)

    last_name = Column(String(100), nullable=False)

    username = Column(String(100), unique=True, nullable=False)

    email = Column(String(255), unique=True, nullable=False)

    phone = Column(String(20), nullable=True)

    company = Column(String(150), nullable=True)

    role = Column(String(50), default="Developer")

    hashed_password = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True)