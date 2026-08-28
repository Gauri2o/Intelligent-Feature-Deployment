from pydantic import BaseModel


class FlagEnvironmentOverrideBase(BaseModel):
    environment_id: int
    enabled: bool
    value: str | None = None


class FlagEnvironmentOverrideCreate(
    FlagEnvironmentOverrideBase
):
    pass


class FlagEnvironmentOverrideUpdate(
    BaseModel
):
    enabled: bool | None = None
    value: str | None = None


class FlagEnvironmentOverrideResponse(
    FlagEnvironmentOverrideBase
):
    id: int
    flag_id: int

    class Config:
        from_attributes = True