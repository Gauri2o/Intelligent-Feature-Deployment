from pydantic import BaseModel


class EnvironmentBase(BaseModel):
    name: str


class EnvironmentCreate(EnvironmentBase):
    pass


class EnvironmentUpdate(BaseModel):
    name: str


class EnvironmentResponse(EnvironmentBase):
    id: int

    class Config:
        from_attributes = True