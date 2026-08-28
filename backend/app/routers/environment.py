from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.models.environment import Environment

from app.schemas.environment import (
    EnvironmentCreate,
    EnvironmentUpdate,
    EnvironmentResponse
)

from app.crud.environment import (
    create_environment,
    get_all_environments,
    get_environment,
    update_environment,
    delete_environment
)


router = APIRouter(
    prefix="/environments",
    tags=["Environment"]
)


# ---------------------------------------------------
# Get All Environments
# ---------------------------------------------------

@router.get(
    "/",
    response_model=list[EnvironmentResponse]
)
def get_environments(
    db: Session = Depends(get_db)
):

    return get_all_environments(db)


# ---------------------------------------------------
# Create Environment
# ---------------------------------------------------

@router.post(
    "/",
    response_model=EnvironmentResponse
)
def add_environment(
    environment: EnvironmentCreate,
    db: Session = Depends(get_db)
):

    existing = get_all_environments(db)

    for item in existing:
        if item.name.lower() == environment.name.lower():
            raise HTTPException(
                status_code=400,
                detail="Environment already exists"
            )

    return create_environment(
        db,
        environment
    )


# ---------------------------------------------------
# Get Environment By ID
# ---------------------------------------------------

@router.get(
    "/{environment_id}",
    response_model=EnvironmentResponse
)
def read_environment(
    environment_id: int,
    db: Session = Depends(get_db)
):

    environment = get_environment(
        db,
        environment_id
    )

    if not environment:
        raise HTTPException(
            status_code=404,
            detail="Environment not found"
        )

    return environment


# ---------------------------------------------------
# Update Environment
# ---------------------------------------------------

@router.put(
    "/{environment_id}",
    response_model=EnvironmentResponse
)
def edit_environment(
    environment_id: int,
    environment: EnvironmentUpdate,
    db: Session = Depends(get_db)
):

    existing_environment = get_environment(
        db,
        environment_id
    )

    if not existing_environment:
        raise HTTPException(
            status_code=404,
            detail="Environment not found"
        )

    # Check duplicate name
    existing_name = (
    db.query(Environment)
    .filter(
        Environment.name == environment.name,
        Environment.id != environment_id
    )
    .first()
)

    if existing_name:
        raise HTTPException(
            status_code=400,
            detail="Environment already exists"
        )

    updated = update_environment(
        db,
        environment_id,
        environment
    )

    return updated


# ---------------------------------------------------
# Delete Environment
# ---------------------------------------------------

@router.delete(
    "/{environment_id}"
)
def remove_environment(
    environment_id: int,
    db: Session = Depends(get_db)
):

    environment = delete_environment(
        db,
        environment_id
    )

    if not environment:
        raise HTTPException(
            status_code=404,
            detail="Environment not found"
        )

    return {
        "message": "Environment deleted successfully"
    }