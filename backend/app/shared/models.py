from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Profile(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    financial_context: str
    goals: List[str]
    stress_level: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Debt(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    profile_id: str
    name: str
    balance: float
    interest_rate: float
    minimum_payment: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)