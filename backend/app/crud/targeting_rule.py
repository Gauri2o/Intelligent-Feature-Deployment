from sqlalchemy.orm import Session

from app.models.targeting_rule import TargetingRule

from app.schemas.targeting_rule import TargetingRuleCreate





def create_rule(
    db: Session,
    rule: TargetingRuleCreate
):


    db_rule = TargetingRule(

        **rule.model_dump()

    )


    db.add(db_rule)

    db.commit()

    db.refresh(db_rule)


    return db_rule






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






def delete_rule(
    db: Session,
    rule_id: int
):


    rule = (

        db.query(TargetingRule)

        .filter(
            TargetingRule.id == rule_id
        )

        .first()

    )


    if not rule:

        return None



    db.delete(rule)

    db.commit()


    return rule