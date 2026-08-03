from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.crud.flag import (
    create_flag,
    get_flags,
    get_flag_by_key,
    update_flag,
    delete_flag,
)

from app.crud.audit_log import (
    create_log,
)

from app.schemas.flag import (
    FlagCreate,
    FlagUpdate,
    FlagResponse,
)

from app.schemas.evaluation import (
    EvaluationRequest,
    EvaluationResponse,
)

from app.services.evaluator import evaluate_flag

router = APIRouter(
    prefix="/flags",
    tags=["Flags"],
)


# ---------------------------------------------------
# Create Flag
# ---------------------------------------------------

@router.post(
    "/",
    response_model=FlagResponse
)
def create_new_flag(
    flag: FlagCreate,
    db: Session = Depends(get_db),
):

    result = create_flag(
        db=db,
        flag=flag
    )

    if result == "INVALID_ENVIRONMENT":
        raise HTTPException(
            status_code=400,
            detail="Invalid environment ID"
        )

    if result == "DUPLICATE_FLAG":
        raise HTTPException(
            status_code=409,
            detail="Flag key already exists"
        )

    create_log(
        db=db,
        action="CREATE_FLAG",
        flag_key=result.flag_key,
        user="admin"
    )

    return result


# ---------------------------------------------------
# Read All Flags
# ---------------------------------------------------

@router.get(
    "/",
    response_model=list[FlagResponse]
)
def read_flags(
    db: Session = Depends(get_db)
):

    return get_flags(db)


# ---------------------------------------------------
# Read Single Flag
# ---------------------------------------------------

@router.get(
    "/{key}",
    response_model=FlagResponse
)
def read_flag(
    key: str,
    db: Session = Depends(get_db),
):

    flag = get_flag_by_key(
        db=db,
        key=key
    )

    if not flag:
        raise HTTPException(
            status_code=404,
            detail="Flag not found"
        )

    return flag
# ---------------------------------------------------
# Update Flag
# ---------------------------------------------------

@router.put(
    "/{key}",
    response_model=FlagResponse
)
def edit_flag(
    key: str,
    flag: FlagUpdate,
    db: Session = Depends(get_db),
):

    updated = update_flag(
        db=db,
        key=key,
        flag=flag,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Flag not found"
        )

    create_log(
        db=db,
        action="UPDATE_FLAG",
        flag_key=updated.flag_key,
        user="admin",
    )

    return updated


# ---------------------------------------------------
# Delete Flag
# ---------------------------------------------------

@router.delete("/{key}")
def remove_flag(
    key: str,
    db: Session = Depends(get_db),
):

    deleted = delete_flag(
        db=db,
        key=key,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Flag not found"
        )

    create_log(
        db=db,
        action="DELETE_FLAG",
        flag_key=key,
        user="admin",
    )

    return {
        "message": "Flag deleted successfully"
    }


# ---------------------------------------------------
# Evaluate Flag
# ---------------------------------------------------

@router.post(
    "/evaluate",
    response_model=EvaluationResponse,
)
def evaluate(
    request: EvaluationRequest,
    db: Session = Depends(get_db),
):

    result = evaluate_flag(
        db=db,
        flag_key=request.flag_key,
        environment_id=request.environment_id,
        user_context=request.user_context,
    )

    create_log(
        db=db,
        action="EVALUATE_FLAG",
        flag_key=request.flag_key,
        user="admin",
    )

    return result