from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.knowledge import KnowledgeBase
from app.schemas.knowledge import KnowledgeBaseSchema

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

@router.get("", response_model=List[KnowledgeBaseSchema])
def list_knowledge_entries(db: Session = Depends(get_db)):
    """Return all seed knowledge base entries."""
    return db.query(KnowledgeBase).all()
