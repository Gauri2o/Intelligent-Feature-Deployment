from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.schemas.targeting_rule import (
    TargetingRuleCreate,
    TargetingRuleResponse
)

from app.crud.targeting_rule import (
    create_rule,
    get_rules_by_flag,
    delete_rule
)

from app.crud.user_group_membership import (
    get_all_groups
)


router = APIRouter(
    prefix="/rules",
    tags=["Targeting Rules"]
)


# =========================================================
# CREATE TARGETING RULE
# =========================================================

@router.post(
    "/",
    response_model=TargetingRuleResponse
)
def create_targeting_rule(
    rule: TargetingRuleCreate,
    db: Session = Depends(get_db)
):

    result = create_rule(
        db=db,
        rule=rule
    )

    if result == "FLAG_NOT_FOUND":

        raise HTTPException(
            status_code=404,
            detail="Flag not found"
        )

    return result


# =========================================================
# GET RULES FOR FLAG
# =========================================================

@router.get(
    "/flag/{flag_id}",
    response_model=list[TargetingRuleResponse]
)
def read_rules(
    flag_id: int,
    db: Session = Depends(get_db)
):

    return get_rules_by_flag(
        db=db,
        flag_id=flag_id
    )


# =========================================================
# GET AVAILABLE GROUPS
# =========================================================

@router.get(
    "/groups"
)
def read_groups(
    db: Session = Depends(get_db)
):

    return {
        "groups": get_all_groups(db)
    }


# =========================================================
# DELETE TARGETING RULE
# =========================================================

@router.delete(
    "/{rule_id}"
)
def remove_rule(
    rule_id: int,
    db: Session = Depends(get_db)
):

    deleted = delete_rule(
        db=db,
        rule_id=rule_id
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Rule not found"
        )

    return {
        "message": "Rule deleted successfully"
    }