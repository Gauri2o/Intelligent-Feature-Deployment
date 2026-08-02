from sqlalchemy.orm import Session
from app.models.flag import Flag


def evaluate_flag(
    db: Session,
    flag_key: str,
    environment_id: int,
    user_context: dict = None,
):
    """
    Simple evaluation engine (Day 4)
    """

    flag = (
        db.query(Flag)
        .filter(
            Flag.flag_key == flag_key,
            Flag.environment_id == environment_id,
        )
        .first()
    )

    if not flag:
        return {
            "flag_key": flag_key,
            "enabled": False,
            "reason": "Flag not found",
        }

    return {
        "flag_key": flag.flag_key,
        "enabled": flag.enabled,
        "default_value": flag.default_value,
        "environment_id": flag.environment_id,
        "reason": "Resolved successfully",
    }