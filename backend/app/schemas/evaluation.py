from pydantic import BaseModel


class EvaluationRequest(BaseModel):

    flag_key: str

    environment_id: int

    user_context: dict | None = None


class EvaluationResponse(BaseModel):

    flag_key: str

    enabled: bool

    default_value: str | None = None

    environment_id: int | None = None

    reason: str