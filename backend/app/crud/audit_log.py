import json

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


# =====================================================
# CREATE AUDIT LOG
# =====================================================

def create_log(
    db: Session,
    action: str,
    flag_key: str | None = None,
    user: str = "system",
    environment_id: int | None = None,
    before_value=None,
    after_value=None,
):
    log = AuditLog(
        action=action,
        flag_key=flag_key,
        user=user,
        environment_id=environment_id,

        before_value=(
            json.dumps(
                before_value,
                default=str
            )
            if before_value is not None
            else None
        ),

        after_value=(
            json.dumps(
                after_value,
                default=str
            )
            if after_value is not None
            else None
        ),
    )

    db.add(log)

    db.commit()

    db.refresh(log)

    return log


# =====================================================
# GET AUDIT LOGS
# =====================================================

def get_audit_logs(
    db: Session,
    user: str | None = None,
    flag_key: str | None = None,
    environment_id: int | None = None,
    start_date=None,
    end_date=None,
):
    query = (
        db.query(AuditLog)
        .order_by(
            AuditLog.timestamp.desc()
        )
    )

    # -------------------------------------------------
    # Filter by actor / user
    # -------------------------------------------------

    if user:

        query = query.filter(
            AuditLog.user.ilike(
                f"%{user}%"
            )
        )

    # -------------------------------------------------
    # Filter by flag key
    # -------------------------------------------------

    if flag_key:

        query = query.filter(
            AuditLog.flag_key.ilike(
                f"%{flag_key}%"
            )
        )

    # -------------------------------------------------
    # Filter by environment
    # -------------------------------------------------

    if environment_id is not None:

        query = query.filter(
            AuditLog.environment_id ==
            environment_id
        )

    # -------------------------------------------------
    # Filter by start date
    # -------------------------------------------------

    if start_date:

        query = query.filter(
            AuditLog.timestamp >= start_date
        )

    # -------------------------------------------------
    # Filter by end date
    # -------------------------------------------------

    if end_date:

        query = query.filter(
            AuditLog.timestamp <= end_date
        )

    return query.all()


# =====================================================
# COMPATIBILITY FUNCTION
# =====================================================
# Router currently imports get_logs.
# Keep this wrapper so existing imports continue working.

def get_logs(
    db: Session,
    user: str | None = None,
    flag_key: str | None = None,
    environment_id: int | None = None,
    start_date=None,
    end_date=None,
):

    return get_audit_logs(
        db=db,
        user=user,
        flag_key=flag_key,
        environment_id=environment_id,
        start_date=start_date,
        end_date=end_date,
    )


# =====================================================
# GET SINGLE AUDIT LOG
# =====================================================

def get_audit_log(
    db: Session,
    log_id: int,
):

    return (
        db.query(AuditLog)
        .filter(
            AuditLog.id == log_id
        )
        .first()
    )