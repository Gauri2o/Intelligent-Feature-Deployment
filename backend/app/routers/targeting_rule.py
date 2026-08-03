from fastapi import APIRouter, Depends, HTTPException

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




router = APIRouter(

    prefix="/rules",

    tags=["Targeting Rules"]

)





@router.post(
    "/",
    response_model=TargetingRuleResponse
)
def create_targeting_rule(

    rule: TargetingRuleCreate,

    db: Session = Depends(get_db)

):


    return create_rule(

        db,

        rule

    )







@router.get(
    "/flag/{flag_id}",
    response_model=list[TargetingRuleResponse]
)
def read_rules(

    flag_id: int,

    db: Session = Depends(get_db)

):


    return get_rules_by_flag(

        db,

        flag_id

    )








@router.delete(
    "/{rule_id}"
)
def remove_rule(

    rule_id: int,

    db: Session = Depends(get_db)

):


    deleted = delete_rule(

        db,

        rule_id

    )



    if not deleted:


        raise HTTPException(

            status_code=404,

            detail="Rule not found"

        )



    return {

        "message":
        "Rule deleted successfully"

    }