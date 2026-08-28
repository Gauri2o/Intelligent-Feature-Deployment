from pydantic import BaseModel


# =====================================================
# Evaluation Request
# =====================================================

class EvaluationRequest(BaseModel):

    flag_key: str

    environment_id: int

    user_id: str | None = None


# =====================================================
# Evaluation Response
# =====================================================

class EvaluationResponse(BaseModel):

    flag_key: str

    enabled: bool

    default_value: str | None = None

    environment_id: int | None = None

    reason: str