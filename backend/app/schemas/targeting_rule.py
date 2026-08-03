from pydantic import BaseModel
from typing import Optional



class TargetingRuleBase(BaseModel):

    flag_id: int

    attribute: str

    operator: str

    value: str




class TargetingRuleCreate(TargetingRuleBase):

    pass




class TargetingRuleResponse(TargetingRuleBase):

    id: int


    class Config:

        from_attributes = True