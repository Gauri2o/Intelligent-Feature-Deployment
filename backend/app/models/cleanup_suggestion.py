from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Index,
)

from sqlalchemy.sql import func

from app.db.database import Base


class CleanupSuggestion(Base):

    __tablename__ = "cleanup_suggestions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # -----------------------------------------
    # Flag
    # -----------------------------------------

    flag_key = Column(
        String(100),
        nullable=False
    )

    # -----------------------------------------
    # Cleanup state
    #
    # fully_rolled_out
    # fully_disabled
    # -----------------------------------------

    state = Column(
        String(30),
        nullable=False
    )

    # -----------------------------------------
    # When flag entered cleanup state
    # -----------------------------------------

    stale_since = Column(
        DateTime(timezone=True),
        nullable=False
    )

    # -----------------------------------------
    # Review status
    # -----------------------------------------

    reviewed = Column(
        Boolean,
        default=False,
        nullable=False
    )

    reviewed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    # -----------------------------------------
    # Created / Updated
    # -----------------------------------------

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # -----------------------------------------
    # Indexes
    # -----------------------------------------

    __table_args__ = (

        Index(
            "idx_cleanup_flag_key",
            "flag_key"
        ),

        Index(
            "idx_cleanup_reviewed",
            "reviewed"
        ),

        Index(
            "idx_cleanup_stale_since",
            "stale_since"
        ),
    )