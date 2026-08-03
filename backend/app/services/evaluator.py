from sqlalchemy.orm import Session

from app.models.flag import Flag
from app.models.environment import Environment
from app.models.targeting_rule import TargetingRule



def evaluate_flag(
    db: Session,
    flag_key: str,
    environment_id: int,
    user_context: dict = None,
):

    """
    Smart Feature Flag Evaluation Engine

    Checks:
    1. Environment exists
    2. Flag exists
    3. Flag enabled status
    4. Targeting rules
    5. Final decision
    """



    # Environment check

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

            "reason":
            "Environment not found"

        }





    # Flag check

    flag = (

        db.query(Flag)

        .filter(

            Flag.flag_key == flag_key,

            Flag.environment_id == environment_id

        )

        .first()

    )



    if not flag:


        return {

            "flag_key": flag_key,

            "enabled": False,

            "reason":
            "Flag not found"

        }





    # Main switch

    if not flag.enabled:


        return {

            "flag_key":
            flag.flag_key,

            "enabled":
            False,

            "reason":
            "Feature disabled"

        }







    # Targeting Rules

    rules = (

        db.query(TargetingRule)

        .filter(

            TargetingRule.flag_id == flag.id

        )

        .all()

    )





    if rules and user_context:



        for rule in rules:



            user_value = user_context.get(
                rule.attribute
            )



            if rule.operator == "equals":


                if user_value != rule.value:


                    return {


                        "flag_key":
                        flag.flag_key,


                        "enabled":
                        False,


                        "reason":
                        "Targeting rule not matched"

                    }







    return {


        "flag_key":
        flag.flag_key,


        "enabled":
        True,


        "default_value":
        flag.default_value,


        "environment_id":
        environment_id,


        "reason":
        "Feature enabled successfully"

    }