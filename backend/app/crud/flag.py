from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.flag import Flag
from app.models.environment import Environment

from app.schemas.flag import (
    FlagCreate,
    FlagUpdate
)


# ---------------------------------------------------
# Create Flag
# ---------------------------------------------------

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

    # Check duplicate flag in same environment
    existing = (
        db.query(Flag)
        .filter(
            Flag.flag_key == flag.flag_key,
            Flag.environment_id == flag.environment_id
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


# ---------------------------------------------------
# Get Flags
# ---------------------------------------------------

def get_flags(
    db: Session,
    environment_id: int | None = None
):

    query = db.query(Flag)

    if environment_id is not None:

        query = query.filter(
            Flag.environment_id == environment_id
        )

    return query.all()


# ---------------------------------------------------
# Get Single Flag
# ---------------------------------------------------

def get_flag_by_key(
    db: Session,
    key: str,
    environment_id: int | None = None
):

    query = (
        db.query(Flag)
        .filter(
            Flag.flag_key == key
        )
    )

    if environment_id is not None:

        query = query.filter(
            Flag.environment_id == environment_id
        )

    return query.first()


# ---------------------------------------------------
# Update Flag
# ---------------------------------------------------

def update_flag(
    db: Session,
    key: str,
    flag: FlagUpdate,
    environment_id: int | None = None
):

    db_flag = get_flag_by_key(
        db=db,
        key=key,
        environment_id=environment_id
    )

    if not db_flag:
        return None

    update_data = flag.model_dump(
        exclude_unset=True
    )

    # If environment is being changed,
    # verify that the new environment exists.
    if "environment_id" in update_data:

        environment = (
            db.query(Environment)
            .filter(
                Environment.id ==
                update_data["environment_id"]
            )
            .first()
        )

        if not environment:
            return "INVALID_ENVIRONMENT"

    for field, value in update_data.items():

        setattr(
            db_flag,
            field,
            value
        )

    try:

        db.commit()

        db.refresh(db_flag)

        return db_flag

    except IntegrityError:

        db.rollback()

        return "DUPLICATE_FLAG"


# ---------------------------------------------------
# Delete Flag
# ---------------------------------------------------

def delete_flag(
    db: Session,
    key: str,
    environment_id: int | None = None
):

    db_flag = get_flag_by_key(
        db=db,
        key=key,
        environment_id=environment_id
    )

    if not db_flag:
        return None

    db.delete(db_flag)

    db.commit()

    return db_flag