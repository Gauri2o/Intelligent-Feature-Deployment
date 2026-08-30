import json

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

from app.crud.audit_log import create_log

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

from app.services.redis_client import (
    delete_flag_evaluation_cache,
)


router = APIRouter(
    prefix="/flags",
    tags=["Flags"],
)


# =========================================================
# FLAG SNAPSHOT
# =========================================================

def flag_snapshot(flag):

    if not flag:
        return None

    return {
        "id": flag.id,
        "flag_key": flag.flag_key,
        "type": flag.type,
        "default_value": flag.default_value,
        "enabled": flag.enabled,
        "rollout_percentage": flag.rollout_percentage,
        "description": flag.description,
        "owner_team": flag.owner_team,
        "environment_id": flag.environment_id,
    }


# =========================================================
# CREATE FLAG
# =========================================================

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
        flag=flag,
    )

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

    # -----------------------------------------------------
    # Audit CREATE
    # -----------------------------------------------------

    after_value = flag_snapshot(result)

    create_log(
        db=db,
        action="CREATE_FLAG",
        flag_key=result.flag_key,
        user="admin",
        environment_id=result.environment_id,
        before_value=None,
        after_value=json.dumps(
            after_value
        ),
    )

    return result


# =========================================================
# GET ALL FLAGS
# =========================================================

@router.get(
    "/",
    response_model=list[FlagResponse]
)
def read_flags(
    db: Session = Depends(get_db),
):

    return get_flags(db)


# =========================================================
# GET SINGLE FLAG
# =========================================================

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
        key=key,
    )

    if not flag:

        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    return flag


# =========================================================
# UPDATE FLAG
# =========================================================

@router.put(
    "/{key}",
    response_model=FlagResponse
)
def edit_flag(
    key: str,
    flag: FlagUpdate,
    db: Session = Depends(get_db),
):

    # -----------------------------------------------------
    # Get BEFORE state
    # -----------------------------------------------------

    existing_flag = get_flag_by_key(
        db=db,
        key=key,
    )

    if not existing_flag:

        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    before_value = flag_snapshot(
        existing_flag
    )

    old_enabled = existing_flag.enabled

    # -----------------------------------------------------
    # Update
    # -----------------------------------------------------

    updated = update_flag(
        db=db,
        key=key,
        flag=flag,
    )

    if updated == "INVALID_ENVIRONMENT":

        raise HTTPException(
            status_code=400,
            detail="Invalid environment ID",
        )

    if updated == "DUPLICATE_FLAG":

        raise HTTPException(
            status_code=409,
            detail="Flag update conflicts with existing data",
        )

    if not updated:

        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    # -----------------------------------------------------
    # AFTER state
    # -----------------------------------------------------

    after_value = flag_snapshot(
        updated
    )

    # -----------------------------------------------------
    # Clear Redis cache
    # -----------------------------------------------------

    delete_flag_evaluation_cache(
        flag_key=updated.flag_key
    )

    # -----------------------------------------------------
    # Determine audit action
    # -----------------------------------------------------

    new_enabled = updated.enabled

    if old_enabled is False and new_enabled is True:

        action = "ENABLE_FLAG"

    elif old_enabled is True and new_enabled is False:

        action = "DISABLE_FLAG"

    else:

        action = "UPDATE_FLAG"

    # -----------------------------------------------------
    # Audit
    # -----------------------------------------------------

    create_log(
        db=db,
        action=action,
        flag_key=updated.flag_key,
        user="admin",
        environment_id=updated.environment_id,
        before_value=json.dumps(
            before_value
        ),
        after_value=json.dumps(
            after_value
        ),
    )

    return updated


# =========================================================
# DELETE FLAG
# =========================================================

@router.delete(
    "/{key}"
)
def remove_flag(
    key: str,
    db: Session = Depends(get_db),
):

    # -----------------------------------------------------
    # Get BEFORE
    # -----------------------------------------------------

    existing_flag = get_flag_by_key(
        db=db,
        key=key,
    )

    if not existing_flag:

        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    before_value = flag_snapshot(
        existing_flag
    )

    environment_id = existing_flag.environment_id

    # -----------------------------------------------------
    # Delete
    # -----------------------------------------------------

    deleted = delete_flag(
        db=db,
        key=key,
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    # -----------------------------------------------------
    # Clear Redis
    # -----------------------------------------------------

    delete_flag_evaluation_cache(
        flag_key=key
    )

    # -----------------------------------------------------
    # Audit DELETE
    # -----------------------------------------------------

    create_log(
        db=db,
        action="DELETE_FLAG",
        flag_key=key,
        user="admin",
        environment_id=environment_id,
        before_value=json.dumps(
            before_value
        ),
        after_value=None,
    )

    return {
        "message": "Flag deleted successfully"
    }


# =========================================================
# EVALUATE FLAG
# =========================================================

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

    # -----------------------------------------------------
    # Evaluation audit
    # -----------------------------------------------------

    create_log(
        db=db,
        action="EVALUATE_FLAG",
        flag_key=request.flag_key,
        user="admin",
        environment_id=request.environment_id,
        before_value=None,
        after_value=None,
    )

    return result