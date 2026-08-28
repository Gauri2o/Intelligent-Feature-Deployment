from sqlalchemy.orm import Session

from app.models.flag_environment_override import (
    FlagEnvironmentOverride
)

from app.models.flag import Flag
from app.models.environment import Environment

from app.schemas.flag_environment_override import (
    FlagEnvironmentOverrideCreate,
    FlagEnvironmentOverrideUpdate
)


# ---------------------------------------------------
# Get All Overrides For A Flag
# ---------------------------------------------------

def get_flag_overrides(
    db: Session,
    flag_id: int
):
    return (
        db.query(FlagEnvironmentOverride)
        .filter(
            FlagEnvironmentOverride.flag_id == flag_id
        )
        .all()
    )


# ---------------------------------------------------
# Get Single Override
# ---------------------------------------------------

def get_override(
    db: Session,
    flag_id: int,
    environment_id: int
):
    return (
        db.query(FlagEnvironmentOverride)
        .filter(
            FlagEnvironmentOverride.flag_id == flag_id,
            FlagEnvironmentOverride.environment_id == environment_id
        )
        .first()
    )


# ---------------------------------------------------
# Create Override
# ---------------------------------------------------

def create_override(
    db: Session,
    flag_id: int,
    override: FlagEnvironmentOverrideCreate
):

    # Check flag exists
    flag = (
        db.query(Flag)
        .filter(
            Flag.id == flag_id
        )
        .first()
    )

    if not flag:
        return "FLAG_NOT_FOUND"

    # Check environment exists
    environment = (
        db.query(Environment)
        .filter(
            Environment.id == override.environment_id
        )
        .first()
    )

    if not environment:
        return "INVALID_ENVIRONMENT"

    # Check duplicate override
    existing = get_override(
        db=db,
        flag_id=flag_id,
        environment_id=override.environment_id
    )

    if existing:
        return "DUPLICATE_OVERRIDE"

    db_override = FlagEnvironmentOverride(
        flag_id=flag_id,
        environment_id=override.environment_id,
        enabled=override.enabled,
        value=override.value
    )

    db.add(db_override)

    db.commit()

    db.refresh(db_override)

    return db_override


# ---------------------------------------------------
# Update Override
# ---------------------------------------------------

def update_override(
    db: Session,
    flag_id: int,
    environment_id: int,
    override: FlagEnvironmentOverrideUpdate
):

    db_override = get_override(
        db=db,
        flag_id=flag_id,
        environment_id=environment_id
    )

    if not db_override:
        return None

    update_data = override.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        setattr(
            db_override,
            field,
            value
        )

    db.commit()

    db.refresh(db_override)

    return db_override


# ---------------------------------------------------
# Delete Override
# ---------------------------------------------------

def delete_override(
    db: Session,
    flag_id: int,
    environment_id: int
):

    db_override = get_override(
        db=db,
        flag_id=flag_id,
        environment_id=environment_id
    )

    if not db_override:
        return None

    db.delete(db_override)

    db.commit()

    return db_override