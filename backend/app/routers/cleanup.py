from datetime import datetime, timedelta, timezone

from fastapi import (
    APIRouter,
    Depends,
    Query,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.models.flag import Flag

from app.models.flag_environment_override import (
    FlagEnvironmentOverride,
)

from app.models.environment import Environment

from app.models.cleanup_suggestion import (
    CleanupSuggestion,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/cleanup",
    tags=["Cleanup"],
)


# =========================================================
# HELPER
# =========================================================

def ensure_utc(value):

    if value is None:
        return datetime.now(timezone.utc)

    if value.tzinfo is None:
        return value.replace(
            tzinfo=timezone.utc
        )

    return value.astimezone(
        timezone.utc
    )


# =========================================================
# GET CLEANUP SUGGESTIONS
# =========================================================

@router.get("/suggestions")
def get_cleanup_suggestions(
    days: int = Query(
        7,
        ge=1,
        le=365,
    ),
    db: Session = Depends(get_db),
):

    now = datetime.now(
        timezone.utc
    )

    cutoff_date = (
        now - timedelta(days=days)
    )

    # =====================================================
    # GET ALL FLAGS
    # =====================================================

    flags = (
        db.query(Flag)
        .order_by(
            Flag.id.asc()
        )
        .all()
    )

    # =====================================================
    # GET ALL ENVIRONMENTS
    # =====================================================

    environments = (
        db.query(Environment)
        .order_by(
            Environment.id.asc()
        )
        .all()
    )

    if not environments:

        return {
            "days": days,
            "count": 0,
            "suggestions": [],
        }

    suggestions = []

    # =====================================================
    # CHECK EVERY FLAG
    # =====================================================

    for flag in flags:

        fully_disabled = True

        fully_rolled_out = True

        environment_state_dates = []

        # =================================================
        # CHECK EVERY ENVIRONMENT
        # =================================================

        for environment in environments:

            override = (
                db.query(
                    FlagEnvironmentOverride
                )
                .filter(
                    FlagEnvironmentOverride.flag_id
                    == flag.id
                )
                .filter(
                    FlagEnvironmentOverride.environment_id
                    == environment.id
                )
                .first()
            )

            # =================================================
            # NO OVERRIDE
            # =================================================

            if override is None:

                enabled = bool(
                    flag.enabled
                )

                rollout = (
                    flag.rollout_percentage
                    if flag.rollout_percentage is not None
                    else 0
                )

                state_changed_at = (
                    flag.state_changed_at
                )

            # =================================================
            # ENVIRONMENT OVERRIDE
            # =================================================

            else:

                enabled = bool(
                    override.enabled
                )

                rollout = (
                    override.rollout_percentage
                    if override.rollout_percentage is not None
                    else 0
                )

                state_changed_at = (
                    override.state_changed_at
                )

            # =================================================
            # NORMALIZE DATE
            # =================================================

            state_changed_at = ensure_utc(
                state_changed_at
            )

            environment_state_dates.append(
                state_changed_at
            )

            # =================================================
            # FULLY DISABLED CHECK
            # =================================================

            if enabled:
                fully_disabled = False

            # =================================================
            # FULLY ROLLED OUT CHECK
            # =================================================

            if (
                not enabled
                or rollout != 100
            ):
                fully_rolled_out = False

        # =====================================================
        # DETERMINE CLEANUP STATE
        # =====================================================

        cleanup_status = None

        cleanup_reason = None

        # -----------------------------------------------------
        # FULLY DISABLED
        # -----------------------------------------------------

        if fully_disabled:

            cleanup_status = (
                "fully_disabled"
            )

            cleanup_reason = (
                "Flag is disabled across "
                "all environments."
            )

        # -----------------------------------------------------
        # FULLY ROLLED OUT
        # -----------------------------------------------------

        elif fully_rolled_out:

            cleanup_status = (
                "fully_rolled_out"
            )

            cleanup_reason = (
                "Flag is rolled out to 100% "
                "across all environments."
            )

        # -----------------------------------------------------
        # NOT A CLEANUP CANDIDATE
        # -----------------------------------------------------

        else:
            continue

        # =====================================================
        # FIND LAST STATE CHANGE
        # =====================================================

        latest_state_change = max(
            environment_state_dates
        )

        latest_state_change = ensure_utc(
            latest_state_change
        )

        # =====================================================
        # STALE CHECK
        # =====================================================

        if latest_state_change >= cutoff_date:
            continue

        # =====================================================
        # STALE DAYS
        # =====================================================

        stale_duration = (
            now - latest_state_change
        )

        stale_days = (
            stale_duration.days
        )

        # =====================================================
        # CHECK EXISTING CLEANUP SUGGESTION
        # =====================================================

        cleanup_record = (
            db.query(
                CleanupSuggestion
            )
            .filter(
                CleanupSuggestion.flag_key
                == flag.flag_key
            )
            .first()
        )

        # =====================================================
        # ALREADY REVIEWED
        #
        # IMPORTANT:
        # Review state comes from cleanup_suggestions,
        # NOT from Flag.
        # =====================================================

        if (
            cleanup_record is not None
            and cleanup_record.reviewed
        ):
            continue

        # =====================================================
        # CREATE CLEANUP RECORD IF NEEDED
        # =====================================================

        if cleanup_record is None:

            cleanup_record = (
                CleanupSuggestion(
                    flag_key=flag.flag_key,
                    state=cleanup_status,
                    stale_since=latest_state_change,
                    reviewed=False,
                )
            )

            db.add(
                cleanup_record
            )

            db.flush()

        else:

            # -------------------------------------------------
            # Keep current cleanup state updated
            # -------------------------------------------------

            cleanup_record.state = (
                cleanup_status
            )

            cleanup_record.stale_since = (
                latest_state_change
            )

        # =====================================================
        # ADD RESPONSE
        # =====================================================

        suggestions.append(
            {
                "id": cleanup_record.id,

                "flag_key": flag.flag_key,

                "description": flag.description,

                "owner_team": flag.owner_team,

                "status": cleanup_status,

                "days": days,

                "stale_days": stale_days,

                "state_changed_at": (
                    latest_state_change.isoformat()
                ),

                "stale_since": (
                    latest_state_change.isoformat()
                ),

                "reviewed": bool(
                    cleanup_record.reviewed
                ),

                "reviewed_at": (
                    cleanup_record.reviewed_at.isoformat()
                    if cleanup_record.reviewed_at
                    else None
                ),

                "reason": cleanup_reason,
            }
        )

    # =====================================================
    # SAVE ANY NEW CLEANUP RECORDS
    # =====================================================

    db.commit()

    # =====================================================
    # RESPONSE
    # =====================================================

    return {
        "days": days,

        "count": len(
            suggestions
        ),

        "suggestions": suggestions,
    }


# =========================================================
# MARK CLEANUP SUGGESTION AS REVIEWED
# =========================================================

@router.patch(
    "/suggestions/{flag_key}/review"
)
def mark_cleanup_suggestion_reviewed(
    flag_key: str,
    db: Session = Depends(get_db),
):

    # =====================================================
    # FIND FLAG
    # =====================================================

    flag = (
        db.query(Flag)
        .filter(
            Flag.flag_key == flag_key
        )
        .first()
    )

    if flag is None:

        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    # =====================================================
    # FIND CLEANUP RECORD
    # =====================================================

    cleanup_record = (
        db.query(
            CleanupSuggestion
        )
        .filter(
            CleanupSuggestion.flag_key
            == flag_key
        )
        .first()
    )

    # =====================================================
    # IF RECORD DOES NOT EXIST
    # =====================================================

    if cleanup_record is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Cleanup suggestion not found"
            ),
        )

    # =====================================================
    # MARK REVIEWED
    # =====================================================

    cleanup_record.reviewed = True

    cleanup_record.reviewed_at = (
        datetime.now(timezone.utc)
    )

    # =====================================================
    # SAVE
    # =====================================================

    db.commit()

    db.refresh(
        cleanup_record
    )

    # =====================================================
    # RESPONSE
    # =====================================================

    return {
        "message": (
            "Cleanup suggestion marked "
            "as reviewed."
        ),

        "flag_key": flag_key,

        "reviewed": True,

        "reviewed_at": (
            cleanup_record.reviewed_at.isoformat()
        ),
    }