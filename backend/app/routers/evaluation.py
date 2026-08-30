from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.services.evaluation import (
    EvaluationRequest,
    EvaluationResponse
)

from app.services.evaluator import evaluate_flag

from app.services.redis_client import (
    get_cache,
    set_cache,
    increment_evaluation_counter
)

from app.crud.audit_log import create_log

from app.models.evaluation_metric import EvaluationMetric

from datetime import datetime, timedelta, timezone


router = APIRouter(
    prefix="/evaluation",
    tags=["Evaluation"]
)


# =====================================================
# APPLICATION TIMEZONE
# =====================================================
# IST = UTC + 5 hours 30 minutes
#
# Using a fixed timezone here avoids the requirement
# for the external "tzdata" package on Windows.
# =====================================================

ANALYTICS_TIMEZONE = timezone(
    timedelta(
        hours=5,
        minutes=30
    )
)


# =====================================================
# EVALUATE FLAG
# =====================================================

@router.post(
    "/",
    response_model=EvaluationResponse
)
def evaluate(
    request: EvaluationRequest,
    db: Session = Depends(get_db)
):

    # =================================================
    # 1. COUNT EVERY EVALUATION
    # =================================================
    #
    # IMPORTANT:
    # This MUST happen before the Redis cache check.
    #
    # Every request is an evaluation, even when the
    # actual flag result comes from Redis cache.
    # =================================================

    increment_evaluation_counter(
        request.flag_key
    )


    # =================================================
    # 2. CREATE CACHE KEY
    # =================================================

    cache_key = (
        f"evaluation:"
        f"{request.flag_key}:"
        f"{request.environment_id}:"
        f"{request.user_id or 'anonymous'}"
    )


    # =================================================
    # 3. CHECK REDIS CACHE
    # =================================================

    cached_result = get_cache(
        cache_key
    )

    if cached_result is not None:

        print(
            "REDIS CACHE HIT:",
            cache_key
        )

        return cached_result


    # =================================================
    # 4. CACHE MISS
    # =================================================

    print(
        "REDIS CACHE MISS:",
        cache_key
    )


    # =================================================
    # 5. EVALUATE FLAG
    # =================================================

    result = evaluate_flag(

        db=db,

        flag_key=request.flag_key,

        environment_id=request.environment_id,

        user_context={
            "user_id": request.user_id
        }
        if request.user_id
        else None,

    )


    # =================================================
    # 6. SAVE RESULT IN REDIS
    # =================================================

    set_cache(

        key=cache_key,

        value=result,

        expire=300

    )


    # =================================================
    # 7. AUDIT LOG
    # =================================================

    create_log(

        db=db,

        action="FLAG_EVALUATION",

        flag_key=request.flag_key,

        user=request.user_id or "anonymous"

    )


    # =================================================
    # 8. RETURN RESULT
    # =================================================

    return result


# =====================================================
# EVALUATION ANALYTICS
# =====================================================

@router.get(
    "/analytics/{flag_key}"
)
def get_evaluation_analytics(

    flag_key: str,

    days: int = Query(
        7,
        ge=1,
        le=30
    ),

    db: Session = Depends(get_db)

):

    # =================================================
    # 1. CURRENT UTC TIME
    # =================================================

    now_utc = datetime.now(
        timezone.utc
    )


    # =================================================
    # 2. CONVERT UTC -> IST
    # =================================================

    now_local = now_utc.astimezone(
        ANALYTICS_TIMEZONE
    )


    # =================================================
    # 3. FIND START OF TODAY IN IST
    # =================================================
    #
    # Example:
    #
    # Today = 30 Aug
    # days = 7
    #
    # Start date = 24 Aug 00:00 IST
    # =================================================

    start_local = (
        now_local
        .replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )
        - timedelta(
            days=days - 1
        )
    )


    # =================================================
    # 4. CONVERT START IST -> UTC
    # =================================================
    #
    # Example:
    #
    # 30 Aug 00:00 IST
    # =
    # 29 Aug 18:30 UTC
    #
    # This is important because database timestamps
    # are stored/queried using UTC.
    # =================================================

    start_utc = start_local.astimezone(
        timezone.utc
    )


    # =================================================
    # 5. GET HOURLY METRICS
    # =================================================

    metrics = (

        db.query(
            EvaluationMetric
        )

        .filter(
            EvaluationMetric.flag_key == flag_key
        )

        .filter(
            EvaluationMetric.hour >= start_utc
        )

        .order_by(
            EvaluationMetric.hour.asc()
        )

        .all()

    )


    # =================================================
    # 6. CREATE DAILY BUCKETS
    # =================================================

    daily_counts = {}

    for i in range(days):

        local_date = (
            start_local
            + timedelta(
                days=i
            )
        ).date()


        daily_counts[
            local_date.isoformat()
        ] = 0


    # =================================================
    # 7. AGGREGATE HOURLY -> DAILY
    # =================================================

    for metric in metrics:

        metric_hour = metric.hour


        # ---------------------------------------------
        # Handle timezone-naive DB timestamps
        # ---------------------------------------------

        if metric_hour.tzinfo is None:

            # Database value is treated as UTC.

            metric_hour = metric_hour.replace(
                tzinfo=timezone.utc
            )


        # ---------------------------------------------
        # Make sure timestamp is UTC
        # ---------------------------------------------

        metric_hour = metric_hour.astimezone(
            timezone.utc
        )


        # ---------------------------------------------
        # UTC -> IST
        # ---------------------------------------------

        metric_local = metric_hour.astimezone(
            ANALYTICS_TIMEZONE
        )


        # ---------------------------------------------
        # Get IST date
        # ---------------------------------------------

        metric_date = (
            metric_local
            .date()
            .isoformat()
        )


        # ---------------------------------------------
        # Add metric count to correct day
        # ---------------------------------------------

        if metric_date in daily_counts:

            daily_counts[
                metric_date
            ] += metric.count


    # =================================================
    # 8. CREATE RESPONSE DATA
    # =================================================

    data = [

        {
            "date": date,
            "count": count
        }

        for date, count
        in daily_counts.items()

    ]


    # =================================================
    # 9. RETURN ANALYTICS
    # =================================================

    return {

        "flag_key": flag_key,

        "days": days,

        "total_evaluations": sum(
            item["count"]
            for item in data
        ),

        "data": data

    }