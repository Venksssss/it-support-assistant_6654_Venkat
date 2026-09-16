from datetime import datetime
from pydantic import BaseModel, ConfigDict

class KnowledgeBaseSchema(BaseModel):
    id: int
    title: str
    problem: str
    solution: str
    keywords: str
    category: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class KnowledgeSearchResult(KnowledgeBaseSchema):
    score: float = 0.0
