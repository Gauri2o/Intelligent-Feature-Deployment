from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    Index,
)

from app.db.database import Base


class Flag(Base):
    __tablename__ = "flags"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    flag_key = Column(
        String(100),
        unique=True,
        nullable=False
    )

    type = Column(
        String(50),
        nullable=False
    )

    default_value = Column(
        String(255),
        nullable=False
    )

    enabled = Column(
        Boolean,
        default=False
    )

    # -----------------------------------------
    # Percentage Rollout
    # 0 = no percentage rollout
    # 100 = all users
    # -----------------------------------------

    rollout_percentage = Column(
        Integer,
        default=0,
        nullable=False
    )

    description = Column(
        String(255)
    )

    owner_team = Column(
        String(100),
        nullable=False
    )

    environment_id = Column(
        Integer,
        ForeignKey("environments.id"),
        nullable=False
    )

    # -----------------------------------------
    # Indexes
    # -----------------------------------------

    __table_args__ = (
        Index(
            "idx_flag_key",
            "flag_key"
        ),

        Index(
            "idx_environment_id",
            "environment_id"
        ),
    )