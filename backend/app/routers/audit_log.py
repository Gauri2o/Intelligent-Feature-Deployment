from datetime import datetime, time

from fastapi import APIRouter, Depends, Query

from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.crud.audit_log import get_logs

from app.schemas.audit_log import AuditLogResponse


router = APIRouter(
    prefix="/audit",
    tags=["Audit Logs"],
)


# =========================================================
# GET AUDIT LOGS
# =========================================================

@router.get(
    "/",
    response_model=list[AuditLogResponse],
)
def read_logs(

    user: str | None = Query(
        default=None,
        description="Filter by actor/user"
    ),

    flag_key: str | None = Query(
        default=None,
        description="Filter by feature flag key"
    ),

    start_date: str | None = Query(
        default=None,
        description="Start date YYYY-MM-DD"
    ),

    end_date: str | None = Query(
        default=None,
        description="End date YYYY-MM-DD"
    ),

    db: Session = Depends(get_db),
):

    parsed_start = None
    parsed_end = None

    # -----------------------------------------------------
    # Parse start date
    # -----------------------------------------------------

    if start_date:

        parsed_start = datetime.combine(
            datetime.strptime(
                start_date,
                "%Y-%m-%d"
            ).date(),
            time.min
        )

    # -----------------------------------------------------
    # Parse end date
    # -----------------------------------------------------

    if end_date:

        parsed_end = datetime.combine(
            datetime.strptime(
                end_date,
                "%Y-%m-%d"
            ).date(),
            time.max
        )

    return get_logs(
        db=db,
        user=user,
        flag_key=flag_key,
        start_date=parsed_start,
        end_date=parsed_end,
    )