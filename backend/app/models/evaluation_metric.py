from sqlalchemy import Column, DateTime, Integer, String, UniqueConstraint

from app.db.database import Base


class EvaluationMetric(Base):

    __tablename__ = "evaluation_metrics"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    flag_key = Column(
        String(100),
        nullable=False,
        index=True
    )

    hour = Column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )

    count = Column(
        Integer,
        nullable=False,
        default=0
    )

    __table_args__ = (
        UniqueConstraint(
            "flag_key",
            "hour",
            name="uq_evaluation_metric_flag_hour"
        ),
    )