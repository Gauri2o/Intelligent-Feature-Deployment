from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.crud.flag import get_flag_by_key

from app.crud.flag_environment_override import (
    get_flag_overrides,
    get_override,
    create_override,
    update_override,
    delete_override,
)

from app.schemas.flag_environment_override import (
    FlagEnvironmentOverrideCreate,
    FlagEnvironmentOverrideUpdate,
    FlagEnvironmentOverrideResponse,
)


router = APIRouter(
    prefix="/flags",
    tags=["Flag Environment Overrides"],
)


# ---------------------------------------------------
# Get All Overrides For A Flag
# ---------------------------------------------------

@router.get(
    "/{key}/overrides",
    response_model=list[FlagEnvironmentOverrideResponse]
)
def read_flag_overrides(
    key: str,
    db: Session = Depends(get_db),
):

    flag = get_flag_by_key(
        db=db,
        key=key,
    )

    if not flag:
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    return get_flag_overrides(
        db=db,
        flag_id=flag.id,
    )


# ---------------------------------------------------
# Get Specific Environment Override
# ---------------------------------------------------

@router.get(
    "/{key}/overrides/{environment_id}",
    response_model=FlagEnvironmentOverrideResponse
)
def read_override(
    key: str,
    environment_id: int,
    db: Session = Depends(get_db),
):

    flag = get_flag_by_key(
        db=db,
        key=key,
    )

    if not flag:
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    override = get_override(
        db=db,
        flag_id=flag.id,
        environment_id=environment_id,
    )

    if not override:
        raise HTTPException(
            status_code=404,
            detail="Environment override not found",
        )

    return override


# ---------------------------------------------------
# Create Environment Override
# ---------------------------------------------------

@router.post(
    "/{key}/overrides",
    response_model=FlagEnvironmentOverrideResponse
)
def add_override(
    key: str,
    override: FlagEnvironmentOverrideCreate,
    db: Session = Depends(get_db),
):

    flag = get_flag_by_key(
        db=db,
        key=key,
    )

    if not flag:
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    result = create_override(
        db=db,
        flag_id=flag.id,
        override=override,
    )

    if result == "FLAG_NOT_FOUND":
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    if result == "INVALID_ENVIRONMENT":
        raise HTTPException(
            status_code=400,
            detail="Invalid environment ID",
        )

    if result == "DUPLICATE_OVERRIDE":
        raise HTTPException(
            status_code=409,
            detail="Override already exists for this environment",
        )

    return result


# ---------------------------------------------------
# Update Environment Override
# ---------------------------------------------------

@router.put(
    "/{key}/overrides/{environment_id}",
    response_model=FlagEnvironmentOverrideResponse
)
def edit_override(
    key: str,
    environment_id: int,
    override: FlagEnvironmentOverrideUpdate,
    db: Session = Depends(get_db),
):

    flag = get_flag_by_key(
        db=db,
        key=key,
    )

    if not flag:
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    updated = update_override(
        db=db,
        flag_id=flag.id,
        environment_id=environment_id,
        override=override,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Environment override not found",
        )

    return updated


# ---------------------------------------------------
# Delete Environment Override
# ---------------------------------------------------

@router.delete(
    "/{key}/overrides/{environment_id}"
)
def remove_override(
    key: str,
    environment_id: int,
    db: Session = Depends(get_db),
):

    flag = get_flag_by_key(
        db=db,
        key=key,
    )

    if not flag:
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    deleted = delete_override(
        db=db,
        flag_id=flag.id,
        environment_id=environment_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Environment override not found",
        )

    return {
        "message": "Environment override deleted successfully"
    }