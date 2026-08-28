import hashlib

from sqlalchemy.orm import Session

from app.models.flag import Flag
from app.models.environment import Environment
from app.models.targeting_rule import TargetingRule
from app.models.flag_environment_override import (
    FlagEnvironmentOverride
)

from app.crud.user_group_membership import (
    get_user_groups
)


# =====================================================
# Deterministic User Bucket
# =====================================================

def get_user_bucket(
    user_id: str,
    flag_key: str
) -> int:
    """
    Deterministically map a user + flag
    to a bucket from 0 to 99.
    """

    value = f"{user_id}:{flag_key}"

    hash_value = hashlib.sha256(
        value.encode("utf-8")
    ).hexdigest()

    number = int(
        hash_value[:8],
        16
    )

    return number % 100


# =====================================================
# Feature Flag Evaluation
# =====================================================

def evaluate_flag(
    db: Session,
    flag_key: str,
    environment_id: int,
    user_context: dict = None,
):
    """
    Feature Flag Evaluation Engine

    Priority:

    1. Environment validation
    2. Flag validation
    3. User targeting
    4. Group targeting
    5. Percentage rollout
    6. Environment override
    7. Flag disabled
    8. Default evaluation
    """

    # =================================================
    # 1. ENVIRONMENT VALIDATION
    # =================================================

    environment = (
        db.query(Environment)
        .filter(
            Environment.id == environment_id
        )
        .first()
    )

    if not environment:

        return {
            "flag_key": flag_key,
            "enabled": False,
            "default_value": None,
            "environment_id": environment_id,
            "reason": "Environment not found",
        }

    # =================================================
    # 2. FLAG VALIDATION
    # =================================================

    flag = (
        db.query(Flag)
        .filter(
            Flag.flag_key == flag_key
        )
        .first()
    )

    if not flag:

        return {
            "flag_key": flag_key,
            "enabled": False,
            "default_value": None,
            "environment_id": environment_id,
            "reason": "Flag not found",
        }

    # =================================================
    # GET TARGETING RULES
    # =================================================

    rules = (
        db.query(TargetingRule)
        .filter(
            TargetingRule.flag_id == flag.id
        )
        .all()
    )

    # =================================================
    # GET USER ID
    # =================================================

    user_id = None

    if user_context:
        user_id = user_context.get("user_id")

    
    # =================================================
    # 3. USER TARGETING
    # =================================================

    if user_id is not None:

        for rule in rules:

            if (
                rule.attribute == "user_id"
                and rule.operator == "equals"
                and str(user_id) == str(rule.value)
            ):

                return {
                    "flag_key": flag.flag_key,
                    "enabled": True,
                    "default_value": flag.default_value,
                    "environment_id": environment_id,
                    "reason": "User targeting rule matched",
                }

    # =================================================
    # 4. GROUP TARGETING
    # =================================================

    if user_id is not None:

        user_groups = get_user_groups(
            db=db,
            user_id=str(user_id),
        )

        user_group_names = {
            membership.group_name
            for membership in user_groups
        }

        
        for rule in rules:

            if (
                rule.attribute == "group"
                and rule.operator == "equals"
                and rule.value in user_group_names
            ):

                return {
                    "flag_key": flag.flag_key,
                    "enabled": True,
                    "default_value": flag.default_value,
                    "environment_id": environment_id,
                    "reason": (
                        f"Group targeting rule matched: "
                        f"{rule.value}"
                    ),
                }

    # =================================================
    # 5. PERCENTAGE ROLLOUT
    # =================================================

    rollout_percentage = (
        flag.rollout_percentage or 0
    )

    if rollout_percentage > 0:

        if user_id is not None:

            bucket = get_user_bucket(
                user_id=str(user_id),
                flag_key=flag.flag_key,
            )

           

            if bucket < rollout_percentage:

                return {
                    "flag_key": flag.flag_key,
                    "enabled": True,
                    "default_value": flag.default_value,
                    "environment_id": environment_id,
                    "reason": (
                        f"Percentage rollout matched: "
                        f"{rollout_percentage}% "
                        f"(bucket {bucket})"
                    ),
                }

            else:

                return {
                    "flag_key": flag.flag_key,
                    "enabled": False,
                    "default_value": flag.default_value,
                    "environment_id": environment_id,
                    "reason": (
                        f"Percentage rollout not matched: "
                        f"{rollout_percentage}% "
                        f"(bucket {bucket})"
                    ),
                }

    # =================================================
    # 6. ENVIRONMENT OVERRIDE
    # =================================================

    override = (
        db.query(FlagEnvironmentOverride)
        .filter(
            FlagEnvironmentOverride.flag_id == flag.id,
            FlagEnvironmentOverride.environment_id == environment_id
        )
        .first()
    )

    if override:

        return {
            "flag_key": flag.flag_key,
            "enabled": override.enabled,
            "default_value": (
                override.value
                if override.value is not None
                else flag.default_value
            ),
            "environment_id": environment_id,
            "reason": "Environment override matched",
        }

    # =================================================
    # 7. FLAG DISABLED
    # =================================================

    if not flag.enabled:

        return {
            "flag_key": flag.flag_key,
            "enabled": False,
            "default_value": flag.default_value,
            "environment_id": environment_id,
            "reason": "Feature disabled",
        }

    # =================================================
    # 8. DEFAULT EVALUATION
    # =================================================

    return {
        "flag_key": flag.flag_key,
        "enabled": True,
        "default_value": flag.default_value,
        "environment_id": environment_id,
        "reason": "Default evaluation",
    }