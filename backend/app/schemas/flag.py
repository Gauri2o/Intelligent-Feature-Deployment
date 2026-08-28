from pydantic import BaseModel, Field
from typing import Optional


class FlagBase(BaseModel):

    flag_key: str

    type: str

    default_value: str

    enabled: bool

    # Percentage rollout: 0 to 100
    rollout_percentage: int = Field(
        default=0,
        ge=0,
        le=100
    )

    description: Optional[str] = None

    owner_team: str

    environment_id: int


class FlagCreate(FlagBase):
    pass


class FlagUpdate(BaseModel):

    type: Optional[str] = None

    default_value: Optional[str] = None

    enabled: Optional[bool] = None

    # Percentage rollout: 0 to 100
    rollout_percentage: Optional[int] = Field(
        default=None,
        ge=0,
        le=100
    )

    description: Optional[str] = None

    owner_team: Optional[str] = None


class FlagResponse(FlagBase):

    id: int

    class Config:
        from_attributes = True