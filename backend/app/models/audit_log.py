from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Text,
    Index,
    ForeignKey,
)

from sqlalchemy.sql import func

from app.db.database import Base


class AuditLog(Base):

    __tablename__ = "audit_log"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    action = Column(
        String(100),
        nullable=False
    )

    flag_key = Column(
        String(100),
        nullable=False
    )

    user = Column(
        String(100),
        nullable=False
    )

    # ---------------------------------------------------
    # Environment
    # ---------------------------------------------------

    environment_id = Column(
        Integer,
        ForeignKey("environments.id"),
        nullable=True
    )

    # ---------------------------------------------------
    # Before / After JSON snapshots
    # ---------------------------------------------------

    before_value = Column(
        Text,
        nullable=True
    )

    after_value = Column(
        Text,
        nullable=True
    )

    # ---------------------------------------------------
    # Timestamp
    # ---------------------------------------------------

    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # ---------------------------------------------------
    # Indexes
    # ---------------------------------------------------

    __table_args__ = (

        Index(
            "idx_audit_log_flag_key",
            "flag_key"
        ),

        Index(
            "idx_audit_log_user",
            "user"
        ),

        Index(
            "idx_audit_log_environment",
            "environment_id"
        ),

        Index(
            "idx_audit_log_timestamp",
            "timestamp"
        ),
    )