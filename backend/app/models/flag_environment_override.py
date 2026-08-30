from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    Index,
    DateTime,
)

from sqlalchemy.sql import func

from app.db.database import Base


class FlagEnvironmentOverride(Base):

    __tablename__ = "flag_environment_overrides"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    flag_id = Column(
        Integer,
        ForeignKey("flags.id"),
        nullable=False
    )

    environment_id = Column(
        Integer,
        ForeignKey("environments.id"),
        nullable=False
    )

    enabled = Column(
        Boolean,
        nullable=False
    )

    value = Column(
        String(255),
        nullable=True
    )

    # -----------------------------------------
    # Percentage Rollout
    # -----------------------------------------

    rollout_percentage = Column(
        Integer,
        default=0,
        nullable=False
    )

    # -----------------------------------------
    # Cleanup tracking
    # -----------------------------------------

    state_changed_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # -----------------------------------------
    # Constraints / Indexes
    # -----------------------------------------

    __table_args__ = (

        UniqueConstraint(
            "flag_id",
            "environment_id",
            name="uq_flag_environment_override"
        ),

        Index(
            "idx_override_flag_id",
            "flag_id"
        ),

        Index(
            "idx_override_environment_id",
            "environment_id"
        ),

        Index(
            "idx_override_state_changed_at",
            "state_changed_at"
        ),
    )