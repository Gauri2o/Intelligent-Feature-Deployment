from pydantic import BaseModel
from datetime import datetime


class AuditLogResponse(BaseModel):

    id: int

    action: str

    flag_key: str

    user: str

    timestamp: datetime


    class Config:

        from_attributes = True