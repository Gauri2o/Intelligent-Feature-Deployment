from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.schemas.evaluation import (
    EvaluationRequest,
    EvaluationResponse,
)

from app.services.evaluator import (
    evaluate_flag,
)

from app.services.redis_client import (
    get_cache,
    set_cache,
    increment_evaluation_counter,
    get_evaluation_counts,
)

from app.crud.audit_log import (
    create_log,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/evaluation",
    tags=["Evaluation"],
)


# =========================================================
# EVALUATE FLAG
# =========================================================

@router.post(
    "/",
    response_model=EvaluationResponse,
)
def evaluate(
    request: EvaluationRequest,
    db: Session = Depends(get_db),
):
    """
    Evaluate a feature flag for an environment and user context.

    Flow:

        Request
          ↓
        Analytics counter
          ↓
        Evaluation audit
          ↓
        Redis cache lookup
          ↓
        Cache HIT → return cached result
          ↓
        Cache MISS → evaluation engine
          ↓
        Save result to Redis
          ↓
        Return result

    IMPORTANT:
    Counter and audit happen BEFORE cache lookup.

    Therefore every evaluation request is counted/audited,
    regardless of whether Redis returns a HIT or MISS.
    """

    # =====================================================
    # 1. EXTRACT USER CONTEXT
    # =====================================================

    user_context = request.user_context or {}

    user_id = user_context.get(
        "user_id",
        "anonymous",
    )

    # Make sure the value is usable in the Redis key
    if user_id is None:
        user_id = "anonymous"

    user_id = str(user_id)


    # =====================================================
    # 2. CREATE UNIQUE CACHE KEY
    # =====================================================

    cache_key = (
        f"evaluation:"
        f"{request.flag_key}:"
        f"{request.environment_id}:"
        f"{user_id}"
    )


    # =====================================================
    # 3. ANALYTICS COUNTER
    # =====================================================

    # IMPORTANT:
    # This MUST happen before Redis cache lookup.
    #
    # Therefore:
    #
    # Cache MISS → counter +1
    # Cache HIT  → counter +1
    #
    # Every evaluation request is counted.

    counter_result = increment_evaluation_counter(
        flag_key=request.flag_key,
    )

    print(
        "EVALUATION COUNTER:",
        request.flag_key,
        counter_result,
    )


    # =====================================================
    # 4. EVALUATION AUDIT
    # =====================================================

    # IMPORTANT:
    # Audit every evaluation request, including cache HITs.

    try:

        create_log(
            db=db,
            action="FLAG_EVALUATION",
            flag_key=request.flag_key,
            user=user_id,
            environment_id=request.environment_id,
            before_value=None,
            after_value=None,
        )

    except Exception as e:

        # Do not allow audit failure to silently break
        # the complete evaluation request.
        #
        # The evaluation itself should still be allowed
        # to continue.

        print(
            "Evaluation audit log error:",
            e,
        )


    # =====================================================
    # 5. CHECK REDIS CACHE
    # =====================================================

    cached_result = get_cache(
        cache_key
    )


    # =====================================================
    # 6. CACHE HIT
    # =====================================================

    if cached_result is not None:

        print(
            "REDIS CACHE HIT:",
            cache_key,
        )

        return cached_result


    # =====================================================
    # 7. CACHE MISS
    # =====================================================

    print(
        "REDIS CACHE MISS:",
        cache_key,
    )


    # =====================================================
    # 8. RUN EVALUATION ENGINE
    # =====================================================

    result = evaluate_flag(
        db=db,
        flag_key=request.flag_key,
        environment_id=request.environment_id,
        user_context=user_context,
    )


    # =====================================================
    # 9. SAVE RESULT IN REDIS
    # =====================================================

    cache_saved = set_cache(
        key=cache_key,
        value=result,
        expire=300,
    )

    print(
        "EVALUATION CACHE SAVED:",
        cache_saved,
    )


    # =====================================================
    # 10. RETURN RESULT
    # =====================================================

    return result


# =========================================================
# ANALYTICS
# =========================================================

@router.get(
    "/analytics/{flag_key}",
)
def evaluation_analytics(
    flag_key: str,
    days: int = 7,
):
    """
    Return daily evaluation counts for a feature flag.

    Example:

        GET /evaluation/analytics/dark_mode?days=7

    Response:

        {
            "flag_key": "dark_mode",
            "days": 7,
            "counts": {
                "2026-08-31": 3,
                "2026-08-30": 0,
                "2026-08-29": 0
            }
        }
    """

    # =====================================================
    # VALIDATE DAYS
    # =====================================================

    if days < 1:
        raise HTTPException(
            status_code=400,
            detail="days must be at least 1",
        )

    if days > 365:
        raise HTTPException(
            status_code=400,
            detail="days cannot be greater than 365",
        )


    # =====================================================
    # GET REDIS COUNTS
    # =====================================================

    counts = get_evaluation_counts(
        flag_key=flag_key,
        days=days,
    )


    # =====================================================
    # RETURN ANALYTICS
    # =====================================================

    return {
        "flag_key": flag_key,
        "days": days,
        "counts": counts,
    }