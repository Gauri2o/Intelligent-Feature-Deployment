from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.flag import Flag
from app.models.environment import Environment

from app.schemas.flag import (
    FlagCreate,
    FlagUpdate
)



def create_flag(
    db: Session,
    flag: FlagCreate
):


    # Check environment exists

    environment = (
        db.query(Environment)
        .filter(
            Environment.id == flag.environment_id
        )
        .first()
    )


    if not environment:

        return "INVALID_ENVIRONMENT"



    # Check duplicate flag

    existing = (

        db.query(Flag)

        .filter(
            Flag.flag_key == flag.flag_key
        )

        .first()

    )


    if existing:

        return "DUPLICATE_FLAG"



    db_flag = Flag(
        **flag.model_dump()
    )


    try:

        db.add(db_flag)

        db.commit()

        db.refresh(db_flag)


        return db_flag



    except IntegrityError:

        db.rollback()

        return "DUPLICATE_FLAG"





def get_flags(
    db: Session
):

    return db.query(Flag).all()





def get_flag_by_key(
    db: Session,
    key: str
):

    return (

        db.query(Flag)

        .filter(
            Flag.flag_key == key
        )

        .first()

    )





def update_flag(
    db: Session,
    key: str,
    flag: FlagUpdate
):


    db_flag = get_flag_by_key(
        db,
        key
    )


    if not db_flag:

        return None



    update_data = flag.model_dump(
        exclude_unset=True
    )



    for field, value in update_data.items():

        setattr(
            db_flag,
            field,
            value
        )



    db.commit()

    db.refresh(db_flag)



    return db_flag





def delete_flag(
    db: Session,
    key: str
):


    db_flag = get_flag_by_key(
        db,
        key
    )


    if not db_flag:

        return None



    db.delete(
        db_flag
    )


    db.commit()



    return db_flag