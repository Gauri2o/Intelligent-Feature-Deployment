from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.crud.audit_log import (
    get_logs,
)

from app.schemas.audit_log import (
    AuditLogResponse,
)

router = APIRouter(
    prefix="/audit",
    tags=["Audit Logs"],
)


@router.get(
    "/",
    response_model=list[AuditLogResponse],
)
def read_logs(
    db: Session = Depends(get_db),
):
    return get_logs(db)