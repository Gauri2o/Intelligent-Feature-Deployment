from pydantic import BaseModel
from typing import Optional


class FlagBase(BaseModel):
    flag_key: str
    type: str
    default_value: str
    enabled: bool
    description: Optional[str] = None
    owner_team: str
    environment_id: int


class FlagCreate(FlagBase):
    pass


class FlagUpdate(BaseModel):
    type: Optional[str] = None
    default_value: Optional[str] = None
    enabled: Optional[bool] = None
    description: Optional[str] = None
    owner_team: Optional[str] = None


class FlagResponse(FlagBase):
    id: int

    class Config:
        from_attributes = True