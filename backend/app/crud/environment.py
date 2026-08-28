from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.schemas.environment import (
    EnvironmentCreate,
    EnvironmentUpdate
)


# ---------------------------------------------------
# Create Environment
# ---------------------------------------------------

def create_environment(
    db: Session,
    environment: EnvironmentCreate
):
    existing = (
        db.query(Environment)
        .filter(
            Environment.name == environment.name
        )
        .first()
    )

    if existing:
        return existing

    db_environment = Environment(
        name=environment.name
    )

    db.add(db_environment)
    db.commit()
    db.refresh(db_environment)

    return db_environment


# ---------------------------------------------------
# Get All Environments
# ---------------------------------------------------

def get_all_environments(
    db: Session
):
    return (
        db.query(Environment)
        .order_by(Environment.id)
        .all()
    )


# ---------------------------------------------------
# Get Environment By ID
# ---------------------------------------------------

def get_environment(
    db: Session,
    environment_id: int
):
    return (
        db.query(Environment)
        .filter(
            Environment.id == environment_id
        )
        .first()
    )


# ---------------------------------------------------
# Update Environment
# ---------------------------------------------------

def update_environment(
    db: Session,
    environment_id: int,
    environment: EnvironmentUpdate
):
    db_environment = (
        db.query(Environment)
        .filter(
            Environment.id == environment_id
        )
        .first()
    )

    if not db_environment:
        return None

    db_environment.name = environment.name

    db.commit()
    db.refresh(db_environment)

    return db_environment


# ---------------------------------------------------
# Delete Environment
# ---------------------------------------------------

def delete_environment(
    db: Session,
    environment_id: int
):
    environment = (
        db.query(Environment)
        .filter(
            Environment.id == environment_id
        )
        .first()
    )

    if not environment:
        return None

    db.delete(environment)
    db.commit()

    return environment