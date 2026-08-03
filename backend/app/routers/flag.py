from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.crud.flag import (
    create_flag,
    get_flags,
    get_flag_by_key,
    update_flag,
    delete_flag,
    toggle_flag,
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


@router.post("/", response_model=FlagResponse)
def create_new_flag(
    flag: FlagCreate,
    db: Session = Depends(get_db),
):
    result = create_flag(db, flag)

    if result == "INVALID_ENVIRONMENT":
        raise HTTPException(
            status_code=400,
            detail="Invalid environment ID",
        )

    if result == "DUPLICATE_FLAG":
        raise HTTPException(
            status_code=409,
            detail="Flag key already exists",
        )

    return result


@router.get("/", response_model=list[FlagResponse])
def read_flags(
    db: Session = Depends(get_db),
):
    return get_flags(db)


@router.get("/{key}", response_model=FlagResponse)
def read_flag(
    key: str,
    db: Session = Depends(get_db),
):
    flag = get_flag_by_key(db, key)

    if not flag:
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    return flag


@router.put("/{key}", response_model=FlagResponse)
def edit_flag(
    key: str,
    flag: FlagUpdate,
    db: Session = Depends(get_db),
):
    updated = update_flag(db, key, flag)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    return updated


@router.delete("/{key}")
def remove_flag(
    key: str,
    db: Session = Depends(get_db),
):
    deleted = delete_flag(db, key)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    return {
        "message": "Flag deleted successfully"
    }


@router.patch("/{key}/toggle", response_model=FlagResponse)
def toggle(
    key: str,
    db: Session = Depends(get_db),
):
    updated = toggle_flag(db, key)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    return updated


@router.post(
    "/evaluate",
    response_model=EvaluationResponse,
)
def evaluate(
    request: EvaluationRequest,
    db: Session = Depends(get_db),
):
    return evaluate_flag(
        db=db,
        flag_key=request.flag_key,
        environment_id=request.environment_id,
    )