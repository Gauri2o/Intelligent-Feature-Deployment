from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.services.evaluation import (
    EvaluationRequest,
    EvaluationResponse
)

from app.services.evaluator import evaluate_flag

from app.services.redis_client import (
    get_cache,
    set_cache
)

from app.crud.audit_log import create_log


router = APIRouter(
    prefix="/evaluation",
    tags=["Evaluation"]
)


@router.post(
    "/",
    response_model=EvaluationResponse
)
def evaluate(
    request: EvaluationRequest,
    db: Session = Depends(get_db)
):

    # =================================================
    # 1. Create unique cache key
    # =================================================

    cache_key = (
        f"evaluation:"
        f"{request.flag_key}:"
        f"{request.environment_id}:"
        f"{request.user_id or 'anonymous'}"
    )

    # =================================================
    # 2. Check Redis cache
    # =================================================

    cached_result = get_cache(cache_key)

    if cached_result is not None:

        print(
            "REDIS CACHE HIT:",
            cache_key
        )

        return cached_result

    # =================================================
    # 3. Cache MISS
    # =================================================

    print(
        "REDIS CACHE MISS:",
        cache_key
    )

    result = evaluate_flag(
        db=db,
        flag_key=request.flag_key,
        environment_id=request.environment_id,
        user_context={
            "user_id": request.user_id
        }
        if request.user_id
        else None
    )

    # =================================================
    # 4. Save result in Redis
    # =================================================

    set_cache(
        key=cache_key,
        value=result,
        expire=300
    )

    # =================================================
    # 5. Save evaluation in audit log
    # =================================================

    create_log(
        db=db,
        action="FLAG_EVALUATION",
        flag_key=request.flag_key,
        user=request.user_id or "anonymous"
    )

    # =================================================
    # 6. Return result
    # =================================================

    return result