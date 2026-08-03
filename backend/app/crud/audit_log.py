from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_log(
    db: Session,
    action: str,
    flag_key: str,
    user: str = "admin"
):

    log = AuditLog(

        action=action,

        flag_key=flag_key,

        user=user

    )

    db.add(log)

    db.commit()

    db.refresh(log)

    return log



def get_logs(
    db: Session
):

    return (

        db.query(AuditLog)

        .order_by(
            AuditLog.timestamp.desc()
        )

        .all()

    )