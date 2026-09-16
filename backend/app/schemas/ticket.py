from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from app.schemas.knowledge import KnowledgeBaseSchema

class TicketCreate(BaseModel):
    question: str = Field(..., min_length=5, max_length=2000, description="Technical support question")

    @field_validator("question")
    @classmethod
    def validate_non_whitespace(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 5:
            raise ValueError("Question must be at least 5 non-whitespace characters long.")
        if len(stripped) > 2000:
            raise ValueError("Question cannot exceed 2000 characters.")
        return stripped

class TicketResponse(BaseModel):
    id: int
    question: str
    retrieved_context: str
    ai_response: str
    status: str
    created_at: datetime
    retrieved_knowledge: Optional[List[KnowledgeBaseSchema]] = None

    model_config = ConfigDict(from_attributes=True)
