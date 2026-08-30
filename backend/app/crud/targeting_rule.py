import json

from sqlalchemy.orm import Session

from app.models.targeting_rule import TargetingRule
from app.models.flag import Flag

from app.schemas.targeting_rule import (
    TargetingRuleCreate
)

from app.crud.audit_log import create_log


# =========================================================
# RULE SNAPSHOT
# =========================================================

def rule_snapshot(rule):

    if not rule:
        return None

    return {
        "id": rule.id,
        "flag_id": rule.flag_id,
        "attribute": rule.attribute,
        "operator": rule.operator,
        "value": rule.value,
    }


# =========================================================
# CREATE TARGETING RULE
# =========================================================

def create_rule(
    db: Session,
    rule: TargetingRuleCreate
):

    # -----------------------------------------------------
    # Verify flag
    # -----------------------------------------------------

    flag = (
        db.query(Flag)
        .filter(
            Flag.id == rule.flag_id
        )
        .first()
    )

    if not flag:
        return "FLAG_NOT_FOUND"

    # -----------------------------------------------------
    # Create rule
    # -----------------------------------------------------

    db_rule = TargetingRule(
        **rule.model_dump()
    )

    db.add(db_rule)

    db.commit()

    db.refresh(db_rule)

    # -----------------------------------------------------
    # Audit ADD
    # -----------------------------------------------------

    create_log(
        db=db,
        action="ADD_TARGETING_RULE",
        flag_key=flag.flag_key,
        user="admin",
        environment_id=flag.environment_id,
        before_value=None,
        after_value=json.dumps(
            rule_snapshot(db_rule)
        ),
    )

    return db_rule


# =========================================================
# GET RULES BY FLAG
# =========================================================

def get_rules_by_flag(
    db: Session,
    flag_id: int
):

    return (
        db.query(TargetingRule)
        .filter(
            TargetingRule.flag_id == flag_id
        )
        .all()
    )


# =========================================================
# DELETE TARGETING RULE
# =========================================================

def delete_rule(
    db: Session,
    rule_id: int
):

    # -----------------------------------------------------
    # Get rule
    # -----------------------------------------------------

    rule = (
        db.query(TargetingRule)
        .filter(
            TargetingRule.id == rule_id
        )
        .first()
    )

    if not rule:
        return None

    # -----------------------------------------------------
    # Get flag
    # -----------------------------------------------------

    flag = (
        db.query(Flag)
        .filter(
            Flag.id == rule.flag_id
        )
        .first()
    )

    # -----------------------------------------------------
    # Save BEFORE
    # -----------------------------------------------------

    before_value = rule_snapshot(
        rule
    )

    flag_key = (
        flag.flag_key
        if flag
        else f"flag_id:{rule.flag_id}"
    )

    environment_id = (
        flag.environment_id
        if flag
        else None
    )

    # -----------------------------------------------------
    # Delete
    # -----------------------------------------------------

    db.delete(rule)

    db.commit()

    # -----------------------------------------------------
    # Audit DELETE
    # -----------------------------------------------------

    create_log(
        db=db,
        action="DELETE_TARGETING_RULE",
        flag_key=flag_key,
        user="admin",
        environment_id=environment_id,
        before_value=json.dumps(
            before_value
        ),
        after_value=None,
    )

    return rule