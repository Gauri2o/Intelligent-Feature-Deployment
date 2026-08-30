from datetime import datetime

from pydantic import BaseModel


class AuditLogResponse(BaseModel):

    id: int

    action: str

    flag_key: str

    user: str

    environment_id: int | None = None

    before_value: str | None = None

    after_value: str | None = None

    timestamp: datetime

    class Config:
        from_attributes = True